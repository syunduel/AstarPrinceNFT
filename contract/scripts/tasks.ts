import { task } from "hardhat/config";
import { ethers } from "ethers";
import { getContract, getEnvVariable } from "./helpers";

function getProvider() {
  const provider = new ethers.providers.JsonRpcProvider(getEnvVariable("TASK_RPC"));
  return provider;
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
/*
task("ownerMint", "Mints from the NFT contract. (only Owner)")
  .addParam("number", "Ownermint Number")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider());
    const transactionResponse = await contract["_ownerMint"](taskArguments.number);
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });
*/
task("isPaused", "Check pause status")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider());
    const transactionResponse = await contract["is_paused"]();
    console.log(`isPaused: ${transactionResponse}`);
  });

task("pause", "Pause Sale")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider());
    const transactionResponse = await contract["pause"](true);
    console.log(`Sale Pause status changed. hash: ${transactionResponse.hash}`);
  });

task("unpause", "Un Pause Sale")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(getEnvVariable("CONTRACT_NAME"), hre, getProvider());
    const transactionResponse = await contract["pause"](false);
    console.log(`Sale Pause status changed. hash: ${transactionResponse.hash}`);
  });
