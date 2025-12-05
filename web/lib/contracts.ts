// web/lib/contracts.ts

import type { PublicClient, WalletClient, Address } from "viem";
import {
  CLIO_REGISTRY_ADDRESS,
  CLIO_MARKET_ADDRESS,
  clioRegistryAbi,
  clioMarketAbi,
  BASE_SEPOLIA_CHAIN_ID,
  USDC_ADDRESS,
} from "@/config/contracts";
import ClioArtistTokenArtifact from "../../contracts/artifacts/contracts/ClioArtistToken.sol/ClioArtistToken.json";

// Re-exports for scripts/tests expecting legacy names
export const ARTIST_REGISTRY_ABI = clioRegistryAbi;
export const BONDING_CURVE_MARKET_ABI = clioMarketAbi;
export const ARTIST_TOKEN_ABI = ClioArtistTokenArtifact.abi;

// ----------------------
// Types
// ----------------------

export type Artist = {
  artistWallet: Address;
  token: Address;
  name: string;
  handle: string;
  active: boolean;
};

// ----------------------
// Read helpers (registry)
// ----------------------

/**
 * Read total number of registered artists.
 */
export async function getArtistCount(
  publicClient: PublicClient
): Promise<bigint> {
  // ClioRegistry uses nextArtistId (starts at 0)
  const nextId = await publicClient.readContract({
    address: CLIO_REGISTRY_ADDRESS,
    abi: clioRegistryAbi,
    functionName: "nextArtistId",
  });

  return nextId as bigint;
}

/**
 * Read a single artist by id from the registry.
 */
export async function getArtistById(
  publicClient: PublicClient,
  artistId: bigint | number
): Promise<Artist> {
  const id = BigInt(artistId);

  // Solidity: mapping(uint256 => Artist) public artists;
  // Getter returns (artistWallet, token, name, handle, active)
  const [artistWallet, token, name, handle, active] = (await publicClient.readContract({
    address: CLIO_REGISTRY_ADDRESS,
    abi: clioRegistryAbi,
    functionName: "artists",
    args: [id],
  })) as [Address, Address, string, string, boolean];

  return {
    artistWallet,
    token,
    name,
    handle,
    active,
  };
}

// ----------------------
// Write helpers (market)
// ----------------------

/**
 * Buy artist tokens via BondingCurveMarket.
 *
 * @param walletClient viem WalletClient (e.g. from wagmi)
 * @param params.artistId   artist id (1..artistCount)
 * @param params.ethIn      amount of ETH to send (in wei)
 * @param params.account    caller address
 * @param params.minTokensOut optional slippage guard (default 0)
 *
 * Returns the transaction hash.
 */
export async function buyArtistTokens(
  walletClient: WalletClient,
  params: {
    artistId: bigint | number;
    tokenAmount: bigint; // 18 decimals
    maxUsdcIn: bigint; // 6 decimals
    account: Address;
  }
): Promise<`0x${string}`> {
  const { artistId, tokenAmount, maxUsdcIn, account } = params;

  const hash = await walletClient.writeContract({
    account,
    chain: { id: BASE_SEPOLIA_CHAIN_ID } as any,
    address: CLIO_MARKET_ADDRESS,
    abi: clioMarketAbi,
    functionName: "buy",
    args: [BigInt(artistId), tokenAmount, maxUsdcIn],
  });

  return hash;
}

/**
 * Sell artist tokens back to the BondingCurveMarket.
 *
 * @param walletClient viem WalletClient
 * @param params.artistId     artist id
 * @param params.tokenAmount  amount of tokens to sell (in smallest units)
 * @param params.minEthOut    slippage guard (minimum ETH to receive)
 * @param params.account      caller address
 *
 * Returns the transaction hash.
 */
export async function sellArtistTokens(
  walletClient: WalletClient,
  params: {
    artistId: bigint | number;
    tokenAmount: bigint;
    minUsdcOut?: bigint;
    account: Address;
  }
): Promise<`0x${string}`> {
  const { artistId, tokenAmount, account } = params;
  const minUsdcOut = params.minUsdcOut ?? 0n;

  const hash = await walletClient.writeContract({
    account,
    chain: { id: BASE_SEPOLIA_CHAIN_ID } as any,
    address: CLIO_MARKET_ADDRESS,
    abi: clioMarketAbi,
    functionName: "sell",
    args: [BigInt(artistId), tokenAmount, minUsdcOut],
  });

  return hash;
}

// ----------------------
// Quotes
// ----------------------

export async function quoteBuy(
  publicClient: PublicClient,
  artistId: bigint | number,
  tokenAmount: bigint
): Promise<{ usdcIn: bigint; fee: bigint; newPriceWad: bigint }> {
  const [usdcIn, fee, newPriceWad] = (await publicClient.readContract({
    address: CLIO_MARKET_ADDRESS,
    abi: clioMarketAbi,
    functionName: "quoteBuy",
    args: [BigInt(artistId), tokenAmount],
  })) as [bigint, bigint, bigint];

  return { usdcIn, fee, newPriceWad };
}

export async function quoteSell(
  publicClient: PublicClient,
  artistId: bigint | number,
  tokenAmount: bigint
): Promise<{ usdcOut: bigint; fee: bigint; newPriceWad: bigint }> {
  const [usdcOut, fee, newPriceWad] = (await publicClient.readContract({
    address: CLIO_MARKET_ADDRESS,
    abi: clioMarketAbi,
    functionName: "quoteSell",
    args: [BigInt(artistId), tokenAmount],
  })) as [bigint, bigint, bigint];

  return { usdcOut, fee, newPriceWad };
}

// ----------------------
// Approvals (USDC)
// ----------------------

export async function approveUsdc(
  walletClient: WalletClient,
  params: { spender: Address; amount: bigint; account: Address }
): Promise<`0x${string}`> {
  const { spender, amount, account } = params;
  const hash = await walletClient.writeContract({
    account,
    chain: { id: BASE_SEPOLIA_CHAIN_ID } as any,
    address: USDC_ADDRESS,
    abi: [{
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    }] as const,
    functionName: "approve",
    args: [spender, amount],
  });
  return hash;
}

// ----------------------
// Utility functions (from social_layer)
// ----------------------

/**
 * Format token amount for display (18 decimals)
 */
export function formatTokenAmount(amount: bigint): string {
  const formatted = Number(amount) / 1e18
  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

/**
 * Format ETH amount for display
 */
export function formatEth(amount: bigint): string {
  const formatted = Number(amount) / 1e18
  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }) + ' ETH'
}

/**
 * Calculate artist fee (3%)
 */
export function calculateArtistFee(amount: bigint): bigint {
  return (amount * 300n) / 10_000n
}

/**
 * Calculate tokens received after fee
 */
export function calculateTokensOut(ethAmount: bigint): bigint {
  const fee = calculateArtistFee(ethAmount)
  return ethAmount - fee // 1 wei = 1 token after fee
}
