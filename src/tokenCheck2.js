const {TOKENS} = require('./constantsToken');

async function main() {
    console.log(`tokenCheck2.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`tokenCheck2.main: ERROR - arguments wrong;`);
        console.log(`node tokenCheck2.js <token symbol> | <token address>`);
        console.log(`e.g:`);
        console.log(`node tokenCheck2.js usdt`);
        console.log(`node tokenCheck2.js 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270`);
        console.log(`for token address, can be partial as long as it is unique, e.g:`);
        console.log(`node tokenCheck2.js 0x0d50`);
        return;
    }
    let tokenStr = process.argv[2];
    console.log(`tokenCheck2: tokenStr:${tokenStr};`);
    let foundTokens = [];
    for (let aToken of TOKENS) {
        let matchIdx = aToken[0].toUpperCase().indexOf(tokenStr.toUpperCase());
        if (matchIdx >= 0) {
            foundTokens.push(aToken);
        } else {
            matchIdx = aToken[1].indexOf(tokenStr.toUpperCase());
            if (matchIdx >= 0) {
                foundTokens.push(aToken);
            }
        }
        //console.log(`aToken: addr:${aToken[0]}; symb:${aToken[1]};`);
    }

    for(let aFoundToken of foundTokens) {
        console.log(`found token: address:[${aFoundToken[0]}]; symbol:[${aFoundToken[1]}];`);
    }
}

main()