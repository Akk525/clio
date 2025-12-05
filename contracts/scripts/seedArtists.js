// scripts/seedArtists.js
// Deploy multiple artists + tokens + curves in one go using the ClioFactory helper.
// Usage: CLIO_FACTORY_ADDRESS=0x... npx hardhat run scripts/seedArtists.js --network baseSepolia
// Optional per-artist overrides inside the `artists` array below.
// Env defaults: BASE_PRICE_USDC (e.g. 0.10), SLOPE_USDC (e.g. 0.00001), ARTIST_FEE_BPS (e.g. 300)

const { ethers } = require("hardhat");

// Artist list mirrors web/lib/mockArtists.ts to keep deployment + frontend in sync.
const artists = [
  {
    name: "Taylor Swift",
    handle: "Taylor.Swift",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "TSWIFT",
  },
  {
    name: "The Weeknd",
    handle: "The.Weeknd",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "WKND",
  },
  {
    name: "Gun n Roses",
    handle: "Gun_n_Roses",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "GNR",
  },
  {
    name: "Deadmau5",
    handle: "Deadmau.5",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "MAU5",
  },
  {
    name: "Daft Punk",
    handle: "Daft_Punk",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "DAFT",
  },
  {
    name: "Seedhe Maut",
    handle: "Seedhe_Maut",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "SEED",
  },
  {
    name: "Daddy Yankee",
    handle: "Daddy_Yankee",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "DYAN",
  },
  {
    name: "Bad Bunny",
    handle: "badBunny",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "BUNNY",
  },
  {
    name: "Luke Combs",
    handle: "Luke_Combs",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "LCMB",
  },
  {
    name: "Charlie XCX",
    handle: "XCX",
    artistWallet: "0x2e2da4311ea87cfa31c372d59b4a0d567c15d760",
    symbol: "XCX",
  },
];

async function main() {
  const {
    CLIO_FACTORY_ADDRESS,
    BASE_PRICE_USDC = "0.10",
    SLOPE_USDC = "0.00001",
    ARTIST_FEE_BPS = "300",
  } = process.env;

  if (!CLIO_FACTORY_ADDRESS) throw new Error("CLIO_FACTORY_ADDRESS env var required");

  const basePriceDefault = ethers.parseUnits(BASE_PRICE_USDC, 18);
  const slopeDefault = ethers.parseUnits(SLOPE_USDC, 18);
  const feeBpsDefault = Number(ARTIST_FEE_BPS);

  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const factory = await ethers.getContractAt("ClioFactory", CLIO_FACTORY_ADDRESS);

  let isFirst = true;

  for (const artist of artists) {
    const basePriceWad = artist.basePriceUSDC
      ? ethers.parseUnits(artist.basePriceUSDC, 18)
      : basePriceDefault;
    const slopeWad = artist.slopeUSDC
      ? ethers.parseUnits(artist.slopeUSDC, 18)
      : slopeDefault;
    const feeBps = artist.feeBps ?? feeBpsDefault;

    console.log(`\nCreating artist: ${artist.name} (${artist.symbol})`);
    // Workaround: artistId 0 curve already initialized in deploy; create first artist without re-init
    const tx = isFirst
      ? await factory.createArtist(artist.artistWallet, artist.name, artist.handle, artist.symbol)
      : await factory.createArtistWithCurve(
          artist.artistWallet,
          artist.name,
          artist.handle,
          artist.symbol,
          basePriceWad,
          slopeWad,
          feeBps
        );
    console.log("  sent tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("  mined block:", receipt.blockNumber);

    // parse ArtistCreated event
    const parsed = receipt.logs
      .map((log) => {
        try {
          return factory.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .find((p) => p.name === "ArtistCreated");

    if (parsed) {
      const { artistId, artistWallet, token } = parsed.args;
      console.log("  ArtistCreated:", {
        artistId: artistId.toString(),
        artistWallet,
        token,
      });
    } else {
      console.log("  (ArtistCreated event not found; verify manually.)");
    }

    isFirst = false;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
