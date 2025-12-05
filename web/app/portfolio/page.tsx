"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MOCK_PORTFOLIO, MOCK_ARTISTS, type PortfolioPosition, type UiArtist } from "@/lib/mockData";

// Extended position with artist data
type PositionWithArtist = PortfolioPosition & {
  artist: UiArtist;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
};

/**
 * DEMO-ONLY: Hardcoded helper to check if user qualifies for Promethean Backer badge.
 * In production, this would check onchain data or API.
 * 
 * Qualification: User owns any amount of The Weeknd's token (artistId: 2)
 * For demo purposes, we can also short-circuit to always return true.
 */
function doesUserQualifyForPrometheanBacker(holdings: PortfolioPosition[]): boolean {
  // DEMO SHORTCUT: For hackathon demo, always return true so badge always shows
  // Remove this line and uncomment the logic below to check actual holdings
  return true;
  
  // PRODUCTION LOGIC (commented for demo):
  // Check if user owns The Weeknd token (artistId: 2)
  // const hasWeekndToken = holdings.some(position => position.artistId === 2 && position.tokensHeld > 0);
  // return hasWeekndToken;
}

export default function PortfolioPage() {
  const router = useRouter();
  
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

  // DEMO: Check if user qualifies for Promethean Backer badge
  const hasPrometheanBacker = useMemo(() => {
    return doesUserQualifyForPrometheanBacker(MOCK_PORTFOLIO);
  }, []);

  // DEMO: Show toast notification when badge is unlocked (one-time)
  const [showBadgeToast, setShowBadgeToast] = useState(false);
  useEffect(() => {
    if (hasPrometheanBacker) {
      // Show toast after a brief delay for better UX
      const timer = setTimeout(() => {
        setShowBadgeToast(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShowBadgeToast(false), 5000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasPrometheanBacker]);

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
          <Link href="/artists" className="flex items-center">
            <Image
              src="/clio-logo.png"
              alt="Clio"
              width={100}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
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
        {/* DEMO: Badge Unlock Toast Notification */}
        {showBadgeToast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300">
            <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-md border-2 border-yellow-400 rounded-xl p-4 shadow-2xl max-w-md">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <div className="flex-1">
                  <div className="font-bold text-white mb-1">New Badge Unlocked: Promethean Backer</div>
                  <div className="text-sm text-yellow-100">
                    You've unlocked early access to The Weeknd's weekend podcast.
                  </div>
                </div>
                <button
                  onClick={() => setShowBadgeToast(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEMO: Promethean Backer Badge & Perk */}
        {hasPrometheanBacker && (
          <div className="mb-6">
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                      BADGE UNLOCKED
                    </span>
                    <span className="text-xs text-gray-400">Promethean Backer</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">Early Access Podcast</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Unlocked exclusive access to The Weeknd's weekend podcast episode.
                  </p>
                  <button
                    onClick={() => router.push('/demo/weeknd-podcast')}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Listen Now →
                  </button>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-sm">{position.artist.name}</div>
                                {/* DEMO: Show badge chip for The Weeknd if user has Promethean Backer */}
                                {hasPrometheanBacker && position.artistId === 2 && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                                    <span className="text-[10px]">👑</span>
                                    <span className="text-[10px] font-bold text-yellow-400">Promethean Backer</span>
                                  </div>
                                )}
                              </div>
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
        <div className="bg-black/40 border border-cyan-500/20 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 text-cyan-300">Badge Achievements</h2>
          <BadgeTypesShowcase />
        </div>
      </div>
    </div>
  );
}

// Custom Badge Icon Components
const BadgeIcon = ({ type, color, isActive }: { type: string; color: string; isActive: boolean }) => {
  const commonProps = {
    className: `transition-all duration-300`,
    style: { filter: isActive ? `drop-shadow(0 0 4px ${color})` : 'none' }
  };

  switch (type) {
      case 'PROMETHEAN_BACKER':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...commonProps}>
          <path d="M5 18 L7 11 L9 13 L12 6 L15 13 L17 11 L19 18 Z" fill={color} opacity="0.9" stroke={color} strokeWidth="1"/>
          <circle cx="7" cy="11" r="1.5" fill={color} />
          <circle cx="12" cy="6" r="1.5" fill={color} />
          <circle cx="17" cy="11" r="1.5" fill={color} />
        </svg>
      );

    case 'ORACLE_OF_RISES':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...commonProps}>
          <circle cx="12" cy="11" r="6" fill={color} opacity="0.6"/>
          <circle cx="12" cy="11" r="4" fill="none" stroke={color} strokeWidth="1" opacity="0.8"/>
          <path d="M9 11 Q12 7 15 11" stroke={color} strokeWidth="1.5" fill="none"/>
        </svg>
      );

    case 'NEREID_NAVIGATOR':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...commonProps}>
          <path d="M3 12 Q6 6 9 12 T15 12 T21 12" stroke={color} strokeWidth="2" fill="none"/>
          <path d="M3 15 Q6 11 9 15 T15 15 T21 15" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"/>
        </svg>
      );

    case 'MUSE_WANDERER':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...commonProps}>
          <circle cx="9" cy="15" r="2" fill={color} opacity="0.8"/>
          <rect x="10" y="7" width="1.5" height="8" fill={color}/>
          <path d="M11.5 7 Q15 6 15 10" stroke={color} strokeWidth="1.5" fill="none"/>
          <circle cx="15" cy="13" r="1.5" fill={color} opacity="0.8"/>
        </svg>
      );

    case 'TITAN_OF_SUPPORT':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...commonProps}>
          <path d="M7 19 L12 4 L17 19 Z" fill={color} opacity="0.7"/>
          <path d="M9 19 L12 9 L15 19 Z" fill={color} opacity="0.5"/>
          <rect x="11" y="13" width="2" height="6" fill={color} opacity="0.8"/>
        </svg>
      );

    default:
      return null;
  }
};

// Badge Types Showcase Component - Compact Grid
function BadgeTypesShowcase() {
  const badgeTypes = [
    {
      id: 'PROMETHEAN_BACKER',
      name: 'Promethean Backer',
      shortDesc: 'First 5 holders',
      rarity: 'Legendary',
      color: '#fbbf24',
    },
    {
      id: 'ORACLE_OF_RISES',
      name: 'Oracle of Rises',
      shortDesc: 'Early to 200+',
      rarity: 'Epic',
      color: '#a855f7',
    },
    {
      id: 'NEREID_NAVIGATOR',
      name: 'Nereid Navigator',
      shortDesc: 'Buy the dip',
      rarity: 'Rare',
      color: '#06b6d4',
    },
    {
      id: 'MUSE_WANDERER',
      name: 'Muse Wanderer',
      shortDesc: '8+ genres',
      rarity: 'Epic',
      color: '#ec4899',
    },
    {
      id: 'TITAN_OF_SUPPORT',
      name: 'Titan of Support',
      shortDesc: '1%+ supply',
      rarity: 'Rare',
      color: '#10b981',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {badgeTypes.map((badge) => (
        <div
          key={badge.id}
          className="bg-black/30 border border-cyan-500/20 rounded-lg p-3 hover:border-cyan-500/40 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
              style={{
                background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`,
                border: `1px solid ${badge.color}40`,
              }}
            >
              <BadgeIcon type={badge.id} color={badge.color} isActive={false} />
            </div>
            <div className="text-xs font-semibold text-white mb-1">{badge.name}</div>
            <div 
              className="text-[10px] px-1.5 py-0.5 rounded mb-1"
              style={{
                backgroundColor: `${badge.color}20`,
                color: badge.color,
              }}
            >
              {badge.rarity}
            </div>
            <div className="text-[10px] text-gray-400">{badge.shortDesc}</div>
          </div>
        </div>
      ))}
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

