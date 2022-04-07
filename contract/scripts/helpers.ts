import { ethers } from "ethers";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
import type { HardhatRuntimeEnvironment } from "hardhat/types";


// Helper method for fetching a contract instance at a given address
export function getContract(contractName: string, hre: HardhatRuntimeEnvironment, provider: ethers.providers.Provider) {
  const account = getAccount(provider);
  return getContractAt(hre, contractName, getEnvVariable("NFT_CONTRACT_ADDRESS"), account);
}

// Helper method for fetching a wallet account using an environment variable for the PK
export function getAccount(provider: ethers.providers.Provider) {
  return new ethers.Wallet(
    getEnvVariable("ACCOUNT_PRIVATE_KEY"), provider);
}


// Helper method for fetching environment variables from .env
export function getEnvVariable(key: string, defaultValue?: string): string {
  if (process.env[key]) {
    return process.env[key] as string;
  }
  if (!defaultValue) {
    throw `${key} is not defined and no default value was provided`;
  }
  return defaultValue;
}
