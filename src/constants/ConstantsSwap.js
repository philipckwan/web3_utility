//const { getNetwork } = require("./helpers");
const {Context} = require('../utils/Context');
const {Constants} = require('./Constants');

class ConstantsSwap {
    static SWAPS_POLYGON_MAINNET = [
        ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3"],
        ["0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "sushiswap"], 
        ["0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", "quickswap"],
        ["0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607", "apeswap"],
        ["0x5C6EC38fb0e2609672BDf628B1fD605A523E5923", "jetswap"],
        ["0x94930a328162957FF1dd48900aF67B5439336cBD", "polycat"],
        ["0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", "waultswap"],
        ["0x2fA4334cfD7c56a0E7Ca02BD81455205FcBDc5E9", "dodo"]
    ]

    static SWAPS_ETHEREUM_MAINNET = [
        ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3"],
        ["0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", "sushiswap"],
        ["0x881D40237659C251811CEC9c364ef91dC08D300C", "metamask"],
        ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57", "paraswap"],
        ["0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607", "apeswap"],
        ["0xc9CB0B9Fe83698DFC3d3935d31BAddEDb5C06151", "jetswap"],
        ["0x94930a328162957FF1dd48900aF67B5439336cBD", "polycat"],
        ["0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", "waultswap"]
    ]


    static getSwapStructs = () => {
        let network = Context.getNetwork();
        if (network == Constants.NETWORKS.POLYGON_MAINNET) {
            return this.SWAPS_POLYGON_MAINNET;
        }
        if (network == Constants.NETWORKS.ETHEREUM_MAINNET) {
            return this.SWAPS_ETHEREUM_MAINNET;
        }
        console.log(`ConstantsSwap.getSwapStructs: ERROR - network not found:${network}; returning empty array;`);
        return [];
    };

    static findSwaps = (swapStr) => {
        let swapStructs = this.getSwapStructs();
        let foundSwaps = [];
        for (let aSwap of swapStructs) {
            let matchIdx = aSwap[1].toUpperCase().indexOf(swapStr.toUpperCase());
            if (matchIdx == 0) {
                foundSwaps.push(aSwap);
            } 
            //console.log(`aSwap: addr:${aSwap[0]}; symb:${aSwap[1]};`);
        }
        return foundSwaps;
    }

    static findASwapByPrefix = (swapPrefix) => {
        let foundSwaps = this.findSwaps(swapPrefix);
        if (foundSwaps.length != 1) {
            console.log(`ConstantsSwap.findASwapByPrefix: ERROR - not able to find exactly 1 swap, found ${foundSwaps.length} instead; swapPrefix:${swapPrefix};`);
            return undefined;
        }
        return foundSwaps[0];
    }
}

exports.ConstantsSwap = ConstantsSwap;