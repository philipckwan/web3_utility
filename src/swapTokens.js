const {Constants} = require('./constants/Constants');
const {ethers} = require('ethers');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const {Price} = require("./utils/Price");
const {UniswapV3Commons} = require("./utils/UniswapV3Commons");
require('dotenv').config();
const ERC20ABI = require('../abis/abi.json');
const {abi:UNISWAP_V3_ROUTER_ABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
var UniswapV2Router = require("../abis/IUniswapV2Router02.json");

async function swap(tokenFromAddress, tokenToAddress, amountFrom, amountToExpected, swapAndFee) {
    let wallet = new ethers.Wallet(process.env.WALLET_SECRET);
    let connectedWallet = wallet.connect(Context.getWeb3Provider());

    let tokenFromContract = new ethers.Contract(tokenFromAddress, ERC20ABI, Context.getWeb3Provider());
    let tokenToContract = new ethers.Contract(tokenToAddress, ERC20ABI, Context.getWeb3Provider());
    const bnAmountFrom = ethers.utils.parseUnits(amountFrom.toString(), await tokenFromContract.decimals());
    console.log(`swapTokens: amountFrom:${amountFrom}; bnAmountFrom:${bnAmountFrom};`);

    let amountFromTimesTen = amountFrom * 10;
    const bnAmountApproved = ethers.utils.parseUnits(amountFromTimesTen.toString(), await tokenFromContract.decimals());
    console.log(`swapTokens: amountFromTimesTen:${amountFromTimesTen}; bnAmountApproved:${bnAmountApproved};`);

    let minAmountToExpected = (amountToExpected * 0.5).toFixed(await tokenToContract.decimals());
    const bnMinAmountToExpected = ethers.utils.parseUnits(minAmountToExpected.toString(), await tokenToContract.decimals());
    console.log(`swapTokens: amountToExpected:${amountToExpected}; minAmountToExpected:${minAmountToExpected}; bnMinAmountToExpected:${bnMinAmountToExpected};`);
    
    let routerAddress = swapAndFee[0];
    let routerName  = swapAndFee[1];

    const approvalTx = await tokenFromContract.connect(connectedWallet).approve(routerAddress, bnAmountApproved, {gasPrice: ethers.utils.parseUnits(Constants.ETH_GAS_PRICE, "gwei"), gasLimit: Constants.ETH_ERC20_APPROVAL_GAS_LIMIT});
    console.log(JSON.stringify(approvalTx));
    //const approvalTxReceipt = await approvalTx.wait();
    
    console.log(`swap: token approved, will proceed to swap;`);
    /*
    if (1 == 0) {
        console.log(`swap: interrupted...`);
        return;
    }
    */
    
    if (routerName == "uniswapV3") {
        uniswapV3Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnMinAmountToExpected, swapAndFee);
    } else {
        uniswapV2Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnMinAmountToExpected, swapAndFee);
    }
    
}

async function uniswapV3Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnAmountToExpected, swapAndFee) {    
    let executionGasLimit = 1200000;
    let executionGasPrice = 50;
    let bnExecutionGasPrice = ethers.utils.parseUnits(`${executionGasPrice}`, "gwei");
    let swapFee = swapAndFee[3];
    let swapAddress = swapAndFee[0];
    if (swapFee == 0) {
        swapFee = UniswapV3Commons.lookupUniswapV3PoolFeeBySymbol(await tokenFromContract.symbol(), await tokenToContract.symbol());
    } 
    
    const swapRouterContract = new ethers.Contract(
        swapAddress,
        UNISWAP_V3_ROUTER_ABI,
        Context.getWeb3Provider()
    );

    const transaction = await swapRouterContract.connect(connectedWallet).exactInputSingle(
        {
            tokenIn: tokenFromContract.address,
            tokenOut: tokenToContract.address,
            fee: swapFee,
            recipient: connectedWallet.address,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: bnAmountFrom,
            amountOutMinimum: bnAmountToExpected,
            sqrtPriceLimitX96: 0
        },
        {
            gasLimit: executionGasLimit,
            gasPrice: bnExecutionGasPrice
        }
    );

    //console.log(JSON.stringify(transaction));    
    const transactionReceipt = await transaction.wait();
        
    console.log(`uniswapV3Swap: 9.0;`);
}

async function uniswapV2Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnAmountToExpected, swapAndFee) {
    console.log(`uniswapV2Swap: 1.0;`);
    let executionGasLimit = 1200000;
    let executionGasPrice = 50;
    let bnExecutionGasPrice = ethers.utils.parseUnits(`${executionGasPrice}`, "gwei");
   
    let routerAddress = swapAndFee[0];
    const swapRouterContract = new ethers.Contract(
        routerAddress,
        UniswapV2Router.abi,
        Context.getWeb3Provider()
    );

    const transaction = await swapRouterContract.connect(connectedWallet).swapExactTokensForTokens(
        bnAmountFrom,
        bnAmountToExpected,
        [tokenFromContract.address, tokenToContract.address],
        connectedWallet.address,
        Math.floor(Date.now() / 1000) + (60 * 10),
        {gasPrice: bnExecutionGasPrice, gasLimit: executionGasLimit}
    );

    console.log(JSON.stringify(transaction));
    
    const transactionReceipt = await transaction.wait();
    //console.log(`uniswapV2Swap: ___transactionReceipt___BELOW___;`);
    //console.log(transactionReceipt);
    //console.log(`uniswapV2Swap: ___transactionReceipt___ABOVE___;`);
}

async function main() {
    // arguments are being passed
    // node swapTokens.js -s<swap> -a<amount> <tokenFrom> <tokenTo>
    if (process.argv.length < 5) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node swapTokens.js [-n<network>] [-l<local>] [-s<swaps>] -a<amount> <tokenFrom> <tokenTo>`);
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

    let tokenStructs = Context.tokensParser(remainingArgv);
    if (tokenStructs.length < 2) {
        console.log(`swapTokens: ERROR - less than 2 tokens, tokens.length:${tokenStructs.length};`);
        return;
    }
    tokenFromStruct = tokenStructs[0];
    tokenToStruct = tokenStructs[1];

    [isFromAll, amountFrom] = Context.amountParser(parsedAmountStr, 0);
    if (isFromAll) {
        let tokenFromContract = new ethers.Contract(tokenFromStruct[0], ERC20ABI, Context.getWeb3Provider());
        let bnTokenFromBalance = await tokenFromContract.balanceOf(process.env.WALLET_ADDRESS);
        amountFrom = Number(ethers.utils.formatUnits(bnTokenFromBalance, await tokenFromContract.decimals()));
    }
    if (amountFrom <= 0) {
        console.log(`swapTokens: ERROR - amountFrom is less than or equal to 0; amountFrom:${amountFrom};`);
        return;
    }
    [amountTo, amountOutSwapAndFee] = await pricer.getMaxSwapAmountBySwapsAndFeesList(tokenFromStruct[0], tokenToStruct[0], amountFrom, swapsAndFeesList);
    let swapShortAndFeeStr = `${amountOutSwapAndFee[1].substring(0, 3)}:${amountOutSwapAndFee[3]}`;
    //[maxAmountOut, maxAmountSwap] = await getMaxSwapAmount(tokenFromStruct[0], tokenToStruct[0], amountFrom, swaps);
    console.log(`swapTokens: amountTo:${amountTo}; swapAndFee:${swapShortAndFeeStr};`);
    if (amountTo == 0) {
        console.log(`swapTokens: amountTo is $0, cannot find any good swap;`);
        return;
    }
    
    swap(tokenFromStruct[0], tokenToStruct[0], amountFrom, amountTo, amountOutSwapAndFee);
}

main();