// web/hooks/useBuySell.ts
// Ready-to-use hooks for buy/sell operations using wagmi v2

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { clioMarketConfig } from "@/config/contracts";

/**
 * Hook for buying artist tokens
 * 
 * Usage:
 * ```tsx
 * const { buy, isPending, isSuccess, hash } = useBuyArtistTokens();
 * 
 * const handleBuy = async () => {
 *   await buy({
 *     artistId: 1,
 *     tokenAmount: parseUnits("100", 18), // tokens to receive
 *     maxUsdcIn: parseUnits("10", 6),      // slippage guard in USDC
 *   });
 * };
 * ```
 */
export function useBuyArtistTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buy = async (params: {
    artistId: number;
    tokenAmount: bigint; // 18 decimals
    maxUsdcIn: bigint;   // 6 decimals
  }) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    writeContract({
      ...clioMarketConfig,
      functionName: "buy",
      args: [BigInt(params.artistId), params.tokenAmount, params.maxUsdcIn],
    });
  };

  return {
    buy,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook for selling artist tokens
 * 
 * Usage:
 * ```tsx
 * const { sell, isPending, isSuccess, hash } = useSellArtistTokens();
 * 
 * const handleSell = async () => {
 *   await sell({
 *     artistId: 1,
 *     tokenAmount: parseUnits("100", 18), // tokens to burn
 *     minUsdcOut: parseUnits("9", 6), // optional slippage in USDC
 *   });
 * };
 * ```
 */
export function useSellArtistTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sell = async (params: {
    artistId: number;
    tokenAmount: bigint;
    minUsdcOut?: bigint; // Optional slippage protection
  }) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    writeContract({
      ...clioMarketConfig,
      functionName: "sell",
      args: [BigInt(params.artistId), params.tokenAmount, params.minUsdcOut ?? 0n],
    });
  };

  return {
    sell,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

