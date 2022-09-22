const {ethers} = require('ethers');
//const{network, ethers} = require('hardhat');
const ERC20ABI = require('../abis/abi.json');
const {UNISWAP_V3_FEE} = require('./constants/constants');
require('dotenv').config();
//const {abi:UNISWAP_V3_ROUTER_ABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');

exports.MY_ADDRESS = process.env.WALLET_ADDRESS;
exports.MY_WALLET_SECRET = process.env.WALLET_SECRET;
/*
exports.init = (networkOverride="", localOverride="") => {

    console.log(`helpers.init: from env: network:${process.env.USE_NETWORK}; local:${process.env.IS_LOCAL};`);
    console.log(`helpers.init: from arg: network:${networkOverride}; local: ${localOverride};`);
    if (this.provider == null) {
        //this.tokenMap = new Map();
        this.network = networkOverride == "" ? process.env.USE_NETWORK : networkOverride;
        this.local = localOverride == "" ? process.env.IS_LOCAL : localOverride;
        let apiUrl = null;
        if (this.network == "mumbai") {
            apiUrl = process.env.API_URL_MUMBAI;
        } else if (this.network == "ethereum_goerli") {
            apiUrl = process.env.API_URL_GOERLI;
        } else if (this.network == "polygon_mainnet" || this.network == "PM") {
            this.network = "polygon_mainnet";
            apiUrl = process.env.API_URL_POLYGON_MAINNET;
        } else if (this.network == "ethereum_mainnet" || this.network == "EM") {
            this.network = "ethereum_mainnet";
            apiUrl = process.env.API_URL_ETHEREUM_MAINNET;
        } else if (this.network == "fantom_mainnet" || this.network == "FM") {
            this.network = "fantom_mainnet";
            apiUrl = process.env.API_URL_FANTOM_MAINNET;
        } else {
            console.log(`helpers.init: ERROR - unknown network;`);
            process.exit();
        }
        if (this.local == "local" || this.local == "L") {
            this.local = "local";
            apiUrl = process.env.API_URL_LOCALHOST;
        } 
        //this.provider = new ethers.providers.JsonRpcProvider(apiUrl);
        this.provider = new ethers.providers.StaticJsonRpcProvider(apiUrl);
    }
    console.log(`helpers.init: END: network:${this.network}; local:${this.local};`);
}

exports.printGeneralInfo = async () => {
    let blockNumber = await this.provider.getBlockNumber();
    console.log(`helpers.printGeneralInfo: 1.0; network:[${this.network}]; local:[${this.local}]; blockNumber:[${blockNumber}];`)
}

exports.formatTime = (d) => {
    let aDate = new Date(d);
    let hour = aDate.getHours();
    let minute = aDate.getMinutes();
    let second = aDate.getSeconds();
    let mSec = aDate.getMilliseconds();
    return `${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}:${second.toString().padStart(2,"0")}:${mSec.toString().padStart(3,"0")}`;
}

exports.ARGV_KEY_SWAPS = ["-s", "SWAPS"]
exports.ARGV_KEY_AMOUNT = ["-a", "AMOUNT"]
exports.ARGV_KEY_NETWORK = ["-n", "NETWORK"]
exports.ARGV_KEY_LOCAL = ["-l", "LOCAL"]
exports.ARGV_KEY_REVERSE = ["-r", "REVERSE"]

exports.argumentParsers = (argv) => {
    let parsedArgMap = new Map()
    let remainingArgv = [];
    for (let i = 0; i < argv.length; i++) {
        if (argv[i].substring(0,2) == this.ARGV_KEY_SWAPS[0]) {
            parsedArgMap.set(this.ARGV_KEY_SWAPS[1], argv[i].substring(2))
            continue
        }
        if (argv[i].substring(0,2) == this.ARGV_KEY_AMOUNT[0]) {
            parsedArgMap.set(this.ARGV_KEY_AMOUNT[1], argv[i].substring(2))
            continue
        }
        if (argv[i].substring(0,2) == this.ARGV_KEY_NETWORK[0]) {
            parsedArgMap.set(this.ARGV_KEY_NETWORK[1], argv[i].substring(2))
            continue
        }
        if (argv[i].substring(0,2) == this.ARGV_KEY_LOCAL[0]) {
            parsedArgMap.set(this.ARGV_KEY_LOCAL[1], argv[i].substring(2))
            continue
        }
        if (argv[i].substring(0,2) == this.ARGV_KEY_REVERSE[0]) {
            parsedArgMap.set(this.ARGV_KEY_REVERSE[1], argv[i].substring(2))
            continue
        }
        remainingArgv.push(argv[i]);
    }
    return [parsedArgMap, remainingArgv]
}
*/

/*
exports.getConnectedWallet = (walletSecret) => {
    let connectedWallet = null;
    if (walletSecret == null || walletSecret.length == 0) {
        console.log(`helpers.getConnectedWallet: ERROR - invalid walletSecret:${walletSecret};`);
        process.exit();
    }
    let wallet = new ethers.Wallet(walletSecret);
    connectedWallet = wallet.connect(this.provider);

    return connectedWallet;
}


exports.getTokenContractByAddress = (tokenAddress) => {
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    return tokenContract;
}


exports.getTokenContract = (token) => {
    if (!this.tokenMap.has(token.symbol)) {
        //console.log(`helpers.getTokenContract: creating a new ERC20 token contract for [${token.symbol}];`);
        let tokenAddress = token.addressAcrossNetworks[this.network];
        if (tokenAddress === undefined || tokenAddress === null || tokenAddress.length == 0) {
            console.log(`helpers.getTokenContract: ERROR - token has no address defined; [${token.symbol}]; address:${tokenAddress};`);
            return null;
        } 
        let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
        this.tokenMap.set(token.symbol, tokenContract);
    }
    return this.tokenMap.get(token.symbol);
}


exports.printNativeBalance = async (address) => {
    let bnNativeBalance = await this.provider.getBalance(address);
    let nativeBalance = ethers.utils.formatUnits(bnNativeBalance, 18);

    console.log(`helpers.printNativeBalance: address:[${address}]; nativeBalance:$${nativeBalance};`);
}

exports.printTokenBalance = async (walletAddress, tokenAddress) => {
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();

    let bnBalance = await tokenContract.balanceOf(walletAddress);
    let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);

    console.log(`-address:[${tokenAddress}]; token:[${tokenSymbolFromContract.padStart(6)}]; $${balance};`);
}
*/

/*
exports.getProvider = () => {
    return this.provider;
}

exports.getNetwork = () => {
    return this.network;
}
*/

exports.lookupUniswapV3PoolFee = (token1, token2) => {
    return this.lookupUniswapV3PoolFeeBySymbol(token1.symbol, token2.symbol);
}

exports.lookupUniswapV3PoolFeeBySymbol = (token1Symbol, token2Symbol) => {
    let fee = -1;

    let key1 = `${token1Symbol}_${token2Symbol}`;
    let key2 = `${token2Symbol}_${token1Symbol}`;

    let value1 = UNISWAP_V3_FEE[key1];
    let value2 = UNISWAP_V3_FEE[key2];

    if (value1 === undefined && value2 === undefined) {
        console.log(`helpers.lookupUniswapV3PoolFeeBySymbol: ERROR - fee not found for [${key1}] pair, returning -1;`);
        return -1;
    } else if (value1 !== undefined && value2 !== undefined) {
        if (value1 != value2) {
            console.log(`helpers.lookupUniswapV3PoolFeeBySymbol: ERROR - fee not consistent for [${key1}] pair, returning -1;`);
            return -1;
        } else {
            fee = value1;
        }
    } else if (value1 !== undefined) {
        fee = value1;
    } else if (value2 !== undefined) {
        fee = value2;
    }
    return fee;
}

exports.getPoolImmutables = async (poolContract) => {
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee()
    ]);

    const immutables = {
        token0: token0,
        token1: token1,
        fee: fee
    };
    return immutables;
}

exports.getPoolState = async (poolContract) => {
    const slot = poolContract.slot0();

    const state = {
        sqrtPriceX96: slot[0]
    }
    return state;
}

/*
exports.fundERC20 = async (sender, recepient, token, amount) => {
    console.log(`helpers.fundERC20: 1.0`);
    const tokenContract = this.getTokenContract(token);
    const bnAmount = ethers.utils.parseUnits(amount.toString(), token.decimals);

    console.log(`__bnAmount:${bnAmount}; token:${await tokenContract.symbol()}`);
  
    // fund erc20 token to the contract
    const MrWhale = await ethers.getSigner(sender);
  
    const contractSigner = tokenContract.connect(MrWhale);
    await contractSigner.transfer(recepient, bnAmount);
    console.log(`helpers.fundERC20: 9.0`);
};
  
exports.impersonateFundErc20 = async (sender, recepient, token, amount) => {
    console.log(`helpers.impersonateFundErc20: 1.0`);
    await network.provider.request({method: "hardhat_impersonateAccount", params: [sender]});
  
    // fund baseToken to the contract
    await this.fundERC20(sender, recepient, token, amount);
  
    await network.provider.request({method: "hardhat_stopImpersonatingAccount", params: [sender]});
    console.log(`helpers.impersonateFundErc20: 9.0`);
};
*/


