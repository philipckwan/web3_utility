/* 
 obsoleted and replaced by: uniswapV3Utility.js
 */

/*
const {ethers} = require('ethers');
const {abi:UNISWAP_V3_FACTORY_ABI} = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json');
const {ERC20TokensMumbai, ERC20ABI, UNISWAP_V3_FACTORY_ADDRESS} = require('./constants');

require('dotenv').config();
const API_URL = process.env.API_URL;

const provider = new ethers.providers.JsonRpcProvider(API_URL);


function getTokenContract(tokenSymbol) {
    if ("WMATIC" == tokenSymbol || "WETH" == tokenSymbol) {
        return new ethers.Contract(ERC20TokensMumbai.get(tokenSymbol), ERC20ABI, provider);
    } else {
        console.log(`getTokenContract: ERROR - unknown tokenSymbol:${tokenSymbol};`);
    }
}


async function main() {
    let token1Contract = getTokenContract("WMATIC");
    let token1Address = token1Contract.address;
    let token2Contract = getTokenContract("WETH");
    let token2Address = token2Contract.address;
    let SWAP_FEE = 500;

    const factoryContract = new ethers.Contract(
        UNISWAP_V3_FACTORY_ADDRESS,
        UNISWAP_V3_FACTORY_ABI,
        provider
    );

    const poolAddress = await factoryContract.getPool(token1Address, token2Address, SWAP_FEE);
    console.log(`poolAddress:${poolAddress};`);
}

main();
*/