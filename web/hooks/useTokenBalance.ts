// web/hooks/useTokenBalance.ts
// Hook to read ERC-20 token balance using wagmi v2

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { erc20Abi, type Address } from "viem";

/**
 * Hook to read token balance for a user
 * 
 * Usage:
 * ```tsx
 * const { balance, isLoading } = useTokenBalance({
 *   tokenAddress: "0x...",
 * });
 * ```
 */
export function useTokenBalance({ tokenAddress }: { tokenAddress: Address | undefined }) {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook to read token balance for a specific artist
 * 
 * Usage:
 * ```tsx
 * const { balance, isLoading } = useArtistTokenBalance({
 *   artistId: 1,
 * });
 * ```
 * 
 * Note: This requires fetching the token address from ArtistRegistry first.
 * For now, this is a placeholder that can be extended when registry integration is ready.
 */
export function useArtistTokenBalance({ artistId }: { artistId: number }) {
  // TODO: First fetch token address from ArtistRegistry
  // const { data: artist } = useReadContract({
  //   ...artistRegistryConfig,
  //   functionName: "artists",
  //   args: [BigInt(artistId)],
  // });
  // const tokenAddress = artist?.token;
  
  // Then use useTokenBalance
  // return useTokenBalance({ tokenAddress });
  
  return {
    balance: undefined as bigint | undefined,
    isLoading: false,
    error: null,
  };
}

