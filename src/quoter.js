const {ethers} = require('ethers');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const ERC20ABI = require('../abis/abi.json');
const {Price} = require("./utils/Price");

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
    
    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedSwapsStr = parsedArgMap.get(Utilities.ARGV_KEY_SWAPS[1]);
    let parsedAmountStr = parsedArgMap.get(Utilities.ARGV_KEY_AMOUNT[1]);
    let parsedReversedStr = parsedArgMap.get(Utilities.ARGV_KEY_REVERSE[1]);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();
    let pricer = new Price(Context.getWeb3Provider());
    //return;

    let swapsAndFeesList = Context.swapsAndFeesParsers(parsedSwapsStr);
    /*
    for (let aResult of swapsAndFeesList) {
        console.log(`aResult: [${aResult[0]}, ${aResult[1]}, [${aResult[2]}]];`);
    }
    */
       
    [isFromAll, amount] = Context.amountParser(parsedAmountStr, 1);

    let isReverse = false;
    if (parsedReversedStr != undefined) {
        isReverse = true;
    }

    let tokenStructs = Context.tokensParser(remainingArgv);

    if (isReverse) {
        tokenStructs.reverse();
    }
    if (tokenStructs.length < 2) {
        console.log(`quoter: ERROR - less than 2 tokens, tokens.length:${tokenStructs.length};`);
        return;
    }
    if (isFromAll) {
        let tokenFromContract = new ethers.Contract(tokenStructs[0][0], ERC20ABI, Context.getWeb3Provider());
        let bnTokenFromBalance = await tokenFromContract.balanceOf(process.env.WALLET_ADDRESS);
        amount = Number(ethers.utils.formatUnits(bnTokenFromBalance, await tokenFromContract.decimals()));
    }

    let amountIn = amount;
    let swapShortAndFeeStrs = [];
    for (let i = 0; i < tokenStructs.length - 1; i++) {
        [amountOut, amountOutSwapAndFee] = await pricer.getMaxSwapAmountBySwapsAndFeesList(tokenStructs[i][0], tokenStructs[i+1][0], amountIn, swapsAndFeesList);
        amountIn = amountOut;
        let swapShortAndFeeStr = `${amountOutSwapAndFee[1].substring(0, 3)}:${amountOutSwapAndFee[3]}`;
        swapShortAndFeeStrs.push(swapShortAndFeeStr);
    }
    let route = "[";
    for (let i = 0; i < tokenStructs.length; i++) {
        route += tokenStructs[i][1];
        if (i != tokenStructs.length - 1) {
            route +=  `-(${swapShortAndFeeStrs[i]})`;
        }
    }
    route += "]";
    //[maxAmountOut, maxAmountSwap] = await getMaxSwapAmount(tokenFrom[0], tokenTo[0], amount, swaps);
    console.log(`quoter: ${route} $${amountOut.toFixed(4)};`)
    //console.log(`quoter: [${tokenFrom[1]}]->[${tokenTo[1]}]; $${amount}->$${maxAmountOut}; swap[${maxAmountSwap[1]}]`);
    
}

main();
