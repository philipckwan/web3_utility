const {ethers} = require('ethers');
//const {WHALE_A_ADDRESS, WHALE_A_WALLET_SECRET} = require('./constants');
const {init, getConnectedWallet, printNativeBalance} = require('./helpers');

init();

async function main() {
    // arguments are being passed
    if (process.argv.length != 5) {
        console.log(`transferNative.main: ERROR - arguments wrong;`);
        console.log(`node transferNative.js <sender private key> <receiver address> <amount>`);
        return;
    }
    let senderSecret = process.argv[2];
    let receiverAddress = process.argv[3];
    let amount = process.argv[4];
    
    let senderWallet = getConnectedWallet(senderSecret);

    let param = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amount.toString())
    }
    try {
        await senderWallet.sendTransaction(param);
        console.log(`transferNative: transfer executed successfully;`);
    } catch (ex) {
        console.log(`transferNative: transfer executed with ERROR; ${ex.error.data.message};`);
        //console.log(ex.error.data.message);
    }
    printNativeBalance(senderWallet.address);
    printNativeBalance(receiverAddress);
}

main();