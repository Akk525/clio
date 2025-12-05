export type UiArtist = {
  id: number;
  name: string;
  handle: string;
  imageUrl: string;
  genre: string;
  currentPrice: number;   // in ETH
  change24h: number;      // in %
  volume24h: number;      // in ETH
  marketCap: number;      // in ETH
  poolSize: number;       // in ETH
  holders: number;
};

export type ChartDataPoint = {
  timestamp: number;      // Unix timestamp in ms
  price: number;          // Price in ETH
};

export type Trade = {
  id: string;
  type: 'buy' | 'sell';
  amount: number;         // Token amount
  ethAmount: number;      // ETH amount
  price: number;          // Price per token in ETH
  user: string;           // Wallet address (shortened)
  timestamp: number;      // Unix timestamp in ms
  artistId: number;
};

export const MOCK_ARTISTS: UiArtist[] = [
  {
    id: 1,
    name: "Nova",
    handle: "nova.wav",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff006e;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238338ec;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g1)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3ENova%3C/text%3E%3C/svg%3E",
    genre: "Hyperpop",
    currentPrice: 0.042,
    change24h: 12.3,
    volume24h: 23.4,
    marketCap: 420,
    poolSize: 180.5,
    holders: 342,
  },
  {
    id: 2,
    name: "Echo",
    handle: "echo.eth",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300d9ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%230066ff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g2)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EEcho%3C/text%3E%3C/svg%3E",
    genre: "Lo-fi",
    currentPrice: 0.028,
    change24h: -5.2,
    volume24h: 18.7,
    marketCap: 280,
    poolSize: 125.3,
    holders: 198,
  },
  {
    id: 3,
    name: "Orion",
    handle: "orion",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300ff88;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300d9ff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g3)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EOrion%3C/text%3E%3C/svg%3E",
    genre: "Cinematic",
    currentPrice: 0.089,
    change24h: 34.5,
    volume24h: 45.2,
    marketCap: 890,
    poolSize: 456.8,
    holders: 521,
  },
  {
    id: 4,
    name: "Lumen",
    handle: "lumen.xyz",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff4500;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ff006e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g4)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3ELumen%3C/text%3E%3C/svg%3E",
    genre: "Indie",
    currentPrice: 0.015,
    change24h: 8.9,
    volume24h: 12.3,
    marketCap: 150,
    poolSize: 67.2,
    holders: 89,
  },
  {
    id: 5,
    name: "Atlas",
    handle: "atlas_onchain",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238338ec;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%233a86ff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g5)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EAtlas%3C/text%3E%3C/svg%3E",
    genre: "Bass",
    currentPrice: 0.031,
    change24h: -2.1,
    volume24h: 28.9,
    marketCap: 310,
    poolSize: 145.6,
    holders: 267,
  },
  {
    id: 6,
    name: "Stellar",
    handle: "stellardrift",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g6' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffbe0b;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ff006e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g6)'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EStellar%3C/text%3E%3C/svg%3E",
    genre: "Chillwave",
    currentPrice: 0.056,
    change24h: 19.7,
    volume24h: 37.8,
    marketCap: 560,
    poolSize: 234.9,
    holders: 412,
  },
  {
    id: 7,
    name: "Phantom",
    handle: "phantomsync",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g7' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230080ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300ffff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g7)'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EPhantom%3C/text%3E%3C/svg%3E",
    genre: "Vaporwave",
    currentPrice: 0.022,
    change24h: 6.4,
    volume24h: 15.6,
    marketCap: 220,
    poolSize: 98.4,
    holders: 156,
  },
  {
    id: 8,
    name: "Aurora",
    handle: "aurorapulse",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g8' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2300ff88;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ff006e;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g8)'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EAurora%3C/text%3E%3C/svg%3E",
    genre: "Deep House",
    currentPrice: 0.067,
    change24h: -8.3,
    volume24h: 42.1,
    marketCap: 670,
    poolSize: 312.7,
    holders: 478,
  },
  {
    id: 9,
    name: "Nexus",
    handle: "nexuswave",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g9' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238338ec;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%233a86ff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g9)'/%3E%3Ctext x='50%25' y='50%25' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3ENexus%3C/text%3E%3C/svg%3E",
    genre: "Ambient Techno",
    currentPrice: 0.038,
    change24h: 15.2,
    volume24h: 31.5,
    marketCap: 380,
    poolSize: 167.3,
    holders: 289,
  },
  {
    id: 10,
    name: "Void",
    handle: "voidcartel",
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g10' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff006e;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238338ec;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='600' fill='url(%23g10)'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3EVoid%3C/text%3E%3C/svg%3E",
    genre: "Dark Ambient",
    currentPrice: 0.019,
    change24h: 22.8,
    volume24h: 19.4,
    marketCap: 190,
    poolSize: 89.1,
    holders: 134,
  },
];

// Generate chart data for last 7 days (hourly data points)
function generateChartData(basePrice: number, volatility: number): ChartDataPoint[] {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const dataPoints: ChartDataPoint[] = [];
  let currentPrice = basePrice * 0.8; // Start 20% below current

  for (let i = 0; i < 168; i++) { // 168 hours = 7 days
    const timestamp = sevenDaysAgo + i * 60 * 60 * 1000;
    // Random walk with slight upward trend
    const change = (Math.random() - 0.45) * volatility;
    currentPrice = Math.max(0.001, currentPrice * (1 + change));
    dataPoints.push({ timestamp, price: currentPrice });
  }

  return dataPoints;
}

export const MOCK_ARTIST_CHART: Record<number, ChartDataPoint[]> = {
  1: generateChartData(0.042, 0.02),
  2: generateChartData(0.028, 0.015),
  3: generateChartData(0.089, 0.03),
  4: generateChartData(0.015, 0.01),
  5: generateChartData(0.031, 0.018),
  6: generateChartData(0.056, 0.025),
  7: generateChartData(0.022, 0.012),
  8: generateChartData(0.067, 0.028),
  9: generateChartData(0.038, 0.02),
  10: generateChartData(0.019, 0.015),
};

// Generate mock trades
const generateMockTrades = (artistId: number, count: number = 20): Trade[] => {
  const artist = MOCK_ARTISTS.find(a => a.id === artistId);
  if (!artist) return [];

  const trades: Trade[] = [];
  const now = Date.now();
  const addresses = [
    '0x1234...5678', '0xabcd...ef01', '0x9876...5432', '0xfedc...ba09',
    '0x1357...2468', '0x2468...1357', '0x3691...2580', '0x4815...9263',
  ];

  for (let i = 0; i < count; i++) {
    const type: 'buy' | 'sell' = Math.random() > 0.4 ? 'buy' : 'sell';
    const price = artist.currentPrice * (0.9 + Math.random() * 0.2);
    const amount = Math.random() * 500 + 10;
    const ethAmount = amount * price;

    trades.push({
      id: `trade-${artistId}-${i}`,
      type,
      amount: parseFloat(amount.toFixed(2)),
      ethAmount: parseFloat(ethAmount.toFixed(4)),
      price: parseFloat(price.toFixed(6)),
      user: addresses[Math.floor(Math.random() * addresses.length)],
      timestamp: now - (count - i) * 10 * 60 * 1000, // Every 10 minutes
      artistId,
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

export const MOCK_TRADES: Trade[] = [
  ...generateMockTrades(1, 15),
  ...generateMockTrades(2, 12),
  ...generateMockTrades(3, 18),
  ...generateMockTrades(4, 10),
  ...generateMockTrades(5, 14),
].sort((a, b) => b.timestamp - a.timestamp);

export type PortfolioPosition = {
  artistId: number;
  tokensHeld: number;
  avgEntryPrice: number; // in ETH
};

export const MOCK_PORTFOLIO: PortfolioPosition[] = [
  { artistId: 1, tokensHeld: 120.5, avgEntryPrice: 0.035 },
  { artistId: 3, tokensHeld: 45.2, avgEntryPrice: 0.072 },
  { artistId: 6, tokensHeld: 78.9, avgEntryPrice: 0.048 },
  { artistId: 9, tokensHeld: 156.3, avgEntryPrice: 0.032 },
  { artistId: 10, tokensHeld: 234.7, avgEntryPrice: 0.015 },
];
