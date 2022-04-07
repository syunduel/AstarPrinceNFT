require('dotenv').config();
import "@nomiclabs/hardhat-waffle";
import type { HardhatUserConfig } from "hardhat/config";
require('./scripts/tasks');
import { getEnvVariable } from "./scripts/helpers";


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more


const config: HardhatUserConfig = {

  defaultNetwork: "localhost",
  solidity: "0.8.0",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    shibuya: {
      url: 'https://rpc.shibuya.astar.network:8545',
      chainId: 81,
    }
  }
};

export default config;
