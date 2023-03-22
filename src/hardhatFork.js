/*
  Important!
  This script needs to be run with hardhat context, i.e.:
  $ npx hardhat run src/hardhatFork.js 
  Please also see hardhat.config.js
 */
const { ethers } = require("hardhat");
const {UniswapV3Commons} = require("./utils/UniswapV3Commons");
const ERC20ABI = require('../abis/abi.json');
//require("@nomiclabs/hardhat-ethers");

const walletAddress="0x048af53c5548c0f83ca4f14533b79b69056fe46c";
//const walletAddress="0x7e10D39bc25c81004575fC764A68541BC5dDEB7b";
const web3ProviderRPCURL="https://eth-mainnet.g.alchemy.com/v2/SBRHuPhMr1oV5jtWFgY2EY1NoXpVU_wY";
//const web3ProviderRPCURL="https://eth-goerli.alchemyapi.io/v2/GtkE9-GF1I-DBxeBCdvI3k6HAVlH5xYj";

const WETHAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDTAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const {Utilities} = require('./utils/Utilities')

let initialBlockNumber = 15887230; // ETH //7968831; // Goerli //15887230; // ETH
let advanceBlockCount = 10;


async function printBlockInfo() {
  let blockNumber = await ethers.provider.getBlockNumber();
  let blockTimestamp = (await ethers.provider.getBlock(blockNumber)).timestamp;
  let blockDate = new Date(blockTimestamp * 1000);
  console.log(`getBlockNumAndMyBalance: blockNum:${blockNumber}; datetime:${Utilities.formatTimeFull(blockDate)}; balance:${await ethers.provider.getBalance(walletAddress)};`);
}

async function printNetworkInfo() {
  let network = await ethers.provider.getNetwork();
  console.log(`getNetworkInfo: chainID:${network.chainId};`);
}

async function resetNetworkToBlockNumber(blockNumber) {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: web3ProviderRPCURL,
          blockNumber: blockNumber,
        },
      },
    ],
});
}

async function main() {
    console.log(`test1.main: 1.0 - START;`);

    await resetNetworkToBlockNumber(initialBlockNumber);
    await printNetworkInfo();
    await printBlockInfo();
    let wethContract = new ethers.Contract(WETHAddress, ERC20ABI, ethers.provider);
    let wethSymbol = await wethContract.symbol();
    let wethDecimals = await wethContract.decimals();
    console.log(`main: wethSymbol:${wethSymbol}; wethDecimals:${wethDecimals};`);
    let usdtContract = new ethers.Contract(USDTAddress, ERC20ABI, ethers.provider);
    let usdtSymbol = await usdtContract.symbol();
    let usdtDecimals = await usdtContract.decimals();
    console.log(`main: usdtSymbol:${usdtSymbol}; usdtDecimals:${usdtDecimals};`);

    tokenInContract = wethContract;
    tokenOutContract = usdtContract;
    let amountIn = 1;
    UniswapV3Commons.init(ethers.provider);
    let bnAmountIn = ethers.utils.parseUnits(amountIn.toString(), await tokenInContract.decimals());
    let aFee = 500;
    let amountOut = Number(ethers.utils.formatUnits(await UniswapV3Commons.getPrice(tokenInContract.address, tokenOutContract.address, bnAmountIn, aFee), await tokenOutContract.decimals()));
    //console.log(`main: [${await tokenInContract.symbol()}]->[${await tokenOutContract.symbol()}]--$[${amountIn}]->$[${amountOut}];`);
    
    for (let i = 1; i < advanceBlockCount; i++) {
      await resetNetworkToBlockNumber(initialBlockNumber + i);
      await printBlockInfo();
      let amountOut = Number(ethers.utils.formatUnits(await UniswapV3Commons.getPrice(tokenInContract.address, tokenOutContract.address, bnAmountIn, aFee), await tokenOutContract.decimals()));
      console.log(`main: [${await tokenInContract.symbol()}]->[${await tokenOutContract.symbol()}]--$[${amountIn}]->$[${amountOut}];`);
    }
    
    console.log(`test1.main: 2.0 - END;`);
}

main()