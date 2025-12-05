"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function WeekndPodcastPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const weekndImageUrl = "https://i.pinimg.com/736x/39/60/10/396010118a7b68e3d3494ce026d6f416.jpg";

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/portfolio" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
            ← Back to Portfolio
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
            <Link href="/portfolio" className="text-sm text-gray-400 hover:text-white transition-colors">
              Portfolio
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with Weeknd Image */}
      <div className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black to-black">
          {!imageError && (
            <Image
              src={weekndImageUrl}
              alt="The Weeknd"
              fill
              className="object-cover"
              priority
              onError={() => setImageError(true)}
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
            {/* Exclusive Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50">
                <span className="text-lg">👑</span>
                <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                  Promethean Backer Exclusive
                </span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                WEEKND
              </span>
              <br />
              <span className="text-white">RADIO</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-2 font-light">
              Early Access Episode
            </p>
            <p className="text-base text-gray-400 max-w-2xl">
              This episode goes public in 48 hours. As a Promethean Backer, you're getting it first.
            </p>
          </div>
        </div>
      </div>

      {/* Audio Player Section */}
      <div className="relative z-20 -mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/90 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Player Controls */}
          <div className="flex items-center gap-6 mb-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-yellow-500/50 flex-shrink-0"
            >
              {isPlaying ? (
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <div className="text-2xl font-bold text-white mb-1">The Weeknd's Weekend Mix</div>
              <div className="text-sm text-gray-400">Episode 1 • Exclusive Early Access • 6:42</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: isPlaying ? '35%' : '0%' }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-sm text-gray-400 mb-8">
            <span className="font-mono">{isPlaying ? '2:15' : '0:00'}</span>
            <span className="font-mono text-yellow-400">6:42</span>
          </div>

          {/* Episode Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-yellow-500/20">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</div>
              <div className="text-sm text-white font-medium">The Weeknd's Weekend Mix</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</div>
              <div className="text-sm text-white font-medium">6 minutes 42 seconds</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Release</div>
              <div className="text-sm text-white font-medium">Early Access • Public in 48h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-12 pb-12">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-md border border-yellow-500/30 rounded-xl text-yellow-400 hover:text-yellow-300 hover:border-yellow-500/50 transition-colors"
        >
          ← Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
