const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const {Price} = require("./utils/Price");

async function main() {

    if (process.argv.length < 3) {
        console.log(`arbCheck: ERROR - arguments wrong;`);
        console.log(`node arbCheck.js [-n<network>] [-l<local>] [-s<swaps>] [-a<amount>] <token0> <token1>... <token0>`);
        console.log(`e.g:`);
        console.log(`node quoter.js -sUQS -a10000 usdc wmatic usdc`);
        console.log(`the above line uses 3 swaps(uniswapV3, quickswap, sushiswap), swap amount $10000 usdc, for USDC->WMATIC->USDC`);
        console.log(``);
        console.log(`node arbCheck.js usdc wmatic usdc`);
        console.log(`the above line defaults to "node arbCheck.js -sALL -a10000 usdc wmatic usdc`);
        return;
    }

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedSwapsStr = parsedArgMap.get(Utilities.ARGV_KEY_SWAPS[1]);
    let parsedAmountStr = parsedArgMap.get(Utilities.ARGV_KEY_AMOUNT[1]);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);

    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();
    let pricer = new Price(Context.getWeb3Provider());

    let swapsAndFeesList = Context.swapsAndFeesParsers(parsedSwapsStr);
    /*
    for (let aResult of swapsAndFeesList) {
        console.log(`aResult: [${aResult[0]}, ${aResult[1]}, [${aResult[2]}]];`);
    }
    */
    [isFromAll, initialAmountIn] = Context.amountParser(parsedAmountStr, 20000);
    let tokenStructs = Context.tokensParser(remainingArgv);
    
    let amountIn = initialAmountIn;
    let swapShortAndFeeStrs = [];
    for (let i = 0; i < tokenStructs.length - 1; i++) {
        [amountOut, amountOutSwapAndFee] = await pricer.getMaxSwapAmountBySwapsAndFeesList(tokenStructs[i][0], tokenStructs[i+1][0], amountIn, swapsAndFeesList);
        amountIn = amountOut;
        let swapShortAndFeeStr = `${amountOutSwapAndFee[1].substring(0, 3)}:${amountOutSwapAndFee[3]}`;
        swapShortAndFeeStrs.push(swapShortAndFeeStr);
    }
    let isProfit = amountOut > initialAmountIn;
    let amountRate = amountOut / initialAmountIn;
    let route = "[";
    for (let i = 0; i < tokenStructs.length; i++) {
        route += tokenStructs[i][1];
        if (i != tokenStructs.length - 1) {
            route +=  `-(${swapShortAndFeeStrs[i]})`;
        }
    }
    route += "]";
    console.log(`arbCheck: isProfit:${isProfit}; ${route} $${amountOut.toFixed(2)}; %[${amountRate.toFixed(6)}];`);

}

main();