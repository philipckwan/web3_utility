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

const alchemyProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_BLOCKNUM_ALCHEMY);
const quicknodeProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_BLOCKNUM_QUICKNODE);
const localProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_LOCALHOST);

let alchemyBlockNum = -1;
let quicknodeBlockNum = -1;
let localBlockNum = -1;

/*
 compare the blocknumber from polygon rpc vs a node
 curl -X POST https://polygon-rpc.com/ --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}'
*/
async function main() {
    console.log(`blockCheck.main: v1.7;`);

    if (process.argv.length == 3 && process.argv[2] == "-once") {
        aPoll();
        return;
    }
    
    let pollAlchemyIntervalMSec = Number(process.env.BLOCKCHECK_ALCMY_INTERVAL_MSEC);
    let pollQuicknodeIntervalMSec = Number(process.env.BLOCKCHECK_QCKND_INTERVAL_MSEC);
    let pollLocalIntervalMSec = Number(process.env.BLOCKCHECK_LOCAL_INTERVAL_MSEC);
    if (pollAlchemyIntervalMSec > 0) {
        setInterval(pollAlchemy, pollAlchemyIntervalMSec);    
    }
    if (pollQuicknodeIntervalMSec > 0) {
        setInterval(pollQuicknode, pollQuicknodeIntervalMSec);    
    }
    if (pollLocalIntervalMSec > 0) {
        setInterval(pollLocal, pollLocalIntervalMSec); 
    }
}

function getDiffString() {
    diff = alchemyBlockNum - localBlockNum;
    diffStr = ""
    if (diff > 0) {
        diffStr = `>${diff}`;
    } else {
        diffStr = `${diff}`;
    }
    return diffStr.padStart(3, " ");
}

async function pollAlchemy() {
    let startTime = Date.now();
    let blockNumber = -1;
    try {
        blockNumber = await alchemyProvider.getBlockNumber();
        let endTime = Date.now();
        let timeDiff = (endTime - startTime) / 1000;
        if (alchemyBlockNum < blockNumber) {
            console.log(`pollAlchemy: new block [${blockNumber}]; T:[${formatTime(endTime)}];`);
            alchemyBlockNum = blockNumber;
            //let block = await alchemyProvider.getBlock(blockNumber);
            //console.log(`++${JSON.stringify(block)}`);            
        }
        let msg = `|${blockNumber}|        |        |${getDiffString()}|T:[${formatTime(startTime)}->${formatTime(endTime)}|${timeDiff}];`;
        flog.debug(msg);
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to alchemyProvider;`);
    }
}

async function pollQuicknode() {
    let startTime = Date.now();
    let blockNumber = -1;
    try {
        blockNumber = await quicknodeProvider.getBlockNumber();
        let endTime = Date.now();
        let timeDiff = (endTime - startTime) / 1000;
        if (quicknodeBlockNum < blockNumber) {
            console.log(`pollQuicknode: new block [${blockNumber}]; T:[${formatTime(endTime)}];`);
            quicknodeBlockNum = blockNumber;
            //let block = await quicknodeProvider.getBlock(blockNumber);
            //console.log(`++${JSON.stringify(block)}`);            
        }
        let msg = `|        |        |${blockNumber}|${getDiffString()}|T:[${formatTime(startTime)}->${formatTime(endTime)}|${timeDiff}];`;
        flog.debug(msg);
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to quicknodeProvider;`);
    }
}

async function pollLocal() {
    let startTime = Date.now();
    let blockNumber = -1;
    try {
        blockNumber = await localProvider.getBlockNumber();
        let endTime = Date.now();
        let timeDiff = (endTime - startTime) / 1000;
        if (localBlockNum < blockNumber) {
            console.log(`pollLocal: new block [${blockNumber}]; T:[${formatTime(endTime)}];`);
            localBlockNum = blockNumber;
            //let block = await localProvider.getBlock(blockNumber);
            //console.log(`++${JSON.stringify(block)}`);            
        }
        let msg = `|        |${blockNumber}|        |${getDiffString()}|T:[${formatTime(startTime)}->${formatTime(endTime)}|${timeDiff}];`;
        flog.debug(msg);
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to localProvider;`);
    }
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
    blockNumberPromises.push(getBlockNumberByProvider("local"));
    //blockNumberPromises.push(getBlockNumberByProvider("polygonRPC"));
    blockNumberPromises.push(getBlockNumberByProvider("alchemy"));
    
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
        let alchemyMinusLocalStr = alchemyMinusLocal > 0 ? `>${alchemyMinusLocal}` : `${alchemyMinusLocal}`;
        let msg = `T:[${formatTime(startTime)}->${formatTime(endTime)}|${timeDiff}]; blockCheck: alchemy:${blockNumberFromAlchemy}; local:${blockNumberFromLocal}; alchemyMinusLocal:[${alchemyMinusLocalStr}];`;
        flog.debug(msg);
    });    
}

main();