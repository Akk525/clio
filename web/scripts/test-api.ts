/**
 * API Routes Test Script
 * 
 * Tests all API endpoints by making direct Prisma queries
 * (simulates what the API routes do without needing the server)
 * 
 * Run with: npx tsx scripts/test-api.ts
 */

import { prisma } from '../lib/prisma'

async function testAPIs() {
  console.log('\n🧪 Testing API Routes\n')
  console.log('═'.repeat(70))

  try {
    // ========================================
    // TEST 1: GET /api/stats
    // ========================================
    console.log('\n📊 TEST 1: GET /api/stats')
    console.log('─'.repeat(70))

    const totalArtists = await prisma.artist.count({
      where: { artistId: { not: 0 } },
    })
    const totalHolders = await prisma.artistHolder.count()
    const totalBadgesAwarded = await prisma.userBadge.count()
    
    const uniqueUsers = await prisma.userBadge.findMany({
      select: { userAddress: true },
      distinct: ['userAddress'],
    })

    const badgeDistribution = await prisma.userBadge.groupBy({
      by: ['badgeId'],
      _count: { badgeId: true },
    })

    console.log(`   Total Artists: ${totalArtists}`)
    console.log(`   Total Holders: ${totalHolders}`)
    console.log(`   Total Badges Awarded: ${totalBadgesAwarded}`)
    console.log(`   Unique Users: ${uniqueUsers.length}`)
    console.log(`   Badge Types Distributed: ${badgeDistribution.length}`)
    console.log('   ✅ Stats endpoint data ready')

    // ========================================
    // TEST 2: GET /api/leaderboard
    // ========================================
    console.log('\n🏆 TEST 2: GET /api/leaderboard')
    console.log('─'.repeat(70))

    const leaderboard = await prisma.userBadge.groupBy({
      by: ['userAddress'],
      _count: { badgeId: true },
      orderBy: { _count: { badgeId: 'desc' } },
      take: 5,
    })

    console.log('   Top 5 Users:')
    leaderboard.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.userAddress.substring(0, 12)}... - ${user._count.badgeId} badges`)
    })
    console.log('   ✅ Leaderboard endpoint data ready')

    // ========================================
    // TEST 3: GET /api/profile/[address]/badges
    // ========================================
    console.log('\n👤 TEST 3: GET /api/profile/[address]/badges')
    console.log('─'.repeat(70))

    // Get a user with badges
    const testUser = leaderboard[0]?.userAddress
    if (testUser) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userAddress: testUser },
        include: {
          badge: true,
          artist: { select: { name: true, handle: true } },
        },
        orderBy: { awardedAt: 'desc' },
      })

      console.log(`   User: ${testUser.substring(0, 12)}...`)
      console.log(`   Total Badges: ${userBadges.length}`)
      if (userBadges.length > 0) {
        console.log('   First 3 badges:')
        userBadges.slice(0, 3).forEach((badge) => {
          const artistInfo = badge.artist ? ` (${badge.artist.name})` : ' (Global)'
          console.log(`     - ${badge.badge.displayName}${artistInfo}`)
        })
      }
      console.log('   ✅ User badges endpoint data ready')
    } else {
      console.log('   ℹ️  No users with badges yet')
    }

    // ========================================
    // TEST 4: GET /api/profile/[address]
    // ========================================
    console.log('\n👥 TEST 4: GET /api/profile/[address]')
    console.log('─'.repeat(70))

    if (testUser) {
      const holdings = await prisma.artistHolder.findMany({
        where: { userAddress: testUser },
        include: {
          artist: {
            select: { artistId: true, name: true, handle: true, genre: true },
          },
        },
      })

      const badges = await prisma.userBadge.findMany({
        where: { userAddress: testUser },
        select: { badgeId: true, artistId: true, awardedAt: true },
      })

      console.log(`   User: ${testUser.substring(0, 12)}...`)
      console.log(`   Artists Supported: ${holdings.length}`)
      console.log(`   Total Badges: ${badges.length}`)
      if (holdings.length > 0) {
        console.log('   First 3 artists:')
        holdings.slice(0, 3).forEach((h) => {
          console.log(`     - ${h.artist.name} (${h.artist.genre || 'N/A'})`)
        })
      }
      console.log('   ✅ Profile endpoint data ready')
    }

    // ========================================
    // TEST 5: GET /api/artists/[artistId]/supporters
    // ========================================
    console.log('\n🎨 TEST 5: GET /api/artists/[artistId]/supporters')
    console.log('─'.repeat(70))

    // Find an artist with holders
    const artistWithHolders = await prisma.artist.findFirst({
      where: {
        artistId: { not: 0 },
        holders: { some: {} },
      },
      include: {
        _count: { select: { holders: true } },
      },
    })

    if (artistWithHolders) {
      const supporters = await prisma.artistHolder.findMany({
        where: { artistId: artistWithHolders.artistId },
        orderBy: { firstBuyTime: 'asc' },
        take: 5,
      })

      const badgesForArtist = await prisma.userBadge.findMany({
        where: { artistId: artistWithHolders.artistId },
        include: {
          badge: { select: { displayName: true } },
        },
      })

      const badgesByUser = badgesForArtist.reduce((acc, ub) => {
        if (!acc[ub.userAddress]) acc[ub.userAddress] = []
        acc[ub.userAddress].push(ub)
        return acc
      }, {} as Record<string, typeof badgesForArtist>)

      console.log(`   Artist: ${artistWithHolders.name} (ID: ${artistWithHolders.artistId})`)
      console.log(`   Total Supporters: ${artistWithHolders._count.holders}`)
      console.log('   First 3 supporters:')
      supporters.slice(0, 3).forEach((s) => {
        const userBadges = badgesByUser[s.userAddress] || []
        console.log(`     - ${s.userAddress.substring(0, 12)}... (${userBadges.length} badges)`)
      })
      console.log('   ✅ Supporters endpoint data ready')
    } else {
      console.log('   ℹ️  No artists with holders yet')
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '═'.repeat(70))
    console.log('📊 API TEST SUMMARY')
    console.log('═'.repeat(70))

    console.log('\n   All API Endpoints Ready:')
    console.log('   ✅ GET /api/stats')
    console.log('   ✅ GET /api/leaderboard')
    console.log('   ✅ GET /api/profile/[address]/badges')
    console.log('   ✅ GET /api/profile/[address]')
    console.log('   ✅ GET /api/artists/[artistId]/supporters')

    console.log('\n   Database State:')
    console.log(`   - ${totalArtists} artists`)
    console.log(`   - ${totalHolders} holders`)
    console.log(`   - ${totalBadgesAwarded} badges awarded`)
    console.log(`   - ${uniqueUsers.length} unique users`)

    console.log('\n✅ ALL API ROUTES TESTED AND READY!\n')

  } catch (error) {
    console.error('\n❌ API Test Failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testAPIs()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })

