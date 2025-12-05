"use client";

import { useState, useEffect } from "react";

interface ArtistCardProps {
  artistId: string;
  name: string;
  symbol: string;
  currentPrice: string;
  supply: string;
  holders: number;
}

export function ArtistCard({ artistId, name, symbol, currentPrice, supply, holders }: ArtistCardProps) {
  const [supporters, setSupporters] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/artists/${artistId}/supporters`)
      .then(res => res.json())
      .then(data => setSupporters(data.supporters || []))
      .catch(err => console.error('Error fetching supporters:', err));
  }, [artistId]);

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-gray-900 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-gray-400 text-sm">${symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-400">${currentPrice}</p>
          <p className="text-gray-500 text-xs">Current Price</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs">Supply</p>
          <p className="text-white font-semibold">{supply}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Holders</p>
          <p className="text-white font-semibold">{holders}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Supporters</p>
          <p className="text-white font-semibold">{supporters.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors font-medium">
          Buy
        </button>
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors font-medium">
          View
        </button>
      </div>
    </div>
  );
}
