const {Context} = require('./utils/Context');
const {Utilities} = require('./utils/Utilities')
const {ethers} = require('ethers');
//const {init, getProvider, printGeneralInfo, argumentParsers, ARGV_KEY_NETWORK, ARGV_KEY_LOCAL} = require("./helpers");
const ERC721ABI = require('../abis/ERC721.json');

require('dotenv').config();

async function main() {
    //console.log(`tokenCheck.main: 1.1;`);

    if (process.argv.length < 3) {
        console.log(`nftTokenCheck.main: ERROR - arguments wrong;`);
        console.log(`node nftTokenCheck.js [-n<network>] [-l<local>] <token address>`);
        console.log(`e.g:`);
        console.log(`node nftTokenCheck.js 0xe7eb9d04ce25dd534ae75ea687441ad8088f5397`);
        return;
    }
        
    let [parsedArgMap, remainingArgv] = Utilities.argumentParsers(process.argv);
    let parsedNetworkStr = parsedArgMap.get(Utilities.ARGV_KEY_NETWORK[1]);
    let parsedLocalStr = parsedArgMap.get(Utilities.ARGV_KEY_LOCAL[1]);
    
    Context.init(parsedNetworkStr, parsedLocalStr);
    await Context.printNetworkAndBlockNumber();

    let tokenStr = remainingArgv[0];
    let foundTokens = Context.findTokens(tokenStr);

    if (foundTokens.length == 0) {
        console.log(`token [${tokenStr}] not found in Context.findTokens();`);
        if (tokenStr.length == 42 && tokenStr.substring(0,2) == "0x") {
            let tokenAddressAssumed = tokenStr;
            console.log(`assume [${tokenAddressAssumed}] is a token address; now attempt to find from chain...`);
            let tokenContract = new ethers.Contract(tokenAddressAssumed, ERC721ABI, Context.getWeb3Provider());
            try {
                let tokenSymbolFromContract = await tokenContract.symbol();
                console.log(`found token [${tokenSymbolFromContract}] from chain by address...`);
                foundTokens.push([tokenAddressAssumed, tokenSymbolFromContract]);
            } catch {
                console.log(`this token is not found in chain`);
            }
        }
    }

    for(let aFoundToken of foundTokens) {
        let aFoundTokenAddress = aFoundToken[0];
        let aFoundTokenSymbol = aFoundToken[1];
        console.log(`-found token: address:[${aFoundTokenAddress}]; symbol:[${aFoundTokenSymbol}];`);
        let nftContract = new ethers.Contract(aFoundTokenAddress, ERC721ABI, Context.getWeb3Provider());
        let tokenSymbolFromContract = await nftContract.symbol();
        let tokenURIFromContract = await nftContract.tokenURI(1);
        let name = await nftContract.name();
        let owner = await nftContract.owner();
        let paused = await nftContract.paused();
        let revealed = await nftContract.revealed();
        //let tokenDecimalsFromContract = await nftContract.decimals();
        console.log(`--info from token contract: address:[${nftContract.address}]; symbol:[${tokenSymbolFromContract}]; name:[${name}];`);
        console.log(`--tokenURIFromContract:[${tokenURIFromContract}]; owner:[${owner}]; paused:[${paused}]; revealed:[${revealed}];`);
    
        //let bnBalance = await tokenContract.balanceOf(process.env.WALLET_ADDRESS);
        //let balance = ethers.utils.formatUnits(bnBalance, tokenDecimalsFromContract);
        //console.log(`--balance for [${process.env.WALLET_ADDRESS}]:$${balance};`);
        let wallet = new ethers.Wallet(process.env.WALLET_SECRET);
        let connectedWallet = wallet.connect(Context.getWeb3Provider());

        addressFrom = "0xe39f4ec73407e26033cdfe312428efb4377701ea";
        addressTo   = "0x1d72ab6EBF474c77fD7A9E256Df4b1A158D2d73f";
        tokenID = 641; // 0x281
        someData = "0x1234"
        let executionGasLimit = 1200000;
        let executionGasPrice = 50;
        let bnExecutionGasPrice = ethers.utils.parseUnits(`${executionGasPrice}`, "gwei");

        let nc = await nftContract.connect(connectedWallet);
        console.log(`__maxSupply:${await nc.maxSupply()};`);

        console.log(`__balanceOf(0xE39f4EC73407e26033CDfe312428EFB4377701Ea):${await nc.balanceOf("0xE39f4EC73407e26033CDfe312428EFB4377701Ea")};`);

        //let transaction = await connectedNftContract.setCost(200);
        /*
        let transaction = null
        try {
            let transaction = await connectedNftContract["safeTransferFrom(address,address,uint256)"](
                addressFrom,
                addressTo,
                tokenID,
                {gasPrice: bnExecutionGasPrice, gasLimit: executionGasLimit}
            );
        } catch (ex) {
            console.log(`ERROR`);
            console.log(`------------------------`);
            console.log(ex)
            console.log(`------------------------`);
        }
        
        if (transaction != null) {
            console.log(`------------------------`);
            console.log(JSON.stringify(transaction));
            console.log(`------------------------`);
            let transactionReceipt = await transaction.wait();
        } else {
            console.log(`__transaction is null;`);
        }
        */

    }
}

main()