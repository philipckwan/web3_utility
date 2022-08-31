const {ethers} = require('ethers');
const {UNISWAP_V3_ROUTER_ADDRESS, SWAP_ROUTER, DODO_LENDING_POOL} = require('./constants');
const {init, printGeneralInfo, formatTime, getProvider, getConnectedWallet, MY_WALLET_SECRET, lookupUniswapV3PoolFeeBySymbol} = require('./helpers');
const FLASHLOAN_ABI = require("../abis/Flashloan.json");
const { findOneToken } = require('./constantsToken');
const ERC20ABI = require('../abis/abi.json');

init();

async function main() {
    console.log(`${formatTime(Date.now())}|flashloan.main: v1.0;`);
    //await printGeneralInfo();

    // arguments are being passed
    if (process.argv.length < 7) {
        console.log(`flashloan.main: ERROR - arguments wrong;`);
        console.log(`node flashloan.js [-a<amount>] <token0> <swap0> <token1> <swap1>... <token0>`);

        return;
    }
    let tokenContracts = [];
    let swaps = [];
    let amountLoan = 1;
    let argVRest = [];
    for (let i = 2; i < process.argv.length; i++) {
      if (process.argv[i].substring(0,2) == "-a") {
          amountLoan = Number(process.argv[i].substring(2));
      } else {
        argVRest.push(process.argv[i]);
      }
    }
    for (let i = 0; i < argVRest.length; i++) {
        if (i % 2 == 0) {
          let tokenStr = argVRest[i];
          //let tokenContract = getTokenContract(ERC20_TOKEN[tokenStr.toUpperCase()]);
          let aTokenTuple = findOneToken(tokenStr);
          let tokenContract = new ethers.Contract(aTokenTuple[0], ERC20ABI, getProvider());
          tokenContracts.push(tokenContract);

        } else {
          let swapStr = argVRest[i];
          let swap = null;
          if (swapStr == 'uniswap') {
            swap = SWAP_ROUTER["POLYGON_UNISWAP_V3"];
          } else if (swapStr == 'quickswap') {
            swap = SWAP_ROUTER["POLYGON_QUICKSWAP"];
          } else if (swapStr == 'sushiswap') {
            swap = SWAP_ROUTER["POLYGON_SUSHISWAP"];
          } else {
            swap = SWAP_ROUTER[swapStr];
          }
          swaps.push(swap);
        }
    }

    let flashloanAddress = process.env.FLASHLOAN_CONTRACT_ADDRESS;

    let myWallet = getConnectedWallet(MY_WALLET_SECRET);

    const flashloanContract = new ethers.Contract(
      flashloanAddress,
      FLASHLOAN_ABI.abi,
      getProvider()
    );

    let bnAmountLoan = ethers.utils.parseUnits(amountLoan.toString(), await tokenContracts[0].decimals());

    /* TODO - need to revisit if token0 is not USDC */
    let token0Symbol = await tokenContracts[0].symbol();
    let dodoLendingPoolAddress = DODO_LENDING_POOL[token0Symbol][0];
    console.log(`${formatTime(Date.now())}|flashloan.main 1.5: token:[${token0Symbol}]; dodoLendingPoolAddress:${dodoLendingPoolAddress};`);

    let gasPrice = 135;
    let bnGasPrice = ethers.utils.parseUnits(gasPrice.toString(), "gwei");

    let gasLimit = 1200000;
    
    let params = {
      flashLoanPool: dodoLendingPoolAddress,
      loanAmount: bnAmountLoan,
      routes: await passRoutes(tokenContracts, swaps)
    }

    console.log(`${formatTime(Date.now())}|flashloan.main 1.6: params:${JSON.stringify(params)};`);

    const connectedContract = await flashloanContract.connect(myWallet);
    let flashloanTx = null;
    try {
      flashloanTx = await connectedContract.dodoFlashLoan(params, {
        gasLimit: gasLimit,
        gasPrice: bnGasPrice,
      });
      console.log(`${formatTime(Date.now())}|__flashloanTx___BELOW___;`);
      console.log(flashloanTx);

      const flashloanTxReceipt = await flashloanTx.wait();
      console.log(`${formatTime(Date.now())}|__flashloanTxReceipt___BELOW___;`);
      console.log(flashloanTxReceipt);
    } catch (ex) {
      console.log(`${formatTime(Date.now())}| ERROR; ${ex.error.data.message};`);
      //console.log(ex);
    }
    //console.log(`flashloan.main: ___flashloanTxReceipt___ABOVE___;`);
    
    console.log(`${formatTime(Date.now())}|flashloan.main: v9.0;`);

}

async function passRoutes(tokenContracts, swaps) {

  let hops = [];
  
  for (let i = 0; i < tokenContracts.length - 1; i++) {
    let tokenInAddress = tokenContracts[i].address;
    let tokenOutAddress = tokenContracts[i+1].address;
    let swap = swaps[i];
    if (swap.protocol == 0) {
      let fee = lookupUniswapV3PoolFeeBySymbol(await tokenContracts[i].symbol(), await tokenContracts[i+1].symbol());
      if (fee == -1) {
        console.log(`flashloan.main: ERROR - lookupUniswapV3PoolFeeBySymbol returns -1;`);
        process.exit(1);
      }
    }
    let aHop = {
      protocol: swap.protocol,
      data: (swap.protocol == 0)? 
             ethers.utils.defaultAbiCoder.encode(["address", "uint24"],
                                                 [UNISWAP_V3_ROUTER_ADDRESS, lookupUniswapV3PoolFeeBySymbol(await tokenContracts[i].symbol(), await tokenContracts[i+1].symbol())]
                                                ) : 
             ethers.utils.defaultAbiCoder.encode(["address"],[swap.address]),
      path: [tokenInAddress, tokenOutAddress]
    };
    hops.push(aHop);
  }
  return [
    {
      hops: hops
    },
  ];
  
}

main();