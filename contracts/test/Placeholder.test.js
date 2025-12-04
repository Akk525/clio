const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Placeholder", function () {
  it("Should deploy", async function () {
    const Placeholder = await ethers.getContractFactory("Placeholder");
    const placeholder = await Placeholder.deploy();
    await placeholder.waitForDeployment();
    expect(await placeholder.getAddress()).to.be.properAddress;
  });
});

