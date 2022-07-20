const {ERC20_TOKEN, WHALE_A_ADDRESS} = require('./constants');
const {init, printGeneralInfo, printNativeBalance, printTokenStatus, getTokenMap, MY_ADDRESS , printTokenBalance} = require('./helpers');

const network = "polygon_mainnet";
const mode="local";
init(mode, network);

async function main() {
    // arguments are being passed
    // node getBalance.js <account> <tokenFrom> <tokenTo> <amountFrom>
    if (process.argv.length < 3) {
        console.log(`swapTokens.main: ERROR - arguments wrong;`);
        console.log(`node getBalance.js <account(s)> [<token1|all> <token2>...]`);
        return;
    }
    console.log(`getBalance.main: v1.0;`);
    await printGeneralInfo();

    let arg2 = process.argv[2];
    let addresses = [];
    let tokens = [];
    if (arg2 == "me") {
        addresses.push(MY_ADDRESS);
    } else if (arg2 == "whaleA") {
        addresses.push(WHALE_A_ADDRESS);
    } else if (arg2 = "all") {
        addresses.push(MY_ADDRESS);
        addresses.push(WHALE_A_ADDRESS);
    }
    if (process.argv.length > 3) {
        if (process.argv[3] == "all") {
            for (const aTokenSymbol in ERC20_TOKEN) {
                tokens.push(ERC20_TOKEN[aTokenSymbol]);
            }
        } else {
            for (let i = 3; i < process.argv.length; i++) {
                let tokenStr = process.argv[i];
                let token = ERC20_TOKEN[tokenStr.toUpperCase()];
                tokens.push(token);
            }
        }
    }
    for (let i = 0; i < addresses.length; i++) {
        await printNativeBalance(addresses[i]);
        for (let j = 0; j < tokens.length; j++) {
            await printTokenBalance(addresses[i], tokens[j]);
        }
    }
    return;
}

main();

