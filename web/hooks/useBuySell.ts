// web/hooks/useBuySell.ts
// Ready-to-use hooks for buy/sell operations using wagmi v2

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { bondingCurveMarketConfig } from "@/config/contracts";

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
 *     ethAmount: "0.01", // as string
 *     minTokensOut: 0n, // optional slippage
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
    ethAmount: string; // ETH amount as string (e.g. "0.01")
    minTokensOut?: bigint; // Optional slippage protection
  }) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    const value = parseEther(params.ethAmount);
    const minTokens = params.minTokensOut ?? 0n;

    writeContract({
      ...bondingCurveMarketConfig,
      functionName: "buy",
      args: [BigInt(params.artistId), minTokens],
      value,
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
 *     tokenAmount: parseUnits("100", 18), // as bigint
 *     minEthOut: parseEther("0.009"), // optional slippage
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
    minEthOut?: bigint; // Optional slippage protection
  }) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    const minEth = params.minEthOut ?? 0n;

    writeContract({
      ...bondingCurveMarketConfig,
      functionName: "sell",
      args: [BigInt(params.artistId), params.tokenAmount, minEth],
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

