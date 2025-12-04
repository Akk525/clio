// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with address:", deployer.address);
  console.log(
    "Deployer balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // 1) Deploy ArtistRegistry
  const Registry = await ethers.getContractFactory("ArtistRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("ArtistRegistry deployed to:", registryAddress);

  // 2) Deploy BondingCurveMarket with registry address
  const Market = await ethers.getContractFactory("BondingCurveMarket");
  const market = await Market.deploy(registryAddress);
  await market.waitForDeployment();

  const marketAddress = await market.getAddress();
  console.log("BondingCurveMarket deployed to:", marketAddress);

  console.log("\n=== Deployment Summary ===");
  console.log(`Registry: ${registryAddress}`);
  console.log(`Market:   ${marketAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
