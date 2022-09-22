const {findOneToken} = require('./constants/constantsToken');
const {ethers} = require('ethers');
//const {argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require("./helpers");
const ERC20ABI = require('../abis/abi.json');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const {UniswapV3Commons} = require('./utils/UniswapV3Commons');
//const uniswapV3FactoryABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json").abi;
//const uniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

/*
exports.findPool = async (token0Address, token1Address, fee) => {
    const factoryContract = new ethers.Contract(uniswapV3FactoryAddress, uniswapV3FactoryABI, getProvider());
    let poolAddress = await factoryContract.getPool(token0Address, token1Address, fee)
    console.log(`liquidityPoolCheck.findPool: fee:${fee}; poolAddress:${poolAddress};`);
    return poolAddress;
}
*/

async function main() {

    if (process.argv.length < 5) {
        console.log(`liquidityPoolCheck: ERROR - arguments wrong;`);
        console.log(`node liquidityPoolCheck.js [-n<network>] [-l<local>] -f<fee1>[,<fee2>,...] <tokenOrAddress0> <tokenOrAddress1>`);
        console.log(`node liquidityPoolCheck.js -f500,1000,3000 dai weth`);
        console.log(` the above command will check for any liquidity pool existed for dai/weth pair, for 3 fees: 500, 1000 and 3000`);
        console.log(``);
        return;
    }

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    let ctx = Context;
    ctx.init(parsedNetworkStr, parsedLocalStr);
    await ctx.printNetworkAndBlockNumber();
    let uniV3 = new UniswapV3Commons();
    uniV3.init(ctx.getWeb3Provider());
    //init(parsedNetworkStr, parsedLocalStr);
    //await printGeneralInfo();

    let isFeeSpecified = false;
    let fees = [];
    let tokens = [];
    for (let i = 2; i < remainingArgv.length; i++) {
        if (remainingArgv[i].substring(0,2) == "-f") {
            isFeeSpecified = true;
            feesStr = remainingArgv[i].substring(2);
            feesStrSplit = feesStr.split(",");
            for (let j = 0; j < feesStrSplit.length; j++) {
                fees.push(Number(feesStrSplit[j]));
            }
        } else {
            if (remainingArgv[i].substring(0,2) == "0x") {
                tokens.push([remainingArgv[i], `unknown_token_${i-2}`])
            } else {
                tokens.push(findOneToken(remainingArgv[i]))
            }
        }
    }    
    if (tokens.length != 2) {
        console.log(`liquidityPoolCheck: ERROR - not 2 tokens, tokens.length:${tokens.length};`);
        return;
    }
    if (!isFeeSpecified) {
        console.log(`liquidityPoolCheck: ERROR - fee is not specified, operation not supported;`);
        return;
    }

    for (let i = 0; i < fees.length; i++) {
        let aFee = fees[i];
        let poolAddress = await uniV3.findPool(tokens[0][0], tokens[1][0], aFee);
        console.log(`--fee:${aFee}; poolAddress:${poolAddress};`);
        if (poolAddress != "0x0000000000000000000000000000000000000000") {
            let token0Contract = new ethers.Contract(tokens[0][0], ERC20ABI, ctx.getWeb3Provider());
            let token0SymbolFromContract = await token0Contract.symbol();
            let token0DecimalsFromContract = await token0Contract.decimals();
            let token0BnBalance = await token0Contract.balanceOf(poolAddress);
            let token0Balance = ethers.utils.formatUnits(token0BnBalance, token0DecimalsFromContract);
            console.log(`----[${token0SymbolFromContract}]: $${token0Balance};`);
            let token1Contract = new ethers.Contract(tokens[1][0], ERC20ABI, ctx.getWeb3Provider());
            let token1SymbolFromContract = await token1Contract.symbol();
            let token1DecimalsFromContract = await token1Contract.decimals();
            let token1BnBalance = await token1Contract.balanceOf(poolAddress);
            let token1Balance = ethers.utils.formatUnits(token1BnBalance, token1DecimalsFromContract);
            console.log(`----[${token1SymbolFromContract}]: $${token1Balance};`)
        }
        
        
    }
    
}

main();