const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities')
const {ethers} = require('ethers');
//const {init, printGeneralInfo, printNativeBalance, printTokenBalance, getConnectedWallet, argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require('./helpers');
const ERC20ABI = require('../abis/abi.json');

require('dotenv').config();

async function printTokenBalance(walletAddress, tokenAddress) {
    let web3Provider = Context.getWeb3Provider();
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, web3Provider);
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();

    let bnBalance = await tokenContract.balanceOf(walletAddress);
    let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);
    console.log(`--tokenAddress:[${tokenAddress}]; tokenSymbol:[${tokenSymbolFromContract.padStart(6)}]; $${balance};`);
}

async function main() {
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js me|<wallet address>|<privateKey> [ <token1|all> <token2>... ] [(additional options)]`);
        console.log(`additional options:`);
        console.log(`-n : network; -nEM (for ethereum mainnet) | -nPM (for polygon mainnet) etc...`)
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
    console.log(`getBalance: v2.3;`);
    //await Context.printNetworkAndBlockNumber();
    let web3Provider = Context.getWeb3Provider();

    let walletAddress = undefined;
    let argWallet = remainingArgv[0];
    if (argWallet == "me") {
        walletAddress = process.env.WALLET_ADDRESS;
    } else if (argWallet.length == 42 && argWallet.substring(0,2) == "0x") {
        walletAddress = argWallet;
    } else if (argWallet.length == 64) {
        privateKey = argWallet;
        let wallet = new ethers.Wallet(privateKey);
        wallet.connect(web3Provider);
        walletAddress = wallet.address;
    } else {
        console.log(`ERROR - unknown address:${remainingArgv[2]};`);
    }
    let bnNativeBalance = await web3Provider.getBalance(walletAddress);
    let nativeBalance = ethers.utils.formatUnits(bnNativeBalance, 18);
    console.log(`getBalance: address:${walletAddress}; nativeBalance:${nativeBalance}`);
    //await printNativeBalance(walletAddress);

    remainingArgv.shift();

    if (remainingArgv.length > 0) {
        if (remainingArgv[0] == "all") {
            for (const aTokenStruct of Context.getTokenStructs()) {
                if (aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                }  
            }
        } else {
            let tokenStructs = Context.tokensParser(remainingArgv);
            for (let aTokenStruct of tokenStructs) {
                if (aTokenStruct != undefined && aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                } 
            }
        }
    }
}

main();

