const {ethers} = require('ethers');
const {ERC20_TOKEN, SWAP_ROUTER} = require('./constants');
const {init, getTokenContract, lookupUniswapV3PoolFee, printGeneralInfo, parseArgumentForAmount, parseArgumentForSwaps} = require('./helpers');
const {getPriceOnUniV3, getPriceOnUniV2} = require("./price");

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function printPriceAndRateFromSwap(tokenIn, tokenOut, amountIn, swapName="uniswapV3") {
    console.log(`quoter.printPriceAndRateFromSwap: 1.0; tokenIn:${tokenIn.symbol}; tokenOut:${tokenOut.symbol};`);
    let tokenInContract = getTokenContract(tokenIn);
    let tokenOutContract = getTokenContract(tokenOut);
    console.log(`__tokenOutContract symbol:${await tokenOutContract.symbol()}; decimals:${await tokenOutContract.decimals()};`);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let bnAmountOut = null;
    if (swapName == "uniswapV3") {
        //console.log(`quoter.printPriceAndRateFromSwap: 3.0; swap:${swapName};`);
        let fee = lookupUniswapV3PoolFee(tokenIn, tokenOut);
        bnAmountOut = await getPriceOnUniV3(tokenInContract.address, tokenOutContract.address, bnAmountIn, fee);
    } else {
        console.log(`quoter.printPriceAndRateFromSwap: 4.0; swap:${swapName};`);
        let swapAddress = SWAP_ROUTER[swapName].address;
        bnAmountOut = await getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swapAddress);
    }
    //console.log(`quoter.printPriceAndRateFromSwap: 5.0;`);
    let amountOut = ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals());
    rate = amountOut / amountIn;
    console.log(`quoter.printPriceAndRateFromSwap: [${swapName}]: [${tokenIn.symbol}]->[${tokenOut.symbol}]:$${amountIn}->$${amountOut};%:${rate};`);
    return Number(amountOut);
}

async function getMaxSwapAmount(tokenIn, tokenOut, amountIn, swaps) {
    //console.log(`quoter.getMaxSwapAmount: 1.0;`);
    //let swaps = ["POLYGON_QUICKSWAP"];
    //let swaps = ["uniswapV3", "POLYGON_QUICKSWAP", "POLYGON_SUSHISWAP"];
    let amountOut = 0;
    let amountMax = 0;
    for (let aSwap of swaps) {
        amountOut = await printPriceAndRateFromSwap(tokenIn, tokenOut, amountIn, aSwap);
        if (amountOut > amountMax) {
            amountMax = amountOut;
        }
    }
    //console.log(`quoter.getMaxSwapAmount: 2.0;`);
    return amountMax;
}

async function main() {
    console.log(`quoter.main: 1.4;`);
    await printGeneralInfo();
    let amountFrom = 1;

    // arguments are being passed
    // node quoter.js <tokenFrom> <tokenTo> <amountFrom>
    if (process.argv.length < 5) {
        console.log(`quoter.main: ERROR - arguments wrong;`);
        console.log(`node quoter.js [-a<amountIn>] [-s<swaps>] <tokenFrom> <tokenTo>`);
        console.log(`e.g:`);
        console.log(`node quoter.js -a2000 -sUQS usdc wmatic`);
        return;
    }
    let [isAmount, amount] = parseArgumentForAmount(process.argv[2]);
    if (isAmount) {
        amountFrom = amount;
        i = 3;
    }
    let [isSwap, swaps] = parseArgumentForSwaps(process.argv[3]);
    if (isSwap) {
        i = 4;
    }
    let tokenFrom = ERC20_TOKEN[process.argv[i].toUpperCase()];
    let tokenTo = ERC20_TOKEN[process.argv[i+1].toUpperCase()];

    let amountOut = await getMaxSwapAmount(tokenFrom, tokenTo, amountFrom, swaps);

    //amountOut = await getMaxSwapAmountMultiple([token0, token2, token4, token2, token0], amountIn);
    console.log(`quoter.main: amountOut:${amountOut};`);
    
}

main();