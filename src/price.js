const {ethers} = require('ethers');
const {abi:quoterABI} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
var UniswapV2Router = require("../abis/IUniswapV2Router02.json");
const ERC20ABI = require('../abis/abi.json');
const {getProvider, lookupUniswapV3PoolFeeBySymbol} = require("./helpers")

exports.getPriceOnUniV3 = async (tokenIn, tokenOut, amountIn, fee) => {
  console.log(`price.getPriceOnUniV3: fee:${fee};`);
    const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
    const quoterContract = new ethers.Contract(quoterAddress, quoterABI, getProvider());
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
      tokenIn,
      tokenOut,
      fee,
      amountIn.toString(),
      0
    );
    //console.log(`price.getPriceOnUniV3: quotedAmountOut:${quotedAmountOut};`);
    if (!ethers.BigNumber.isBigNumber(quotedAmountOut)) {
      console.log(`price.getPriceOnUniV3: WARN - amountsOut returned is null, will return 0;`);
      return ethers.BigNumber.from(0);
    }
    return quotedAmountOut;
};

exports.getPriceOnUniV2 = async (tokenIn, tokenOut, amountIn, routerAddress) => {
  let v2Router = new ethers.Contract(
      routerAddress,
      UniswapV2Router.abi,
      getProvider()
  );
  let bnAmountOut = ethers.BigNumber.from(0);
  try {
      let amountsOut = await v2Router.getAmountsOut(amountIn, [
        tokenIn,
        tokenOut,
      ]);
      if (!amountsOut || amountsOut.length !== 2) {
        console.log(`price.getPriceOnUniV2: WARN - amountsOut returned is null, will return 0;`);
      } else {
        bnAmountOut = amountsOut[1];
      }
  } catch (ex) {
      //console.debug(`price.getPriceOnUniV2: ERROR - error when quoting price from [${routerAddress}]; will return 0;`);
  }
  return bnAmountOut;
};

exports.queryPrice = async (tokenInAddress, tokenOutAddress, amountIn, swap) => {
  let tokenInContract = new ethers.Contract(tokenInAddress, ERC20ABI, getProvider());
  let tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20ABI, getProvider());
  let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
  let bnAmountOut = ethers.BigNumber.from(0);
  if (swap[1] == "uniswapV3") {
      let fee = lookupUniswapV3PoolFeeBySymbol(await tokenInContract.symbol(), await tokenOutContract.symbol());
      if (fee == -1) {
        bnAmountOut = ethers.BigNumber.from(0);
      } else {
        bnAmountOut = await this.getPriceOnUniV3(tokenInContract.address, tokenOutContract.address, bnAmountIn, fee);
      }
  } else {
      bnAmountOut = await this.getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swap[0]);
  }
  //console.log(`quoter.printPriceAndRateFromSwap: 5.0;`);
  let amountOut = Number(ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals()));
  rate = amountOut / amountIn;
  console.log(`price: [${swap[1].padStart(10)}]: [${(await tokenInContract.symbol()).padStart(6)}]->[${(await tokenOutContract.symbol()).padStart(6)}]:$${amountIn.toFixed(4)}->$${amountOut.toFixed(4)}; %:${rate.toFixed(4)};`);
  return amountOut;
}

exports.getMaxSwapAmount = async (tokenInAddress, tokenOutAddress, amountIn, swaps) => {
  let amountOut = 0;
  let amountMax = 0;
  let amountMaxSwap = ["0x0000", "nobody"];
  for (let aSwap of swaps) {
      amountOut = await this.queryPrice(tokenInAddress, tokenOutAddress, amountIn, aSwap);
      if (amountOut > amountMax) {
          amountMax = amountOut;
          amountMaxSwap = aSwap;
      }
  }
  return [amountMax, amountMaxSwap];
}