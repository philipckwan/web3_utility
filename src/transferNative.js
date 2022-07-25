const {ethers} = require('ethers');
const {WHALE_A_ADDRESS, WHALE_A_WALLET_SECRET} = require('./constants');
const {init, getConnectedWallet, MY_ADDRESS, MY_WALLET_SECRET, transferNative} = require('./helpers');

init();

async function main() {
    // arguments are being passed
    // node transferNative.js <from account> <to account> <amount>
    if (process.argv.length != 5) {
        console.log(`transferNative.main: ERROR - arguments wrong;`);
        console.log(`node transferNative.js <from account> <to account> <amount>`);
        return;
    }
    let from = process.argv[2];
    let to = process.argv[3];
    let amount = process.argv[4];
    
    let fromWallet = null;
    let toAddress = null;
    if (from == "me") {
        fromWallet = getConnectedWallet(MY_WALLET_SECRET);
    } else if (from == "whaleA") {
        fromWallet = getConnectedWallet(WHALE_A_WALLET_SECRET);
    }

    if (to == "me") {
        toAddress = MY_ADDRESS;
    } else if (to == "whaleA") {
        toAddress = WHALE_A_ADDRESS;
    }
    
    transferNative(fromWallet, toAddress, amount);
}

main();