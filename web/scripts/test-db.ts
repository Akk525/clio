/**
 * Database Test Script
 * 
 * Tests all models and relationships in the Clio social layer database.
 * Run with: npx tsx scripts/test-db.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('\n🧪 Starting Database Tests...\n')

  try {
    // ========================================
    // TEST 1: Verify Badge Seeding
    // ========================================
    console.log('📋 TEST 1: Checking Badge table...')
    const badges = await prisma.badge.findMany()
    console.log(`   ✅ Found ${badges.length} badges`)
    badges.forEach(badge => {
      console.log(`      - ${badge.displayName} (${badge.badgeId})`)
    })

    if (badges.length !== 5) {
      throw new Error(`Expected 5 badges, found ${badges.length}`)
    }

    // ========================================
    // TEST 2: Create Test Artist
    // ========================================
    console.log('\n🎨 TEST 2: Creating test artist...')
    const testArtist = await prisma.artist.upsert({
      where: { artistId: 1 },
      update: {},
      create: {
        artistId: 1,
        tokenAddress: '0x1234567890123456789012345678901234567890',
        name: 'Taylor Swift',
        handle: '@taylorswift',
        genre: 'pop',
      },
    })
    console.log(`   ✅ Created artist: ${testArtist.name} (ID: ${testArtist.artistId})`)
    console.log(`      Token: ${testArtist.tokenAddress}`)
    console.log(`      Genre: ${testArtist.genre}`)

    // ========================================
    // TEST 3: Add Artist Holders
    // ========================================
    console.log('\n👥 TEST 3: Adding artist holders...')
    const holders = [
      {
        artistId: 1,
        userAddress: '0xUser1111111111111111111111111111111111111',
        firstBuyBlock: 1000,
        firstBuyTime: new Date('2024-01-01T10:00:00Z'),
        isEarly50: true,
      },
      {
        artistId: 1,
        userAddress: '0xUser2222222222222222222222222222222222222',
        firstBuyBlock: 1001,
        firstBuyTime: new Date('2024-01-01T11:00:00Z'),
        isEarly50: true,
      },
      {
        artistId: 1,
        userAddress: '0xUser3333333333333333333333333333333333333',
        firstBuyBlock: 1050,
        firstBuyTime: new Date('2024-01-02T10:00:00Z'),
        isEarly50: false,
      },
    ]

    for (const holder of holders) {
      await prisma.artistHolder.upsert({
        where: {
          artistId_userAddress: {
            artistId: holder.artistId,
            userAddress: holder.userAddress,
          },
        },
        update: {},
        create: holder,
      })
      console.log(`   ✅ Added holder: ${holder.userAddress.substring(0, 10)}... (Early50: ${holder.isEarly50})`)
    }

    // ========================================
    // TEST 4: Add Artist Stats
    // ========================================
    console.log('\n📊 TEST 4: Adding artist stats...')
    const stats = [
      {
        artistId: 1,
        blockNumber: 1000,
        price: '0.01',
        holderCount: 1,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        artistId: 1,
        blockNumber: 1050,
        price: '0.05',
        holderCount: 3,
        createdAt: new Date('2024-01-02T10:00:00Z'),
      },
      {
        artistId: 1,
        blockNumber: 1100,
        price: '0.15',
        holderCount: 10,
        createdAt: new Date('2024-01-03T10:00:00Z'),
      },
    ]

    for (const stat of stats) {
      await prisma.artistStats.create({
        data: stat,
      })
      console.log(`   ✅ Added stat: Block ${stat.blockNumber}, Price ${stat.price} ETH, ${stat.holderCount} holders`)
    }

    // ========================================
    // TEST 5: Award User Badges
    // ========================================
    console.log('\n🏆 TEST 5: Awarding user badges...')
    
    // Award PROMETHEAN_BACKER to first 2 holders (artist-specific)
    await prisma.userBadge.upsert({
      where: {
        userAddress_badgeId_artistId: {
          userAddress: '0xUser1111111111111111111111111111111111111',
          badgeId: 'PROMETHEAN_BACKER',
          artistId: 1,
        },
      },
      update: {},
      create: {
        userAddress: '0xUser1111111111111111111111111111111111111',
        badgeId: 'PROMETHEAN_BACKER',
        artistId: 1,
        meta: JSON.stringify({ position: 1 }),
      },
    })
    console.log('   ✅ Awarded PROMETHEAN_BACKER to User1 for Artist 1')

    await prisma.userBadge.upsert({
      where: {
        userAddress_badgeId_artistId: {
          userAddress: '0xUser2222222222222222222222222222222222222',
          badgeId: 'PROMETHEAN_BACKER',
          artistId: 1,
        },
      },
      update: {},
      create: {
        userAddress: '0xUser2222222222222222222222222222222222222',
        badgeId: 'PROMETHEAN_BACKER',
        artistId: 1,
        meta: JSON.stringify({ position: 2 }),
      },
    })
    console.log('   ✅ Awarded PROMETHEAN_BACKER to User2 for Artist 1')

    // Award MUSE_WANDERER (global badge, artistId = 0)
    await prisma.userBadge.upsert({
      where: {
        userAddress_badgeId_artistId: {
          userAddress: '0xUser1111111111111111111111111111111111111',
          badgeId: 'MUSE_WANDERER',
          artistId: 0,
        },
      },
      update: {},
      create: {
        userAddress: '0xUser1111111111111111111111111111111111111',
        badgeId: 'MUSE_WANDERER',
        artistId: 0,
        meta: JSON.stringify({ genresSupported: 8 }),
      },
    })
    console.log('   ✅ Awarded MUSE_WANDERER (global) to User1')

    // ========================================
    // TEST 6: Query with Relations
    // ========================================
    console.log('\n🔍 TEST 6: Querying data with relations...')
    
    const artistWithRelations = await prisma.artist.findUnique({
      where: { artistId: 1 },
      include: {
        holders: true,
        stats: {
          orderBy: { blockNumber: 'desc' },
          take: 3,
        },
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    })

    console.log(`\n   Artist: ${artistWithRelations?.name}`)
    console.log(`   Holders: ${artistWithRelations?.holders.length}`)
    console.log(`   Stats entries: ${artistWithRelations?.stats.length}`)
    console.log(`   Badges awarded: ${artistWithRelations?.userBadges.length}`)

    // ========================================
    // TEST 7: Query User Badges
    // ========================================
    console.log('\n👤 TEST 7: Querying user badges...')
    const userAddress = '0xUser1111111111111111111111111111111111111'
    const userBadges = await prisma.userBadge.findMany({
      where: { userAddress },
      include: {
        badge: true,
        artist: true,
      },
    })

    console.log(`\n   User: ${userAddress.substring(0, 10)}...`)
    console.log(`   Total badges: ${userBadges.length}`)
    userBadges.forEach(ub => {
      const artistInfo = ub.artistId === 0 ? 'Global' : `Artist: ${ub.artist?.name}`
      console.log(`      - ${ub.badge.displayName} (${artistInfo})`)
    })

    // ========================================
    // TEST 8: Complex Query - Early Holders with Badges
    // ========================================
    console.log('\n🎯 TEST 8: Complex query - Early holders with their badges...')
    const earlyHolders = await prisma.artistHolder.findMany({
      where: {
        isEarly50: true,
        artistId: 1,
      },
      include: {
        artist: true,
      },
    })

    console.log(`   Found ${earlyHolders.length} early holders:`)
    for (const holder of earlyHolders) {
      const badges = await prisma.userBadge.findMany({
        where: { userAddress: holder.userAddress },
        include: { badge: true },
      })
      console.log(`      ${holder.userAddress.substring(0, 10)}... - ${badges.length} badge(s)`)
    }

    // ========================================
    // TEST 9: Aggregate Stats
    // ========================================
    console.log('\n📈 TEST 9: Aggregate statistics...')
    const totalArtists = await prisma.artist.count()
    const totalHolders = await prisma.artistHolder.count()
    const totalBadgesAwarded = await prisma.userBadge.count()
    const totalStats = await prisma.artistStats.count()

    console.log(`   Total Artists: ${totalArtists}`)
    console.log(`   Total Holders: ${totalHolders}`)
    console.log(`   Total Badges Awarded: ${totalBadgesAwarded}`)
    console.log(`   Total Stats Entries: ${totalStats}`)

    // ========================================
    // TEST 10: Badge Distribution
    // ========================================
    console.log('\n🎖️  TEST 10: Badge distribution...')
    for (const badge of badges) {
      const count = await prisma.userBadge.count({
        where: { badgeId: badge.badgeId },
      })
      console.log(`   ${badge.displayName}: ${count} awarded`)
    }

    console.log('\n✅ ALL TESTS PASSED! Database is fully functional.\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

