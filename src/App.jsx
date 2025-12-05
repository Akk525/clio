import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Home, Compass, Users, Settings, Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Sidebar Component
function Sidebar() {
  return (
    <div className="w-16 bg-gradient-to-b from-amber-950/50 via-black to-black border-r border-amber-900/20 flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
        <span className="text-black font-bold text-lg">N</span>
      </div>

      {/* Yellow dot separator */}
      <div className="w-2 h-2 bg-amber-500 rounded-full" />

      {/* Nav Icons */}
      <div className="flex flex-col gap-3 mt-4">
        <button className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center hover:bg-amber-500/30 transition-all">
          <Home className="w-5 h-5 text-amber-500" />
        </button>
        
        <button className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all">
          <Compass className="w-5 h-5 text-gray-600" />
        </button>
        
        <button className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Bottom icon */}
      <div className="mt-auto">
        <button className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <div className="h-16 px-8 flex items-center justify-between bg-black/40 backdrop-blur-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-900/50 border-0 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:bg-gray-900/70 transition-all"
          />
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-4">
        <button className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Sun className="w-4 h-4 text-amber-500" />
        </button>
        <button className="w-9 h-9 bg-gray-800/50 rounded-xl flex items-center justify-center">
          <Bell className="w-4 h-4 text-gray-500" />
        </button>
        <button className="w-9 h-9 bg-gray-800/50 rounded-xl flex items-center justify-center">
          <Moon className="w-4 h-4 text-gray-500" />
        </button>
        <div className="w-9 h-9 rounded-xl overflow-hidden">
          <img src="https://i.pravatar.cc/150?img=33" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection() {
  const cast = [
    { name: 'Keanu Reeves', role: 'John Wick', img: 'https://i.pravatar.cc/120?img=13' },
    { name: 'Donnie Yen', role: 'Caine', img: 'https://i.pravatar.cc/120?img=14' },
    { name: 'Bill Skarsgård', role: 'Marquis Vinee...', img: 'https://i.pravatar.cc/120?img=15' },
    { name: 'Hiroyuki', role: 'Shimazu Koji', img: 'https://i.pravatar.cc/120?img=16' },
  ];

  return (
    <div className="relative h-[480px] bg-gradient-to-br from-orange-900 via-amber-800 to-orange-950 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* CD Artwork - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* First CD */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-80 h-80">
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 shadow-2xl">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <img src="https://picsum.photos/400/400?random=1" alt="" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-amber-950 rounded-full shadow-inner" />
              </div>
              {/* Text around CD */}
              <div className="absolute top-8 left-0 right-0 text-center">
                <span className="text-orange-900/50 text-xs">Chapter 4 John Wick</span>
              </div>
            </div>
          </div>

          {/* Second CD - Center */}
          <div className="absolute left-[30%] top-1/2 -translate-y-1/2 w-80 h-80 z-10">
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-600 shadow-2xl">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <img src="https://picsum.photos/400/400?random=2" alt="" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-amber-950 rounded-full shadow-inner" />
              </div>
            </div>
          </div>

          {/* Third CD - Right */}
          <div className="absolute left-[55%] top-1/2 -translate-y-1/2 w-80 h-80">
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-orange-700 shadow-2xl">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <img src="https://picsum.photos/400/400?random=3" alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-amber-950 rounded-full shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Left Side */}
      <div className="relative z-20 h-full flex flex-col justify-center px-16 max-w-xl">
        <h1 className="text-white mb-2">
          <span className="block text-6xl font-bold tracking-tight">Johnwick</span>
          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-light">Chapter</span>
            <span className="text-8xl font-bold">4</span>
          </div>
        </h1>

        <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
          The plot of John Wick: Chapter 4 has been kept under wraps, but it is expected to pick up where Chapter 3 left off with John Wi... <span className="text-amber-400 cursor-pointer">Read More</span>
        </p>

        {/* Cast */}
        <div className="flex items-start gap-4 mb-8">
          {cast.map((actor, i) => (
            <div key={i} className="flex flex-col items-center w-20">
              <div className="w-16 h-20 rounded-2xl overflow-hidden mb-2 ring-2 ring-white/10">
                <img src={actor.img} alt={actor.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-white text-xs font-medium text-center leading-tight">{actor.name}</p>
              <p className="text-white/50 text-xs text-center">{actor.role}</p>
            </div>
          ))}
          <button className="flex flex-col items-center justify-center w-16 h-20 mt-0 text-amber-400">
            <span className="text-xs">See</span>
            <span className="text-xs">More</span>
            <ChevronRight className="w-4 h-4 mt-1" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 rounded-full text-black font-semibold transition-all shadow-xl shadow-amber-500/30">
            <Play className="w-4 h-4" fill="black" />
            Play Now
          </button>
          <button className="px-6 py-3.5 bg-transparent border border-amber-500/40 hover:border-amber-500 rounded-full text-amber-500 font-medium transition-all">
            Watch Trailer
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <button className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-500/20 hover:bg-amber-500/30 rounded-full flex items-center justify-center transition-all">
        <ChevronLeft className="w-5 h-5 text-amber-500" />
      </button>
      <button className="absolute left-20 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">
        <ChevronRight className="w-5 h-5 text-white/50" />
      </button>
    </div>
  );
}

// Recommendations Section
function Recommendations() {
  const movies = [
    { title: 'Captain America', genre: 'Action, Adventure, 2025', duration: '1h 7m', rating: 45, img: 'https://picsum.photos/500/300?random=10' },
    { title: 'Aladdin', genre: 'Action, Adventure, 2012', duration: '1h 7m', rating: 42, img: 'https://picsum.photos/500/300?random=11' },
    { title: 'The Avengers', genre: 'Action, Adventure, 2019', duration: '2h 15m', rating: 48, img: 'https://picsum.photos/500/300?random=12' },
    { title: 'Pirates of Caribbean', genre: 'Action, Adventure, 2017', duration: '2h 30m', rating: 44, img: 'https://picsum.photos/500/300?random=13' },
  ];

  return (
    <div className="px-16 py-10 bg-black">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-semibold">You might like</h2>
        <button className="text-amber-500 text-sm hover:text-amber-400">See All</button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 mb-6">
        <button className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-black text-sm font-semibold shadow-lg shadow-amber-500/30">
          Top Trending
        </button>
        <button className="px-5 py-2 bg-gray-900 rounded-full text-gray-400 text-sm font-medium hover:bg-gray-800">
          Recently Watched
        </button>
        <button className="px-5 py-2 bg-gray-900 rounded-full text-gray-400 text-sm font-medium hover:bg-gray-800">
          New released
        </button>
        <button className="px-5 py-2 bg-gray-900 rounded-full text-gray-400 text-sm font-medium hover:bg-gray-800">
          Bestsellers
        </button>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 gap-6">
        {movies.map((movie, i) => (
          <div key={i} className="group relative bg-gray-900 rounded-3xl overflow-hidden hover:ring-2 hover:ring-amber-500/30 transition-all">
            <div className="relative h-56">
              <img src={movie.img} alt={movie.title} className="w-full h-full object-cover" />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-amber-500/50">
                  <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
                </button>
              </div>

              {/* Rating */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1">
                <Star className="w-4 h-4 text-amber-500" fill="#f59e0b" />
                <span className="text-white text-sm font-semibold">{movie.rating}</span>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white font-semibold text-lg mb-1">{movie.title}</h3>
                <p className="text-gray-400 text-sm">{movie.genre} · {movie.duration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trending Actors Section
function TrendingActors() {
  return (
    <div className="px-16 py-10 bg-black">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-semibold">Trending Actors</h2>
        <button className="text-amber-500 text-sm hover:text-amber-400">See All</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Large card */}
        <div className="row-span-2 bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden">
          <div className="h-96">
            <img src="https://i.pravatar.cc/600?img=50" alt="Dwayne Johnson" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h3 className="text-white font-bold text-2xl mb-2">Dwayne Johnson</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Dwayne Douglas Johnson (born May 2, 1972), also known by his ring name The Rock, is an American actor and former professional wrestler.
            </p>
          </div>
        </div>

        {/* Small cards */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden flex">
          <div className="w-48 h-full">
            <img src="https://i.pravatar.cc/300?img=51" alt="Vin Diesel" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="text-white font-bold text-xl mb-2">Vin Diesel</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Mark Sinclair (born July 18, 1967), known professionally as Vin Diesel, is an American actor and producer. One of the world's highest-grossing actors...
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl overflow-hidden flex">
          <div className="w-48 h-full">
            <img src="https://i.pravatar.cc/300?img=48" alt="Emma Watson" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="text-white font-bold text-xl mb-2">Emma Watson</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Emma Charlotte Duerre Watson (born 15 April 1990) is an English actress, model and activist. Known for her roles in both independent films...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Header />
        <HeroSection />
        <Recommendations />
        <TrendingActors />
      </div>
    </div>
  );
}