const {ethers} = require('ethers');
const {ERC20_TOKEN, SWAP_ROUTER} = require('./constants');
const {init, getTokenContractByAddress, lookupUniswapV3PoolFeeBySymbol, printGeneralInfo, parseArgumentForAmount, parseArgumentForSwaps, resolveTokenSymbolAndAddress} = require('./helpers');
const {getPriceOnUniV3, getPriceOnUniV2} = require("./price");

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function printPriceAndRateFromSwap(tokenInAddress, tokenOutAddress, amountIn, swapName="uniswapV3") {
    //console.log(`quoter.printPriceAndRateFromSwap: 1.0; tokenIn:${tokenInAddress}; tokenOut:${tokenOutAddress};`);
    let tokenInContract = getTokenContractByAddress(tokenInAddress);
    let tokenOutContract = getTokenContractByAddress(tokenOutAddress);
    //console.log(`__tokenOutContract symbol:${await tokenOutContract.symbol()}; decimals:${await tokenOutContract.decimals()};`);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let bnAmountOut = null;
    if (swapName == "uniswapV3") {
        //console.log(`quoter.printPriceAndRateFromSwap: 3.0; swap:${swapName};`);
        let fee = lookupUniswapV3PoolFeeBySymbol(await tokenInContract.symbol(), await tokenOutContract.symbol());
        bnAmountOut = await getPriceOnUniV3(tokenInContract.address, tokenOutContract.address, bnAmountIn, fee);
    } else {
        //console.log(`quoter.printPriceAndRateFromSwap: 4.0; swap:${swapName};`);
        let swapAddress = SWAP_ROUTER[swapName].address;
        bnAmountOut = await getPriceOnUniV2(tokenInContract.address, tokenOutContract.address, bnAmountIn, swapAddress);
    }
    //console.log(`quoter.printPriceAndRateFromSwap: 5.0;`);
    let amountOut = ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals());
    rate = amountOut / amountIn;
    console.log(`quoter.printPriceAndRateFromSwap: [${swapName}]: [${await tokenInContract.symbol()}]->[${await tokenOutContract.symbol()}]:$${amountIn}->$${amountOut};%:${rate};`);
    return Number(amountOut);
}

async function getMaxSwapAmount(tokenInAddress, tokenOutAddress, amountIn, swaps) {
    //console.log(`quoter.getMaxSwapAmount: 1.0;`);
    //let swaps = ["POLYGON_QUICKSWAP"];
    //let swaps = ["uniswapV3", "POLYGON_QUICKSWAP", "POLYGON_SUSHISWAP"];
    let amountOut = 0;
    let amountMax = 0;
    for (let aSwap of swaps) {
        amountOut = await printPriceAndRateFromSwap(tokenInAddress, tokenOutAddress, amountIn, aSwap);
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

    // arguments are being passed
    // node quoter.js <tokenFrom> <tokenTo> <amountFrom>
    if (process.argv.length < 5) {
        console.log(`quoter.main: ERROR - arguments wrong;`);
        console.log(`node quoter.js -s<swaps> -a<amountIn> <tokenFrom> <tokenTo>`);
        console.log(`e.g:`);
        console.log(`node quoter.js -sUQS -a2000 usdc wmatic`);
        return;
    }
    let [isSwap, swaps] = parseArgumentForSwaps(process.argv[2]);

    let [isAmount, amountFrom] = parseArgumentForAmount(process.argv[3]);

    if (!isSwap || !isAmount) {
        console.log(`quoter.main: ERROR -s and -a not defined properly;`);
        return;
    }

    let fromSymbolOrAddress = process.argv[4];
    let [tokenFromSymbol, tokenFromAddress] = await resolveTokenSymbolAndAddress(fromSymbolOrAddress);
    console.log(`quoter.main: tokenFrom:[${tokenFromSymbol}:${tokenFromAddress}];`);

    let toSymbolOrAddress = process.argv[5];
    let [tokenToSymbol, tokenToAddress] = await resolveTokenSymbolAndAddress(toSymbolOrAddress);
    console.log(`quoter.main: tokenTo:[${tokenToSymbol}:${tokenToAddress}];`);

    let maxAmountOut = await getMaxSwapAmount(tokenFromAddress, tokenToAddress, amountFrom, swaps);

    //amountOut = await getMaxSwapAmountMultiple([token0, token2, token4, token2, token0], amountIn);
    console.log(`quoter.main: maxAmountOut:${maxAmountOut};`);
    
}

main();