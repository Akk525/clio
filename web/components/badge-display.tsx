"use client";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  awardedAt: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      case 'uncommon': return 'from-green-400 to-emerald-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <div 
          key={badge.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-900 hover:border-gray-600 transition-all"
        >
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-3xl mb-3`}>
            {badge.icon}
          </div>
          <h4 className="text-white font-bold mb-1">{badge.name}</h4>
          <p className="text-gray-400 text-sm mb-2">{badge.description}</p>
          <div className="flex justify-between items-center">
            <span className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white font-medium`}>
              {badge.rarity}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(badge.awardedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
