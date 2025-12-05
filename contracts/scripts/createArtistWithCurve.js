// scripts/createArtistWithCurve.js
// Usage: npx hardhat run scripts/createArtistWithCurve.js --network baseSepolia
// Env: ARTIST_WALLET, ARTIST_NAME, ARTIST_HANDLE, ARTIST_SYMBOL, BASE_PRICE_USDC, SLOPE_USDC, ARTIST_FEE_BPS

const { ethers } = require("hardhat");

async function main() {
  const {
    ARTIST_WALLET,
    ARTIST_NAME,
    ARTIST_HANDLE,
    ARTIST_SYMBOL,
    BASE_PRICE_USDC = "0.10",
    SLOPE_USDC = "0.00001",
    ARTIST_FEE_BPS = "300",
    CLIO_FACTORY_ADDRESS,
  } = process.env;

  if (!CLIO_FACTORY_ADDRESS) throw new Error("CLIO_FACTORY_ADDRESS env var required");
  if (!ARTIST_WALLET) throw new Error("ARTIST_WALLET env var required");
  if (!ARTIST_NAME || !ARTIST_HANDLE || !ARTIST_SYMBOL) throw new Error("Artist name/handle/symbol required");

  const basePriceWad = ethers.parseUnits(BASE_PRICE_USDC, 18);
  const slopeWad = ethers.parseUnits(SLOPE_USDC, 18);
  const feeBps = Number(ARTIST_FEE_BPS);

  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const factory = await ethers.getContractAt("ClioFactory", CLIO_FACTORY_ADDRESS);

  const tx = await factory.createArtistWithCurve(
    ARTIST_WALLET,
    ARTIST_NAME,
    ARTIST_HANDLE,
    ARTIST_SYMBOL,
    basePriceWad,
    slopeWad,
    feeBps
  );
  console.log("Sent tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in block", receipt.blockNumber);

  // Find ArtistCreated event
  const artistCreated = receipt.logs
    .map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean)
    .find((parsed) => parsed.name === "ArtistCreated");

  if (artistCreated) {
    const { artistId, artistWallet, token } = artistCreated.args;
    console.log("ArtistCreated:", {
      artistId: artistId.toString(),
      artistWallet,
      token,
    });
  } else {
    console.log("ArtistCreated event not found in receipt; verify manually.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
