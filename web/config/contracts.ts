// web/config/contracts.ts

// 🧱 Import ABIs from Hardhat artifacts
// (paths are relative to /web; adjust if your folder names differ)
import ClioRegistryArtifact from "../../contracts/artifacts/contracts/ClioRegistry.sol/ClioRegistry.json";
import ClioMarketArtifact from "../../contracts/artifacts/contracts/ClioMarket.sol/ClioMarket.json";
import ClioFactoryArtifact from "../../contracts/artifacts/contracts/ClioFactory.sol/ClioFactory.json";

// 🌐 Base Sepolia chain id
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// 🔗 Deployed contract addresses on Base Sepolia
// 👉 REPLACE these with the actual addresses printed by your deploy script
export const CLIO_REGISTRY_ADDRESS =
  "0xb0Dc40b7577a6FCefA64F785a79c79349d8cf495" as `0x${string}`;

export const CLIO_MARKET_ADDRESS =
  "0x30204730cFf84DCD442502AB8DB24042bd1bb55a" as `0x${string}`;

export const CLIO_FACTORY_ADDRESS =
  "0x33087Aa41f28752b20c9980aCb1e78E8951Aa514" as `0x${string}`;

// 🪙 Base Sepolia USDC address (replace with canonical testnet USDC)
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;

// 📜 ABIs
export const clioRegistryAbi = ClioRegistryArtifact.abi;
export const clioMarketAbi = ClioMarketArtifact.abi;
export const clioFactoryAbi = ClioFactoryArtifact.abi;

// 🎛️ Helper configs for wagmi / viem
export const clioRegistryConfig = {
  address: CLIO_REGISTRY_ADDRESS,
  abi: clioRegistryAbi,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;

export const clioMarketConfig = {
  address: CLIO_MARKET_ADDRESS,
  abi: clioMarketAbi,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;

export const clioFactoryConfig = {
  address: CLIO_FACTORY_ADDRESS,
  abi: clioFactoryAbi,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;

export const usdcConfig = {
  address: USDC_ADDRESS,
  abi: [
    // minimal ERC20 approve/allowance/balanceOf/decimals
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const,
  chainId: BASE_SEPOLIA_CHAIN_ID,
} as const;
