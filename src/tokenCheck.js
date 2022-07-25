const {TOKENS, findTokens} = require('./constantsToken');
const {ethers} = require('ethers');
const {init, getProvider} = require("./helpers");
const ERC20ABI = require('../abis/abi.json');
require('dotenv').config();
init();

async function main() {
    //console.log(`tokenCheck.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`tokenCheck.main: ERROR - arguments wrong;`);
        console.log(`node tokenCheck.js <token symbol> | <token address>`);
        console.log(`e.g:`);
        console.log(`node tokenCheck.js usdt`);
        console.log(`node tokenCheck.js 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270`);
        console.log(`for token address, can be partial as long as it is unique, e.g:`);
        console.log(`node tokenCheck.js 0x0d50`);
        return;
    }
    let tokenStr = process.argv[2];
    let foundTokens = findToken(tokenStr);

    for(let aFoundToken of foundTokens) {
        let aFoundTokenAddress = aFoundToken[0];
        let aFoundTokenSymbol = aFoundToken[1];
        console.log(`-found token: address:[${aFoundTokenAddress}]; symbol:[${aFoundTokenSymbol}];`);
        let tokenContract = new ethers.Contract(aFoundTokenAddress, ERC20ABI, getProvider());
        let tokenSymbolFromContract = await tokenContract.symbol();
        let tokenDecimalsFromContract = await tokenContract.decimals();
        let tokenNameFromContract = await tokenContract.name();
        console.log(`--info from token contract: address:[${tokenContract.address}]; symbol:[${tokenSymbolFromContract}]; name:[${tokenNameFromContract}]; decimals:[${tokenDecimalsFromContract}];`);
    
        let bnBalance = await tokenContract.balanceOf(process.env.WALLET_ADDRESS);
        let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);
        console.log(`--balance for [${process.env.WALLET_ADDRESS}]:$${balance};`);
    }
}

main()