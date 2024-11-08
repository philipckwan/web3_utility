//require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
/** @type import('hardhat/config').HardhatUserConfig */


task(
  "blockNumber",
  "Prints the current block number",
  async (_, { ethers }) => {
    await ethers.provider.getBlockNumber().then((blockNumber) => {
      console.log("Current block number: " + blockNumber);
    });
  }
);

module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-goerli.alchemyapi.io/v2/***",
        //url: 
        blockNumber: 7802740
      }
    }
  }
};