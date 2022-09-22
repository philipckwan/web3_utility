//const {findOneToken} = require('./constantsToken');
const {ethers} = require('ethers');
//const {init, getProvider, printGeneralInfo, argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require("./helpers");
//const ERC20ABI = require('../abis/abi.json');
//const {Context} = require('./Context');
//const {Utilities} = require('./Utilities');
const {abi:uniswapV3FactoryABI} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");

const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

class UniswapV3Commons {

    constructor() {
        this.isInited = false;
        this.factoryContract = null;
        console.log(`UniswapV3Commons.constructor;`);
    }

    init(web3Provider) {
        if (this.isInited) {
            console.log(`UniswapV3Commons.init: WARN - already inited;`);
            return;
        }
        this.factoryContract = new ethers.Contract(uniswapV3FactoryAddress, uniswapV3FactoryABI, web3Provider);
        this.isInited = true;
        console.log(`UniswapV3Commons.init: DONE;`)
    }

    async findPool(token0Address, token1Address, fee) {
        let poolAddress = await this.factoryContract.getPool(token0Address, token1Address, fee)
        console.log(`UniswapV3Commons.findPool: fee:${fee}; poolAddress:${poolAddress};`);
        return poolAddress;
    }
}

exports.UniswapV3Commons = UniswapV3Commons;

/*
async function main() {
    console.log(`UniswapV3Commons.main: 1.0;`);
    let ctx = new Context();
    ctx.init("PM","remote");
    await ctx.printNetworkAndBlockNumber();
    
}

main();
*/