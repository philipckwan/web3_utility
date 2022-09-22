const {ethers} = require('ethers');
const {ERC20_TOKEN} = require('./constants');
const {init, getConnectedWallet, getNetwork, printNativeBalance, printTokenBalance} = require('./helpers');
const {findOneToken} = require('./constantsToken');
const ERC20ABI = require('../abis/abi.json');
const { Constants } = require('./constants/Constants');

init();

async function main() {
    // arguments are being passed
    // node wrapNative.js <account> <amount>
    if (process.argv.length != 4) {
        console.log(`wrapNative.main: ERROR - arguments wrong;`);
        console.log(`node wrapNative.js <private key> <amount>`);
        return;
    }
    let privateKey = process.argv[2];
    let amount = process.argv[3];
    
    let wallet = getConnectedWallet(privateKey);
    let wrappedNativeTokenStruct = undefined;
    const network = getNetwork();

    if (network == Constants.NETWORKS.POLYGON_MUMBAI || network == Constants.NETWORKS.POLYGON_MAINNET) {
        wrappedNativeTokenStruct = findOneToken("WMATIC");
    } else if (network == Constants.NETWORKS.ETHEREUM_GOERLI || network == Constants.NETWORKS.ETHEREUM_MAINNET) {
        wrappedNativeTokenStruct = findOneToken("WETH");
    } else if (network == Constants.NETWORKS.FANTOM_MAINNET) {
        wrappedNativeTokenStruct = findOneToken("WFTM")
    } else {
        console.log(`wrapNative: ERROR - invalid network to find the wrapped token; network:${network};`);
        return;
    }
    if (wrappedNativeTokenStruct == undefined) {
        console.log(`wrapNative: ERROR - wrappedNativeTokenStruct not found;`);
        return;
    }
    let param = {
        to: wrappedNativeTokenStruct[0],
        value: ethers.utils.parseEther(amount.toString())
    }
    try {
        await wallet.sendTransaction(param);
    } catch (ex) {
        console.log(`wrapNative: transfer executed with ERROR; ${ex.error.data.message};`);
    }

    printNativeBalance(wallet.address);
    printTokenBalance(wallet.address, wrappedNativeTokenStruct[0]);
    //await wrapNative(fromWallet, amount);

}

main();