import { task, types } from "hardhat/config";
import { ethers } from "ethers";
import { getContract, getEnvVariable, getProvider } from "./helpers";


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("checksum", "Change address to checksum address")
  .addParam("address", "wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log(ethers.utils.getAddress(taskArgs.address));
  });

task("pushWL", "Push WhiteList from JSON file")
  .addOptionalParam("filename", "WhiteList json file name", "./whitelist_import.json")
  .setAction(async (taskArgs, hre) => {
    const whitelist = await import(taskArgs.filename);
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    const transactionResponse = await contract["pushMultiWL"](whitelist.default);
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("ownerMint", "Mints from the NFT contract. (only Owner)")
  .addParam("number", "Ownermint Number")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    const transactionResponse = await contract["ownerMint"](taskArguments.number);
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("isPaused", "Check pause status")
  .setAction(async function (taskArguments, hre) {

    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    const transactionResponse = await contract["is_paused"]();
    console.log(`isPaused: ${transactionResponse}`);
  });

task("pause", "Pause Sale")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    const transactionResponse = await contract["pause"](true);
    console.log(`Sale Pause status changed. hash: ${transactionResponse.hash}`);
  });

task("unpause", "Un Pause Sale")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    console.log(`call contract.address ${contract.address}.`);
    const transactionResponse = await contract["pause"](false);
    console.log(`Sale Pause status changed. hash: ${transactionResponse.hash}`);
  });


task("totalSupply", "Show Total Supply")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider(hre));
    console.log(`call contract.address ${contract.address}.`);
    const transactionResponse = await contract["totalSupply"]();
    console.log(`totalSupply: ${transactionResponse}`);
  });
