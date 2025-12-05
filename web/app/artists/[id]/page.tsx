"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { parseUnits, formatUnits, type Address } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { MOCK_ARTISTS, MOCK_ARTIST_CHART, MOCK_TRADES, type UiArtist } from "@/lib/mockData";
import { notFound } from "next/navigation";
import { useBuyArtistTokens, useSellArtistTokens } from "@/hooks/useBuySell";
import { USDC_ADDRESS, CLIO_MARKET_ADDRESS } from "@/config/contracts";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { DEPLOYED_ARTISTS } from "@/lib/deployedArtists";

export default function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const artistId = Number(params.id);
  const artist = MOCK_ARTISTS.find((a) => a.id === artistId);

  if (!artist) {
    notFound();
  }

  const deployedArtist = DEPLOYED_ARTISTS.find((a) => a.artistId === artistId);
  const tokenAddress = deployedArtist?.token as Address | undefined;

  const chartData = MOCK_ARTIST_CHART[artistId] || [];
  const artistTrades = MOCK_TRADES.filter((t) => t.artistId === artistId).slice(0, 10);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [usdcAmount, setUsdcAmount] = useState("10");
  const [tokenAmount, setTokenAmount] = useState("1");

  const { address } = useAccount();
  const { buy, isPending: isBuyPending, isSuccess: isBuySuccess, error: buyError, hash: buyHash } = useBuyArtistTokens();
  const { sell, isPending: isSellPending, isSuccess: isSellSuccess, error: sellError, hash: sellHash } = useSellArtistTokens();

  const { balance: tokenBalance } = useTokenBalance({ tokenAddress });

  // USDC approve state
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract();

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: [
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
    ] as const,
    functionName: "allowance",
    args: address ? [address, CLIO_MARKET_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { isSuccess: isApproveSuccess, isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: !!approveHash,
    },
  });

  // Dummy position data
  const userPosition = {
    balance: 120.5,
    avgPrice: 0.035,
    currentValue: artist.currentPrice * 120.5,
    pnl: ((artist.currentPrice - 0.035) / 0.035) * 100,
  };

  const estUsdcForBuy = Number(tokenAmount || "0") * artist.currentPrice;
  const estUsdcForSell = Number(tokenAmount || "0") * artist.currentPrice;

  const parsedTokenAmount = useMemo(() => {
    try {
      return parseUnits(tokenAmount || "0", 18);
    } catch {
      return 0n;
    }
  }, [tokenAmount]);

  const parsedMaxUsdc = useMemo(() => {
    try {
      return parseUnits(usdcAmount || "0", 6);
    } catch {
      return 0n;
    }
  }, [usdcAmount]);

  const tokenBalanceDisplay = useMemo(() => {
    if (!tokenBalance) return "0";
    try {
      return Number(formatUnits(tokenBalance, 18)).toFixed(4);
    } catch {
      return "0";
    }
  }, [tokenBalance]);

  const exceedsBalance = useMemo(() => {
    if (tokenBalance === undefined) return false;
    return parsedTokenAmount > tokenBalance;
  }, [parsedTokenAmount, tokenBalance]);

  const hasAllowance = useMemo(() => {
    if (!allowance) return false;
    return allowance >= parsedMaxUsdc && parsedMaxUsdc > 0n;
  }, [allowance, parsedMaxUsdc]);

  const handleApprove = () => {
    if (!address) return alert("Connect wallet first");
    const amount = parsedMaxUsdc;
    if (amount === 0n) return alert("Enter USDC amount to approve");
    writeApprove({
      address: USDC_ADDRESS,
      abi: [
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
      ] as const,
      functionName: "approve",
      args: [CLIO_MARKET_ADDRESS, amount],
    });
  };

  const handleBuy = async () => {
    const tokenAmt = parsedTokenAmount;
    const maxUsdc = parsedMaxUsdc;
    if (!address) return alert("Connect wallet first");
    if (tokenAmt === 0n || maxUsdc === 0n) return alert("Enter token and USDC amounts");
    await buy({ artistId, tokenAmount: tokenAmt, maxUsdcIn: maxUsdc });
  };

  const handleSell = async () => {
    const tokenAmt = parsedTokenAmount;
    if (!address) return alert("Connect wallet first");
    if (tokenAmt === 0n) return alert("Enter token amount");
    if (tokenBalance !== undefined && tokenAmt > tokenBalance) {
      const readable = formatUnits(tokenBalance, 18);
      return alert(`Amount exceeds your balance (${readable} tokens)`);
    }
    await sell({ artistId, tokenAmount: tokenAmt, minUsdcOut: 0n });
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050509] via-black to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/artists" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Artists
          </Link>
          <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Clio
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              {artist.name}
            </h1>
            <p className="text-xl text-cyan-300 mb-2">@{artist.handle}</p>
            <p className="text-sm text-gray-400 mb-4">{artist.genre}</p>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm">
                Twitter
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Chart */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-cyan-300">Price Chart (7d)</h2>
              <div className="h-64 relative">
                <PriceChart data={chartData} currentPrice={artist.currentPrice} />
              </div>
            </div>
          </div>

          {/* Right: Stats Card */}
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 text-cyan-300">Market Stats</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Price</div>
                <div className="text-2xl font-bold">USDC {artist.currentPrice.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">24h Change</div>
                <div className={`text-xl font-bold ${artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {artist.change24h >= 0 ? '+' : ''}{artist.change24h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">24h Volume</div>
                <div className="text-lg font-semibold">USDC {artist.volume24h.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                <div className="text-lg font-semibold">USDC {artist.marketCap.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Pool Size</div>
                <div className="text-lg font-semibold">USDC {artist.poolSize.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Holders</div>
                <div className="text-lg font-semibold">{artist.holders.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Buy/Sell + Position */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Buy/Sell Panel */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 text-cyan-300">Trade</h2>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-black/50 p-1 rounded-lg">
                <button
                  onClick={() => setTab("buy")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    tab === "buy"
                      ? "bg-green-500 text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTab("sell")}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    tab === "sell"
                      ? "bg-red-500 text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sell
                </button>
              </div>

              {tab === "buy" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Tokens to buy</label>
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Max USDC (slippage)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={usdcAmount}
                        onChange={(e) => setUsdcAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Est. cost at current price: <span className="text-cyan-300 font-semibold">~USDC {estUsdcForBuy.toFixed(4)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!hasAllowance && (
                      <button
                        onClick={handleApprove}
                        className="flex-1 py-3 bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 font-semibold rounded-lg hover:bg-cyan-500/30 transition-all"
                        disabled={isApprovePending || isApproveConfirming}
                      >
                        {isApprovePending || isApproveConfirming ? "Approving..." : "Approve USDC"}
                      </button>
                    )}
                    <button
                      onClick={handleBuy}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/30"
                      disabled={isBuyPending}
                    >
                      {isBuyPending ? "Buying..." : "Confirm Buy"}
                    </button>
                  </div>
                  {(approveError || buyError) && (
                    <div className="text-xs text-red-400 mt-2">
                      {(approveError as Error)?.message || (buyError as Error)?.message}
                    </div>
                  )}
                  {(isApproveSuccess || buyHash) && (
                    <div className="text-xs text-cyan-300 mt-1">
                      {isApproveSuccess && "USDC approved."} {buyHash && `Tx: ${buyHash}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (Tokens)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      max={tokenBalanceDisplay}
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="text-sm text-gray-400 flex items-center justify-between">
                    <span>
                      You will receive: <span className="text-cyan-300 font-semibold">~{estUsdcForSell.toFixed(4)} USDC</span>
                    </span>
                    <span>
                      Available: <span className="text-cyan-300 font-semibold">{tokenBalanceDisplay} tokens</span>
                    </span>
                  </div>
                  {exceedsBalance && (
                    <div className="text-xs text-red-400">Amount exceeds your balance.</div>
                  )}
                  <button
                    onClick={handleSell}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-lg hover:from-red-400 hover:to-rose-400 transition-all shadow-lg shadow-red-500/30"
                    disabled={isSellPending || exceedsBalance || (tokenBalance !== undefined && tokenBalance === 0n)}
                  >
                    {isSellPending ? "Selling..." : "Confirm Sell"}
                  </button>
                  {sellError && (
                    <div className="text-xs text-red-400 mt-2">{(sellError as Error).message}</div>
                  )}
                  {sellHash && (
                    <div className="text-xs text-cyan-300 mt-1">Tx: {sellHash}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Your Position */}
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-4 text-cyan-300">Your Position</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Token Balance</div>
                <div className="text-xl font-bold">{userPosition.balance.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Avg. Entry Price</div>
                <div className="text-lg font-semibold">USDC {userPosition.avgPrice.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Current Value</div>
                <div className="text-lg font-semibold">USDC {userPosition.currentValue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Unrealized PnL</div>
                <div className={`text-xl font-bold ${userPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {userPosition.pnl >= 0 ? '+' : ''}{userPosition.pnl.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4 text-cyan-300">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-cyan-500/20">
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Price (USDC)</th>
                  <th className="text-left py-3 px-2">Value (USDC)</th>
                  <th className="text-left py-3 px-2">User</th>
                  <th className="text-left py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {artistTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'buy' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm">{trade.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 text-sm">USDC {trade.price.toFixed(4)}</td>
                    <td className="py-3 px-2 text-sm">USDC {trade.ethAmount.toFixed(3)}</td>
                    <td className="py-3 px-2 text-xs text-gray-400 font-mono">{trade.user}</td>
                    <td className="py-3 px-2 text-xs text-gray-500">{formatTimeAgo(trade.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(isBuySuccess || isSellSuccess) && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/90 border border-cyan-500/40 text-white px-4 py-3 rounded-lg shadow-lg shadow-cyan-500/30 max-w-sm">
          <div className="text-sm font-semibold">
            {isBuySuccess ? "Buy successful" : "Sell successful"}
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {buyHash && isBuySuccess && `Tx: ${buyHash}`}
            {sellHash && isSellSuccess && `Tx: ${sellHash}`}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple price chart component
function PriceChart({ data, currentPrice }: { data: typeof MOCK_ARTIST_CHART[number], currentPrice: number }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No chart data available
      </div>
    );
  }

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice || 1;
  const width = 600;
  const height = 200;
  const padding = 20;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.price - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = currentPrice >= data[0]?.price || true;
  const lineColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area under curve */}
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill="url(#chartGradient)"
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
