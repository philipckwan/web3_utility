const {ethers} = require('ethers');
const {abi:quoterABI} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
var UniswapV2Router = require("../abis/IUniswapV2Router02.json");
const {getProvider} = require("./helpers")

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
      return getBigNumber(0);
    }
    return quotedAmountOut;
};

exports.getPriceOnUniV2 = async (tokenIn, tokenOut, amountIn, routerAddress) => {
  //console.debug(`priceV2.getPriceOnUniV2: 1.0;`);
  let v2Router = new ethers.Contract(
      routerAddress,
      UniswapV2Router.abi,
      getProvider()
  );
  //console.debug(`priceV2.getPriceOnUniV2: 1.2;`);
  const amountsOut = await v2Router.getAmountsOut(amountIn, [
    tokenIn,
    tokenOut,
  ]);
  //console.debug(`priceV2.getPriceOnUniV2: 1.4;`);
  if (!amountsOut || amountsOut.length !== 2) {
    console.log(`price.getPriceOnUniV2: WARN - amountsOut returned is null, will return 0;`);
    return getBigNumber(0);
  }
  return amountsOut[1];
};