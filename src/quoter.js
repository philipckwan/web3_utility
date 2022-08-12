const {findOneToken} = require('./constantsToken');
const {ethers} = require('ethers');
const {SWAPS, findASwapByPrefix} = require('./constantsSwap');
const {init, getProvider} = require("./helpers");
const ERC20ABI = require('../abis/abi.json');
const {getMaxSwapAmount} = require("./price");
init();

async function main() {
    //console.log(`quoter.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`quoter: ERROR - arguments wrong;`);
        console.log(`node quoter.js [-s<swaps>] [-a<amount>] [-r] <tokenFrom> [<tokenTo1> <tokenTo2>...]`);
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
    let amount = 1;
    let isReverse = false;
    let isFromAll = false;
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
            if (process.argv[i].substring(2) == "ALL") {
                isFromAll = true;
            } else {
                amount = Number(process.argv[i].substring(2));
            }
        } else if (process.argv[i].substring(0,2) == "-r") {
            isReverse = true;
        } else {
            tokens.push(findOneToken(process.argv[i]));
        }
    }    
    if (isReverse) {
        tokens.reverse();
    }
    if (tokens.length < 2) {
        console.log(`quoter: ERROR - less than 2 tokens, tokens.length:${tokens.length};`);
        return;
    }
    if (isFromAll) {
        let tokenFromContract = new ethers.Contract(tokens[0][0], ERC20ABI, getProvider());
        let bnTokenFromBalance = await tokenFromContract.balanceOf(process.env.WALLET_ADDRESS);
        amount = Number(ethers.utils.formatUnits(bnTokenFromBalance, await tokenFromContract.decimals()));
    }

    let amountIn = amount;
    let amountOutSwaps = [];
    for (let i = 0; i < tokens.length - 1; i++) {
        [amountOut, amountOutSwap] = await getMaxSwapAmount(tokens[i][0], tokens[i+1][0], amountIn, swaps);
        amountIn = amountOut;
        amountOutSwaps.push(amountOutSwap[1]);
    }
    let route = "[";
    for (let i = 0; i < tokens.length; i++) {
        route += tokens[i][1];
        if (i != tokens.length - 1) {
            route +=  `-(${amountOutSwaps[i]})`;
        }
    }
    route += "]";
    //[maxAmountOut, maxAmountSwap] = await getMaxSwapAmount(tokenFrom[0], tokenTo[0], amount, swaps);
    console.log(`quoter: ${route} $${amountOut.toFixed(2)};`)
    //console.log(`quoter: [${tokenFrom[1]}]->[${tokenTo[1]}]; $${amount}->$${maxAmountOut}; swap[${maxAmountSwap[1]}]`);

}

main();
   