const {findOneToken} = require('./constantsToken');
const {SWAPS, findASwapByPrefix} = require('./constantsSwap');
const {init} = require("./helpers");
const {getMaxSwapAmount} = require("./price");
init();

async function main() {
    //console.log(`quoter.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`quoter: ERROR - arguments wrong;`);
        console.log(`node quoter.js [-s<swaps>] [-a<amount>] [-r] <token1> [token2]`);
        console.log(`arguments: -r for reverse swap, i.e. swap 10000 wmatic to usdc`);
        console.log(`is specifed <token2>, then <token1> is the fromToken, while <token2> is the toToken`);
        console.log(`e.g:`);
        console.log(`node quoter.js -sUQS -a10000 wmatic`);
        console.log(`the above line uses 3 swaps(uniswapV3, quickswap, sushiswap), swap amount $10000 usdc, for WMATIC`);
        console.log(``);
        console.log(`node quoter.js wmatic`);
        console.log(`the above line defaults to "node quoter.js -sALL -a10000 wmatic`);
        return;
    }

    let swaps = SWAPS;
    let tokenIn = findOneToken("USDC");
    let amount = 10000;
    let tokenOut = undefined;
    let isReverse = false;
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
        } else if (process.argv[i].substring(0,2) == "-r") {
            isReverse = true;
        } else {
            if (tokenOut == undefined) {
                tokenOut = findOneToken(process.argv[i]);
            } else {
                tokenIn = tokenOut;
                tokenOut = findOneToken(process.argv[i]);
            }
        }
    }    
    let maxAmountOut = 0;
    if (isReverse) {
        maxAmountOut = await getMaxSwapAmount(tokenOut[0], tokenIn[0], amount, swaps);
    } else {
        maxAmountOut = await getMaxSwapAmount(tokenIn[0], tokenOut[0], amount, swaps);
    }
    console.log(`quoter: maxAmountOut:${maxAmountOut};`);

}

main();
   