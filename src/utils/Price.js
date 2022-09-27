const {ethers} = require('ethers');
//const {abi:quoterABI} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {abi:UniswapV2RouterABI} = require("../../abis/IUniswapV2Router02.json");
const ERC20ABI = require('../../abis/abi.json');
//const {getProvider, lookupUniswapV3PoolFeeBySymbol} = require("./helpers")
const {UniswapV3Commons} = require('./UniswapV3Commons')
const {Context} = require('./Context')


class Price {

  constructor(web3Provider) {
    this.web3Provider = web3Provider;
    UniswapV3Commons.init(web3Provider);
  }
  
  iterateSwapsAndFees(swapsAndFeesList) {
    /*
      return structure looks like this:
      [
        [<swapAddress>, <swapName>, <protocolNum>, <fee>],
        [<swapAddress>, <swapName>, <protocolNum>, <fee>],
      ]
      i.e.:
      [
        ["0xE592...", "uniswapV3", 0, 100],
        ["0xE592...", "uniswapV3", 0, 500],
        ["0x1b02...", "sushiswap", 1, 0],
        ...
      ]
     */
    let resultsSwapsAndFees = [];
    if (swapsAndFeesList.length == 0) {
      // currently assume return all if input is empty array
      swapsAndFeesList = Context.getSwapStructs().map(aSwap => [aSwap[0], aSwap[1], []]);
    }
    for (let aSwapAndFeeList of swapsAndFeesList) {
      let aSwap = Context.findOneSwapByName(aSwapAndFeeList[1]);
      if (aSwap == null) {
        resultsSwapsAndFees.push([aSwapAndFeeList[0], aSwapAndFeeList[1], -1, 0]);
      } else if (aSwap[1] == "uniswapV3") {
        let fees = aSwapAndFeeList[2];
        if (fees.length == 0) {
          resultsSwapsAndFees = resultsSwapsAndFees.concat(UniswapV3Commons.FEES.map(aFee => [aSwap[0], aSwap[1], aSwap[2], aFee]));
        } else {
          resultsSwapsAndFees = resultsSwapsAndFees.concat(fees.map(aFee => [aSwap[0], aSwap[1], aSwap[2], aFee]));
        }
      } else {
        resultsSwapsAndFees.push([aSwap[0], aSwap[1], aSwap[2], 0]);
      }
    }
    return resultsSwapsAndFees;
  }

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

  async queryPrice(tokenInAddress, tokenOutAddress, amountIn, swapAndFeeStruct) {
    let tokenInContract = new ethers.Contract(tokenInAddress, ERC20ABI, this.web3Provider);
    let tokenOutContract = new ethers.Contract(tokenOutAddress, ERC20ABI, this.web3Provider);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let bnAmountOut = ethers.BigNumber.from(0);
    let feeStr = "";
    if (swapAndFeeStruct[1] == "uniswapV3") {
        let aFee = swapAndFeeStruct[3];
        bnAmountOut = await UniswapV3Commons.getPrice(tokenInContract.address, tokenOutContract.address, bnAmountIn, aFee);
        feeStr = `:${aFee}`;
    } else {
        bnAmountOut = await this.getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swapAndFeeStruct[0]);
    }
    //console.log(`quoter.printPriceAndRateFromSwap: 5.0;`);
    let amountOut = Number(ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals()));
    let rate = amountOut / amountIn;
    let swapAndFeeStr = `${swapAndFeeStruct[1].substring(0,3)}${feeStr}`;
    console.log(`Price.queryPrice: [${swapAndFeeStr.padEnd(10)}]: [${(await tokenInContract.symbol()).padStart(6)}]->[${(await tokenOutContract.symbol()).padStart(6)}]:$${amountIn.toFixed(4)}->$${amountOut.toFixed(4)}; %:${rate.toFixed(6)};`);
    return amountOut;
  }

  /*
  async getMaxSwapAmount(tokenInAddress, tokenOutAddress, amountIn, swaps, fees=[]) {
    let amountOut = 0;
    let amountMax = 0;
    let amountMaxSwapAndFee = null;
    let swapsAndFees = this.iterateSwapsAndFees(swaps, fees);
    for (let aSwapAndFee of swapsAndFees) {
      amountOut = await this.queryPrice(tokenInAddress, tokenOutAddress, amountIn, aSwapAndFee);
      if (amountOut > amountMax) {
          amountMax = amountOut;
          amountMaxSwapAndFee = aSwapAndFee;
      }
    }
    return [amountMax, amountMaxSwapAndFee];
  }
  */

  async getMaxSwapAmountBySwapsAndFeesList(tokenInAddress, tokenOutAddress, amountIn, swapsAndFeesList) {
    let amountOut = 0;
    let amountMax = 0;
    let amountMaxSwapAndFee = ["null", "null", -1, 0];
    let swapsAndFees = this.iterateSwapsAndFees(swapsAndFeesList);
    for (let aSwapAndFee of swapsAndFees) {
      //console.log(`__aSwapAndFee:${aSwapAndFee};`);
      amountOut = await this.queryPrice(tokenInAddress, tokenOutAddress, amountIn, aSwapAndFee);
      if (amountOut > amountMax) {
          amountMax = amountOut;
          amountMaxSwapAndFee = aSwapAndFee;
      }
    }
    return [amountMax, amountMaxSwapAndFee];
  }
}

exports.Price = Price;