'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_ARTISTS, type UiArtist } from '@/lib/mockData';

// ============================================================================
// COMPONENTS
// ============================================================================

// Enhanced flashy news ticker component
function NewsTicker() {
  const [isPaused, setIsPaused] = useState(false);
  
  const hotArtists = useMemo(() => {
    return [...MOCK_ARTISTS]
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 10);
  }, []);

  // Duplicate the array multiple times for seamless infinite loop
  const tickerItems = [...hotArtists, ...hotArtists, ...hotArtists, ...hotArtists];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] overflow-hidden">
      {/* Main ticker container with animated gradient background */}
      <div className="relative bg-gradient-to-r from-red-600 via-orange-500 via-pink-600 to-purple-600 animate-gradient-flow">
        {/* Top shine effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        
        {/* Bottom border with glow */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 shadow-lg shadow-orange-500/50" />
        
        <div 
          className="relative flex items-center h-12 cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* "LIVE" or "HOT" label with enhanced design */}
          <div className="absolute left-0 z-10 h-full flex items-center bg-gradient-to-r from-black via-black to-transparent pr-12">
            <div className="px-4 sm:px-6 flex items-center gap-3 border-r-2 border-white/20">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute" />
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
              </div>
              <span className="text-white font-black text-xs sm:text-sm tracking-[0.3em] uppercase flex items-center gap-2">
                <span className="hidden sm:inline">🔥</span>
                Live
                <span className="hidden sm:inline text-[10px] font-normal tracking-normal text-white/70">Market Movers</span>
              </span>
            </div>
          </div>

          {/* Scrolling content with enhanced styling */}
          <div 
            className={`flex ${isPaused ? 'animate-ticker-scroll-paused' : 'animate-ticker-scroll-smooth'} pl-32 sm:pl-48`}
          >
            {tickerItems.map((artist, idx) => (
              <div
                key={`${artist.id}-${idx}`}
                className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 whitespace-nowrap group/ticker-item"
              >
                {/* Artist name with hover effect */}
                <span className="text-white font-black text-xs sm:text-sm group-hover/ticker-item:text-yellow-200 transition-colors duration-200">
                  {artist.name}
                </span>
                
                {/* Price change badge */}
                <span className={`font-black text-xs sm:text-sm px-2 py-0.5 rounded-full border-2 transition-all duration-200 ${
                  artist.change24h >= 0 
                    ? 'text-green-300 border-green-400/50 bg-green-500/20 group-hover/ticker-item:bg-green-500/30 group-hover/ticker-item:scale-110' 
                    : 'text-red-300 border-red-400/50 bg-red-500/20 group-hover/ticker-item:bg-red-500/30 group-hover/ticker-item:scale-110'
                }`}>
                  {artist.change24h >= 0 ? '↗' : '↘'} {artist.change24h >= 0 ? '+' : ''}{artist.change24h.toFixed(1)}%
                </span>
                
                {/* Current price */}
                <span className="text-yellow-200 font-bold text-xs sm:text-sm bg-black/20 px-2 py-0.5 rounded border border-yellow-400/30 group-hover/ticker-item:bg-black/40 group-hover/ticker-item:scale-105 transition-all duration-200">
                  Ξ {artist.currentPrice.toFixed(4)}
                </span>
                
                {/* Volume indicator */}
                <span className="hidden md:inline text-white/60 text-xs font-semibold">
                  Vol: {artist.volume24h.toFixed(1)}Ξ
                </span>
                
                {/* Separator */}
                <span className="text-white/30 mx-1 sm:mx-3 text-lg">•</span>
              </div>
            ))}
          </div>

          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-600 via-purple-600/50 to-transparent pointer-events-none" />
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 text-[10px] font-bold bg-black/40 px-2 py-1 rounded border border-white/20 backdrop-blur-sm">
            PAUSED
          </div>
        )}
      </div>
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-12 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-black/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10' 
        : 'bg-gradient-to-b from-black via-black/80 to-transparent backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Clio
          </div>
          <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium animate-pulse-glow">
            on Base Sepolia
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-8">
          <Link href="/" className="group text-sm text-gray-400 hover:text-white transition-all duration-200 font-medium relative">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-pink-500 group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/artists" className="group text-sm text-white font-bold relative">
            Artists
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-pink-500" />
          </Link>
          <Link href="/portfolio" className="group text-sm text-gray-400 hover:text-white transition-all duration-200 font-medium relative">
            Portfolio
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-pink-500 group-hover:w-full transition-all duration-300" />
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
        <div className="relative overflow-hidden rounded-3xl h-96 sm:h-[500px] group/hero cursor-pointer shadow-2xl border border-cyan-500/20">
          {/* Background image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover transition-transform duration-700 group-hover/hero:scale-110"
              priority
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          {/* Multiple animated glow backgrounds */}
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-bl from-pink-500/30 to-transparent rounded-full blur-3xl opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700 animate-pulse-glow" />
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-tr from-cyan-500/30 to-transparent rounded-full blur-3xl opacity-0 group-hover/hero:opacity-100 transition-opacity duration-700 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <div className="space-y-6 z-10 transform transition-transform duration-500 group-hover/hero:translate-y-[-10px]">
              <div>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-3 drop-shadow-2xl bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent animate-gradient leading-tight">
                  {artist.name}
                </h1>
                <p className="text-xl sm:text-2xl text-cyan-300 font-bold drop-shadow-lg flex items-center gap-2">
                  <span className="text-cyan-500/50">@</span>
                  {artist.handle}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                <div className="group/stat bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20">
                  <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Price</span>
                  <p className="text-white font-black text-lg">Ξ {artist.currentPrice.toFixed(3)}</p>
                </div>
                <div className="group/stat bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20">
                  <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">24h</span>
                  <p className={`font-black text-lg ${artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {artist.change24h >= 0 ? '↗ +' : '↘ '}{artist.change24h.toFixed(1)}%
                  </p>
                </div>
                <div className="group/stat bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/20">
                  <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Volume</span>
                  <p className="text-white font-black text-lg">Ξ {artist.volume24h.toFixed(1)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  className="group/btn relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-white via-cyan-100 to-white text-black font-black rounded-xl hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105 overflow-hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/artists/${artist.id}`;
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    <span className="text-2xl group-hover/btn:animate-pulse"></span>
                    View Market
                  </span>
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
      <div className="group/card relative overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transform transition-all duration-500 hover:scale-105">
        {/* Animated border glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 rounded-xl opacity-0 group-hover/card:opacity-70 blur-lg transition-all duration-500" />
        
        <div className="relative bg-black/40 rounded-xl border border-cyan-500/20 group-hover/card:border-cyan-400/50 transition-all duration-500 overflow-hidden">
          {/* Image */}
          <div className="relative w-full h-40 sm:h-52 rounded-t-xl overflow-hidden">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              className="object-cover transition-transform duration-700 group-hover/card:scale-110 group-hover/card:rotate-1"
            />
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-500" />
          </div>

          {/* Content below image */}
          <div className="p-4 space-y-2 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-sm">
            <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 group-hover/card:text-cyan-300 transition-colors duration-300">
              {artist.name}
            </h3>
            <p className="text-xs text-cyan-400 font-bold flex items-center gap-1">
              <span className="text-cyan-500/50">@</span>
              {artist.handle}
            </p>
            
            {/* Metrics row */}
            <div className="flex items-center gap-3 text-xs pt-2 border-t border-white/10">
              <span className="text-white font-bold bg-cyan-500/10 px-2 py-1 rounded">
                Ξ {artist.currentPrice.toFixed(3)}
              </span>
              <span className={`font-black px-2 py-1 rounded ${
                artist.change24h >= 0 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {artist.change24h >= 0 ? '↗ +' : '↘ '}{artist.change24h.toFixed(1)}%
              </span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              Vol: {artist.volume24h.toFixed(1)} Ξ
            </div>
          </div>
        </div>
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
    <div className="space-y-6 group/section">
      <div className="px-4 sm:px-0">
        <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent mb-2 animate-gradient">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            {subtitle}
          </p>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div className="relative group/row">
        <div className="overflow-x-auto scrollbar-hide scroll-smooth">
          <div className="flex gap-4 sm:gap-6 pb-6 px-4 sm:px-0">
            {artists.map((artist, idx) => (
              <div 
                key={artist.id} 
                className="flex-shrink-0 w-40 sm:w-48 md:w-52 animate-fade-in-up"
                style={{ 
                  animationDelay: `${idx * 100}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced gradient fades */}
        <div className="absolute top-0 left-0 bottom-6 w-24 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 bottom-6 w-24 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
        
        {/* Scroll hint on edges */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 pointer-events-none">
          <span className="text-cyan-400 text-sm">←</span>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-500 pointer-events-none">
          <span className="text-cyan-400 text-sm">→</span>
        </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className="group/stat relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,15,30,0.4)] hover:border-cyan-400/40 transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(6,182,212,0.3)] cursor-pointer overflow-hidden animate-fade-in-up"
          style={{ 
            animationDelay: `${idx * 100}ms`,
            animationFillMode: 'backwards'
          }}
        >
          {/* Animated gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-pink-500/5 to-purple-500/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />
          
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover/stat:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
          
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-3 font-bold flex items-center gap-2 group-hover/stat:text-cyan-400 transition-colors duration-300">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full opacity-50 group-hover/stat:opacity-100 group-hover/stat:animate-pulse" />
              {stat.label}
            </p>
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-white via-cyan-100 to-white bg-clip-text text-transparent mb-2 group-hover/stat:scale-110 transition-transform duration-300">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 group-hover/stat:text-gray-400 transition-colors duration-300">{stat.hint}</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-[#050509] via-black to-black overflow-x-hidden">
      {/* News Ticker */}
      <NewsTicker />
      
      {/* Header */}
      <Header />

      {/* Enhanced animated background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-green-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

        {/* Main content */}
        <main className="relative z-10 max-w-7xl mx-auto pt-32 pb-16">

          {/* Hero section */}
          <section className="px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20 animate-fade-in-up">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                Featured
              </p>
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-gradient">
                Top Artist
              </h2>
            </div>
            <ArtistCard artist={heroArtist} isHero />
          </section>

          {/* Search and summary */}
          <section className="px-4 sm:px-6 lg:px-8 mb-16 space-y-8">
            <div className="group relative bg-gradient-to-br from-black/60 via-black/40 to-black/60 border border-cyan-500/20 rounded-3xl p-6 sm:p-10 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-500 shadow-2xl overflow-hidden">
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                      Discovery
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent mb-3 animate-gradient leading-tight">
                      Browse live bonding-curve markets
                    </h1>
                    <p className="text-sm sm:text-base text-gray-400 max-w-2xl">
                      Filter by genre, sort by momentum, and jump into the markets that fit your thesis.
                    </p>
                  </div>
                  <div className="w-full lg:w-auto">
                    <div className="relative group/search">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl opacity-0 group-hover/search:opacity-30 blur transition-opacity duration-500" />
                      <input
                        type="text"
                        placeholder="🔍 Search artists or handles…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="relative w-full lg:w-96 px-5 py-4 bg-black/70 border border-cyan-500/30 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/60 transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-3">
                    {genreFilters.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setGenreFilter(genre)}
                        className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide border transition-all duration-300 transform hover:scale-105 ${
                          genreFilter === genre
                            ? 'border-cyan-400/80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20'
                            : 'border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/40 hover:bg-white/5'
                        }`}
                      >
                        {genre === 'all' ? '🎵 All Genres' : genre.replace(/\b\w/g, (c) => c.toUpperCase())}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(SORT_OPTIONS) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortOption(option)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 border transform hover:scale-105 ${
                          sortOption === option
                            ? 'bg-gradient-to-r from-white via-cyan-100 to-white text-black border-transparent shadow-xl shadow-white/20'
                            : 'border-white/10 text-gray-300 hover:border-cyan-400/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {SORT_OPTIONS[option].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <StatHighlights stats={summaryStats} />
              </div>
            </div>
          </section>

        {/* Artist rows */}
        <section className="space-y-20 sm:space-y-28">
          {trendingArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <ArtistRow
                title="🔥 Trending Artists"
                artists={trendingArtists}
                subtitle="Rising stars on Base Sepolia"
              />
            </div>
          )}

          {newArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <ArtistRow
                title="✨ New on Clio"
                artists={newArtists}
                subtitle="Freshly launched tokens"
              />
            </div>
          )}

          {risingArtists.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <ArtistRow
                title="🚀 Rising Stars"
                artists={risingArtists}
                subtitle="Top gainers in the last 24h"
              />
            </div>
          )}

          {filteredAndSorted.length === 0 && (
            <div className="px-4 sm:px-6 lg:px-8 text-center py-20 animate-fade-in-up">
              <div className="max-w-md mx-auto bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-12 backdrop-blur-xl">
                <div className="text-6xl mb-6 opacity-50">🔍</div>
                <p className="text-gray-400 text-xl font-semibold mb-2">No artists found</p>
                <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </section>

        {/* Footer spacing */}
        <div className="h-16" />
      </main>

      {/* Custom styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        @keyframes gradient-flow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 5s ease infinite;
        }

        .animate-ticker-scroll-smooth {
          animation: ticker-scroll 45s linear infinite;
        }

        .animate-ticker-scroll-paused {
          animation: ticker-scroll 45s linear infinite;
          animation-play-state: paused;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
