//const {findOneToken} = require('./constantsToken');
const {ethers} = require('ethers');
//const {init, getProvider, printGeneralInfo, argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require("./helpers");
//const ERC20ABI = require('../abis/abi.json');
//const {Context} = require('./Context');
//const {Utilities} = require('./Utilities');
const {abi:uniswapV3FactoryABI} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const {abi:uniswapV3QuoterABI} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {Constants} = require('../constants/Constants');

const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const uniswapV3QuoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

class UniswapV3Commons {

    constructor() {
        this.isInited = false;
        this.factoryContract = null;
        this.quoterContract = null;
        this.fees = [100, 500, 1000, 3000, 10000];
        console.log(`UniswapV3Commons.constructor;`);
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    init(web3Provider) {
        if (this.isInited) {
            console.log(`UniswapV3Commons.init: WARN - already inited;`);
            return;
        }
        this.factoryContract = new ethers.Contract(uniswapV3FactoryAddress, uniswapV3FactoryABI, web3Provider);
        this.quoterContract = new ethers.Contract(uniswapV3QuoterAddress, uniswapV3QuoterABI, web3Provider);
        this.isInited = true;
        console.log(`UniswapV3Commons.init: DONE;`)
    }

    async findPool(token0Address, token1Address, fee) {
        let poolAddress = await this.factoryContract.getPool(token0Address, token1Address, fee)
        //console.log(`UniswapV3Commons.findPool: fee:${fee}; poolAddress:${poolAddress};`);
        return poolAddress;
    }

    async getPrice(tokenInAddress, tokenOutAddress, amountIn, fee) {
        let quotedAmountOut = ethers.BigNumber.from(0);

        try {
            quotedAmountOut = await this.quoterContract.callStatic.quoteExactInputSingle(tokenInAddress, tokenOutAddress, fee, amountIn.toString(), 0);
            //console.log(`UniswapV3Commons.getPrice: quotedAmountOut:${quotedAmountOut};`);
        } catch (ex) {
        }
        if (!ethers.BigNumber.isBigNumber(quotedAmountOut)) {
            console.log(`UniswapV3Commons.getPrice: WARN - amountsOut returned is null, will return 0;`);
            return ethers.BigNumber.from(0);
        }
        return quotedAmountOut;
    }

    async getPricesAcrossAllFees(tokenInAddress, tokenOutAddress, amountIn) {
        console.log(`UniswapV3Commons.getPricesAcrossAllFees: tokenInAddress:${tokenInAddress}; tokenOutAddress:${tokenOutAddress}; amountIn:${amountIn};`);
        let resultsFeesAndQuotedAmountOut = [];
        for (let i = 0; i < this.fees.length; i++) {
            let aFee = this.fees[i];
            //console.log(`__aFee:${aFee};`);
            let quotedAmountOut = await this.getPrice(tokenInAddress, tokenOutAddress, amountIn, aFee);
            resultsFeesAndQuotedAmountOut.push([aFee, quotedAmountOut]);
        }
        return resultsFeesAndQuotedAmountOut;
    }

    lookupUniswapV3PoolFeeBySymbol(token1Symbol, token2Symbol) {
        let fee = -1;
    
        let key1 = `${token1Symbol}_${token2Symbol}`;
        let key2 = `${token2Symbol}_${token1Symbol}`;
    
        let value1 = Constants.UNISWAP_V3_FEE[key1];
        let value2 = Constants.UNISWAP_V3_FEE[key2];
    
        if (value1 === undefined && value2 === undefined) {
            console.log(`UniswapV3Commons.lookupUniswapV3PoolFeeBySymbol: ERROR - fee not found for [${key1}] pair, returning -1;`);
            return -1;
        } else if (value1 !== undefined && value2 !== undefined) {
            if (value1 != value2) {
                console.log(`UniswapV3Commons.lookupUniswapV3PoolFeeBySymbol: ERROR - fee not consistent for [${key1}] pair, returning -1;`);
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
}

exports.UniswapV3Commons = UniswapV3Commons.Instance;

/*
async function main() {
    console.log(`UniswapV3Commons.main: 1.0;`);
    let ctx = new Context();
    ctx.init("PM","remote");
    await ctx.printNetworkAndBlockNumber();
    
}

main();
*/