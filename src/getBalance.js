const {getTokenStructs, findOneToken} = require('./constantsToken');
const {init, printGeneralInfo, printNativeBalance, printTokenBalance, getConnectedWallet} = require('./helpers');
require('dotenv').config();

init();

/*
async function printTokenBalance(walletAddress, tokenAddress) {
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, getProvider());
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();

    let bnBalance = await tokenContract.balanceOf(walletAddress);
    let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);

    console.log(`-address:[${tokenAddress}]; token:[${tokenSymbolFromContract.padStart(6)}]; $${balance};`);
}
*/

async function main() {
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js me|<wallet address>|<privateKey> [ <token1|all> <token2>... ]`);
        return;
    }

    console.log(`getBalance.main: v2.0;`);
    await printGeneralInfo();

    let privateKey = "n/a";
    let walletAddress = undefined;
    if (process.argv[2] == "me") {
        walletAddress = process.env.WALLET_ADDRESS;
    } else if (process.argv[2].length == 42 && process.argv[2].substring(0,2) == "0x") {
        walletAddress = process.argv[2];
    } else if (process.argv[2].length == 64) {
        privateKey = process.argv[2];
        let wallet = getConnectedWallet(privateKey);
        walletAddress = wallet.address;
    } else {
        console.log(`ERROR - unknown address:${process.argv[2]};`);
    }
    await printNativeBalance(walletAddress);

    if (process.argv.length > 3) {
        if (process.argv[3] == "all") {
            for (const aTokenStruct of getTokenStructs()) {
                if (aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                }  
            }
        } else {
            for (let i = 3; i < process.argv.length; i++) {
                let aTokenStruct = findOneToken(process.argv[i]);
                if (aTokenStruct != undefined && aTokenStruct[0] != "") {
                    await printTokenBalance(walletAddress, aTokenStruct[0]);
                } 
            }
        }
    }
}

main();

