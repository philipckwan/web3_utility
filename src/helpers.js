const {ethers} = require('ethers');
//const{network, ethers} = require('hardhat');
const ERC20ABI = require('../abis/abi.json');
const {UNISWAP_V3_FEE, ERC20_TOKEN, UNISWAP_V3_ROUTER_ADDRESS} = require('./constants');
require('dotenv').config();
const {abi:UNISWAP_V3_ROUTER_ABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');

exports.MY_ADDRESS = process.env.WALLET_ADDRESS;
exports.MY_WALLET_SECRET = process.env.WALLET_SECRET;

exports.init = () => {

    console.log(`helpers.init: 1.0; mode:${process.env.IS_LOCAL}; network:${process.env.USE_NETWORK};`);
    if (this.provider == null) {
        this.tokenMap = new Map();
        this.network = process.env.USE_NETWORK;
        this.mode = process.env.IS_LOCAL;
        let apiUrl = null;
        if (this.network == "mumbai") {
            apiUrl = process.env.API_URL_MUMBAI;
        } else if (this.network == "goerli") {
            apiUrl = process.env.API_URL_GOERLI;
        } else if (this.network == "polygon_mainnet") {
            apiUrl = process.env.API_URL_POLYGON_MAINNET;
        } else {
            console.log(`helpers.init: ERROR - unknown network;`);
            process.exit();
        }
        if (this.mode == "local") {
            // override the apiUrl is mode == "local"
            apiUrl = process.env.API_URL_LOCALHOST;
        } 
        //this.provider = new ethers.providers.JsonRpcProvider(apiUrl);
        this.provider = new ethers.providers.StaticJsonRpcProvider(apiUrl);
    }
}

exports.formatTime = (d) => {
    let aDate = new Date(d);
    let minute = aDate.getMinutes();
    let second = aDate.getSeconds();
    let mSec = aDate.getMilliseconds();
    return `${minute.toString().padStart(2,"0")}:${second.toString().padStart(2,"0")}:${mSec.toString().padStart(3,"0")}`;
}

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

exports.printGeneralInfo = async () => {
    let blockNumber = await this.provider.getBlockNumber();
    console.log(`helpers.printGeneralInfo: 1.0; network:[${this.network}]; mode:[${this.mode}]; blockNumber:[${blockNumber}];`)
}

exports.printNativeBalance = async (address) => {
    let bnNativeBalance = await this.provider.getBalance(address);
    let nativeBalance = ethers.utils.formatUnits(bnNativeBalance, 18);

    console.log(`helpers.printNativeBalance: address:[${address}]; nativeBalance:$${nativeBalance};`);
}

/*
exports.printTokenInfoAndBalanceByAddress = async (tokenAddress) => {
    let tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();
    let tokenNameFromContract = await tokenContract.name();
    console.log(`helpers.printTokenInfoAndBalanceByAddress: token address:${tokenAddress}; symbol:${tokenSymbolFromContract}; name:${tokenNameFromContract}; decimals:${tokenDecimalsFromContract};`);

    let bnBalance = await tokenContract.balanceOf(this.MY_ADDRESS);
    let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);

    console.log(`helpers.printTokenInfoAndBalanceByAddress: balance for [${this.MY_ADDRESS}]:$${balance};`);
}
*/

exports.printTokenBalance = async (address, token) => {
    let tokenContract = this.getTokenContract(token);
    if (tokenContract == null) {
        return;
    }
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();

    bnBalance = await tokenContract.balanceOf(address);
    balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);

    console.log(`helpers.printTokenBalance: address:[${address}]; token:[${tokenSymbolFromContract}] $${balance};`);
}

/*
exports.printTokenStatus = async (address, token) => {
    let tokenAddressFromConstants = token.addressAcrossNetworks[this.network];
    console.log(`helpers.printTokenStatus: from constants: token:${token.symbol}; address:${tokenAddressFromConstants}; decimals:${token.decimals};`);
    if (tokenAddressFromConstants == null || tokenAddressFromConstants.length == 0) {
        console.log(`helpers.printTokenStatus: ERROR - token address not set; address:[${tokenAddressFromConstants}];`);
        return;
    }
    let tokenContract = this.getTokenContract(token);
    let tokenSymbolFromContract = await tokenContract.symbol();
    let tokenDecimalsFromContract = await tokenContract.decimals();
    console.log(`helpers.printTokenStatus:  from contract: token:${tokenSymbolFromContract}; address:${tokenContract.address}; decimals:${tokenDecimalsFromContract};`);
    bnBalance = await tokenContract.balanceOf(address);
    balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);
    if (token.symbol != tokenSymbolFromContract) {
        console.log(`helpers.printTokenStatus: WARN - token symbol mismatch between constants[${token.symbol}] and contract[${tokenSymbolFromContract}];`)
    }
    console.log(`helpers.printTokenStatus: token:[${tokenSymbolFromContract}] $${balance};`);
}

exports.getTokenMap = () => {
    return this.tokenMap;
}
*/

exports.getProvider = () => {
    return this.provider;
}

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

exports.transferNative = async (senderWallet, receiverAddress, amount) => {
    console.log(`helpers.transferNative: 1.0;`);

    let param = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amount.toString())
    }
    await senderWallet.sendTransaction(param);

    console.log(`helpers.transferNative: 9.0;`);
};


exports.wrapNative = async (fromWallet, amountFrom) => {
    console.log(`helpers.wrapNative: 1.0;`);
    const wmaticContract = this.getTokenContract(ERC20_TOKEN["WMATIC"]);

    let param = {
        to: wmaticContract.address,
        value: ethers.utils.parseEther(amountFrom.toString())
    }
    await fromWallet.sendTransaction(param);

    console.log(`helpers.wrapNative: 9.0;`);
};

exports.swapTokenToToken = async (fromWallet, toAddress, tokenFrom, tokenTo, amountFrom) => {
    console.log(`helpers.swapTokenToToken: 1.0;`);

    const bnAmountFrom = ethers.utils.parseUnits(amountFrom.toString(), tokenFrom.decimals);

    let tokenFromContract = this.getTokenContract(tokenFrom);
    let tokenToContract = this.getTokenContract(tokenTo);
    let swapFee = this.lookupUniswapV3PoolFee(tokenFrom, tokenTo);

    const approvalTx = await tokenFromContract.connect(fromWallet).approve(UNISWAP_V3_ROUTER_ADDRESS, bnAmountFrom);
    const approvalTxReceipt = await approvalTx.wait();
    //console.log(`helpers.swapTokenToToken: ___approvalTxReceipt___BELOW___;`);
    //console.log(approvalTxReceipt);
    //console.log(`helpers.swapTokenToToken: ___approvalTxReceipt___ABOVE___;`);

    
    const swapRouterContract = new ethers.Contract(
        UNISWAP_V3_ROUTER_ADDRESS,
        UNISWAP_V3_ROUTER_ABI,
        this.provider
    );
    
    
    const transaction = await swapRouterContract.connect(fromWallet).exactInputSingle(
        {
            tokenIn: tokenFromContract.address,
            tokenOut: tokenToContract.address,
            fee: swapFee,
            recipient: toAddress,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10),
            amountIn: bnAmountFrom,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        },
        {
            gasLimit: ethers.utils.hexlify(14000000)
        }
    );
    
    const transactionReceipt = await transaction.wait();
    //console.log(`helpers.swapTokenToToken: ___transactionReceipt___BELOW___;`);
    //console.log(transactionReceipt);
    //console.log(`helpers.swapTokenToToken: ___transactionReceipt___ABOVE___;`);
        
    console.log(`helpers.swapTokenToToken: 9.0;`);
};