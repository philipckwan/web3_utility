
exports.SWAPS = [
    ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3"],
    ["0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "sushiswap"],
    ["0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", "quickswap"],
    ["0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607", "apeswap"],
    ["0x5C6EC38fb0e2609672BDf628B1fD605A523E5923", "jetswap"],
    ["0x94930a328162957FF1dd48900aF67B5439336cBD", "polycat"],
    ["0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", "waultswap"]
]

exports.findSwaps = (swapStr) => {
    let foundSwaps = [];
    for (let aSwap of this.SWAPS) {
        let matchIdx = aSwap[0].toUpperCase().indexOf(swapStr.toUpperCase());
        if (matchIdx >= 0) {
            foundSwaps.push(aSwap);
        } else {
            matchIdx = aSwap[1].toUpperCase().indexOf(swapStr.toUpperCase());
            if (matchIdx >= 0) {
                foundSwaps.push(aSwap);
            }
        }
        //console.log(`aSwap: addr:${aSwap[0]}; symb:${aSwap[1]};`);
    }
    return foundSwaps;
}

exports.findASwapByPrefix = (swapPrefix) => {
    let foundSwaps = [];
    for (let aSwap of this.SWAPS) {
        let matchIdx = aSwap[1].toUpperCase().indexOf(swapPrefix.toUpperCase());
        if (matchIdx == 0) {
            foundSwaps.push(aSwap);
        } 
    }
    if (foundSwaps.length != 1) {
        console.log(`constantsSwap.findASwapByPrefix: ERROR - not able to find exactly 1 swap, found ${foundSwaps.length} instead;`);
        return undefined;
    }
    return foundSwaps[0];
}