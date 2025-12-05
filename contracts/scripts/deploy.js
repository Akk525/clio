// scripts/deploy.js
// Deploy Clio registry, market (USDC), and factory; wire addresses.

const { ethers } = require("hardhat");

const {
  BASE_SEPOLIA_USDC,
  BASE_PRICE_USDC, // optional, defaults to 0.10 USDC
  SLOPE_USDC, // optional, defaults to 0.00001 USDC per token
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with address:", deployer.address);
  console.log(
    "Deployer balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  if (!BASE_SEPOLIA_USDC) {
    throw new Error("BASE_SEPOLIA_USDC env var is required (Base Sepolia USDC address)");
  }

  const basePriceWad = ethers.parseUnits(BASE_PRICE_USDC || "0.10", 18);
  const slopeWad = ethers.parseUnits(SLOPE_USDC || "0.00001", 18);

  // 1) Deploy registry
  const Registry = await ethers.getContractFactory("ClioRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ClioRegistry deployed to:", registryAddress);

  // 2) Deploy market (USDC)
  const Market = await ethers.getContractFactory("ClioMarket");
  const market = await Market.deploy(registryAddress, BASE_SEPOLIA_USDC);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("ClioMarket deployed to:", marketAddress);

  // 3) Deploy factory
  const Factory = await ethers.getContractFactory("ClioFactory");
  const factory = await Factory.deploy(registryAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("ClioFactory deployed to:", factoryAddress);

  // 4) Wire addresses (registry owner is deployer by default)
  const tx1 = await registry.setTokenFactory(factoryAddress);
  await tx1.wait();
  const tx2 = await registry.setMarket(marketAddress);
  await tx2.wait();
  const tx3 = await factory.setMarket(marketAddress);
  await tx3.wait();

  // allow factory to init curves
  const tx4 = await market.setCurveAdmin(factoryAddress);
  await tx4.wait();

  // 5) Initialize default curve params for artistId 0 (optional)
  const initTx = await market.initCurve(0, basePriceWad, slopeWad, 300);
  await initTx.wait();

  console.log("\n=== Deployment Summary ===");
  console.log(`Registry: ${registryAddress}`);
  console.log(`Market:   ${marketAddress}`);
  console.log(`Factory:  ${factoryAddress}`);
  console.log(`Base price (wad): ${basePriceWad}`);
  console.log(`Slope (wad):       ${slopeWad}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
