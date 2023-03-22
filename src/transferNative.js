const {ethers} = require('ethers');
//const {WHALE_A_ADDRESS, WHALE_A_WALLET_SECRET} = require('./constants');
//const {init, getConnectedWallet, printNativeBalance} = require('./helpers');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');

async function main() {
    // arguments are being passed
    if (process.argv.length != 5) {
        console.log(`transferNative.main: ERROR - arguments wrong;`);
        console.log(`node transferNative.js <sender private key> <receiver address> -a<amount>`);
        return;
    }

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedAmountStr = parsedArgMap.get(Utilities.ARGV_KEY_AMOUNT[1]);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();
    [isFromAll, amount] = Context.amountParser(parsedAmountStr, 1);
    let senderSecret = remainingArgv[0];
    let receiverAddress = remainingArgv[1];
    
    let wallet = new ethers.Wallet(senderSecret);
    let connectedWalletSender = wallet.connect(Context.getWeb3Provider());
    //let senderWallet = getConnectedWallet(senderSecret);

    console.log(`__amount:${amount};`);

    let param = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amount.toString())
    }
    try {
        await connectedWalletSender.sendTransaction(param, {gasLimit: 35000});
        console.log(`transferNative: transfer executed successfully;`);
    } catch (ex) {
        console.log(`transferNative: transfer executed with ERROR; ${ex};`);
        //console.log(ex.error.data.message);
    }
    //printNativeBalance(connectedWalletSender.address);
    //printNativeBalance(receiverAddress);
}

main();