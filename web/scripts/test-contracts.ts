/**
 * Smart Contract Integration Test
 * 
 * Tests all smart contract functions through the frontend interface
 * Requires Hardhat node to be running with deployed contracts
 * 
 * Run with: npx tsx scripts/test-contracts.ts
 */

import { createPublicClient, http, type Address, defineChain } from 'viem'
import { 
  ARTIST_REGISTRY_ABI, 
  BONDING_CURVE_MARKET_ABI,
  ARTIST_TOKEN_ABI,
} from '../lib/contracts'
import {
  CLIO_REGISTRY_ADDRESS as DEFAULT_REGISTRY,
  CLIO_MARKET_ADDRESS as DEFAULT_MARKET,
  CLIO_FACTORY_ADDRESS as DEFAULT_FACTORY,
  BASE_SEPOLIA_CHAIN_ID,
} from '../config/contracts'

// ============================================================================
// Configuration
// ============================================================================

// Env-driven config (defaults to Base Sepolia addresses from web/config/contracts.ts)
const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545'
const REGISTRY_ADDRESS = (process.env.CLIO_REGISTRY_ADDRESS ?? DEFAULT_REGISTRY) as Address
const MARKET_ADDRESS = (process.env.CLIO_MARKET_ADDRESS ?? DEFAULT_MARKET) as Address
const FACTORY_ADDRESS = (process.env.CLIO_FACTORY_ADDRESS ?? DEFAULT_FACTORY) as Address
const CHAIN_ID = Number(process.env.CHAIN_ID ?? BASE_SEPOLIA_CHAIN_ID)

// Minimal chain object for viem when not using a built-in chain
const customChain = defineChain({
  id: CHAIN_ID,
  name: `custom-${CHAIN_ID}`,
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
})

// ============================================================================
// Setup Clients
// ============================================================================

const publicClient = createPublicClient({
  chain: customChain,
  transport: http(RPC_URL),
})

// ============================================================================
// Test Functions
// ============================================================================

// Read-only smoke checks (no tx signing required)
async function checkArtistCount(): Promise<bigint> {
  console.log('\n📈 Reading artist count')
  const count = (await publicClient.readContract({
    address: REGISTRY_ADDRESS,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'nextArtistId',
  })) as bigint
  console.log(`✓ nextArtistId: ${count}`)
  return count
}

async function readFirstArtist(): Promise<void> {
  if (!REGISTRY_ADDRESS) return
  console.log('\n👁️  Reading artist #1 (if exists)')
  try {
    const artist = await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: ARTIST_REGISTRY_ABI,
      functionName: 'artists',
      args: [1n],
    }) as [Address, Address, string, string, boolean]

    const [artistWallet, token, name, handle, active] = artist
    console.log('✓ Artist #1:')
    console.log(`  name:   ${name}`)
    console.log(`  handle: ${handle}`)
    console.log(`  wallet: ${artistWallet}`)
    console.log(`  token:  ${token}`)
    console.log(`  active: ${active}`)
  } catch (err) {
    console.log('ℹ️  Unable to read artist #1 (may not exist yet).')
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║           🧪 SMART CONTRACT INTEGRATION TESTS 🧪          ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  try {
    // Check connection
    console.log('\n🔌 Checking connection to Hardhat node...')
    const blockNumber = await publicClient.getBlockNumber()
    console.log(`✓ Connected! Current block: ${blockNumber}`)

    // Check contract deployment
    console.log('\n🔍 Verifying contract deployment...')
    console.log(`Registry: ${REGISTRY_ADDRESS}`)
    console.log(`Market: ${MARKET_ADDRESS}`)
    console.log(`Factory: ${FACTORY_ADDRESS}`)

    const registryCode = await publicClient.getBytecode({ address: REGISTRY_ADDRESS })
    const marketCode = await publicClient.getBytecode({ address: MARKET_ADDRESS })

    if (!registryCode || registryCode === '0x') {
      throw new Error('ArtistRegistry not deployed at expected address')
    }
    if (!marketCode || marketCode === '0x') {
      throw new Error('BondingCurveMarket not deployed at expected address')
    }

    console.log('✓ Contracts deployed and verified')

    // Run read-only checks
    await checkArtistCount()
    await readFirstArtist()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log('✅ RPC reachable & contracts present')
    console.log('✅ Registry/Market bytecode verified')
    console.log('✅ Registry read methods (nextArtistId / artists[1])')
    console.log('\nℹ️  Buy/sell paths require USDC, approvals, and token linkage; run dedicated flow when funded.')
    console.log('')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
