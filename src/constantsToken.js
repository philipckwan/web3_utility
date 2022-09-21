require('dotenv').config();
const {getNetwork} = require('./helpers');
/*
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
    ["0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a", "SUSHI"],
    ["0x7Ff54B5C384C9F3A3FeCE70e150D2Ce2D70DA6f7", "TBAC"],
    ["0xadBe0eac80F955363f4Ff47B0f70189093908c04", "XMT"],
    ["0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128", "PAR"],
    ["0xD6DF932A45C0f255f85145f286eA0b292B21C90B", "AAVE"],
    ["0x82a0E6c02b91eC9f6ff943C0A933c03dBaa19689", "WNT"],
    ["0x516cdAe319F4B0E31A29c9572bc3F255679d7a0F", "DDD"],
    ["", ""],
    ["", ""],
    ["", ""],
]
*/

TOKENS_POLYGON_MAINNET = [
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
    ["0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a", "SUSHI"],
    ["0x7Ff54B5C384C9F3A3FeCE70e150D2Ce2D70DA6f7", "TBAC"],
    ["0xadBe0eac80F955363f4Ff47B0f70189093908c04", "XMT"],
    ["0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128", "PAR"],
    ["0xD6DF932A45C0f255f85145f286eA0b292B21C90B", "AAVE"],
    ["0x82a0E6c02b91eC9f6ff943C0A933c03dBaa19689", "WNT"],
    ["0x516cdAe319F4B0E31A29c9572bc3F255679d7a0F", "DDD"],
    ["0xbbba073c31bf03b8acf7c28ef0738decf3695683", "SAND"],
    ["0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32", "TEL"],
    ["0xC168E40227E4ebD8C1caE80F7a55a4F0e6D66C97", "DFYN"],
    ["0x980111ae1B84E50222C8843e3A7a038F36Fecd2b", "STACK"],
    ["0xB0B417A00E1831DeF11b242711C3d251856AADe3", "DLP"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
]

TOKENS_ETHEREUM_GOERLI = [
    ["0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C", "USDC"],
    ["0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60", "DAI"],
    ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", "WETH"],
    ["0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", "UNI"],
    ["", ""],
    ["", ""],
    ["", ""],
]

TOKENS_ETHEREUM_MAINNET = [
    ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "USDC"],
    ["0x3845badAde8e6dFF049820680d1F14bD3903a5d0", "SAND"],
    ["0xdac17f958d2ee523a2206206994597c13d831ec7", "USDT"],
    ["0x6b175474e89094c44da98b954eedeac495271d0f", "DAI"],
    ["0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", "stETH"],
    ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "WETH"],
    ["0x4e15361fd6b4bb609fa63c81a2be19d873717870", "FTM"],
    ["0x514910771af9ca656af840dff83e8264ecf986ca", "LINK"],
    ["0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", "YFI"],
    ["", ""],
    ["", ""],
]


TOKENS_FANTOM_MAINNET = [
    ["0x74b23882a30290451A17c44f4F05243b6b58C76d", "WETH"],
    ["", ""],
    ["", ""],
    ["", ""],
]

exports.getTokenStructs = () => {
    if (getNetwork() == "polygon_mainnet") {
        return TOKENS_POLYGON_MAINNET;
    }
    if (getNetwork() == "ethereum_goerli") {
        return TOKENS_ETHEREUM_GOERLI;
    } 
    if (getNetwork() == "ethereum_mainnet") {
        return TOKENS_ETHEREUM_MAINNET;
    }
    if (getNetwork() == "fantom_mainnet") {
        return TOKENS_FANTOM_MAINNET;
    }
    console.log(`constantsToken.getTokenStructs: ERROR - network not found:${getNetwork()}; returning empty array;`);
    return [];
};

exports.findTokens = (tokenStr) => {
    let tokenStructs = this.getTokenStructs();
    let foundTokens = [];
    for (let aToken of tokenStructs) {
        let matchIdx = aToken[0].toUpperCase().indexOf(tokenStr.toUpperCase());
        if (matchIdx >= 0) {
            foundTokens.push(aToken);
        } else {
            let tokenSymbolWithPrefix = `@${aToken[1]}`;
            matchIdx = tokenSymbolWithPrefix.toUpperCase().indexOf(tokenStr.toUpperCase());
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
        console.log(`constantsToken.findOneToken: ERROR - not able to find exactly 1 token, found ${foundTokens.length} instead; tokenStr:${tokenStr};`);
        return undefined;
    }
    return foundTokens[0];
}
