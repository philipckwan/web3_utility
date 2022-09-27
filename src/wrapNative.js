const {ethers} = require('ethers');
const {Constants} = require('./constants/Constants');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const ERC20ABI = require('../abis/abi.json');
const {WFTM_ABI} = require("../abis/fantom.json")

async function main() {
    // arguments are being passed
    // node wrapNative.js <account> <amount>
    if (process.argv.length != 4) {
        console.log(`wrapNative.main: ERROR - arguments wrong;`);
        console.log(`node wrapNative.js -a<amount> <private key>`);
        return;
    }

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedAmountStr = parsedArgMap.get(Utilities.ARGV_KEY_AMOUNT[1]);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();

    [isFromAll, amount] = Context.amountParser(parsedAmountStr, 1);

    let privateKey = remainingArgv[0];
    console.log(`privateKey:${privateKey};`);

    let wallet = new ethers.Wallet(privateKey);
    let connectedWallet = wallet.connect(Context.getWeb3Provider());

    let wrappedNativeTokenStruct = undefined;
    const network = Context.getNetwork();

    if (network == Constants.NETWORKS.POLYGON_MUMBAI || network == Constants.NETWORKS.POLYGON_MAINNET) {
        wrappedNativeTokenStruct = Context.findOneToken("WMATIC");
    } else if (network == Constants.NETWORKS.ETHEREUM_GOERLI || network == Constants.NETWORKS.ETHEREUM_MAINNET) {
        wrappedNativeTokenStruct = Context.findOneToken("WETH");
    } else if (network == Constants.NETWORKS.FANTOM_MAINNET) {
        wrappedNativeTokenStruct = Context.findOneToken("WFTM")
    } else {
        console.log(`wrapNative: ERROR - invalid network to find the wrapped token; network:${network};`);
        return;
    }
    if (wrappedNativeTokenStruct == undefined) {
        console.log(`wrapNative: ERROR - wrappedNativeTokenStruct not found;`);
        return;
    }
    console.log(`__wrappedNativeTokenStruct:${wrappedNativeTokenStruct};`);

    if (network == Constants.NETWORKS.FANTOM_MAINNET) {
        const wrappedFTMContract = new ethers.Contract(
            wrappedNativeTokenStruct[0],
            WFTM_ABI,
            Context.getWeb3Provider()
        );
    
        let param = {value:ethers.utils.parseEther(amount.toString())};
        const transaction = await wrappedFTMContract.connect(connectedWallet).deposit();
        /*
            bnAmountFrom,
            bnAmountToExpected,
            [tokenFromContract.address, tokenToContract.address],
            connectedWallet.address,
            Math.floor(Date.now() / 1000) + (60 * 10),
            {gasPrice: bnExecutionGasPrice, gasLimit: executionGasLimit}
        );
        */
        return;
    } 

    let param = {
        to: wrappedNativeTokenStruct[0],
        value: ethers.utils.parseEther(amount.toString())
    }
    try {
        await connectedWallet.sendTransaction(param);
    } catch (ex) {
        console.log(`wrapNative: transfer executed with ERROR; ${ex.error.data.message};`);
    }
    let bnNativeBalance = await Context.getWeb3Provider().getBalance(connectedWallet.address);
    let nativeBalance = ethers.utils.formatUnits(bnNativeBalance, 18);
    console.log(`--address:${connectedWallet.address}; nativeBalance:${nativeBalance}`);

    let wrappedNativeTokenContract = new ethers.Contract(wrappedNativeTokenStruct[0], ERC20ABI, Context.getWeb3Provider());

    let bnBalance = await wrappedNativeTokenContract.balanceOf(connectedWallet.address);
    let balance = ethers.utils.formatUnits(bnBalance, await wrappedNativeTokenContract.decimals());
    console.log(`--tokenAddress:[${wrappedNativeTokenContract.address}]; tokenSymbol:[${(await wrappedNativeTokenContract.symbol()).padStart(6)}]; $${balance};`);

}

main();