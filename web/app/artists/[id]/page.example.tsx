// EXAMPLE: How to integrate real contract calls in /artists/[id]/page.tsx
// This is a reference - don't use this file directly
// Copy the relevant patterns to the actual page.tsx when ready

"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther, parseUnits, formatEther } from "viem";
import { useBuyArtistTokens } from "@/hooks/useBuySell";
import { useSellArtistTokens } from "@/hooks/useBuySell";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useUserPosition } from "@/hooks/useUserPosition";
import { WalletConnectButton } from "@/components/connect-button";

// Example component showing real contract integration
export function BuySellPanelExample({ artistId, tokenAddress, currentPrice }: {
  artistId: number;
  tokenAddress: `0x${string}` | undefined;
  currentPrice: number;
}) {
  const { address, isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState("0.01");
  const [tokenAmount, setTokenAmount] = useState("100");
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  // Buy hook
  const { 
    buy, 
    isPending: isBuyPending, 
    isSuccess: isBuySuccess,
    hash: buyHash 
  } = useBuyArtistTokens();

  // Sell hook
  const { 
    sell, 
    isPending: isSellPending, 
    isSuccess: isSellSuccess,
    hash: sellHash 
  } = useSellArtistTokens();

  // Read balance
  const { balance, isLoading: isBalanceLoading } = useTokenBalance({
    tokenAddress,
  });

  // Calculate user position
  const { balance: positionBalance, currentValue, pnl, pnlPercent } = useUserPosition({
    tokenAddress,
    currentPrice,
  });

  const handleBuy = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    try {
      // Calculate minTokensOut with 5% slippage tolerance
      const ethValue = parseEther(ethAmount);
      const estimatedTokens = Number(ethAmount) / currentPrice;
      const minTokensOut = parseUnits((estimatedTokens * 0.95).toFixed(18), 18); // 5% slippage

      await buy({
        artistId,
        ethAmount,
        minTokensOut,
      });
    } catch (error) {
      console.error("Buy error:", error);
      alert(`Buy failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleSell = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet");
      return;
    }

    if (!balance || balance === 0n) {
      alert("No tokens to sell");
      return;
    }

    try {
      const tokenAmountBigInt = parseUnits(tokenAmount, 18);
      
      if (tokenAmountBigInt > balance) {
        alert("Insufficient balance");
        return;
      }

      // Calculate minEthOut with 5% slippage tolerance
      const estimatedEth = Number(tokenAmount) * currentPrice;
      const minEthOut = parseEther((estimatedEth * 0.95).toFixed(18)); // 5% slippage

      await sell({
        artistId,
        tokenAmount: tokenAmountBigInt,
        minEthOut,
      });
    } catch (error) {
      console.error("Sell error:", error);
      alert(`Sell failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6">
        <p className="text-gray-400 mb-4">Connect wallet to trade</p>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("buy")}
          className={`flex-1 py-2 rounded-lg ${
            tab === "buy" ? "bg-green-500 text-black" : "bg-black/50 text-gray-400"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setTab("sell")}
          className={`flex-1 py-2 rounded-lg ${
            tab === "sell" ? "bg-red-500 text-black" : "bg-black/50 text-gray-400"
          }`}
        >
          Sell
        </button>
      </div>

      {tab === "buy" ? (
        <div className="space-y-4">
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="ETH amount"
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white"
          />
          
          {isBuySuccess && (
            <div className="text-green-400 text-sm">
              Buy successful! <a href={`https://sepolia.basescan.org/tx/${buyHash}`} target="_blank" rel="noopener noreferrer" className="underline">View tx</a>
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={isBuyPending}
            className="w-full py-3 bg-green-500 text-black font-bold rounded-lg disabled:opacity-50"
          >
            {isBuyPending ? "Confirming..." : "Buy"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Token amount"
            className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white"
          />
          
          {isSellSuccess && (
            <div className="text-green-400 text-sm">
              Sell successful! <a href={`https://sepolia.basescan.org/tx/${sellHash}`} target="_blank" rel="noopener noreferrer" className="underline">View tx</a>
            </div>
          )}

          <button
            onClick={handleSell}
            disabled={isSellPending}
            className="w-full py-3 bg-red-500 text-black font-bold rounded-lg disabled:opacity-50"
          >
            {isSellPending ? "Confirming..." : "Sell"}
          </button>
        </div>
      )}

      {/* Your Position */}
      <div className="mt-6 pt-6 border-t border-cyan-500/20">
        <div className="text-sm text-gray-400">Your Position</div>
        {isBalanceLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Balance:</span>
              <span>{positionBalance.toFixed(2)} tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Value:</span>
              <span>Ξ {currentValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>PnL:</span>
              <span className={pnl >= 0 ? "text-green-400" : "text-red-400"}>
                {pnl >= 0 ? "+" : ""}Ξ {pnl.toFixed(2)} ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Notes:
// 1. Replace dummy handleConfirm() with handleBuy/handleSell above
// 2. Replace dummy userPosition with useUserPosition hook
// 3. Keep chart data (MOCK_ARTIST_CHART) and volume metrics as dummy for hackathon
// 4. Add toast notifications instead of alerts (optional)
// 5. Fetch tokenAddress from ArtistRegistry when ready

