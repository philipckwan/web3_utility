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

const network = "polygon_mainnet";
const mode="remote";
init(mode, network);

/*
 compare the blocknumber from polygon rpc vs a node
 curl -X POST https://polygon-rpc.com/ --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":83}'
*/
async function main() {
    console.log(`blockCheck.main: v1.3;`);
    let pollIntervalMSec = 1000;
    setInterval(aPoll, pollIntervalMSec);    
}

async function aPoll() {
    //console.log(`blockCheck.aPoll: 1.1;`);
    let startTime = Date.now();

    let alchemyProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_POLYGON_MAINNET);
    let localProvider = new ethers.providers.StaticJsonRpcProvider(process.env.API_URL_LOCALHOST);

    let payload = {jsonrpc:"2.0", method:"eth_blockNumber", params:[], id:83};

    let blockNumberFromPolygonRPC = -1;
    try {
        let res = await axios.post("https://polygon-rpc.com/", payload);
        let data = res.data;
        let currentBlockNumberHex = data.result;
        blockNumberFromPolygonRPC = parseInt(currentBlockNumberHex, 16);
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to polygonRPC;`);
    }

    let blockNumberFromAlchemy = -1;
    try {
        blockNumberFromAlchemy = await alchemyProvider.getBlockNumber();
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to alchemyProvider;`);
    }
    
    let blockNumberFromLocal = -1;
    try {
        blockNumberFromLocal = await localProvider.getBlockNumber();
    } catch (ex) {
        flog.debug(`ERROR - unable to connect to localProvider;`);
    }

    let endTime = Date.now();
    //let timeDiff = (endTime - startTime) / 1000;
    let alchemyMinusLocal = blockNumberFromAlchemy - blockNumberFromLocal;
    let msg = `T:[${formatTime(startTime)}->${formatTime(endTime)}]; blockCheck: polygonRPC:${blockNumberFromPolygonRPC}; alchemy:${blockNumberFromAlchemy}; local:${blockNumberFromLocal};`;
    if (alchemyMinusLocal != 0) {
        msg += ` alchemyMinusLocal:${alchemyMinusLocal};`;
    }
    flog.debug(msg);
}

main();