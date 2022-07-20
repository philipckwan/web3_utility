const {ethers} = require('ethers');
const {ERC20_TOKEN, WHALE_A_WALLET_SECRET} = require('./constants');
const {init, getConnectedWallet, MY_WALLET_SECRET, swapTokenToToken} = require('./helpers');

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function main() {
    // arguments are being passed
    // node swapTokens.js <account> <tokenFrom> <tokenTo> <amountFrom>
    if (process.argv.length != 6) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node swapTokens.js <account> <tokenFrom> <tokenTo> <amountFrom>`);
        return;
    }
    let account = process.argv[2];
    let tokenFrom = ERC20_TOKEN[process.argv[3].toUpperCase()];
    let tokenTo = ERC20_TOKEN[process.argv[4].toUpperCase()];
    let amountFrom = process.argv[5];
    
    let fromWallet = null;
    if (account == "me") {
        fromWallet = getConnectedWallet(MY_WALLET_SECRET);
    } else if (account == "whaleA") {
        fromWallet = getConnectedWallet(WHALE_A_WALLET_SECRET);
    }
    
    swapTokenToToken(fromWallet, fromWallet.address, tokenFrom, tokenTo, amountFrom);
}

main();