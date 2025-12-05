"use client";

import { useMemo, useState } from "react";
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
        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm mb-8">
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

        {/* Badge Types Showcase */}
        <div className="bg-black/40 border border-yellow-500/20 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            Badge Achievements
          </h2>
          <p className="text-gray-400 mb-8 text-sm">Earn exclusive badges through your trading activity and show off your achievements</p>
          <BadgeTypesShowcase />
        </div>
      </div>
    </div>
  );
}

// Custom Badge Icon Components
const BadgeIcon = ({ type, color, isActive }: { type: string; color: string; isActive: boolean }) => {
  const commonProps = {
    className: `transition-all duration-500 ${isActive ? 'animate-pulse' : ''}`,
    style: { filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none' }
  };

  switch (type) {
    case 'PROMETHEAN_BACKER':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...commonProps}>
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path d="M8 30 L12 18 L15 22 L20 12 L25 22 L28 18 L32 30 Z" fill="url(#crownGrad)" stroke={color} strokeWidth="1.5"/>
          <circle cx="12" cy="18" r="2" fill={color} />
          <circle cx="20" cy="12" r="2.5" fill={color} />
          <circle cx="28" cy="18" r="2" fill={color} />
          <path d="M18 8 Q20 4 22 8 L20 12 Z" fill="#fbbf24" opacity="0.8"/>
        </svg>
      );

    case 'ORACLE_OF_RISES':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...commonProps}>
          <defs>
            <radialGradient id="orbGrad">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="18" r="10" fill="url(#orbGrad)" opacity="0.8"/>
          <circle cx="20" cy="18" r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.5"/>
          <path d="M15 18 Q20 12 25 18" stroke="#e879f9" strokeWidth="1.5" fill="none"/>
          <path d="M14 30 L26 30 Q28 28 26 26 L14 26 Q12 28 14 30 Z" fill={color} opacity="0.6"/>
        </svg>
      );

    case 'NEREID_NAVIGATOR':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...commonProps}>
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path d="M5 20 Q10 10 15 20 T25 20 T35 20" stroke="url(#waveGrad)" strokeWidth="2" fill="none"/>
          <path d="M5 25 Q10 18 15 25 T25 25 T35 25" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
          <path d="M5 30 Q10 24 15 30 T25 30 T35 30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5"/>
          <circle cx="15" cy="15" r="1.5" fill="#22d3ee"/>
          <circle cx="25" cy="15" r="2" fill="#22d3ee"/>
        </svg>
      );

    case 'MUSE_WANDERER':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...commonProps}>
          <defs>
            <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="15" cy="25" r="3" fill="url(#noteGrad)"/>
          <rect x="17" y="12" width="2" height="13" fill={color}/>
          <path d="M19 12 Q25 10 25 16" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="25" cy="22" r="2.5" fill="url(#noteGrad)"/>
          <rect x="27" y="14" width="2" height="8" fill={color}/>
          <circle cx="10" cy="15" r="1" fill="#ec4899"/>
          <circle cx="30" cy="18" r="1" fill="#ec4899"/>
          <line x1="15" y1="25" x2="25" y2="22" stroke={color} strokeWidth="0.5" opacity="0.3"/>
        </svg>
      );

    case 'TITAN_OF_SUPPORT':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" {...commonProps}>
          <defs>
            <linearGradient id="titanGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path d="M12 32 L20 8 L28 32 Z" fill="url(#titanGrad)" opacity="0.8"/>
          <path d="M15 32 L20 15 L25 32 Z" fill={color} opacity="0.6"/>
          <rect x="18" y="22" width="4" height="10" fill={color} opacity="0.9"/>
          <polygon points="20,8 22,12 18,12" fill="#10b981"/>
          <circle cx="20" cy="8" r="2" fill="#34d399" opacity="0.8"/>
        </svg>
      );

    default:
      return null;
  }
};

// Badge Types Showcase Component - Exciting Achievement Gallery
function BadgeTypesShowcase() {
  const [selectedBadge, setSelectedBadge] = useState<number>(0);

  const badgeTypes = [
    {
      id: 'PROMETHEAN_BACKER',
      name: 'Promethean Backer',
      shortDesc: 'First 5 holders',
      description: 'Be among the first 5 believers in an artist. The earliest supporters who saw the potential before anyone else.',
      rarity: 'Legendary',
      rarityScore: 99,
      color: '#fbbf24',
      holders: '< 50',
      difficulty: 'Extreme',
      tip: 'Watch for new artist launches and be quick!',
    },
    {
      id: 'ORACLE_OF_RISES',
      name: 'Oracle of Rises',
      shortDesc: 'Early to 200+',
      description: 'Backed an artist early (top 50 holders) who later reached 200+ total holders. You predicted greatness.',
      rarity: 'Epic',
      rarityScore: 85,
      color: '#a855f7',
      holders: '~200',
      difficulty: 'Hard',
      tip: 'Find artists with momentum in their first 50 holders',
    },
    {
      id: 'NEREID_NAVIGATOR',
      name: 'Nereid Navigator',
      shortDesc: 'Buy the dip',
      description: 'Bought during a 15%+ price dip. Master of market timing and conviction in downturns.',
      rarity: 'Rare',
      rarityScore: 70,
      color: '#06b6d4',
      holders: '~500',
      difficulty: 'Medium',
      tip: 'Watch the charts and buy when others panic',
    },
    {
      id: 'MUSE_WANDERER',
      name: 'Muse Wanderer',
      shortDesc: '8+ genres',
      description: 'Support artists across 8+ different genres. True music connoisseur with diverse taste.',
      rarity: 'Epic',
      rarityScore: 82,
      color: '#ec4899',
      holders: '~300',
      difficulty: 'Hard',
      tip: 'Explore all genres - diversity is key',
    },
    {
      id: 'TITAN_OF_SUPPORT',
      name: 'Titan of Support',
      shortDesc: '1%+ supply',
      description: 'Acquired 1%+ of an artist\'s total supply in a single buy. Whale status achieved.',
      rarity: 'Rare',
      rarityScore: 75,
      color: '#10b981',
      holders: '~400',
      difficulty: 'Medium',
      tip: 'Go big on your favorite artists',
    },
  ];

  const currentBadge = badgeTypes[selectedBadge];

  return (
    <div>
      {/* Main Spotlight */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Featured Badge */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="relative bg-gradient-to-br from-black/80 to-black/40 rounded-3xl p-8 border-2 overflow-hidden"
              style={{ borderColor: currentBadge.color }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${currentBadge.color}40, transparent 70%)`,
                  animation: 'pulseGlow 3s ease-in-out infinite'
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Badge Icon - Large */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-3xl animate-pulse"
                      style={{ backgroundColor: currentBadge.color, opacity: 0.6 }}
                    />
                    <div 
                      className="relative w-32 h-32 rounded-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle, ${currentBadge.color}40, ${currentBadge.color}10)`,
                        border: `3px solid ${currentBadge.color}`,
                        boxShadow: `0 0 40px ${currentBadge.color}80`,
                      }}
                    >
                      <BadgeIcon type={currentBadge.id} color={currentBadge.color} isActive={true} />
                    </div>
                  </div>
                </div>

                {/* Badge Name & Rarity */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div 
                      className="px-4 py-1.5 rounded-full text-xs font-black border-2"
                      style={{
                        backgroundColor: currentBadge.color,
                        color: '#000',
                        borderColor: currentBadge.color,
                      }}
                    >
                      {currentBadge.rarity.toUpperCase()}
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                      {currentBadge.holders} holders
                    </div>
                  </div>
                  <h3 className="text-3xl font-black mb-2" style={{ color: currentBadge.color }}>
                    {currentBadge.name}
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">{currentBadge.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Rarity Score</div>
                    <div className="text-2xl font-black" style={{ color: currentBadge.color }}>
                      {currentBadge.rarityScore}
                      <span className="text-sm text-gray-400">/100</span>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Difficulty</div>
                    <div className="text-2xl font-black" style={{ color: currentBadge.color }}>
                      {currentBadge.difficulty}
                    </div>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <div className="text-xs font-bold text-cyan-300 mb-1">PRO TIP</div>
                      <p className="text-sm text-gray-300">{currentBadge.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Badge Selector Grid */}
        <div>
          <div className="space-y-4">
            {badgeTypes.map((badge, idx) => {
              const isSelected = selectedBadge === idx;
              
              return (
                <div
                  key={badge.id}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedBadge(idx)}
                  style={{
                    animation: 'slideInRight 0.6s ease-out forwards',
                    animationDelay: `${idx * 100}ms`,
                    opacity: 0,
                  }}
                >
                  {/* Glow on selected */}
                  <div 
                    className="absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500"
                    style={{
                      backgroundColor: badge.color,
                      opacity: isSelected ? 0.5 : 0,
                    }}
                  />

                  <div 
                    className={`relative bg-gradient-to-br from-black/60 to-black/40 rounded-2xl p-5 border-2 transition-all duration-300 ${
                      isSelected ? 'border-opacity-100' : 'border-opacity-20 hover:border-opacity-40'
                    }`}
                    style={{ borderColor: badge.color }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                        style={{
                          background: `radial-gradient(circle, ${badge.color}30, ${badge.color}10)`,
                          border: `2px solid ${badge.color}`,
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        }}
                      >
                        <BadgeIcon type={badge.id} color={badge.color} isActive={isSelected} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-black text-white truncate">{badge.name}</h4>
                          <div 
                            className="px-2 py-0.5 rounded text-[10px] font-black"
                            style={{
                              backgroundColor: `${badge.color}30`,
                              color: badge.color,
                            }}
                          >
                            {badge.rarity}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{badge.shortDesc}</p>
                        
                        {/* Progress bar */}
                        <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${badge.rarityScore}%`,
                              backgroundColor: badge.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        <div className="text-2xl" style={{ color: badge.color }}>→</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
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

