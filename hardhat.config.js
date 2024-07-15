require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("@nomiclabs/hardhat-waffle");

const { GANACHE_PRIVATE_KEY, SEPOLIA_RPC_URL, PRIVATE_KEY} = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [GANACHE_PRIVATE_KEY] // Replace this with Ganache private keys if needed
    },
  },
  
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

};
