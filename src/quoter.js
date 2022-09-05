const {findOneToken} = require('./constantsToken');
const {ethers} = require('ethers');
const {getSwapStructs, findASwapByPrefix} = require('./constantsSwap');
const {init, getProvider, printGeneralInfo, argumentParsers, ARGV_KEY_SWAPS, ARGV_KEY_AMOUNT, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL, ARGV_KEY_REVERSE} = require("./helpers");
const ERC20ABI = require('../abis/abi.json');
const {getMaxSwapAmount} = require("./price");

async function main() {
    //console.log(`quoter.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`quoter: ERROR - arguments wrong;`);
        console.log(`node quoter.js [-s<swaps>] [-a<amount>] [-r] [-n<network>] [-l<local>] <tokenFrom> [<tokenTo1> <tokenTo2>...]`);
        console.log(`node quoter.js -sUQS -a10000 wmatic usdc`);
        console.log(`the above line means 3 swaps(uniswapV3, quickswap, sushiswap), swap amount $10000 WMATIC to USDC`);
        console.log(``);
        console.log(`node quoter.js -sUQS -a10000 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270 usdc`);
        console.log(`the above line uses the token address of wmatic instead of symbol`);
        console.log(``);
        console.log(`if <tokenTo> is not specifed, defaults to USDC`);
        console.log(``);
        console.log(`node quoter.js wmatic`);
        console.log(`the above line means "node quoter.js -sALL -a1 wmatic`);
        return;
    }
    
    let [parsedArgMap, remainingArgv] = argumentParsers(process.argv);
    let parsedSwapsStr = parsedArgMap.get(ARGV_KEY_SWAPS[1]);
    let parsedAmountStr = parsedArgMap.get(ARGV_KEY_AMOUNT[1]);
    let parsedReversedStr = parsedArgMap.get(ARGV_KEY_REVERSE[1]);
    let parsedNetworkStr = parsedArgMap.get(ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(ARGV_KEY_LOCAL[1]);
    
    init(parsedNetworkStr, parsedLocalStr);
    await printGeneralInfo();
    //return;
    let swaps = getSwapStructs();
    if ("ALL" == parsedSwapsStr) {
        // do nothing
    } else {
        swaps = [];
        for (let i = 0; i < parsedSwapsStr.length; i++) {
            swaps.push(findASwapByPrefix(parsedSwapsStr.substring(i,i+1)));
        }
    }

    let amount = 1;
    let isFromAll = false;
    if ("ALL" == parsedAmountStr) {
        isFromAll = true;
    } else {
        amount = Number(parsedAmountStr);
    }

    let isReverse = false;
    if (parsedReversedStr != undefined) {
        isReverse = true;
    }

    let tokens = [];
    for(let i = 2; i < remainingArgv.length; i++) {
        if (remainingArgv[i].substring(0,2) == "0x") {
            tokens.push([remainingArgv[i], `unknown_token_${i-2}`])
        } else {
            tokens.push(findOneToken(remainingArgv[i]))
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
    console.log(`quoter: ${route} $${amountOut.toFixed(4)};`)
    //console.log(`quoter: [${tokenFrom[1]}]->[${tokenTo[1]}]; $${amount}->$${maxAmountOut}; swap[${maxAmountSwap[1]}]`);

}

main();
