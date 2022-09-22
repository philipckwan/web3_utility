const {ethers} = require('ethers');
//const {abi:quoterABI} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {abi:UniswapV2RouterABI} = require("../../abis/IUniswapV2Router02.json");
const ERC20ABI = require('../../abis/abi.json');
//const {getProvider, lookupUniswapV3PoolFeeBySymbol} = require("./helpers")
const {UniswapV3Commons} = require('./UniswapV3Commons')


class Price {

  constructor(web3Provider) {
    console.log(`Price.constructor: START;`);
    this.web3Provider = web3Provider;
    UniswapV3Commons.init(web3Provider);
    console.log(`Price.constructor: END;`);
  }

  /*
  exports.getPriceOnUniV3 = async (tokenIn, tokenOut, amountIn, fee) => {
    //console.log(`price.getPriceOnUniV3: fee:${fee};`);
      const quoterAddress = ;
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
  */

  async getPriceOnUniV2(tokenInAddress, tokenOutAddress, amountIn, routerAddress) {
    let v2Router = new ethers.Contract(routerAddress, UniswapV2RouterABI, this.web3Provider);
    let bnAmountOut = ethers.BigNumber.from(0);
    try {
        let amountsOut = await v2Router.getAmountsOut(amountIn, [tokenInAddress, tokenOutAddress]);
        if (!amountsOut || amountsOut.length !== 2) {
          console.log(`price.getPriceOnUniV2: WARN - amountsOut returned is null, will return 0;`);
        } else {
          bnAmountOut = amountsOut[1];
        }
    } catch (ex) {
        //console.debug(`price.getPriceOnUniV2: ERROR - error when quoting price from [${routerAddress}]; will return 0;`);
    }
    return bnAmountOut;
  }

  async queryPrice (tokenInAddress, tokenOutAddress, amountIn, swapStruct) {
    let tokenInContract = new ethers.Contract(tokenInAddress, ERC20ABI, this.web3Provider);
    let tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20ABI, this.web3Provider);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let bnAmountOut = ethers.BigNumber.from(0);
    let feeStr = "";
    if (swapStruct[1] == "uniswapV3") {
        let resultsFeesAndQuotedAmountOut = await UniswapV3Commons.getPricesAcrossAllFees(tokenInContract.address, tokenOutContract.address, bnAmountIn);
        // pick the best rate
        let highestAmountOut = ethers.BigNumber.from(0);
        let highestAmountOutFee = 0;
        for (let i = 0;  i < resultsFeesAndQuotedAmountOut.length; i++) {
          let aResult = resultsFeesAndQuotedAmountOut[i];
          console.log(`Price.queryPrice: uniswapV3 fee:${aResult[0]}; amountOut:${aResult[1]};`);
          if (aResult[1] > highestAmountOut) {
            highestAmountOut = aResult[1];
            highestAmountOutFee = aResult[0];
          }
        }
        bnAmountOut = highestAmountOut;
        feeStr = `:${highestAmountOutFee}`;
        /*
        let fee = UniswapV3Commons.lookupUniswapV3PoolFeeBySymbol(await tokenInContract.symbol(), await tokenOutContract.symbol());
        feeStr = `:${fee}`;
        if (fee == -1) {
          bnAmountOut = ethers.BigNumber.from(0);
        } else {
          bnAmountOut = await UniswapV3Commons.getPrice(tokenInContract.address, tokenOutContract.address, bnAmountIn, fee);
        }
        */
    } else {
        bnAmountOut = await this.getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swapStruct[0]);
    }
    //console.log(`quoter.printPriceAndRateFromSwap: 5.0;`);
    let amountOut = Number(ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals()));
    let rate = amountOut / amountIn;
    let swapAndFeeStr = `${swapStruct[1].substring(0,3)}${feeStr}`;
    console.log(`Price.queryPrice: [${swapAndFeeStr.padEnd(10)}]: [${(await tokenInContract.symbol()).padStart(6)}]->[${(await tokenOutContract.symbol()).padStart(6)}]:$${amountIn.toFixed(4)}->$${amountOut.toFixed(4)}; %:${rate.toFixed(4)};`);
    return amountOut;
  }

  async getMaxSwapAmount (tokenInAddress, tokenOutAddress, amountIn, swaps) {
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
}

exports.Price = Price;