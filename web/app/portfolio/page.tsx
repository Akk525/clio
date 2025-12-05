"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MOCK_PORTFOLIO, MOCK_ARTISTS, type PortfolioPosition, type UiArtist } from "@/lib/mockData";

// Extended position with artist data
type PositionWithArtist = PortfolioPosition & {
  artist: UiArtist;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
};

export default function PortfolioPage() {
  // Combine portfolio positions with artist data
  const positions = useMemo<PositionWithArtist[]>(() => {
    return MOCK_PORTFOLIO.map((position) => {
      const artist = MOCK_ARTISTS.find((a) => a.id === position.artistId);
      if (!artist) return null;

      const currentValue = position.tokensHeld * artist.currentPrice;
      const costBasis = position.tokensHeld * position.avgEntryPrice;
      const pnl = currentValue - costBasis;
      const pnlPercent = ((artist.currentPrice - position.avgEntryPrice) / position.avgEntryPrice) * 100;

      return {
        ...position,
        artist,
        currentValue,
        pnl,
        pnlPercent,
      };
    }).filter((p): p is PositionWithArtist => p !== null);
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
    
    // Calculate weighted 24h change
    const weightedChange = positions.reduce((sum, p) => {
      const weight = p.currentValue / totalValue;
      return sum + (p.artist.change24h * weight);
    }, 0);

    return {
      totalValue,
      totalPnL,
      totalPnLPercent,
      change24h: weightedChange,
      artistCount: positions.length,
    };
  }, [positions]);

  // Calculate allocation percentages for chart
  const allocations = useMemo(() => {
    return positions.map((p) => ({
      artist: p.artist,
      percentage: (p.currentValue / summary.totalValue) * 100,
      value: p.currentValue,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [positions, summary.totalValue]);

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
          <nav className="flex items-center gap-6">
            <Link href="/artists" className="text-sm text-gray-400 hover:text-white transition-colors">
              Artists
            </Link>
            <Link href="/portfolio" className="text-sm text-cyan-400 font-semibold">
              Portfolio
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-sm text-gray-400 mb-2">Total Portfolio Value</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              Ξ {summary.totalValue.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-sm text-gray-400 mb-2">24h Change</div>
            <div className={`text-3xl font-bold ${summary.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.change24h >= 0 ? '+' : ''}{summary.change24h.toFixed(2)}%
            </div>
          </div>

          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-sm text-gray-400 mb-2">Number of Artists</div>
            <div className="text-3xl font-bold text-cyan-300">
              {summary.artistCount}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Positions Table */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 text-cyan-300">Your Positions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-cyan-500/20">
                      <th className="text-left py-3 px-2">Artist</th>
                      <th className="text-right py-3 px-2">Tokens</th>
                      <th className="text-right py-3 px-2">Price</th>
                      <th className="text-right py-3 px-2">Value</th>
                      <th className="text-right py-3 px-2">24h</th>
                      <th className="text-right py-3 px-2">PnL</th>
                      <th className="text-center py-3 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr
                        key={position.artistId}
                        className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors"
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0">
                              <Image
                                src={position.artist.imageUrl}
                                alt={position.artist.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{position.artist.name}</div>
                              <div className="text-xs text-gray-400">@{position.artist.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right text-sm font-mono">
                          {position.tokensHeld.toFixed(2)}
                        </td>
                        <td className="py-4 px-2 text-right text-sm">
                          Ξ {position.artist.currentPrice.toFixed(4)}
                        </td>
                        <td className="py-4 px-2 text-right text-sm font-semibold">
                          Ξ {position.currentValue.toFixed(2)}
                        </td>
                        <td className={`py-4 px-2 text-right text-sm font-semibold ${
                          position.artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {position.artist.change24h >= 0 ? '+' : ''}{position.artist.change24h.toFixed(2)}%
                        </td>
                        <td className={`py-4 px-2 text-right text-sm font-semibold ${
                          position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {position.pnl >= 0 ? '+' : ''}Ξ {position.pnl.toFixed(2)}
                          <div className="text-xs opacity-75">
                            ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <Link
                            href={`/artists/${position.artistId}`}
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Allocation Chart */}
          <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 text-cyan-300">Allocation</h2>
            <AllocationChart allocations={allocations} />
          </div>
        </div>

        {/* Overall PnL Summary */}
        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Profit & Loss</div>
              <div className={`text-2xl font-bold ${summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.totalPnL >= 0 ? '+' : ''}Ξ {summary.totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Total Return</div>
              <div className={`text-2xl font-bold ${summary.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.totalPnLPercent >= 0 ? '+' : ''}{summary.totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Allocation Chart Component
function AllocationChart({ allocations }: { allocations: Array<{ artist: UiArtist; percentage: number; value: number }> }) {
  const colors = [
    'from-cyan-400 to-cyan-600',
    'from-pink-500 to-pink-700',
    'from-purple-500 to-purple-700',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
  ];

  return (
    <div className="space-y-4">
      {allocations.map((alloc, index) => (
        <div key={alloc.artist.id}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
              <span className="text-sm font-semibold">{alloc.artist.name}</span>
            </div>
            <span className="text-sm text-gray-400">{alloc.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-300`}
              style={{ width: `${alloc.percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">Ξ {alloc.value.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

