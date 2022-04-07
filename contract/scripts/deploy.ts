import hre from "hardhat";

async function main() {
  const AstarCats = await hre.ethers.getContractFactory("AstarCats");
  console.log('Deploying AstarCats ERC721 token...');
  const token = await AstarCats.deploy("AstarCats", "CAT", "ipfs://QmS3VmXBrVFRRdkSSBfgbRB5mzVdnANNdGaZPyo69BMwsR/hidden.json");

  await token.deployed();
  console.log("AstarCats deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });