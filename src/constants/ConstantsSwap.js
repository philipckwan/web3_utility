class ConstantsSwap {

    /*
     swap struct explained:
     [0] - swap address
     [1] - swap name, can be prefix matched, i.e. "uni" to match "uniswapV3"
     [2] - protocol number, i.e. "1", as used in calling flashloan contract
     [3] - short symbol capitalized, so as to easily distinguish when used in command line arguements, i.e. both "paraswap" and "polycat" starts with "p"
    */
    static SWAPS_POLYGON_MAINNET = [
        ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3", 0, "U"],
        ["0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "sushiswap", 1, "S"], 
        ["0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", "quickswap", 2, "Q"],
        ["0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607", "apeswap", 3, "A"],
        ["0x5C6EC38fb0e2609672BDf628B1fD605A523E5923", "jetswap", 4, "J"],
        ["0x94930a328162957FF1dd48900aF67B5439336cBD", "polycat", 5, "P"],
        ["0x3a1D87f206D12415f5b0A33E786967680AAb4f6d", "waultswap", 6, "W"],
        ["0x2fA4334cfD7c56a0E7Ca02BD81455205FcBDc5E9", "dodo", -1, "D"],
    ]

    static SWAPS_ETHEREUM_MAINNET = [
        ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3", 0, "U"],
        ["0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", "sushiswap", 1, "S"],
    ]


    static SWAPS_ARBITRUM_MAINNET = [
        ["0xE592427A0AEce92De3Edee1F18E0157C05861564", "uniswapV3", 0, "U"],
        ["0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", "sushiswap", 1, "S"],
    ]
}

exports.ConstantsSwap = ConstantsSwap;