"use client";

import { useState } from "react";

export interface UserBadge {
  badgeId: string;
  displayName: string;
  description: string;
  artistId: number | null;
  artistName: string | null;
  artistHandle: string | null;
  awardedAt: string;
  meta: any;
}

interface BadgeDisplayProps {
  badges: UserBadge[];
  isLoading?: boolean;
}

// Custom Badge Icon Component (same as in portfolio)
const BadgeIcon = ({ type, color, size = 48 }: { type: string; color: string; size?: number }) => {
  const scale = size / 40;
  
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    style: { filter: `drop-shadow(0 0 6px ${color}60)` }
  };

  switch (type) {
    case 'PROMETHEAN_BACKER':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id={`crownGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path d="M8 30 L12 18 L15 22 L20 12 L25 22 L28 18 L32 30 Z" fill={`url(#crownGrad-${type})`} stroke={color} strokeWidth="1.5"/>
          <circle cx="12" cy="18" r="2" fill={color} />
          <circle cx="20" cy="12" r="2.5" fill={color} />
          <circle cx="28" cy="18" r="2" fill={color} />
          <path d="M18 8 Q20 4 22 8 L20 12 Z" fill="#fbbf24" opacity="0.8"/>
        </svg>
      );

    case 'ORACLE_OF_RISES':
      return (
        <svg {...commonProps}>
          <defs>
            <radialGradient id={`orbGrad-${type}`}>
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="18" r="10" fill={`url(#orbGrad-${type})`} opacity="0.8"/>
          <circle cx="20" cy="18" r="8" fill="none" stroke={color} strokeWidth="1" opacity="0.5"/>
          <path d="M15 18 Q20 12 25 18" stroke="#e879f9" strokeWidth="1.5" fill="none"/>
          <path d="M14 30 L26 30 Q28 28 26 26 L14 26 Q12 28 14 30 Z" fill={color} opacity="0.6"/>
        </svg>
      );

    case 'NEREID_NAVIGATOR':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id={`waveGrad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path d="M5 20 Q10 10 15 20 T25 20 T35 20" stroke={`url(#waveGrad-${type})`} strokeWidth="2" fill="none"/>
          <path d="M5 25 Q10 18 15 25 T25 25 T35 25" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
          <path d="M5 30 Q10 24 15 30 T25 30 T35 30" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5"/>
          <circle cx="15" cy="15" r="1.5" fill="#22d3ee"/>
          <circle cx="25" cy="15" r="2" fill="#22d3ee"/>
        </svg>
      );

    case 'MUSE_WANDERER':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id={`noteGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="15" cy="25" r="3" fill={`url(#noteGrad-${type})`}/>
          <rect x="17" y="12" width="2" height="13" fill={color}/>
          <path d="M19 12 Q25 10 25 16" stroke={color} strokeWidth="2" fill="none"/>
          <circle cx="25" cy="22" r="2.5" fill={`url(#noteGrad-${type})`}/>
          <rect x="27" y="14" width="2" height="8" fill={color}/>
          <circle cx="10" cy="15" r="1" fill="#ec4899"/>
          <circle cx="30" cy="18" r="1" fill="#ec4899"/>
          <line x1="15" y1="25" x2="25" y2="22" stroke={color} strokeWidth="0.5" opacity="0.3"/>
        </svg>
      );

    case 'TITAN_OF_SUPPORT':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id={`titanGrad-${type}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path d="M12 32 L20 8 L28 32 Z" fill={`url(#titanGrad-${type})`} opacity="0.8"/>
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

// Badge rarity and color mapping
const badgeRarity: Record<string, string> = {
  'PROMETHEAN_BACKER': 'Legendary',
  'ORACLE_OF_RISES': 'Epic',
  'NEREID_NAVIGATOR': 'Rare',
  'MUSE_WANDERER': 'Epic',
  'TITAN_OF_SUPPORT': 'Rare',
};

const badgeColors: Record<string, string> = {
  'PROMETHEAN_BACKER': '#fbbf24',
  'ORACLE_OF_RISES': '#a855f7',
  'NEREID_NAVIGATOR': '#06b6d4',
  'MUSE_WANDERER': '#ec4899',
  'TITAN_OF_SUPPORT': '#10b981',
};

export function BadgeDisplay({ badges, isLoading = false }: BadgeDisplayProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  const getRarityColor = (badgeId: string) => {
    const rarity = badgeRarity[badgeId] || 'Common';
    switch (rarity.toLowerCase()) {
      case 'legendary': return { gradient: 'from-yellow-400 to-orange-500', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/20' };
      case 'epic': return { gradient: 'from-purple-400 to-pink-500', border: 'border-purple-500/50', glow: 'shadow-purple-500/20' };
      case 'rare': return { gradient: 'from-blue-400 to-cyan-500', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/20' };
      case 'uncommon': return { gradient: 'from-green-400 to-emerald-500', border: 'border-green-500/50', glow: 'shadow-green-500/20' };
      default: return { gradient: 'from-gray-400 to-gray-500', border: 'border-gray-500/50', glow: 'shadow-gray-500/20' };
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-black/40 border border-cyan-500/20 rounded-xl p-5">
            <div className="w-16 h-16 bg-gray-700 rounded-full mb-4" />
            <div className="h-4 bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-3 bg-gray-700 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 opacity-50">🏆</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">No Badges Yet</h3>
        <p className="text-gray-500 text-sm">Start trading artist tokens to earn your first badges!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge, idx) => {
        const colors = getRarityColor(badge.badgeId);
        const isHovered = hoveredBadge === badge.badgeId;
        const badgeColor = badgeColors[badge.badgeId] || '#6b7280';
        const rarity = badgeRarity[badge.badgeId] || 'Common';
        
        return (
          <div 
            key={`${badge.badgeId}-${idx}`}
            className={`group relative bg-gradient-to-br from-black/60 to-black/40 border ${colors.border} rounded-xl p-5 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer ${isHovered ? `shadow-xl ${colors.glow}` : ''}`}
            onMouseEnter={() => setHoveredBadge(badge.badgeId)}
            onMouseLeave={() => setHoveredBadge(null)}
            style={{ 
              animation: 'fadeIn 0.5s ease-out forwards',
              animationDelay: `${idx * 100}ms`,
              opacity: 0
            }}
          >
            {/* Animated glow background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl`} />
            
            <div className="relative">
              {/* Badge Icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}
                style={{
                  background: `radial-gradient(circle, ${badgeColor}40, ${badgeColor}10)`,
                  border: `2px solid ${badgeColor}`,
                }}
              >
                <BadgeIcon type={badge.badgeId} color={badgeColor} size={48} />
              </div>
              
              {/* Badge Name */}
              <h4 className="text-white font-bold mb-2 text-lg">{badge.displayName}</h4>
              
              {/* Description */}
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{badge.description}</p>
              
              {/* Artist Info (if applicable) */}
              {badge.artistName && (
                <div className="mb-3 pb-3 border-b border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Earned from</p>
                  <p className="text-sm font-semibold text-cyan-400">{badge.artistName}</p>
                </div>
              )}
              
              {/* Bottom Info */}
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-black font-bold`}>
                  {rarity}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(badge.awardedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
