const {ethers} = require('ethers');
const {ERC20_TOKEN} = require('./constants');
const {init, printGeneralInfo, printTokenInfoAndBalanceByAddress} = require('./helpers');

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function main() {
    console.log(`tokenCheck.main: 1.1;`);
    await printGeneralInfo();

    // node tokenCheck.js -a<address> | -s<symbol>
    if (process.argv.length < 3) {
        console.log(`tokenCheck.main: ERROR - arguments wrong;`);
        console.log(`node tokenCheck.js -a<address> | -s<symbol>`);
        console.log(`e.g:`);
        console.log(`node tokenCheck.js -a0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270`);
        console.log(`node tokenCheck.js -sUSDT`);
        return;
    }
    let isAddressCheck = false;
    let isSymbolCheck = false;
    let tokenData = undefined;

    let arg3 = process.argv[2];
    if (arg3.substring(0,2) == "-a") {
        isAddressCheck = true;
    } else if (arg3.substring(0,2) == "-s") {
        isSymbolCheck = true;
    } else {
        console.log(`ERROR - invalid argument:${arg3};`);
        return;
    }

    let tokenAddress = "n/a";
    if (isSymbolCheck) {
        let tokenSymbol = arg3.substring(2);
        let tokenData = ERC20_TOKEN[tokenSymbol.toUpperCase()];
        if (tokenData == undefined) {
            console.log(`tokenCheck.main: tokenData not found for [${tokenSymbol}];`);
            return;
        }
        console.log(`tokenCheck.main: tokenData for [${tokenSymbol}]:${JSON.stringify(tokenData)};`);
        tokenAddress = tokenData.addressAcrossNetworks[network];
    } 
    if (isAddressCheck) {
        tokenAddress = arg3.substring(2);
    }
    printTokenInfoAndBalanceByAddress(tokenAddress);
}

main();