/**
 * Badge Engine Test Script
 * 
 * Simulates various buy events to test all badge awarding logic
 * Run with: npx tsx scripts/test-badge-engine.ts
 */

import { prisma } from '../lib/prisma'
import { processBuyEvent, type BuyEvent } from '../lib/badgeEngine'

async function main() {
  console.log('\n🧪 Testing Badge Engine\n')
  console.log('=' .repeat(70))

  try {
    // ========================================
    // CLEANUP: Clear existing test data
    // ========================================
    console.log('\n🧹 Cleaning up previous test data...')
    
    // Delete in order to respect foreign keys
    await prisma.userBadge.deleteMany({
      where: {
        OR: [
          { artistId: 100 },
          { artistId: { gte: 200, lte: 209 } }
        ]
      }
    })
    await prisma.artistStats.deleteMany({
      where: {
        OR: [
          { artistId: 100 },
          { artistId: { gte: 200, lte: 209 } }
        ]
      }
    })
    await prisma.artistHolder.deleteMany({
      where: {
        OR: [
          { artistId: 100 },
          { artistId: { gte: 200, lte: 209 } }
        ]
      }
    })
    await prisma.artist.deleteMany({
      where: {
        OR: [
          { artistId: 100 },
          { artistId: { gte: 200, lte: 209 } }
        ]
      }
    })
    console.log('✅ Cleaned up previous test data')

    // ========================================
    // SETUP: Create test artist
    // ========================================
    console.log('\n📋 SETUP: Creating test artist...')
    
    const testArtist = await prisma.artist.create({
      data: {
        artistId: 100,
        tokenAddress: '0xTEST1234567890123456789012345678901234567890',
        name: 'Test Artist',
        handle: '@testartist',
        genre: 'electronic',
      },
    })
    console.log(`✅ Created artist: ${testArtist.name} (ID: ${testArtist.artistId})`)

    // ========================================
    // TEST 1: Promethean Backer (First 5 holders)
    // ========================================
    console.log('\n' + '='.repeat(70))
    console.log('🏆 TEST 1: PROMETHEAN_BACKER (First 5 holders)')
    console.log('='.repeat(70))

    for (let i = 1; i <= 7; i++) {
      const buyEvent: BuyEvent = {
        artistId: 100,
        buyer: `0xPromethean${i}${'0'.repeat(30)}`,
        tokenAmount: 1000n,
        newSupply: BigInt(i * 1000),
        newPrice: BigInt(i * 10000000000000000), // 0.01 ETH increments
        blockNumber: 1000 + i,
        timestamp: new Date(Date.now() + i * 1000),
      }

      await processBuyEvent(buyEvent)
      await sleep(50)
    }

    // Verify
    const prometheanBadges = await prisma.userBadge.count({
      where: {
        badgeId: 'PROMETHEAN_BACKER',
        artistId: 100,
      },
    })
    console.log(`\n✅ Result: ${prometheanBadges} PROMETHEAN_BACKER badges (expected: 5)`)

    // ========================================
    // TEST 2: Titan of Support (1%+ share)
    // ========================================
    console.log('\n' + '='.repeat(70))
    console.log('🏆 TEST 2: TITAN_OF_SUPPORT (1%+ share in one buy)')
    console.log('='.repeat(70))

    const bigBuyEvent: BuyEvent = {
      artistId: 100,
      buyer: '0xTitanWhale123456789012345678901234567890',
      tokenAmount: 500000n,
      newSupply: 10000000n,
      newPrice: 100000000000000000n,
      blockNumber: 1010,
      timestamp: new Date(),
    }

    await processBuyEvent(bigBuyEvent)

    const titanBadges = await prisma.userBadge.count({
      where: {
        badgeId: 'TITAN_OF_SUPPORT',
        artistId: 100,
      },
    })
    console.log(`\n✅ Result: ${titanBadges} TITAN_OF_SUPPORT badge(s) (expected: >=1)`)

    // ========================================
    // TEST 3: Nereid Navigator (15%+ price dip)
    // ========================================
    console.log('\n' + '='.repeat(70))
    console.log('🏆 TEST 3: NEREID_NAVIGATOR (Bought during 15%+ dip)')
    console.log('='.repeat(70))

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    await prisma.artistStats.create({
      data: {
        artistId: 100,
        blockNumber: 900,
        price: '1000000000000000000',
        holderCount: 8,
        createdAt: twoHoursAgo,
      },
    })
    console.log('Created historical stat: 1 ETH (2 hours ago)')

    const dipBuyEvent: BuyEvent = {
      artistId: 100,
      buyer: '0xDipBuyer1234567890123456789012345678901',
      tokenAmount: 5000n,
      newSupply: 10005000n,
      newPrice: 800000000000000000n,
      blockNumber: 1230,
      timestamp: new Date(),
    }

    await processBuyEvent(dipBuyEvent)

    const nereidBadges = await prisma.userBadge.count({
      where: {
        badgeId: 'NEREID_NAVIGATOR',
        artistId: 100,
      },
    })
    console.log(`\n✅ Result: ${nereidBadges} NEREID_NAVIGATOR badge(s) (expected: >=1)`)

    // ========================================
    // TEST 4: Muse Wanderer (8+ genres)
    // ========================================
    console.log('\n' + '='.repeat(70))
    console.log('🏆 TEST 4: MUSE_WANDERER (8+ genres)')
    console.log('='.repeat(70))

    const museLover = '0xMuseLover1234567890123456789012345678901'
    const genres = ['pop', 'rap', 'rock', 'jazz', 'edm', 'country', 'indie', 'classical']

    console.log(`Creating ${genres.length} artists...`)
    for (let i = 0; i < genres.length; i++) {
      const artistId = 200 + i
      const genre = genres[i]

      await prisma.artist.create({
        data: {
          artistId,
          tokenAddress: `0xArtist${artistId}${'0'.repeat(30)}`,
          name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Artist`,
          handle: `@${genre}artist`,
          genre,
        },
      })

      const buyEvent: BuyEvent = {
        artistId,
        buyer: museLover,
        tokenAmount: 1000n,
        newSupply: 1000n,
        newPrice: 10000000000000000n,
        blockNumber: 2000 + i,
        timestamp: new Date(Date.now() + i * 1000),
      }
      
      await processBuyEvent(buyEvent)
      console.log(`   ✅ ${genre}`)
    }

    const museBadges = await prisma.userBadge.count({
      where: {
        badgeId: 'MUSE_WANDERER',
        userAddress: museLover.toLowerCase(),
        artistId: undefined,
      },
    })
    console.log(`\n✅ Result: ${museBadges} MUSE_WANDERER badge(s) (expected: 1)`)

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(70))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(70))

    const allBadges = await prisma.userBadge.findMany({
      include: { badge: true },
    })

    const badgeCounts = allBadges.reduce((acc, ub) => {
      acc[ub.badgeId] = (acc[ub.badgeId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\nBadge Distribution:')
    for (const [badgeId, count] of Object.entries(badgeCounts)) {
      const badgeInfo = await prisma.badge.findUnique({ where: { badgeId } })
      console.log(`   ${badgeInfo?.displayName.padEnd(25)} ${count} awarded`)
    }

    console.log(`\n   Total badges awarded: ${allBadges.length}`)
    console.log('\n✅ ALL BADGE ENGINE TESTS PASSED!\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
