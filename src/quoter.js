const {findOneToken} = require('./constantsToken');
const {SWAPS, findASwapByPrefix} = require('./constantsSwap');
const {init} = require("./helpers");
const {getMaxSwapAmount} = require("./price");
init();

async function main() {
    //console.log(`quoter.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`quoter: ERROR - arguments wrong;`);
        console.log(`node quoter.js [-s<swaps>] [-a<amount>] [-r] <tokenFrom> [<tokenTo>]`);
        console.log(`node quoter.js -sUQS -a10000 wmatic`);
        console.log(`the above line means 3 swaps(uniswapV3, quickswap, sushiswap), swap amount $10000 WMATIC to USDC`);
        console.log(``);
        console.log(`arguments: -r for reverse swap, i.e. swap 10000 <tokenTo> to <tokenFrom>`);
        console.log(`if <tokenTo> is not specifed, defaults to USDC`);
        console.log(``);
        console.log(`node quoter.js wmatic`);
        console.log(`the above line means "node quoter.js -sALL -a1 wmatic`);
        return;
    }

    let swaps = SWAPS;
    let tokenTo = findOneToken("USDC");
    let amount = 1;
    let tokenFrom = undefined;
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
            if (tokenFrom == undefined) {
                tokenFrom = findOneToken(process.argv[i]);
            } else {
                tokenTo = findOneToken(process.argv[i]);
            }
        }
    }    
    let maxAmountOut = 0;
    if (isReverse) {
        let tmpToken = tokenFrom;
        tokenFrom = tokenTo;
        tokenTo = tmpToken;
    }
    [maxAmountOut, maxAmountSwap] = await getMaxSwapAmount(tokenFrom[0], tokenTo[0], amount, swaps);

    console.log(`quoter: [${tokenFrom[1]}]->[${tokenTo[1]}]; $${amount}->$${maxAmountOut}; swap[${maxAmountSwap[1]}]`);

}

main();
   