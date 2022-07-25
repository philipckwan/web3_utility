const {ethers} = require('ethers');
const {ERC20_TOKEN, WHALE_A_WALLET_SECRET} = require('./constants');
const {init, getConnectedWallet, MY_WALLET_SECRET, wrapNative} = require('./helpers');
init();

async function main() {
    // arguments are being passed
    // node wrapNative.js <account> <amount>
    if (process.argv.length != 4) {
        console.log(`wrapNative.main: ERROR - arguments wrong;`);
        console.log(`node wrapNative.js <account> <amount>`);
        return;
    }
    let account = process.argv[2];
    let amount = process.argv[3];
    
    let fromWallet = null;
    if (account == "me") {
        fromWallet = getConnectedWallet(MY_WALLET_SECRET);
    } else if (account == "whaleA") {
        fromWallet = getConnectedWallet(WHALE_A_WALLET_SECRET);
    }

    await wrapNative(fromWallet, amount);

}

main();