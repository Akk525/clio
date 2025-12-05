// web/hooks/useUserPosition.ts
// Hook to compute user position for an artist (balance, avg price, PnL)
// This is a placeholder - will need on-chain data + transaction history

import { useMemo } from "react";
import { useTokenBalance } from "./useTokenBalance";
import { formatEther } from "viem";
import type { Address } from "viem";

/**
 * Hook to get user position for an artist
 * 
 * This combines:
 * - Token balance (on-chain)
 * - Average entry price (would need transaction history)
 * - Current price (from mock data for now)
 * - PnL calculation
 * 
 * Usage:
 * ```tsx
 * const { balance, currentValue, pnl, pnlPercent, isLoading } = useUserPosition({
 *   tokenAddress: artistTokenAddress,
 *   currentPrice: 0.042, // from mock data or price oracle
 * });
 * ```
 */
export function useUserPosition({
  tokenAddress,
  currentPrice,
  avgEntryPrice,
}: {
  tokenAddress: Address | undefined;
  currentPrice: number; // Current price in ETH (from mock data for hackathon)
  avgEntryPrice?: number; // Average entry price (would need tx history to calculate)
}) {
  const { balance, isLoading } = useTokenBalance({ tokenAddress });

  const position = useMemo(() => {
    if (!balance || balance === 0n) {
      return {
        balance: 0,
        currentValue: 0,
        pnl: 0,
        pnlPercent: 0,
      };
    }

    const balanceNum = parseFloat(formatEther(balance));
    const currentValue = balanceNum * currentPrice;
    
    // For hackathon: use dummy avg price if not provided
    // In production, calculate from transaction history
    const avgPrice = avgEntryPrice ?? currentPrice * 0.85; // Dummy: assume 15% gain
    const costBasis = balanceNum * avgPrice;
    const pnl = currentValue - costBasis;
    const pnlPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

    return {
      balance: balanceNum,
      currentValue,
      pnl,
      pnlPercent,
    };
  }, [balance, currentPrice, avgEntryPrice]);

  return {
    ...position,
    isLoading,
    balanceRaw: balance,
  };
}

