/**
 * Contract Configuration and ABIs
 * 
 * Contains contract addresses, ABIs, and helper utilities
 * for interacting with Clio smart contracts
 */

import { type Address } from 'viem'

// ============================================================================
// Contract Addresses
// ============================================================================

export const CONTRACTS = {
  // Base Sepolia (Testnet)
  baseSepolia: {
    artistRegistry: process.env.NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS as Address,
    bondingCurveMarket: process.env.NEXT_PUBLIC_BONDING_CURVE_ADDRESS as Address,
  },
  // Localhost (Hardhat)
  localhost: {
    artistRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,
    bondingCurveMarket: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,
  },
}

// ============================================================================
// ABIs
// ============================================================================

export const ARTIST_REGISTRY_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registerArtist',
    inputs: [
      { name: 'artistWallet', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'handle', type: 'string' },
    ],
    outputs: [{ name: 'artistId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setArtistToken',
    inputs: [
      { name: 'artistId', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getArtist',
    inputs: [{ name: 'artistId', type: 'uint256' }],
    outputs: [
      {
        name: 'artist',
        type: 'tuple',
        components: [
          { name: 'artistWallet', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'handle', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'artistCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'artists',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'artistWallet', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'handle', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ArtistRegistered',
    inputs: [
      { name: 'artistId', type: 'uint256', indexed: true },
      { name: 'artistWallet', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'handle', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ArtistTokenSet',
    inputs: [
      { name: 'artistId', type: 'uint256', indexed: true },
      { name: 'token', type: 'address', indexed: true },
    ],
  },
] as const

export const BONDING_CURVE_MARKET_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: 'registry_', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'buy',
    inputs: [
      { name: 'artistId', type: 'uint256' },
      { name: 'minTokensOut', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'sell',
    inputs: [
      { name: 'artistId', type: 'uint256' },
      { name: 'tokenAmount', type: 'uint256' },
      { name: 'minEthOut', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reserveBalance',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registry',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ARTIST_FEE_BPS',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Bought',
    inputs: [
      { name: 'artistId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'ethIn', type: 'uint256', indexed: false },
      { name: 'tokensOut', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Sold',
    inputs: [
      { name: 'artistId', type: 'uint256', indexed: true },
      { name: 'seller', type: 'address', indexed: true },
      { name: 'tokensIn', type: 'uint256', indexed: false },
      { name: 'ethOut', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ReserveUpdated',
    inputs: [
      { name: 'artistId', type: 'uint256', indexed: true },
      { name: 'newReserve', type: 'uint256', indexed: false },
    ],
  },
] as const

export const ARTIST_TOKEN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get contract addresses for the current chain
 */
export function getContractAddresses(chainId: number) {
  if (chainId === 84532) {
    // Base Sepolia
    return CONTRACTS.baseSepolia
  } else if (chainId === 31337 || chainId === 1337) {
    // Localhost Hardhat
    return CONTRACTS.localhost
  }
  return CONTRACTS.baseSepolia // Default to Base Sepolia
}

/**
 * Format token amount for display (18 decimals)
 */
export function formatTokenAmount(amount: bigint): string {
  const formatted = Number(amount) / 1e18
  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}

/**
 * Format ETH amount for display
 */
export function formatEth(amount: bigint): string {
  const formatted = Number(amount) / 1e18
  return formatted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }) + ' ETH'
}

/**
 * Calculate artist fee (3%)
 */
export function calculateArtistFee(amount: bigint): bigint {
  return (amount * 300n) / 10_000n
}

/**
 * Calculate tokens received after fee
 */
export function calculateTokensOut(ethAmount: bigint): bigint {
  const fee = calculateArtistFee(ethAmount)
  return ethAmount - fee // 1 wei = 1 token after fee
}
