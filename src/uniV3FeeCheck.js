const {findOneToken} = require('./constantsToken');
const {ethers} = require('ethers');
const {init, getProvider} = require("./helpers");
const {getPriceOnUniV3} = require("./price");
const ERC20ABI = require('../abis/abi.json');
init();

async function main() {

    if (process.argv.length < 4) {
        console.log(`uniV3FeeCheck: ERROR - arguments wrong;`);
        console.log(`node uniV3FeeCheck.js [-a<amount>] [-r] [-f<fee1>[,<fee2>,...]] <tokenFrom> <tokenTo>`);
        console.log(`node uniV3FeeCheck.js -f500,1000,3000 dai weth`);
        console.log(` the above command will check for swap betwen dai and weth for 3 fees: 500, 1000 and 3000`);
        console.log(``);
        console.log(`arguments: -r for reverse swap, i.e. swap 10000 <tokenTo> to <tokenFrom>`);
        return;
    }

    let amount = 1;
    let isReverse = false;
    let isFeeSpecified = false;
    let fees = [];
    let tokens = [];
    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i].substring(0,2) == "-a") {
            amount = Number(process.argv[i].substring(2));
        } else if (process.argv[i].substring(0,2) == "-r") {
            isReverse = true;
        } else if (process.argv[i].substring(0,2) == "-f") {
            isFeeSpecified = true;
            feesStr = process.argv[i].substring(2);
            feesStrSplit = feesStr.split(",");
            for (let j = 0; j < feesStrSplit.length; j++) {
                fees.push(Number(feesStrSplit[j]));
            }
        } else {
            tokens.push(findOneToken(process.argv[i]));
        }
    }    
    if (isReverse) {
        tokens.reverse();
    }
    if (tokens.length != 2) {
        console.log(`uniV3FeeCheck: ERROR - not 2 tokens, tokens.length:${tokens.length};`);
        return;
    }
    if (!isFeeSpecified) {
        console.log(`uniV3FeeCheck: ERROR - fee is not specified, currently not supported;`);
        return;
    }
    let tokenInContract = new ethers.Contract(tokens[0][0], ERC20ABI, getProvider());
    let tokenOutContract = new ethers.Contract(tokens[1][0], ERC20ABI, getProvider());
    let bnAmountIn = ethers.utils.parseUnits(amount.toString(), await tokenInContract.decimals());

    for (let i = 0; i < fees.length; i++) {
        let aFee = fees[i];
        let feePercent = aFee / 10000;
        let feePercentStr = feePercent.toString().padStart(5);
        let bnAmountOut = 0;
        try {
            bnAmountOut = await getPriceOnUniV3(tokens[0][0], tokens[1][0], bnAmountIn, aFee);
        } catch (ex) {
            console.log(`uniV3FeeCheck: [${tokens[0][1]}]->(${feePercentStr}%)->[${tokens[1][1]}]: ERROR;`);
            continue;
        }
        let amountOut = Number(ethers.utils.formatUnits(bnAmountOut, await tokenOutContract.decimals()));
        console.log(`uniV3FeeCheck: [${tokens[0][1]}]->(${feePercentStr}%)->[${tokens[1][1]}]: $${amount}->$${amountOut};`);
    }

}

main();