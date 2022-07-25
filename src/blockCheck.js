const {init, formatTime} = require('./helpers');
const axios = require('axios');
const {ethers} = require('ethers');
require('dotenv').config();
//const {log4js} = require("log4js");
var log4js = require('log4js');
const flog=log4js.getLogger("file");

log4js.configure({
    appenders: {
      file: { type:"file", filename:"./logs/blockCheck.log", layout:{type:"pattern", pattern:"%m"}},
      console: { type:"console"}
    },
    categories: {
      file: { appenders:["file"], level: "debug" },
      default: { appenders: ["console"], level: "debug" }
    },
  });

init();

/*
 compare the blocknumber from polygon rpc vs a node
 curl -X POST https://polygon-rpc.com/ --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}'
*/
async function main() {
    console.log(`blockCheck.main: v1.4;`);

    if (process.argv.length == 3 && process.argv[2] == "-once") {
        aPoll();
        return;
    }
    
    let pollIntervalMSec = Number(process.env.BLOCKCHECK_INTERVAL_MSEC);
    setInterval(aPoll, pollIntervalMSec);    
}

async function getBlockNumberByProvider(providerName) {
    //console.log(`getBlockNumberByProvider: providerName:${providerName};`);
    let blockNumber = -1;
    if (providerName == "polygonRPC") {
        let payload = {jsonrpc:"2.0", method:"eth_blockNumber", params:[], id:83};
        try {
            let res = await axios.post("https://polygon-rpc.com/", payload);
            let data = res.data;
            let currentBlockNumberHex = data.result;
            blockNumber = parseInt(currentBlockNumberHex, 16);
        } catch (ex) {
            flog.debug(`ERROR - unable to connect to polygonRPC;`);
        }
    } else if (providerName == "alchemy") {
        let alchemyProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_POLYGON_MAINNET);
        try {
            blockNumber = await alchemyProvider.getBlockNumber();
        } catch (ex) {
            flog.debug(`ERROR - unable to connect to alchemyProvider;`);
        }
    } else if (providerName == "local") {
        let localProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_LOCALHOST);
        try {
            blockNumber = await localProvider.getBlockNumber();
        } catch (ex) {
            flog.debug(`ERROR - unable to connect to localProvider;`);
        }
    }
    return [blockNumber, providerName]
}

async function aPoll() {
    //console.log(`blockCheck.aPoll: 1.1;`);
    let startTime = Date.now();

    let blockNumberPromises = []
    blockNumberPromises.push(getBlockNumberByProvider("polygonRPC"));
    blockNumberPromises.push(getBlockNumberByProvider("alchemy"));
    blockNumberPromises.push(getBlockNumberByProvider("local"));
    
    Promise.all(blockNumberPromises).then(async (resultsBlockNumberAndProvider) => {
        let blockNumberFromPolygonRPC = -1;
        let blockNumberFromAlchemy = -1;
        let blockNumberFromLocal = -1;
        for (let i = 0; i < resultsBlockNumberAndProvider.length; i++) {
            let [blockNumber, providerName] = resultsBlockNumberAndProvider[i];
            if (providerName == "polygonRPC") {
                blockNumberFromPolygonRPC = blockNumber;
            } else if (providerName == "alchemy") {
                blockNumberFromAlchemy = blockNumber;
            } else if (providerName == "local") {
                blockNumberFromLocal = blockNumber;
            }
        }
        let endTime = Date.now();
        let timeDiff = (endTime - startTime) / 1000;
        let alchemyMinusLocal = blockNumberFromAlchemy - blockNumberFromLocal;
        let msg = `T:[${formatTime(startTime)}->${formatTime(endTime)}|${timeDiff}]; blockCheck: polygonRPC:${blockNumberFromPolygonRPC}; alchemy:${blockNumberFromAlchemy}; local:${blockNumberFromLocal};`;
        if (alchemyMinusLocal != 0) {
            msg += ` alchemyMinusLocal:${alchemyMinusLocal};`;
        }
        flog.debug(msg);
    });    
}

main();