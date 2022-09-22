const {ConstantsToken} = require('./constants/ConstantsToken');
const {ethers} = require('ethers');
const ERC20ABI = require('../abis/abi.json');
const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities');
const {UniswapV3Commons} = require('./utils/UniswapV3Commons');

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
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();
    
    UniswapV3Commons.init(Context.getWeb3Provider());
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
                tokens.push(ConstantsToken.findOneToken(remainingArgv[i]))
            }
        }
    }    
    if (tokens.length != 2) {
        console.log(`liquidityPoolCheck: ERROR - not 2 tokens, tokens.length:${tokens.length};`);
        return;
    }
    if (!isFeeSpecified) {
        console.log(`liquidityPoolCheck: fee is not specified, defaults to [100,500,1000,3000,10000];`);
        fees.push(100);
        fees.push(500);
        fees.push(1000);
        fees.push(3000);
        fees.push(10000);
    }

    for (let i = 0; i < fees.length; i++) {
        let aFee = fees[i];
        let poolAddress = await UniswapV3Commons.findPool(tokens[0][0], tokens[1][0], aFee);
        if (poolAddress == "0x0000000000000000000000000000000000000000") {
            console.log(`--fee:${aFee}; pool not found;`)
        } else {
            console.log(`--fee:${aFee}; poolAddress:${poolAddress};`);
            let token0Contract = new ethers.Contract(tokens[0][0], ERC20ABI, Context.getWeb3Provider());
            let token0SymbolFromContract = await token0Contract.symbol();
            let token0DecimalsFromContract = await token0Contract.decimals();
            let token0BnBalance = await token0Contract.balanceOf(poolAddress);
            let token0Balance = ethers.utils.formatUnits(token0BnBalance, token0DecimalsFromContract);
            console.log(`----[${token0SymbolFromContract.padStart(6)}]: $${token0Balance};`);
            let token1Contract = new ethers.Contract(tokens[1][0], ERC20ABI, Context.getWeb3Provider());
            let token1SymbolFromContract = await token1Contract.symbol();
            let token1DecimalsFromContract = await token1Contract.decimals();
            let token1BnBalance = await token1Contract.balanceOf(poolAddress);
            let token1Balance = ethers.utils.formatUnits(token1BnBalance, token1DecimalsFromContract);
            console.log(`----[${token1SymbolFromContract.padStart(6)}]: $${token1Balance};`)
        
        }
    }
    
}

main();