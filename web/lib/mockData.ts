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
    name: "Taylor Swift",
    handle: "Taylor.Swift",
    imageUrl: "https://imgcdn.stablediffusionweb.com/2024/5/13/cb8a5628-78a0-4937-a067-3791c3ea0c16.jpg",
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
    name: "Abel Tesfaye",
    handle: "Abel.Tesfaye",
    imageUrl: "https://i.pinimg.com/736x/39/60/10/396010118a7b68e3d3494ce026d6f416.jpg",
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
    name: "Mark Sinclair",
    handle: "Mark_Sinclair",
    imageUrl: "https://pics.craiyon.com/2023-11-29/SbqtmazpTdKAW9dbvkIBTQ.webp",
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
    name: "Joel Thomas Zimmerman",
    handle: "Joel.Thomas.Zimmerman",
    imageUrl: "https://i1.sndcdn.com/avatars-vZzWjpbLJSK2u9dj-0Uvgow-t1080x1080.jpg",
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
    name: "Emma Charlotte Duerre Watson",
    handle: "Emma_Charlotte_Duerre_Watson",
    imageUrl: "https://image.lexica.art/md2_webp/f3d4ed16-b965-4334-8696-e760023e4d88",
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
    name: "Jacques Bermon Webster II",
    handle: "Jacques-Bermon-Webster-II",
    imageUrl: "https://cdn.dribbble.com/userupload/27891818/file/original-c4b49367c08bb289b0575379e5130c5a.png?resize=752x&vertical=center",
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
    name: "Thomas Cruise",
    handle: "Thomas_Cruise",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnQ0UZBYWnPGKDAigSrCdflNmwr0gQVe6XTg&s",
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
    name: "Benito Antonio Martínez Ocasio",
    handle: "benitoAntonioMartínezOcasio",
    imageUrl: "https://ih1.redbubble.net/image.4514614621.2487/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
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
    name: "Luke Combs",
    handle: "Luke_Combs",
    imageUrl: "https://mir-s3-cdn-cf.behance.net/project_modules/1400/02c9f988019587.5dc9d8f094022.png",
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
    name: "Charlotte Emma Aitchison",
    handle: "Charlotte_Emma_Aitchison",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/60/Charli_XCX_-_Brat_%28album_cover%29.png",
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
