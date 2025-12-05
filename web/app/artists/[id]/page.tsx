"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_ARTISTS, MOCK_ARTIST_CHART, MOCK_TRADES, type UiArtist } from "@/lib/mockData";
import { notFound } from "next/navigation";

export default function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const artistId = Number(params.id);
  const artist = MOCK_ARTISTS.find((a) => a.id === artistId);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!artist) {
    notFound();
  }

  const chartData = MOCK_ARTIST_CHART[artistId] || [];
  const artistTrades = MOCK_TRADES.filter((t) => t.artistId === artistId).slice(0, 10);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [ethAmount, setEthAmount] = useState("0.01");
  const [tokenAmount, setTokenAmount] = useState("100");

  // Dummy position data
  const userPosition = {
    balance: 120.5,
    avgPrice: 0.035,
    currentValue: artist.currentPrice * 120.5,
    pnl: ((artist.currentPrice - 0.035) / 0.035) * 100,
  };

  const estTokensForBuy = Number(ethAmount || "0") / artist.currentPrice;
  const estEthForSell = Number(tokenAmount || "0") * artist.currentPrice;

  const handleConfirm = () => {
    const message = tab === "buy" 
      ? `Simulated buy: ${estTokensForBuy.toFixed(2)} tokens for ${ethAmount} ETH`
      : `Simulated sell: ${tokenAmount} tokens for ${estEthForSell.toFixed(4)} ETH`;
    
    alert(message);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050509] via-black to-black text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-bl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-cyan-500/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link 
            href="/artists" 
            className="group flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:gap-3"
          >
            <span className="transform transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Artists</span>
          </Link>
          <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Clio
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Artist Header */}
        <div 
          className={`flex flex-col md:flex-row gap-6 mb-12 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500 animate-pulse" />
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 transform transition-all duration-500 group-hover:scale-105 group-hover:border-cyan-400/50">
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient leading-tight">
                {artist.name}
              </h1>
              <p className="text-2xl text-cyan-300 font-semibold flex items-center gap-2">
                <span className="text-cyan-500/50">@</span>
                {artist.handle}
              </p>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300 font-medium">
                  {artist.genre}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-sm text-gray-400">{artist.holders.toLocaleString()} holders</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="group px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/40 rounded-lg text-cyan-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 text-sm font-medium hover:scale-105 transform">
                <span className="flex items-center gap-2">
                  <span className="group-hover:scale-110 transition-transform">🐦</span>
                  Twitter
                </span>
              </button>
              <button className="group px-5 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/40 rounded-lg text-purple-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-sm font-medium hover:scale-105 transform">
                <span className="flex items-center gap-2">
                  <span className="group-hover:scale-110 transition-transform">💬</span>
                  Discord
                </span>
              </button>
              <button className="group px-5 py-2.5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/40 rounded-lg text-pink-300 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 text-sm font-medium hover:scale-105 transform">
                <span className="flex items-center gap-2">
                  <span className="group-hover:scale-110 transition-transform">🌐</span>
                  Website
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Left: Chart */}
          <div className="lg:col-span-2">
            <div className="group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">📈</span>
                    Price Chart
                    <span className="text-xs text-gray-500 font-normal">(7 days)</span>
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    artist.change24h >= 0 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {artist.change24h >= 0 ? '+' : ''}{artist.change24h.toFixed(2)}%
                  </div>
                </div>
                <div className="h-64 relative rounded-lg overflow-hidden">
                  <PriceChart data={chartData} currentPrice={artist.currentPrice} artistId={artistId} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats Card */}
          <div className="group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="text-cyan-400">📊</span>
                Market Stats
              </h2>
              <div className="space-y-5">
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Current Price</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Ξ {artist.currentPrice.toFixed(4)}
                  </div>
                </div>
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">24h Change</div>
                  <div className={`text-2xl font-bold ${artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {artist.change24h >= 0 ? '↗ +' : '↘ '}{artist.change24h.toFixed(2)}%
                  </div>
                </div>
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">24h Volume</div>
                  <div className="text-lg font-bold text-white">Ξ {artist.volume24h.toFixed(2)}</div>
                </div>
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Market Cap</div>
                  <div className="text-lg font-bold text-white">Ξ {artist.marketCap.toFixed(0)}</div>
                </div>
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Pool Size</div>
                  <div className="text-lg font-bold text-white">Ξ {artist.poolSize.toFixed(2)}</div>
                </div>
                <div className="group/stat p-3 rounded-lg hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
                  <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wider">Holders</div>
                  <div className="text-lg font-bold text-white">{artist.holders.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Buy/Sell + Position */}
        <div 
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Buy/Sell Panel */}
          <div className="lg:col-span-2">
            <div className="group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <span className="text-cyan-400">💰</span>
                  Trade
                </h2>
                
                {/* Tabs */}
                <div className="relative flex gap-2 mb-8 bg-black/60 p-1.5 rounded-xl border border-white/5">
                  <button
                    onClick={() => setTab("buy")}
                    className={`relative flex-1 py-3 rounded-lg font-bold transition-all duration-300 transform ${
                      tab === "buy"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-black scale-105 shadow-lg shadow-green-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab === "buy" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur-xl opacity-50" />
                    )}
                    <span className="relative">Buy</span>
                  </button>
                  <button
                    onClick={() => setTab("sell")}
                    className={`relative flex-1 py-3 rounded-lg font-bold transition-all duration-300 transform ${
                      tab === "sell"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white scale-105 shadow-lg shadow-red-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab === "sell" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 rounded-lg blur-xl opacity-50" />
                    )}
                    <span className="relative">Sell</span>
                  </button>
                </div>

                {tab === "buy" ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Amount (ETH)</label>
                      <div className="relative group/input">
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={ethAmount}
                          onChange={(e) => setEthAmount(e.target.value)}
                          className="w-full px-5 py-4 bg-black/70 border border-green-500/30 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 group-hover/input:border-green-500/40"
                          placeholder="0.0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">ETH</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">You will receive</div>
                      <div className="text-2xl font-black text-green-400">~{estTokensForBuy.toFixed(2)} tokens</div>
                    </div>
                    <button
                      onClick={handleConfirm}
                      className="group/btn relative w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black text-lg rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-[1.02] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      <span className="relative">Confirm Buy</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Amount (Tokens)</label>
                      <div className="relative group/input">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(e.target.value)}
                          className="w-full px-5 py-4 bg-black/70 border border-red-500/30 rounded-xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 group-hover/input:border-red-500/40"
                          placeholder="0.0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">TOKENS</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">You will receive</div>
                      <div className="text-2xl font-black text-red-400">~{estEthForSell.toFixed(4)} Ξ</div>
                    </div>
                    <button
                      onClick={handleConfirm}
                      className="group/btn relative w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-black text-lg rounded-xl hover:from-red-400 hover:to-rose-400 transition-all duration-300 shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.02] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      <span className="relative">Confirm Sell</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Your Position */}
          <div className="group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="text-cyan-400">💼</span>
                Your Position
              </h2>
              <div className="space-y-5">
                <div className="group/stat p-4 rounded-xl hover:bg-white/5 transition-all duration-300 transform hover:scale-105 border border-white/5">
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Token Balance</div>
                  <div className="text-2xl font-black text-white">{userPosition.balance.toFixed(2)}</div>
                </div>
                <div className="group/stat p-4 rounded-xl hover:bg-white/5 transition-all duration-300 transform hover:scale-105 border border-white/5">
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Avg. Entry Price</div>
                  <div className="text-xl font-bold text-white">Ξ {userPosition.avgPrice.toFixed(4)}</div>
                </div>
                <div className="group/stat p-4 rounded-xl hover:bg-white/5 transition-all duration-300 transform hover:scale-105 border border-white/5">
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Current Value</div>
                  <div className="text-xl font-bold text-white">Ξ {userPosition.currentValue.toFixed(2)}</div>
                </div>
                <div className={`group/stat p-4 rounded-xl transition-all duration-300 transform hover:scale-105 border ${
                  userPosition.pnl >= 0 
                    ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' 
                    : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                }`}>
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Unrealized PnL</div>
                  <div className={`text-3xl font-black ${userPosition.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {userPosition.pnl >= 0 ? '↗ +' : '↘ '}{userPosition.pnl.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div 
          className={`group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-500 overflow-hidden transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <span className="text-cyan-400">📜</span>
              Recent Activity
            </h2>
            <div className="overflow-x-auto -mx-6 px-6 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-cyan-500/20 uppercase tracking-wider">
                    <th className="text-left py-4 px-3 font-semibold">Type</th>
                    <th className="text-left py-4 px-3 font-semibold">Amount</th>
                    <th className="text-left py-4 px-3 font-semibold">Price</th>
                    <th className="text-left py-4 px-3 font-semibold">Value</th>
                    <th className="text-left py-4 px-3 font-semibold">User</th>
                    <th className="text-left py-4 px-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {artistTrades.map((trade, idx) => (
                    <tr 
                      key={trade.id} 
                      className="border-b border-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5 transition-all duration-300 group/row"
                      style={{ 
                        animationDelay: `${idx * 50}ms`,
                        animation: 'fadeInUp 0.5s ease-out forwards'
                      }}
                    >
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 group-hover/row:scale-110 ${
                          trade.type === 'buy' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 group-hover/row:bg-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/30 group-hover/row:bg-red-500/20'
                        }`}>
                          {trade.type === 'buy' ? '📈' : '📉'}
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-sm font-semibold text-white">{trade.amount.toFixed(2)}</td>
                      <td className="py-4 px-3 text-sm font-semibold text-cyan-300">Ξ {trade.price.toFixed(4)}</td>
                      <td className="py-4 px-3 text-sm font-bold text-white">Ξ {trade.ethAmount.toFixed(3)}</td>
                      <td className="py-4 px-3">
                        <span className="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded border border-white/5">
                          {trade.user}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-xs text-gray-500 font-medium">{formatTimeAgo(trade.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}

// Enhanced price chart component
function PriceChart({ data, currentPrice, artistId }: { data: typeof MOCK_ARTIST_CHART[number], currentPrice: number, artistId: number }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; time: number } | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center space-y-2">
          <div className="text-4xl opacity-50">📊</div>
          <div className="text-sm">No chart data available</div>
        </div>
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
    return { x, y, price: point.price, time: point.time };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const isPositive = currentPrice >= data[0]?.price || true;
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const glowColor = isPositive ? '#34d399' : '#f87171';

  return (
    <div className="relative w-full h-full">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        className="overflow-visible"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={`chartGradient-${artistId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.4" />
            <stop offset="50%" stopColor={lineColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${artistId}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + (i * (height - padding * 2) / 4)}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2) / 4)}
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Area under curve */}
        <polygon
          points={`${padding},${height - padding} ${pathPoints} ${width - padding},${height - padding}`}
          fill={`url(#chartGradient-${artistId})`}
          className="transition-all duration-500"
        />
        
        {/* Main line with glow */}
        <polyline
          points={pathPoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${artistId})`}
          className="transition-all duration-500"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={lineColor}
              className="opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(point)}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(point)}
            />
          </g>
        ))}
        
        {/* Hover indicator */}
        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={padding}
              x2={hoveredPoint.x}
              y2={height - padding}
              stroke={glowColor}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="6"
              fill={lineColor}
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="10"
              fill={glowColor}
              opacity="0.3"
              className="animate-ping"
            />
          </>
        )}
      </svg>
      
      {/* Hover tooltip */}
      {hoveredPoint && (
        <div 
          className="absolute bg-black/90 border border-cyan-500/30 rounded-lg px-4 py-3 pointer-events-none backdrop-blur-xl shadow-2xl"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="text-xs text-gray-400 mb-1">Price</div>
          <div className="text-lg font-bold text-white">Ξ {hoveredPoint.price.toFixed(4)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(hoveredPoint.time).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
