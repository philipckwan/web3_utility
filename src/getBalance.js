const {ConstantsToken} = require('./constants/ConstantsToken');
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
        console.log(`node getBalance.js me|<wallet address>|<privateKey> [ <token1|all> <token2>... ]`);
        return;
    }

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);

    Context.init(parsedNetworkStr, parsedLocalStr);
    console.log(`getBalance: v2.2;`);
    //await Context.printNetworkAndBlockNumber();
    let web3Provider = Context.getWeb3Provider();

    let walletAddress = undefined;
    if (remainingArgv[2] == "me") {
        walletAddress = process.env.WALLET_ADDRESS;
    } else if (remainingArgv[2].length == 42 && remainingArgv[2].substring(0,2) == "0x") {
        walletAddress = remainingArgv[2];
    } else if (remainingArgv[2].length == 64) {
        privateKey = remainingArgv[2];
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

    if (remainingArgv.length > 3) {
        if (remainingArgv[3] == "all") {
            for (const aTokenStruct of ConstantsToken.getTokenStructs()) {
                if (aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                }  
            }
        } else {
            for (let i = 3; i < remainingArgv.length; i++) {
                let aTokenStruct = ConstantsToken.findOneToken(remainingArgv[i]);
                console.log(`__address:${aTokenStruct[0]}; symbol:${aTokenStruct[1]};`)
                if (aTokenStruct != undefined && aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                } 
            }
        }
    }
}

main();

