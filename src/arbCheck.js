const {findOneToken} = require('./constantsToken');
const {SWAPS, findASwapByPrefix} = require('./constantsSwap');
const {init, printGeneralInfo} = require("./helpers");
const {getMaxSwapAmount} = require("./price");
init();

async function getIsProfit(tokens, initialAmountIn, swaps) {
    let amountIn = initialAmountIn;
    let amountOut = 0;
    //let amountMax = 0;
    let tokenIn = null;
    let tokenOut = null;
    let amountOutSwaps = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        tokenIn = tokens[i];
        tokenOut = tokens[i+1];
        [amountOut, amountOutSwap] = await getMaxSwapAmount(tokenIn[0], tokenOut[0], amountIn, swaps);
        amountIn = amountOut;
        amountOutSwaps.push(amountOutSwap[1]);
    }
    let isProfit = amountOut > initialAmountIn;
    let amountRate = amountOut / initialAmountIn;
    let route = "[";
    for (let i = 0; i < tokens.length; i++) {
        route += tokens[i][1];
        if (i != tokens.length - 1) {
            route +=  `-(${amountOutSwaps[i]})`;
        }
    }
    route += "]";
    console.log(`arbCheck: isProfit:${isProfit}; ${route} $${amountOut.toFixed(2)}; %[${amountRate.toFixed(6)}];`);
}

async function main() {

    if (process.argv.length < 3) {
        console.log(`arbCheck: ERROR - arguments wrong;`);
        console.log(`node arbCheck.js [-s<swaps>] [-a<amount>] <token0> <token1>... <token0>`);
        console.log(`e.g:`);
        console.log(`node quoter.js -sUQS -a10000 usdc wmatic usdc`);
        console.log(`the above line uses 3 swaps(uniswapV3, quickswap, sushiswap), swap amount $10000 usdc, for USDC->WMATIC->USDC`);
        console.log(``);
        console.log(`node arbCheck.js usdc wmatic usdc`);
        console.log(`the above line defaults to "node arbCheck.js -sALL -a10000 usdc wmatic usdc`);
        return;
    }

    await printGeneralInfo();

    let swaps = SWAPS;
    let amount = 10000;    
    let tokens = [];
    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i].substring(0,2) == "-s") {
            swaps = [];
            if ("ALL" == process.argv[i].substring(2)) {
                swaps = SWAPS;
            } else {
                for (let j = 2; j < process.argv[i].length; j++) {
                    swaps.push(findASwapByPrefix(process.argv[i].substring(j,j+1)));
                }
            }
        } else if (process.argv[i].substring(0,2) == "-a") {
            amount = Number(process.argv[i].substring(2));
        } else {
            tokens.push(findOneToken(process.argv[i]));
        }
    }    
    await getIsProfit(tokens, amount, swaps);

}

main();