'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_ARTISTS, type UiArtist } from '@/lib/mockData';

// ============================================================================
// COMPONENTS
// ============================================================================

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Clio
          </div>
          <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium">
            on Base Sepolia
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium">
            Home
          </Link>
          <Link href="/artists" className="text-sm text-white font-bold">
            Artists
          </Link>
          <Link href="/portfolio" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium">
            Portfolio
          </Link>
        </nav>
      </div>
    </header>
  );
}

interface ArtistCardProps {
  artist: UiArtist;
  isHero?: boolean;
}

function ArtistCard({ artist, isHero = false }: ArtistCardProps) {
  if (isHero) {
    return (
      <Link href={`/artists/${artist.id}`}>
        <div className="relative overflow-hidden rounded-2xl h-96 sm:h-[500px] group/hero cursor-pointer">
          {/* Background image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover transition-transform duration-300 group-hover/hero:scale-105"
              priority
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* Animated glow background */}
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <div className="space-y-4 z-10">
              <div>
                <h1 className="text-5xl sm:text-6xl font-black text-white mb-2 drop-shadow-lg">
                  {artist.name}
                </h1>
                <p className="text-lg sm:text-xl text-cyan-300 font-semibold drop-shadow-md">
                  @{artist.handle}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-gray-400">Price</span>
                  <p className="text-white font-bold">Ξ {artist.currentPrice.toFixed(3)}</p>
                </div>
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-gray-400">24h</span>
                  <p className={`font-bold ${artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {artist.change24h >= 0 ? '+' : ''}{artist.change24h.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-gray-400">Volume</span>
                  <p className="text-white font-bold">Ξ {artist.volume24h.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-2xl"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/artists/${artist.id}`;
                  }}
                >
                  ▶ View Market
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/artists/${artist.id}`}>
      <div className="group/card relative overflow-hidden rounded-lg cursor-pointer flex-shrink-0">
        {/* Image */}
        <div className="relative w-full h-40 sm:h-52 rounded-lg overflow-hidden">
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            className="object-cover transition-transform duration-300 group-hover/card:scale-105"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover/card:opacity-95 transition-opacity duration-300 rounded-lg" />

        {/* Content below image */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
            {artist.name}
          </h3>
          <p className="text-xs text-cyan-300 font-semibold">
            @{artist.handle}
          </p>
          
          {/* Metrics row */}
          <div className="flex items-center gap-3 text-xs pt-1">
            <span className="text-white font-medium">
              Ξ {artist.currentPrice.toFixed(3)}
            </span>
            <span className={`font-semibold ${artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {artist.change24h >= 0 ? '+' : ''}{artist.change24h.toFixed(1)}%
            </span>
            <span className="text-gray-400">
              Vol: {artist.volume24h.toFixed(1)} Ξ
            </span>
          </div>
        </div>

        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover/card:border-cyan-400/50 transition-colors duration-300 pointer-events-none" />

        {/* Shadow lift */}
        <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-lg blur opacity-0 group-hover/card:opacity-50 -z-10 transition-opacity duration-300" />
      </div>
    </Link>
  );
}

interface ArtistRowProps {
  title: string;
  artists: UiArtist[];
  subtitle?: string;
}

function ArtistRow({ title, artists, subtitle }: ArtistRowProps) {
  if (artists.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="relative group/row">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 sm:gap-4 pb-4 px-4 sm:px-0">
            {artists.map((artist) => (
              <div key={artist.id} className="flex-shrink-0 w-32 sm:w-40 md:w-44">
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        </div>

        {/* Left fade */}
        <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-black via-black to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />

        {/* Right fade */}
        <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-black via-black to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}

type SortOption = 'trending' | 'volume' | 'gainers' | 'new';

const SORT_OPTIONS: Record<SortOption, { label: string; description: string }> = {
  trending: { label: 'Trending', description: 'Market cap momentum' },
  volume: { label: 'Top Volume', description: 'Most traded in 24h' },
  gainers: { label: 'Biggest Gainers', description: 'Largest % moves' },
  new: { label: 'New', description: 'Recently listed artists' },
};

interface StatHighlightsProps {
  stats: Array<{ label: string; value: string; hint: string }>;
}

function StatHighlights({ stats }: StatHighlightsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(15,15,30,0.4)]"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
          <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
          <p className="text-sm text-gray-500 mt-1">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('trending');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const genreFilters = useMemo(() => {
    const uniqueGenres = Array.from(new Set(MOCK_ARTISTS.map((artist) => artist.genre))).filter(Boolean);
    return ['all', ...uniqueGenres.map((genre) => genre.toLowerCase())];
  }, []);

  const summaryStats = useMemo(() => {
    const totalVolume = MOCK_ARTISTS.reduce((sum, artist) => sum + artist.volume24h, 0);
    const avgChange = MOCK_ARTISTS.reduce((sum, artist) => sum + artist.change24h, 0) / MOCK_ARTISTS.length;
    const hottest = [...MOCK_ARTISTS].sort((a, b) => b.change24h - a.change24h)[0];

    return [
      { label: 'Artists Live', value: `${MOCK_ARTISTS.length}`, hint: 'Ready to trade now' },
      { label: '24h Volume', value: `Ξ ${totalVolume.toFixed(1)}`, hint: 'Combined secondary flow' },
      { label: 'Avg. Move', value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(1)}%`, hint: 'Net change across markets' },
      { label: 'Top Mover', value: hottest ? hottest.name : '—', hint: hottest ? `${hottest.change24h.toFixed(1)}% today` : 'Waiting for listings' },
    ];
  }, []);

  // Filter and sort artists
  const filteredAndSorted = useMemo(() => {
    let filtered = MOCK_ARTISTS.filter((artist) => {
      const query = searchQuery.toLowerCase();
      return (
        artist.name.toLowerCase().includes(query) ||
        artist.handle.toLowerCase().includes(query)
      );
    });

    if (genreFilter !== 'all') {
      filtered = filtered.filter((artist) => artist.genre.toLowerCase() === genreFilter);
    }

    // Sort based on sortOption
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'trending':
          return (b.marketCap + b.volume24h) - (a.marketCap + a.volume24h);
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'gainers':
          return b.change24h - a.change24h;
        case 'new':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, sortOption, genreFilter]);

  // Get featured hero artist (top by market cap + volume)
  const heroArtist = useMemo(() => {
    const sorted = [...MOCK_ARTISTS].sort(
      (a, b) => (b.marketCap + b.volume24h) - (a.marketCap + a.volume24h)
    );
    return sorted[0];
  }, []);

  // Get row data from filtered/sorted list
  const trendingArtists = filteredAndSorted.slice(0, 6);
  const newArtists = useMemo(() => {
    return [...filteredAndSorted]
      .sort((a, b) => b.id - a.id)
      .slice(0, 6);
  }, [filteredAndSorted]);
  const risingArtists = useMemo(() => {
    return [...filteredAndSorted]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 6);
  }, [filteredAndSorted]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050509] via-black to-black overflow-hidden">
      <Header />

      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-3xl" />
      </div>

        {/* Main content */}
        <main className="relative z-10 max-w-7xl mx-auto pt-24 pb-16">

          {/* Hero section */}
          <section className="px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
            <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-semibold mb-2">Featured</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Top Artist</h2>
            </div>
            <ArtistCard artist={heroArtist} isHero />
          </section>

          {/* Search and summary */}
          <section className="px-4 sm:px-6 lg:px-8 mb-10 space-y-8">
            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Discovery</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white">Browse live bonding-curve markets</h1>
                  <p className="text-sm text-gray-400 max-w-2xl mt-2">
                    Filter by genre, sort by momentum, and jump into the markets that fit your thesis.
                  </p>
                </div>
                <div className="w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="Search artists or handles…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-80 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {genreFilters.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setGenreFilter(genre)}
                      className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-colors ${
                        genreFilter === genre
                          ? 'border-cyan-400/80 bg-cyan-400/10 text-cyan-100'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {genre === 'all' ? 'All Genres' : genre.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SORT_OPTIONS) as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortOption(option)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        sortOption === option
                          ? 'bg-white text-black border-transparent'
                          : 'border-white/10 text-gray-300 hover:border-cyan-400/40 hover:text-white'
                      }`}
                    >
                      {SORT_OPTIONS[option].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <StatHighlights stats={summaryStats} />
        </section>

        {/* Artist rows */}
        <section className="space-y-16 sm:space-y-24">
          {trendingArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8">
              <ArtistRow
                title="Trending Artists"
                artists={trendingArtists}
                subtitle="Rising stars on Base Sepolia"
              />
            </div>
          )}

          {newArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8">
              <ArtistRow
                title="New on Clio"
                artists={newArtists}
                subtitle="Freshly launched tokens"
              />
            </div>
          )}

          {risingArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8">
              <ArtistRow
                title="Rising Degens"
                artists={risingArtists}
                subtitle="Top gainers in the last 24h"
              />
            </div>
          )}

          {filteredAndSorted.length === 0 && (
            <div className="px-4 sm:px-6 lg:px-8 text-center py-16">
              <p className="text-gray-400 text-lg">No artists found matching your search.</p>
            </div>
          )}
        </section>

        {/* Footer spacing */}
        <div className="h-16" />
      </main>

      {/* Hide scrollbar globally */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
