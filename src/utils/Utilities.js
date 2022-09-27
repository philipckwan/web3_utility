class Utilities {

    static formatTime(d) {
        let aDate = new Date(d);
        let hour = aDate.getHours();
        let minute = aDate.getMinutes();
        let second = aDate.getSeconds();
        let mSec = aDate.getMilliseconds();
        return `${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}:${second.toString().padStart(2,"0")}:${mSec.toString().padStart(3,"0")}`;
    }

    static ARGV_KEY_SWAPS = ["-s", "SWAPS"]
    static ARGV_KEY_AMOUNT = ["-a", "AMOUNT"]
    static ARGV_KEY_NETWORK = ["-n", "NETWORK"]
    static ARGV_KEY_LOCAL = ["-l", "LOCAL"]
    static ARGV_KEY_REVERSE = ["-r", "REVERSE"]

    static argumentParsers(argv) {
        let parsedArgMap = new Map()
        let remainingArgv = [];
        for (let i = 0; i < argv.length; i++) {
            if (argv[i].substring(0,2) == this.ARGV_KEY_SWAPS[0]) {
                parsedArgMap.set(this.ARGV_KEY_SWAPS[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_AMOUNT[0]) {
                parsedArgMap.set(this.ARGV_KEY_AMOUNT[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_NETWORK[0]) {
                parsedArgMap.set(this.ARGV_KEY_NETWORK[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_LOCAL[0]) {
                parsedArgMap.set(this.ARGV_KEY_LOCAL[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_REVERSE[0]) {
                parsedArgMap.set(this.ARGV_KEY_REVERSE[1], argv[i].substring(2))
                continue
            }
            remainingArgv.push(argv[i]);
        }
        return [parsedArgMap, remainingArgv]
    }
    /*
    static swapsAndFeesParsers(argSwapsAndFees) {
        
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
         
        let resultsSwapsAndFees = [];

        if (argSwapsAndFees == "ALL") {
            let swaps = ConstantsSwap.getSwapStructs();
            resultsSwapsAndFees = swaps.map(obj => [obj[0], obj[1], []]);
        }
        
        if (swaps.length == 0) {
        swaps = ConstantsSwap.getSwapStructs();
        }
        if (fees.length == 0) {
        fees = UniswapV3Commons.FEES;
        }
        for (let aSwap of swaps) {
        if (aSwap[1] == "uniswapV3") {
            for (let aFee of fees) {
            resultsSwapsAndFees.push([aSwap[0], aSwap[1], aSwap[2], aFee]);
            }
        } else {
            resultsSwapsAndFees.push([aSwap[0], aSwap[1], aSwap[2], 0]);
        }
        }
        
        return resultsSwapsAndFees;
    }*/
}

exports.Utilities = Utilities;