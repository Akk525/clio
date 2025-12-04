const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BondingCurveMarket basic flow", function () {
  let deployer, artist, buyer;
  let registry, market, token;
  let artistId;

  beforeEach(async function () {
    [deployer, artist, buyer] = await ethers.getSigners();

    // Deploy ArtistRegistry
    const Registry = await ethers.getContractFactory("ArtistRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();

    // Deploy BondingCurveMarket with registry address
    const Market = await ethers.getContractFactory("BondingCurveMarket");
    market = await Market.deploy(await registry.getAddress());
    await market.waitForDeployment();

    // Register an artist
    const tx = await registry.registerArtist(
      artist.address,
      "Test Artist",
      "@test"
    );
    await tx.wait();

    // artistId should now be 1
    artistId = await registry.artistCount();
    expect(artistId).to.equal(1n);

    // Deploy ArtistToken with owner = market
    const Token = await ethers.getContractFactory("ArtistToken");
    token = await Token.deploy(
      "Test Artist Token",
      "TAT",
      await market.getAddress()
    );
    await token.waitForDeployment();

    // Link token in registry
    await registry.setArtistToken(
      artistId,
      await token.getAddress()
    );
  });

  it("runs a buy and sell flow for one artist", async function () {
    const value = ethers.parseEther("1"); // 1 ETH
    const ARTIST_FEE_BPS = 300n; // 3%
    const fee = (value * ARTIST_FEE_BPS) / 10_000n;
    const amountAfterFee = value - fee; // goes into reserve & tokens

    // Record artist balance before
    const artistBalanceBefore = await ethers.provider.getBalance(
      artist.address
    );

    // ----------------- BUY -----------------
    await market.connect(buyer).buy(artistId, 0, { value });

    // Artist should receive exactly the fee
    const artistBalanceAfter = await ethers.provider.getBalance(
      artist.address
    );
    expect(artistBalanceAfter - artistBalanceBefore).to.equal(fee);

    // Buyer should receive tokens equal to amountAfterFee (1 wei = 1 token)
    const buyerTokenBalance = await token.balanceOf(buyer.address);
    expect(buyerTokenBalance).to.equal(amountAfterFee);

    // Reserve balance in contract should equal amountAfterFee
    const reserve = await market.reserveBalance(artistId);
    expect(reserve).to.equal(amountAfterFee);

    // Contract's ETH balance should match reserveBalance
    const marketEthBalance = await ethers.provider.getBalance(
      await market.getAddress()
    );
    expect(marketEthBalance).to.equal(amountAfterFee);

    // ----------------- SELL -----------------
    // Sell all tokens back
    await market
      .connect(buyer)
      .sell(artistId, buyerTokenBalance, 0); // minEthOut = 0 for test

    // After selling all, buyer's token balance should be 0
    const buyerTokenAfter = await token.balanceOf(buyer.address);
    expect(buyerTokenAfter).to.equal(0n);

    // Reserve for this artist should now be 0
    const reserveAfter = await market.reserveBalance(artistId);
    expect(reserveAfter).to.equal(0n);

    // Contract ETH balance should also be 0
    const marketEthAfter = await ethers.provider.getBalance(
      await market.getAddress()
    );
    expect(marketEthAfter).to.equal(0n);
  });
});
