const {ethers} = require('ethers');
const ERC20ABI = require('../abis/abi.json');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const {UniswapV3Commons} = require('./utils/UniswapV3Commons');

async function main() {

    if (process.argv.length < 5) {
        console.log(`liquidityPoolCheck: ERROR - arguments wrong;`);
        console.log(`node liquidityPoolCheck.js [-n<network>] [-l<local>] [-f<fee1>,<fee2>,...] <tokenOrAddress0> <tokenOrAddress1> [<poolAddress>]`);
        console.log(`node liquidityPoolCheck.js -f500,1000,3000 dai weth`);
        console.log(` the above command will check for any uniswapV3 liquidity pool existed for dai/weth pair, for 3 fees: 500, 1000 and 3000`);
        console.log(``);
        console.log(`node liquidityPoolCheck.js -nPM wmatic weth 0xadbF1854e5883eB8aa7BAf50705338739e558E5b`);
        console.log(` the above command will check for liquidity pool at address 0xadbF and query the balances for wmatic and weth`);
        return;
    }

    // sample quickswap pool
    // 0xadbF1854e5883eB8aa7BAf50705338739e558E5b
    // https://polygonscan.com/address/0xadbf1854e5883eb8aa7baf50705338739e558e5b#code

    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();
    
    UniswapV3Commons.init(Context.getWeb3Provider());
    //init(parsedNetworkStr, parsedLocalStr);
    //await printGeneralInfo();

    let isFeeSpecified = false;
    let fees = [];
    let tokens = [];
    let poolAddress = "";
    for (let i = 0; i < remainingArgv.length; i++) {
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
                tokens.push(Context.findOneToken(remainingArgv[i], true))
            }
        }
    }    
    if (tokens.length == 3) {
        // assume the 3rd address is pool address
        poolAddress = tokens[2][0];
    } else if (tokens.length != 2) {
        console.log(`liquidityPoolCheck: ERROR - not 2 tokens, tokens.length:${tokens.length};`);
        return;
    }

    let token0Contract = new ethers.Contract(tokens[0][0], ERC20ABI, Context.getWeb3Provider());
    let token0SymbolFromContract = await token0Contract.symbol();
    let token0DecimalsFromContract = await token0Contract.decimals();
    let token1Contract = new ethers.Contract(tokens[1][0], ERC20ABI, Context.getWeb3Provider());
    let token1SymbolFromContract = await token1Contract.symbol();
    let token1DecimalsFromContract = await token1Contract.decimals();

    if (!isFeeSpecified && poolAddress == "") {
        console.log(`liquidityPoolCheck: fee is not specified, defaults to all valid fees;`);
    }

    let resultsFeesAndPoolAddresses = [];
    if (poolAddress == "") {
        // uniswapV3 find pools
        resultsFeesAndPoolAddresses = await UniswapV3Commons.findPools(token0Contract.address, token1Contract.address, fees);
    } else {
        // pool specified
        resultsFeesAndPoolAddresses.push([0, poolAddress]);
    }

    console.log(`t0:[${token0SymbolFromContract.padStart(6)}]; t1:[${token1SymbolFromContract.padStart(6)}]`);
    for (let i = 0; i < resultsFeesAndPoolAddresses.length; i++) {
        let aFee =  resultsFeesAndPoolAddresses[i][0];
        let aPoolAddress = resultsFeesAndPoolAddresses[i][1];
        if (aPoolAddress == UniswapV3Commons.INVALID_POOL_ADDRESS) {
            console.log(`--f[${aFee.toString().padStart(5)}] @[${"n/a".padStart(42)}]`);
        } else {
            let token0Balance = Number(ethers.utils.formatUnits(await token0Contract.balanceOf(aPoolAddress), token0DecimalsFromContract));
            let token1Balance = Number(ethers.utils.formatUnits(await token1Contract.balanceOf(aPoolAddress), token1DecimalsFromContract));
            let rate =  token0Balance / token1Balance;
            console.log(`--f[${aFee.toString().padStart(5)}] @[${aPoolAddress}] t0[${token0Balance.toFixed(4).toString().padStart(16)}] t1[${token1Balance.toFixed(4).toString().padStart(16)}]; %[${rate.toFixed(6)}]`);
        }
    }
    
}

main();