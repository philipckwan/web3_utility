const {ethers} = require('ethers');
const {getTokenStructs, findOneToken} = require('./constantsToken');
const {init, printGeneralInfo, printNativeBalance, getProvider} = require('./helpers');
const ERC20ABI = require('../abis/abi.json');
require('dotenv').config();

init();

async function printTokenBalance(walletAddress, tokenAddress) {
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, getProvider());
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();

    let bnBalance = await tokenContract.balanceOf(walletAddress);
    let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);

    console.log(`-address:[${tokenAddress}]; token:[${tokenSymbolFromContract.padStart(6)}]; $${balance};`);
}

async function main() {
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js me|<wallet address> [ <token1|all> <token2>... ]`);
        return;
    }

    console.log(`getBalance.main: v2.0;`);
    await printGeneralInfo();

    let walletAddress = undefined;
    if (process.argv[2] == "me") {
        walletAddress = process.env.WALLET_ADDRESS;
    } else if (process.argv[2].length == 42 && process.argv[2].substring(0,2) == "0x") {
        walletAddress = process.argv[2];
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

/*
async function main2() {
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js <account(s)> [<token1|all> <token2>...]`);
        return;
    }
    console.log(`getBalance.main: v1.2;`);
    await printGeneralInfo();

    let arg2 = process.argv[2];
    let addresses = [];
    let tokens = [];
    if (arg2 == "me") {
        addresses.push(MY_ADDRESS);
    } else if (arg2 == "whaleA") {
        addresses.push(WHALE_A_ADDRESS);
    } else if (arg2 = "all") {
        addresses.push(MY_ADDRESS);
        addresses.push(WHALE_A_ADDRESS);
    }
    if (process.argv.length > 3) {
        if (process.argv[3] == "all") {
            for (const aTokenSymbol in ERC20_TOKEN) {
                tokens.push(ERC20_TOKEN[aTokenSymbol]);
            }
        } else {
            for (let i = 3; i < process.argv.length; i++) {
                let tokenStr = process.argv[i];
                let token = ERC20_TOKEN[tokenStr.toUpperCase()];
                tokens.push(token);
            }
        }
    }
    for (let i = 0; i < addresses.length; i++) {
        await printNativeBalance(addresses[i]);
        for (let j = 0; j < tokens.length; j++) {
            await printTokenBalance(addresses[i], tokens[j]);
        }
    }
    return;
}
*/
main();

