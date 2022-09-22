const {ethers} = require('ethers');
require('dotenv').config();
const {Utilities} = require("./Utilities");
const {Constants} = require('../constants/Constants');

class Context {

    constructor() {
        this.isInited = false;
        this.web3Provider = null;
        this.network = null;
        this.local = null;
        this.apiURL = null;
        console.log(`Context.constructor;`);
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    init(networkOverride="", localOverride="") {
        if (this.isInited) {
            console.log(`Context.init: WARN - already inited;`);
            return;
        }
        console.log(`Context.init: from .env:     network:${process.env.USE_NETWORK}; local:${process.env.IS_LOCAL};`);
        console.log(`Context.init: from argument: network:${networkOverride}; local: ${localOverride};`);

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
        console.log(`Context.init: final state:   network:${this.network}; local:${this.local}; apiUrl:${this.apiUrl};`);
    }

    async printNetworkAndBlockNumber() {
        let blockNumber = await this.web3Provider.getBlockNumber();
        let now = Date.now();
        console.log(`Context.printNetworkAndBlockNumber:t:[${Utilities.formatTime(now)}]; network:[${this.network}]; local:[${this.local}]; apiUrl:${this.apiUrl}; blockNumber:[${blockNumber}];`)
    }

    getWeb3Provider() {
        return this.web3Provider;
    }

    getNetwork() {
        return this.network;
    }

}

exports.Context = Context.Instance;