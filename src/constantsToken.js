
exports.TOKENS = [
    ["0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "USDC"],
    ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f", "USDT"],
    ["0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", "DAI"],
    ["0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6", "WBTC"],
    ["0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39", "LINK"],
    ["0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", "WMATIC"],
    ["0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", "WETH"],
    ["0xb33eaad8d922b1083446dc23f610c2567fb5180f", "UNI"],
    ["0x16DFb898cf7029303c2376031392cb9baC450f94", "DMA"],
    ["0x831753DD7087CaC61aB5644b308642cc1c33Dc13", "QUICK"],
    ["",""],
    ["",""]
]

exports.findTokens = (tokenStr) => {
    let foundTokens = [];
    for (let aToken of this.TOKENS) {
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
    return foundTokens;
}

exports.findOneToken = (tokenStr) => {
    let foundTokens = this.findTokens(tokenStr);
    if (foundTokens.length != 1) {
        console.log(`constantsToken.findOneToken: ERROR - not able to find exactly 1 token, found ${foundTokens.length} instead;`);
        return undefined;
    }
    return foundTokens[0];
}
