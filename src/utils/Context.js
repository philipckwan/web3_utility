const {ethers} = require('ethers');
require('dotenv').config();
const {Utilities} = require("./Utilities");
const {Constants} = require("../constants/Constants");
const {ConstantsSwap} = require("../constants/ConstantsSwap")
const {ConstantsToken} = require("../constants/ConstantsToken")

class Context {

    constructor() {
        this.isInited = false;
        this.web3Provider = null;
        this.network = null;
        this.local = null;
        this.apiURL = null;
        //console.log(`Context.constructor;`);
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    init(networkOverride="", localOverride="") {
        if (this.isInited) {
            console.log(`Context.init: WARN - already inited;`);
            return;
        }
        //console.log(`Context.init: from .env:     network:${process.env.USE_NETWORK}; local:${process.env.IS_LOCAL};`);
        //console.log(`Context.init: from argument: network:${networkOverride}; local: ${localOverride};`);

        this.network = networkOverride == "" ? process.env.USE_NETWORK : networkOverride;
        this.local = localOverride == "" ? process.env.IS_LOCAL : localOverride;
        if (this.network == Constants.NETWORKS.POLYGON_MUMBAI) {
            this.apiUrl = process.env.API_URL_MUMBAI;
        } else if (this.network == Constants.NETWORKS.ETHEREUM_GOERLI) {
            this.apiUrl = process.env.API_URL_GOERLI;
        } else if (this.network == Constants.NETWORKS.POLYGON_MAINNET || this.network == "PM") {
            this.network = Constants.NETWORKS.POLYGON_MAINNET;
            this.apiUrl = process.env.API_URL_POLYGON_MAINNET;
        } else if (this.network == Constants.NETWORKS.ETHEREUM_MAINNET || this.network == "EM") {
            this.network = Constants.NETWORKS.ETHEREUM_MAINNET;
            this.apiUrl = process.env.API_URL_ETHEREUM_MAINNET;
        } else if (this.network == Constants.NETWORKS.FANTOM_MAINNET || this.network == "FM") {
            this.network = Constants.NETWORKS.FANTOM_MAINNET;
            this.apiUrl = process.env.API_URL_FANTOM_MAINNET;
        } else if (this.network == Constants.NETWORKS.ARBITRUM_MAINNET || this.network == "AM") {
            this.network = Constants.NETWORKS.ARBITRUM_MAINNET;
            this.apiUrl = process.env.API_URL_ARBITRUM_MAINNET;            
        } else {
            console.log(`Context.init: ERROR - unknown network:${this.network};`);
            process.exit();
        }
        if (this.local == "local" || this.local == "L") {
            this.local = "local";
            this.apiUrl = process.env.API_URL_LOCALHOST;
        } 
        this.web3Provider = new ethers.providers.StaticJsonRpcProvider(this.apiUrl);
        this.isInited = true;
        //console.log(`Context.init: final state:   network:${this.network}; local:${this.local}; apiUrl:${this.apiUrl};`);
    }

    async printNetworkAndBlockNumber() {
        let blockNumber = await this.web3Provider.getBlockNumber();
        //let now = Date.now();
        console.log(`Context: network:[${this.network}]; local:[${this.local}]; apiUrl:${this.apiUrl}; blockNumber:[${blockNumber}];`)
    }

    getWeb3Provider() {
        return this.web3Provider;
    }

    getNetwork() {
        return this.network;
    }


    getTokenStructs() {
        let network = this.network;
        if (network == Constants.NETWORKS.POLYGON_MAINNET) {
            return ConstantsToken.TOKENS_POLYGON_MAINNET;
        }
        if (network == Constants.NETWORKS.ETHEREUM_GOERLI) {
            return ConstantsToken.TOKENS_ETHEREUM_GOERLI;
        } 
        if (network == Constants.NETWORKS.ETHEREUM_MAINNET) {
            return ConstantsToken.TOKENS_ETHEREUM_MAINNET;
        }
        if (network == Constants.NETWORKS.FANTOM_MAINNET) {
            return ConstantsToken.TOKENS_FANTOM_MAINNET;
        }
        if (network == Constants.NETWORKS.ARBITRUM_MAINNET) {
            return ConstantsToken.TOKENS_ARBITRUM_MAINNET;
        }
        console.log(`Context.getTokenStructs: ERROR - network not found:${network}; returning empty array;`);
        return [];
    };

    findTokens(tokenStr) {
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

    findOneToken(tokenStr, exactMatchIfMoreThanOneFound=false) {
        let foundTokens = this.findTokens(tokenStr);
        if (foundTokens.length == 0) {
            console.log(`Context.findOneToken: ERROR - not able to find any token, tokenStr:${tokenStr};`);
            return undefined;
        }
        if (foundTokens.length == 1) {
            return foundTokens[0];
        } 
        if (exactMatchIfMoreThanOneFound) {
            for (let aToken of foundTokens)  {
                if (aToken[1].toUpperCase() == tokenStr.toUpperCase()) {
                    return aToken;
                }
            }
        }
        console.log(`Context.findOneToken: ERROR - not able to find exactly 1 token, found ${foundTokens.length} instead; tokenStr:${tokenStr};`);
        return undefined;

    }

    getSwapStructs() {
        if (this.network == Constants.NETWORKS.POLYGON_MAINNET) {
            return ConstantsSwap.SWAPS_POLYGON_MAINNET;
        }
        if (this.network == Constants.NETWORKS.ETHEREUM_MAINNET) {
            return ConstantsSwap.SWAPS_ETHEREUM_MAINNET;
        }
        if (this.network == Constants.NETWORKS.ARBITRUM_MAINNET) {
            return ConstantsSwap.SWAPS_ARBITRUM_MAINNET;
        }
        console.log(`Context.getSwapStructs: ERROR - network not found:${this.network}; returning empty array;`);
        return [];
    }

    findOneSwapByName(swapName) {
        // swap name is prefix match (best match from prefix)
        let swapStructs = this.getSwapStructs();
        let foundSwaps = [];
        for (let aSwap of swapStructs) {
            let matchIdx = aSwap[1].toUpperCase().indexOf(swapName.toUpperCase());
            if (matchIdx == 0) {
                foundSwaps.push(aSwap);
            } 
        }
        if (foundSwaps.length != 1) {
            console.log(`Context.findOneSwapByName: ERROR - not able to find exactly 1 swap, found ${foundSwaps.length} instead; swapName:${swapName};`);
            return null;
        }
        return foundSwaps[0];
    }

    findOneSwapByShortSymbol(swapShortSymbol) {
        // short symbol is exact (1 character) match
        let swapStructs = this.getSwapStructs();
        let foundSwaps = [];
        for (let aSwap of swapStructs) {
            if (aSwap[3].toUpperCase() == swapShortSymbol.toUpperCase())  {
                foundSwaps.push(aSwap);
            }
        }
        if (foundSwaps.length != 1) {
            console.log(`Context.findOneSwapByShortSymbol: ERROR - not able to find exactly 1 swap, found ${foundSwaps.length} instead; swapShortSymbol:${swapShortSymbol};`);
            process.exit();
        }
        return foundSwaps[0];
    }

    swapsAndFeesParsers(argSwapsAndFees) {
        /*
          return the swaps and fees struct
          return structure: 
          [
            [<swap address1>, <swap name1>, [<fee1>,<fee2>,...]]                  
            [<swap address2>, <swap name2>, [<fee1>,<fee2>,...]]
          ]
    
          case 1: all swaps, will get swaps list from ConstantsSwap, empty list for [3] for all or none fees
          input: "ALL"
          output: [
                   ["0xE592...", "uniswapV3", []],
                   ["0x1b02...", "sushiswap", []],
                   ["0xa5E0...", "quickswap", []]
                   ...
                  ]
    
          case 2: specified uniswapV3 fees
          input: "U:500,1000S"
          output: [
                   ["0xE592...", "uniswapV3", [500, 1000]],
                   ["0x1b02...", "sushiswap", []]
                  ]
    
          case 3: specified only an address, assumed this is a uniswapV2 swap (i.e. sushiswap)
          input: "0x1b02..."
          output: [
                   ["0x1b02...", "unknownSwap", []]
                  ]
         */
        let resultsSwapsAndFees = [];

        if (argSwapsAndFees == null || argSwapsAndFees == "ALL") {
            let swaps = this.getSwapStructs();
            resultsSwapsAndFees = swaps.map(obj => [obj[0], obj[1], []]);
            return resultsSwapsAndFees;
        } 

        if (argSwapsAndFees.substring(0,2) == "0x") {
            resultsSwapsAndFees.push([argSwapsAndFees, "unknownSwap", []]);
            return resultsSwapsAndFees;
        }

        let foundSwap = [];
        let foundSwapFees = [];
        let foundFeeStr = "";
        for (let i = 0; i < argSwapsAndFees.length; i++) {
            let aChar = argSwapsAndFees[i];
            if (aChar.toUpperCase() != aChar.toLowerCase()) {
                // the above is a trick to check whether a character is a letter, see: https://stackoverflow.com/questions/9862761/how-to-check-if-character-is-a-letter-in-javascript
                //console.log(`processed a foundSwap symbol:${aChar};`);
                if (foundSwap.length != 0) {
                    //console.log(`__added a foundSwap:${foundSwap};`);
                    resultsSwapsAndFees.push([foundSwap[0], foundSwap[1], foundSwapFees]);
                } 
                foundSwap = this.findOneSwapByShortSymbol(aChar);
                foundSwapFees = [];
            } else if (aChar ==  ":") {
                //  will process the next expecting numbers, till comma or letter
                for (let j = i + 1; j < argSwapsAndFees.length; j++) {
                    let bChar = argSwapsAndFees[j];
                    if (!isNaN(bChar)) {
                        foundFeeStr += bChar;
                        continue;
                    } 
                    if (bChar == ",") { // || (bChar.toUpperCase() != bChar.toLowerCase()) || j == argSwapsAndFees.length - 1) {
                        foundSwapFees.push(Number(foundFeeStr));
                        foundFeeStr = "";
                        continue;
                    } 
                    if (bChar.toUpperCase() != bChar.toLowerCase()) {
                        let foundFee = Number(foundFeeStr);
                        //console.log(`__processed a foundFee:${foundFee};`);
                        foundSwapFees.push(foundFee);
                        foundFeeStr = "";
                        i = j - 1;
                        break;
                    }
                }
            }
        }
        // need to handle the last processed foundSwap, foundSwapFees and foundFeeStr
        if (foundFeeStr.length > 0) {
            let foundFee = Number(foundFeeStr);
            //console.log(`__processed last foundFee:${foundFee};`);
            foundSwapFees.push(foundFee)
        }
        if (foundSwap.length > 0 || foundSwapFees.length > 0) {
            //console.log(`__added last foundSwap:${foundSwap};`);
            resultsSwapsAndFees.push([foundSwap[0], foundSwap[1], foundSwapFees]);
        }
        return resultsSwapsAndFees;
    }

    tokensParser(argRemaining) {
        /*
          input: arrays of arguments, expecting they are all tokens, either symbol (i.e. usdt) or address (0x2791)
          output: a list of tokensStructs, as defined in ConstantsToken.js
         */
        let tokens = argRemaining.map(anArg => this.findOneToken(anArg, true))
        return tokens;
    }

    amountParser(argAmount, amountDefault) {
        let isFromAll = (argAmount == "ALL");
        let amount = !isNaN(argAmount) ? Number(argAmount) : amountDefault;
        return [isFromAll, amount];
    }

}

exports.Context = Context.Instance;