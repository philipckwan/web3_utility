const {ethers} = require('ethers');
const {ERC20_TOKEN, SWAP_ROUTER} = require('./constants');
const {init, getTokenContract, lookupUniswapV3PoolFee, printGeneralInfo, parseArgumentForAmount, parseArgumentForSwaps} = require('./helpers');
const {getPriceOnUniV3, getPriceOnUniV2} = require("./price");

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function printPriceAndRateFromSwap(tokenIn, tokenOut, amountIn, swapName="uniswapV3") {
    console.log(`arbCheck.printPriceAndRateFromSwap: 1.0; tokenIn:${tokenIn.symbol}; tokenOut:${tokenOut.symbol};`);
    let tokenInContract = getTokenContract(tokenIn);
    let tokenOutContract = getTokenContract(tokenOut);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let bnAmountOut = null;
    if (swapName == "uniswapV3") {
        let fee = lookupUniswapV3PoolFee(tokenIn, tokenOut);
        bnAmountOut = await getPriceOnUniV3(tokenInContract.address, tokenOutContract.address, bnAmountIn, fee);
    } else {
        let swapAddress = SWAP_ROUTER[swapName].address;
        bnAmountOut = await getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swapAddress);
    }
    let amountOut = ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals());
    rate = amountOut / amountIn;
    console.log(`arbCheck.printPriceAndRateFromSwap: [${swapName}]: [${tokenIn.symbol}]->[${tokenOut.symbol}]:$${amountIn}->$${amountOut};%:${rate};`);
    return Number(amountOut);
}

async function getMaxSwapAmount(tokenIn, tokenOut, amountIn, swaps) {
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
    return amountMax;
}

async function getIsProfit(tokens, initialAmountIn, swaps) {
    let amountIn = initialAmountIn;
    let amountOut = 0;
    //let amountMax = 0;
    let tokenIn = null;
    let tokenOut = null;
    for (let i = 0; i < tokens.length - 1; i++) {
        tokenIn = tokens[i];
        tokenOut = tokens[i+1];
        amountOut = await getMaxSwapAmount(tokenIn, tokenOut, amountIn, swaps);
        amountIn = amountOut;
    }
    let isProfit = amountOut > initialAmountIn;
    let route = "[";
    for (let i = 0; i < tokens.length; i++) {
        route += tokens[i].symbol;
        if (i != tokens.length - 1) {
            route += ":";
        }
    }
    route += "]";
    console.log(`arbCheck.getIsProfit: isProfit:${isProfit}; ${route} $${amountOut.toFixed(2)};`)
}

async function main() {
    console.log(`arbCheck.main: 1.2;`);
    await printGeneralInfo();
    let amountIn = 1;
    let i = 2;

    // arguments are being passed
    // node arbCheck.js <token0> <token1>... <token0>
    if (process.argv.length < 5) {
        console.log(`arbCheck.main: ERROR - arguments wrong;`);
        console.log(`node arbCheck.js [-a<amountIn>] [-s<swaps>] <token0> <token1>... <token0>`);
        console.log(`e.g:`);
        console.log(`node arbCheck.js -a2000 -sUQS usdc wmatic usdc`);
        return;
    }
    let [isAmount, amount] = parseArgumentForAmount(process.argv[2]);
    if (isAmount) {
        amountIn = amount;
        i = 3;
    }
    let [isSwap, swaps] = parseArgumentForSwaps(process.argv[3]);
    if (isSwap) {
        i = 4;
    }
    let tokens = [];
    for (i; i < process.argv.length; i++) {
        let tokenStr = process.argv[i];
        let token = ERC20_TOKEN[tokenStr.toUpperCase()];
        tokens.push(token);
    }

    //let amountIn = 10000; // for usdc
    //let amountIn = 19000; // for wmatic
    //let amountIn = 8.5; // for weth
    console.log(`arbCheck.main: amountIn:${amountIn};`);
    await getIsProfit(tokens, amountIn, swaps);

    //amountOut = await getMaxSwapAmountMultiple([token0, token2, token4, token2, token0], amountIn);
    //console.log(`__amountOut:${amountOut};`);
    
}

main();