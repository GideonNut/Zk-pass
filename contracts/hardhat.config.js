require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

const deployerAddress = process.env.DEPLOYER_ADDRESS;
const accounts = deployerAddress ? [deployerAddress] : [];

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      chainId: 11155111,
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts,
    },
    morphTestnet: {
      chainId: 2810,
      url: "https://rpc-holesky.morphl2.io",
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      morphTestnet: "anything",
    },
    customChains: [
      {
        network: "morphTestnet",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-api-holesky.morphl2.io/api? ",
          browserURL: "https://explorer-holesky.morphl2.io/",
        },
      },
    ],
  },
};
