const {UNISWAP_V3_ROUTER_ADDRESS} = require('./constants');
const {ethers} = require('ethers');
const {init, getProvider, lookupUniswapV3PoolFeeBySymbol} = require('./helpers');
const {findOneToken} = require('./constantsToken');
const {SWAPS, findASwapByPrefix} = require('./constantsSwap');
const {getMaxSwapAmount} = require("./price");
require('dotenv').config();
const ERC20ABI = require('../abis/abi.json');
const {abi:UNISWAP_V3_ROUTER_ABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
var UniswapV2Router = require("../abis/IUniswapV2Router02.json");

init();

async function swap(tokenFromStruct, tokenToStruct, amountFrom, amountToExpected, swapStruct) {
    console.log(`swap: 1.0;`);

    let wallet = new ethers.Wallet(process.env.WALLET_SECRET);
    let connectedWallet = wallet.connect(getProvider());

    let tokenFromContract = new ethers.Contract(tokenFromStruct[0], ERC20ABI, getProvider());
    let tokenToContract = new ethers.Contract(tokenToStruct[0], ERC20ABI, getProvider());
    const bnAmountFrom = ethers.utils.parseUnits(amountFrom.toString(), await tokenFromContract.decimals());
    console.log(`swap: amountFrom:${amountFrom}; bnAmountFrom:${bnAmountFrom};`);

    let amountFromTimesTen = amountFrom * 10;
    const bnAmountApproved = ethers.utils.parseUnits(amountFromTimesTen.toString(), await tokenFromContract.decimals());
    console.log(`swap: amountFromTimesTen:${amountFromTimesTen}; bnAmountApproved:${bnAmountApproved};`);

    let minAmountToExpected = (amountToExpected * 0.5).toFixed(await tokenToContract.decimals());
    const bnMinAmountToExpected = ethers.utils.parseUnits(minAmountToExpected.toString(), await tokenToContract.decimals());
    console.log(`swap: amountToExpected:${amountToExpected}; minAmountToExpected:${minAmountToExpected}; bnMinAmountToExpected:${bnMinAmountToExpected};`);
    
    let routerAddress = swapStruct[1] == "uniswapV3" ? UNISWAP_V3_ROUTER_ADDRESS : swapStruct[0];

    const approvalTx = await tokenFromContract.connect(connectedWallet).approve(routerAddress, bnAmountApproved, {gasPrice: ethers.utils.parseUnits("50", "gwei"), gasLimit: 80000});
    console.log(JSON.stringify(approvalTx));
    const approvalTxReceipt = await approvalTx.wait();
    
    console.log(`swap: token approved, will proceed to swap;`);
    /*
    if (1 == 0) {
        console.log(`swap: interrupted...`);
        return;
    }
    */

    if (swapStruct[1] == "uniswapV3") {
        uniswapV3Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnMinAmountToExpected);
    } else {
        uniswapV2Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnMinAmountToExpected, routerAddress);
    }

}

async function uniswapV3Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnAmountToExpected) {
    console.log(`uniswapV3Swap: 1.0;`);
    
    let executionGasLimit = 1200000;
    let executionGasPrice = 50;
    let bnExecutionGasPrice = ethers.utils.parseUnits(`${executionGasPrice}`, "gwei");
    let swapFee = lookupUniswapV3PoolFeeBySymbol(await tokenFromContract.symbol(), await tokenToContract.symbol());

    const swapRouterContract = new ethers.Contract(
        UNISWAP_V3_ROUTER_ADDRESS,
        UNISWAP_V3_ROUTER_ABI,
        getProvider()
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

    console.log(JSON.stringify(transaction));    
    const transactionReceipt = await transaction.wait();
        
    console.log(`uniswapV3Swap: 9.0;`);
}

async function uniswapV2Swap(tokenFromContract, tokenToContract, connectedWallet, bnAmountFrom, bnAmountToExpected, routerAddress) {
    console.log(`uniswapV2Swap: 1.0;`);
    let executionGasLimit = 1200000;
    let executionGasPrice = 50;
    let bnExecutionGasPrice = ethers.utils.parseUnits(`${executionGasPrice}`, "gwei");
   
    const swapRouterContract = new ethers.Contract(
        routerAddress,
        UniswapV2Router.abi,
        getProvider()
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
        
    console.log(`uniswapV2Swap: 9.0;`);
}

async function main() {
    // arguments are being passed
    // node swapTokens.js -s<swap> -a<amount> <tokenFrom> <tokenTo>
    if (process.argv.length != 6) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node swapTokens.js -s<swaps> -a<amount> <tokenFrom> <tokenTo>`);
        return;
    }

    let swaps = [];
    let amountFrom = 0;
    let isFromAll = false;
    if (process.argv[2].substring(0,2) == "-s") {
        if ("ALL" == process.argv[2].substring(2)) {
            swaps = SWAPS;
        } else {
            for (let j = 2; j < process.argv[2].length; j++) {
                swaps.push(findASwapByPrefix(process.argv[2].substring(j,j+1)));
            }
        }
    } else {
        console.log(`ERROR - -s<swaps> not defined;`);
        return;
    }
    
    if (process.argv[3].substring(0,2) == "-a") {
        if (process.argv[3].substring(2) == "ALL") {
            isFromAll = true;
        } else {
            amountFrom = Number(process.argv[3].substring(2));
        }
    } else {
        console.log(`ERROR - -a<amount> not defined;`);
        return;
    }
    
    tokenFromStruct = findOneToken(process.argv[4]);
    tokenToStruct = findOneToken(process.argv[5]);

    if (isFromAll) {
        let tokenFromContract = new ethers.Contract(tokenFromStruct[0], ERC20ABI, getProvider());
        let bnTokenFromBalance = await tokenFromContract.balanceOf(process.env.WALLET_ADDRESS);
        amountFrom = Number(ethers.utils.formatUnits(bnTokenFromBalance, await tokenFromContract.decimals()));
    }
    [maxAmountOut, maxAmountSwap] = await getMaxSwapAmount(tokenFromStruct[0], tokenToStruct[0], amountFrom, swaps);
    console.log(`swapTokens: maxAmountOut:${maxAmountOut}; maxAmountSwap:${maxAmountSwap[1]};`);
    if (maxAmountOut == 0) {
        console.log(`swapTokens: maxAmountOut is $0, cannot find any good swap;`);
        return;
    }
    
    swap(tokenFromStruct, tokenToStruct, amountFrom, maxAmountOut, maxAmountSwap);
}

main();