// web/lib/contracts.ts

import type { PublicClient, WalletClient, Address } from "viem";
import {
  ARTIST_REGISTRY_ADDRESS,
  BONDING_CURVE_MARKET_ADDRESS,
  artistRegistryAbi,
  bondingCurveMarketAbi,
  BASE_SEPOLIA_CHAIN_ID,
} from "@/config/contracts";

// ----------------------
// Types
// ----------------------

export type Artist = {
  artistWallet: Address;
  token: Address;
  name: string;
  handle: string;
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
  const count = await publicClient.readContract({
    address: ARTIST_REGISTRY_ADDRESS,
    abi: artistRegistryAbi,
    functionName: "artistCount",
  });

  return count as bigint;
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
  // Getter returns (artistWallet, token, name, handle)
  const [artistWallet, token, name, handle] = (await publicClient.readContract({
    address: ARTIST_REGISTRY_ADDRESS,
    abi: artistRegistryAbi,
    functionName: "artists",
    args: [id],
  })) as [Address, Address, string, string];

  return {
    artistWallet,
    token,
    name,
    handle,
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
    ethIn: bigint;
    account: Address;
    minTokensOut?: bigint;
  }
): Promise<`0x${string}`> {
  const { artistId, ethIn, account } = params;
  const minTokensOut = params.minTokensOut ?? 0n;

  const hash = await walletClient.writeContract({
    account,
    chain: { id: BASE_SEPOLIA_CHAIN_ID } as any,
    address: BONDING_CURVE_MARKET_ADDRESS,
    abi: bondingCurveMarketAbi,
    functionName: "buy",
    args: [BigInt(artistId), minTokensOut],
    value: ethIn,
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
    minEthOut?: bigint;
    account: Address;
  }
): Promise<`0x${string}`> {
  const { artistId, tokenAmount, account } = params;
  const minEthOut = params.minEthOut ?? 0n;

  const hash = await walletClient.writeContract({
    account,
    chain: { id: BASE_SEPOLIA_CHAIN_ID } as any,
    address: BONDING_CURVE_MARKET_ADDRESS,
    abi: bondingCurveMarketAbi,
    functionName: "sell",
    args: [BigInt(artistId), tokenAmount, minEthOut],
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
