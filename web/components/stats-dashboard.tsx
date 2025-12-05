"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalArtists: number;
  totalTransactions: number;
  totalVolume: number;
  totalBadgesAwarded: number;
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArtists: 0,
    totalTransactions: 0,
    totalVolume: 0,
    totalBadgesAwarded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  const statCards = [
    { label: 'Total Artists', value: stats.totalArtists, icon: '🎨', color: 'purple' },
    { label: 'Total Transactions', value: stats.totalTransactions, icon: '💰', color: 'blue' },
    { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString()}`, icon: '📈', color: 'green' },
    { label: 'Badges Awarded', value: stats.totalBadgesAwarded, icon: '🏆', color: 'yellow' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div 
          key={stat.label}
          className="border border-gray-700 rounded-lg p-6 bg-gray-900 hover:border-gray-600 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{stat.icon}</span>
            {loading && (
              <div className="animate-pulse bg-gray-700 h-8 w-16 rounded"></div>
            )}
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {loading ? '...' : stat.value}
          </p>
          <p className="text-gray-400 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
