import hre from "hardhat";
import { getEnvVariable } from "./helpers";

async function main() {
  const AstarPrince = await hre.ethers.getContractFactory("AstarPrince");
  console.log('Deploying AstarPrince ERC721 token...');
  const token = await AstarPrince.deploy(getEnvVariable("CONTRACT_NAME"), getEnvVariable("CONTRACT_SYMBOL"), getEnvVariable("IPFS_JSON"));

  await token.deployed();
  console.log("AstarPrince deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });