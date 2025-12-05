// web/config/contracts.ts

// 🧱 Import ABIs from Hardhat artifacts
// (paths are relative to /web; adjust if your folder names differ)
import ArtistRegistryArtifact from "../../contracts/artifacts/contracts/ArtistRegistry.sol/ArtistRegistry.json";
import BondingCurveMarketArtifact from "../../contracts/artifacts/contracts/BondingCurveMarket.sol/BondingCurveMarket.json";

// 🌐 Base Sepolia chain id
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// 🔗 Deployed contract addresses on Base Sepolia
// 👉 REPLACE these two with the actual addresses printed by your deploy script
export const ARTIST_REGISTRY_ADDRESS =
  "0xREGISTRY_ADDRESS_FROM_DEPLOY" as `0x${string}`;

export const BONDING_CURVE_MARKET_ADDRESS =
  "0xMARKET_ADDRESS_FROM_DEPLOY" as `0x${string}`;

// 📜 ABIs
export const artistRegistryAbi = ArtistRegistryArtifact.abi;
export const bondingCurveMarketAbi = BondingCurveMarketArtifact.abi;

// 🎛️ Helper configs for wagmi / viem
export const artistRegistryConfig = {
  address: ARTIST_REGISTRY_ADDRESS,
  abi: artistRegistryAbi,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;

export const bondingCurveMarketConfig = {
  address: BONDING_CURVE_MARKET_ADDRESS,
  abi: bondingCurveMarketAbi,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;
