/**
 * On-Chain Indexer for Clio Badge System
 * 
 * Watches Base Sepolia for Bought events from BondingCurveMarket
 * and processes them through the badge engine.
 * 
 * Run with: npm run indexer
 */

import { createPublicClient, http, type Log } from 'viem'
import { baseSepolia } from 'viem/chains'
import { processBuyEvent, type BuyEvent } from '../lib/badgeEngine'
import BondingCurveMarketABI from '../abis/BondingCurveMarket.json'

// ============================================================================
// Environment Variables
// ============================================================================

const RPC_URL = process.env.RPC_URL
const BONDING_CURVE_ADDRESS = process.env.BONDING_CURVE_ADDRESS as `0x${string}`

// Validate environment variables
if (!RPC_URL) {
  console.error('❌ Missing RPC_URL environment variable')
  console.log('💡 Add to .env file: RPC_URL=https://sepolia.base.org')
  process.exit(1)
}

if (!BONDING_CURVE_ADDRESS) {
  console.error('❌ Missing BONDING_CURVE_ADDRESS environment variable')
  console.log('💡 Add to .env file: BONDING_CURVE_ADDRESS=0x...')
  process.exit(1)
}

// Validate address format
if (!BONDING_CURVE_ADDRESS.startsWith('0x') || BONDING_CURVE_ADDRESS.length !== 42) {
  console.error('❌ Invalid BONDING_CURVE_ADDRESS format')
  console.log('Expected: 0x followed by 40 hex characters')
  process.exit(1)
}

// ============================================================================
// Viem Client Setup
// ============================================================================

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
})

// ============================================================================
// Event Processing
// ============================================================================

/**
 * Process a Bought event from the blockchain
 * Converts viem log into BuyEvent and calls badge engine
 */
async function processBoughtEvent(log: Log): Promise<void> {
  try {
    // Decode event args
    const { artistId, buyer, tokenAmount, newSupply, newPrice } = log.args as {
      artistId: bigint
      buyer: string
      tokenAmount: bigint
      newSupply: bigint
      newPrice: bigint
    }

    // Fetch block to get timestamp
    const block = await client.getBlock({
      blockNumber: log.blockNumber!,
    })

    // Build BuyEvent object
    const buyEvent: BuyEvent = {
      artistId: Number(artistId),
      buyer: buyer.toLowerCase(),
      tokenAmount,
      newSupply,
      newPrice,
      blockNumber: Number(log.blockNumber),
      timestamp: new Date(Number(block.timestamp) * 1000), // Convert to milliseconds
    }

    // Log event detection
    console.log(`📡 Bought event detected:`)
    console.log(`   Artist ID: ${buyEvent.artistId}`)
    console.log(`   Buyer: ${buyEvent.buyer}`)
    console.log(`   Amount: ${buyEvent.tokenAmount.toString()}`)
    console.log(`   New Supply: ${buyEvent.newSupply.toString()}`)
    console.log(`   New Price: ${buyEvent.newPrice.toString()}`)
    console.log(`   Block: ${buyEvent.blockNumber}`)
    console.log(`   Time: ${buyEvent.timestamp.toISOString()}`)

    // Process through badge engine
    await processBuyEvent(buyEvent)

    console.log(`✅ Event processed successfully\n`)
  } catch (error) {
    console.error('❌ Error processing Bought event:', error)
    console.error('Log details:', JSON.stringify(log, null, 2))
    // Don't exit - continue processing other events
  }
}

// ============================================================================
// Indexer
// ============================================================================

/**
 * Start the indexer - watches for Bought events and processes them
 */
export async function startIndexer(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║           🎨 CLIO BADGE INDEXER STARTING 🎨               ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('📡 Configuration:')
  console.log(`   Chain: Base Sepolia (${baseSepolia.id})`)
  console.log(`   RPC: ${RPC_URL}`)
  console.log(`   Contract: ${BONDING_CURVE_ADDRESS}`)
  console.log('')

  // Verify connection
  try {
    const blockNumber = await client.getBlockNumber()
    console.log(`✅ Connected to Base Sepolia (block: ${blockNumber})`)
  } catch (error) {
    console.error('❌ Failed to connect to RPC endpoint:', error)
    process.exit(1)
  }

  console.log('')
  console.log('🎧 Watching for Bought events...')
  console.log('   (Press Ctrl+C to stop)')
  console.log('')
  console.log('─'.repeat(60))
  console.log('')

  // Watch for Bought events
  const unwatch = client.watchContractEvent({
    address: BONDING_CURVE_ADDRESS,
    abi: BondingCurveMarketABI,
    eventName: 'Bought',
    onLogs: async (logs) => {
      for (const log of logs) {
        await processBoughtEvent(log)
      }
    },
    onError: (error) => {
      console.error('❌ Watch error:', error)
      console.log('🔄 Attempting to reconnect...')
      // Watcher will automatically attempt to reconnect
    },
  })

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('')
    console.log('─'.repeat(60))
    console.log('')
    console.log('🛑 Shutting down indexer...')
    unwatch()
    console.log('✅ Indexer stopped gracefully')
    process.exit(0)
  })

  // Keep process alive
  await new Promise(() => {})
}

// ============================================================================
// Main
// ============================================================================

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    await startIndexer()
  } catch (error) {
    console.error('')
    console.error('═'.repeat(60))
    console.error('❌ FATAL ERROR')
    console.error('═'.repeat(60))
    console.error(error)
    console.error('')
    console.error('Troubleshooting:')
    console.error('  1. Check your .env file exists')
    console.error('  2. Verify RPC_URL is correct')
    console.error('  3. Verify BONDING_CURVE_ADDRESS is deployed')
    console.error('  4. Check your internet connection')
    console.error('')
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

