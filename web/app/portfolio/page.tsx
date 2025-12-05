"use client";

import { useMemo, useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Subtle background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-lg' : 'bg-black/80 backdrop-blur-md border-b border-cyan-500/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/artists" className="group flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-all duration-200">
            <span className="transform transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Artists</span>
          </Link>
          <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Clio
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/artists" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Artists
            </Link>
            <Link href="/portfolio" className="text-sm text-cyan-400 font-bold">
              Portfolio
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className={`mb-8 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-4xl font-bold text-white mb-2">Your Portfolio</h1>
          <p className="text-gray-400">Track your artist token holdings and performance</p>
        </div>

        {/* Top Summary */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 transform transition-all duration-700 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">Total Portfolio Value</div>
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Ξ {summary.totalValue.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${
              summary.change24h >= 0 ? 'bg-gradient-to-br from-green-500/5 to-transparent' : 'bg-gradient-to-br from-red-500/5 to-transparent'
            }`} />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">24h Change</div>
              <div className={`text-4xl font-black ${summary.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.change24h >= 0 ? '↗ +' : '↘ '}{summary.change24h.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">Number of Artists</div>
              <div className="text-4xl font-black text-cyan-300">
                {summary.artistCount}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Left: Positions Table */}
          <div className="lg:col-span-2">
            <div className="group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <div className="relative">
                <h2 className="text-2xl font-bold mb-6 text-white">Your Positions</h2>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-cyan-500/20">
                        <th className="text-left py-4 px-3 font-semibold">Artist</th>
                        <th className="text-right py-4 px-3 font-semibold">Tokens</th>
                        <th className="text-right py-4 px-3 font-semibold">Price</th>
                        <th className="text-right py-4 px-3 font-semibold">Value</th>
                        <th className="text-right py-4 px-3 font-semibold">24h</th>
                        <th className="text-right py-4 px-3 font-semibold">PnL</th>
                        <th className="text-center py-4 px-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position, idx) => (
                        <tr
                          key={position.artistId}
                          className="border-b border-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500/5 hover:to-purple-500/5 transition-all duration-200 group/row"
                          style={{ 
                            animation: 'fadeIn 0.5s ease-out forwards',
                            animationDelay: `${idx * 50}ms`,
                            opacity: 0
                          }}
                        >
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0 group-hover/row:border-cyan-400/50 transition-colors duration-200">
                                <Image
                                  src={position.artist.imageUrl}
                                  alt={position.artist.name}
                                  fill
                                  className="object-cover group-hover/row:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-white">{position.artist.name}</div>
                                <div className="text-xs text-gray-400">@{position.artist.handle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-right text-sm font-mono text-gray-300">
                            {position.tokensHeld.toFixed(2)}
                          </td>
                          <td className="py-4 px-3 text-right text-sm text-cyan-300 font-semibold">
                            Ξ {position.artist.currentPrice.toFixed(4)}
                          </td>
                          <td className="py-4 px-3 text-right text-sm font-bold text-white">
                            Ξ {position.currentValue.toFixed(2)}
                          </td>
                          <td className={`py-4 px-3 text-right text-sm font-bold ${
                            position.artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {position.artist.change24h >= 0 ? '+' : ''}{position.artist.change24h.toFixed(2)}%
                          </td>
                          <td className={`py-4 px-3 text-right text-sm font-bold ${
                            position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {position.pnl >= 0 ? '+' : ''}Ξ {position.pnl.toFixed(2)}
                            <div className="text-xs opacity-75 mt-0.5">
                              ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <Link
                              href={`/artists/${position.artistId}`}
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-all duration-200 hover:gap-2"
                            >
                              View
                              <span>→</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Allocation Chart */}
          <div className="group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 text-white">Allocation</h2>
              <AllocationChart allocations={allocations} />
            </div>
          </div>
        </div>

        {/* Overall PnL Summary */}
        <div className={`group relative bg-gradient-to-br from-black/60 to-black/40 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${
            summary.totalPnL >= 0 ? 'bg-gradient-to-br from-green-500/5 to-transparent' : 'bg-gradient-to-br from-red-500/5 to-transparent'
          }`} />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Total Profit & Loss</div>
              <div className={`text-4xl font-black ${summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.totalPnL >= 0 ? '↗ +' : '↘ '}Ξ {summary.totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Total Return</div>
              <div className={`text-4xl font-black ${summary.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.totalPnLPercent >= 0 ? '↗ +' : '↘ '}{summary.totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

// Enhanced Allocation Chart Component
function AllocationChart({ allocations }: { allocations: Array<{ artist: UiArtist; percentage: number; value: number }> }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors = [
    { gradient: 'from-cyan-400 to-cyan-600', dot: 'bg-cyan-500' },
    { gradient: 'from-pink-500 to-pink-700', dot: 'bg-pink-500' },
    { gradient: 'from-purple-500 to-purple-700', dot: 'bg-purple-500' },
    { gradient: 'from-green-400 to-green-600', dot: 'bg-green-500' },
    { gradient: 'from-yellow-400 to-yellow-600', dot: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-5">
      {allocations.map((alloc, index) => {
        const color = colors[index % colors.length];
        const isHovered = hoveredIndex === index;
        
        return (
          <div 
            key={alloc.artist.id}
            className="group/alloc"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${color.dot} transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`} />
                <span className={`text-sm font-bold transition-colors duration-200 ${isHovered ? 'text-white' : 'text-gray-300'}`}>
                  {alloc.artist.name}
                </span>
              </div>
              <span className={`text-sm font-bold transition-all duration-200 ${isHovered ? 'text-cyan-300 scale-110' : 'text-gray-400'}`}>
                {alloc.percentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="relative w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color.gradient} rounded-full transition-all duration-500 ease-out ${isHovered ? 'shadow-lg' : ''}`}
                style={{ 
                  width: `${alloc.percentage}%`,
                  boxShadow: isHovered ? `0 0 20px ${color.dot}` : 'none'
                }}
              />
            </div>
            
            <div className={`text-xs mt-1.5 transition-colors duration-200 ${isHovered ? 'text-gray-300' : 'text-gray-500'}`}>
              Ξ {alloc.value.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

