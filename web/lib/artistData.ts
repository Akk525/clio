import { formatUnits } from "viem";
import type { PublicClient } from "viem";
import { clioRegistryAbi, clioMarketAbi, CLIO_REGISTRY_ADDRESS, CLIO_MARKET_ADDRESS } from "@/config/contracts";
import { MOCK_ARTISTS, type UiArtist } from "./mockData";
import { DEPLOYED_ARTISTS } from "./deployedArtists";
import { getArtistCount } from "./contracts";

/**
 * Load artists from the on-chain registry and enrich with mock metadata (images/genres).
 * Price is fetched from ClioMarket.currentPrice (wad, 18 decimals, USDC-denominated).
 * Volume/marketCap/poolSize remain mock placeholders until an indexer is wired.
 */
export async function loadOnchainArtists(publicClient: PublicClient): Promise<UiArtist[]> {
  const count = await getArtistCount(publicClient);

  const artists: UiArtist[] = [];
  const total = Number(count);
  for (let i = 0; i < total; i++) {
    const artistId = BigInt(i);

    // Read artist tuple from registry
    const [artistWallet, token, name, handle, active] = (await publicClient.readContract({
      address: CLIO_REGISTRY_ADDRESS,
      abi: clioRegistryAbi,
      functionName: "artists",
      args: [artistId],
    })) as [string, string, string, string, boolean];

    if (!active) {
      continue; // skip inactive entries
    }

    // Fetch current price (wad, USDC 18 decimals)
    let currentPrice = 0;
    try {
      const priceWad = (await publicClient.readContract({
        address: CLIO_MARKET_ADDRESS,
        abi: clioMarketAbi,
        functionName: "currentPrice",
        args: [artistId],
      })) as bigint;
      currentPrice = Number(formatUnits(priceWad, 18));
    } catch (err) {
      currentPrice = 0;
    }

    // Enrich with mock metadata for visuals, prefer deployed mapping to align names/handles/tokens
    const deployed = DEPLOYED_ARTISTS.find((a) => a.artistId === i);
    const mockFallback =
      MOCK_ARTISTS.find((a) => a.id === i) ||
      MOCK_ARTISTS.find((a) => a.handle.toLowerCase() === handle.toLowerCase());

    artists.push({
      id: i,
      name: deployed?.name || name || mockFallback?.name || `Artist ${i}`,
      handle: deployed?.handle || handle || mockFallback?.handle || `artist-${i}`,
      imageUrl: mockFallback?.imageUrl || "https://placehold.co/600x600",
      genre: mockFallback?.genre || "",
      currentPrice,
      change24h: mockFallback?.change24h ?? 0,
      volume24h: mockFallback?.volume24h ?? 0,
      marketCap: mockFallback?.marketCap ?? 0,
      poolSize: mockFallback?.poolSize ?? 0,
      holders: mockFallback?.holders ?? 0,
    });
  }

  return artists;
}
