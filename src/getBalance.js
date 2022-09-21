const {getTokenStructs, findOneToken} = require('./constantsToken');
const {init, printGeneralInfo, printNativeBalance, printTokenBalance, getConnectedWallet, argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require('./helpers');
require('dotenv').config();

async function main() {
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js me|<wallet address>|<privateKey> [ <token1|all> <token2>... ]`);
        return;
    }

    let [parsedArgMap, remainingArgv] = argumentParsers(process.argv);
    let parsedNetworkStr = parsedArgMap.get(ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(ARGV_KEY_LOCAL[1]);

    init(parsedNetworkStr, parsedLocalStr);
    console.log(`getBalance.main: v2.0;`);
    await printGeneralInfo();

    let privateKey = "n/a";
    let walletAddress = undefined;
    if (remainingArgv[2] == "me") {
        walletAddress = process.env.WALLET_ADDRESS;
    } else if (remainingArgv[2].length == 42 && remainingArgv[2].substring(0,2) == "0x") {
        walletAddress = remainingArgv[2];
    } else if (remainingArgv[2].length == 64) {
        privateKey = remainingArgv[2];
        let wallet = getConnectedWallet(privateKey);
        walletAddress = wallet.address;
    } else {
        console.log(`ERROR - unknown address:${remainingArgv[2]};`);
    }
    await printNativeBalance(walletAddress);

    if (remainingArgv.length > 3) {
        if (remainingArgv[3] == "all") {
            for (const aTokenStruct of getTokenStructs()) {
                if (aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                }  
            }
        } else {
            for (let i = 3; i < remainingArgv.length; i++) {
                let aTokenStruct = findOneToken(remainingArgv[i]);
                if (aTokenStruct != undefined && aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                } 
            }
        }
    }
}

main();

