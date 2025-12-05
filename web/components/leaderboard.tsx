"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  address: string;
  badgeCount: number;
  totalValue: number;
  artistsSupported: number;
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaders(data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400">Loading leaderboard...</div>;
  }

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <h3 className="text-xl font-bold text-white">🏆 Top Collectors</h3>
      </div>
      <div className="divide-y divide-gray-700">
        {leaders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No collectors yet. Be the first!
          </div>
        ) : (
          leaders.map((entry, index) => (
            <div key={entry.address} className="p-4 hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500 text-gray-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-mono text-sm">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {entry.artistsSupported} artists • ${entry.totalValue.toLocaleString()} total value
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">{entry.badgeCount}</p>
                  <p className="text-gray-500 text-xs">badges</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
