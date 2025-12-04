const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");
  
  // Placeholder deployment
  const Placeholder = await hre.ethers.getContractFactory("Placeholder");
  const placeholder = await Placeholder.deploy();
  
  await placeholder.waitForDeployment();
  
  const address = await placeholder.getAddress();
  console.log("Placeholder deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

