/**
 * Quick Database Inspection Script
 * 
 * Use this for quick checks of database state.
 * Run with: npx tsx scripts/inspect-db.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('\n🔍 Database Inspection\n')
  console.log('=' .repeat(60))

  // Badges
  console.log('\n📋 BADGES:')
  const badges = await prisma.badge.findMany()
  badges.forEach(b => console.log(`   ${b.badgeId.padEnd(20)} → ${b.displayName}`))

  // Artists
  console.log('\n🎨 ARTISTS:')
  const artists = await prisma.artist.findMany({
    include: {
      _count: {
        select: { holders: true, stats: true, userBadges: true }
      }
    }
  })
  
  if (artists.length === 0) {
    console.log('   (no artists yet)')
  } else {
    artists.forEach(a => {
      console.log(`   ID ${a.artistId}: ${a.name} (@${a.handle})`)
      console.log(`      Token: ${a.tokenAddress}`)
      console.log(`      Genre: ${a.genre || 'N/A'}`)
      console.log(`      Holders: ${a._count.holders}, Stats: ${a._count.stats}, Badges: ${a._count.userBadges}`)
    })
  }

  // Holders
  console.log('\n👥 ARTIST HOLDERS:')
  const holders = await prisma.artistHolder.findMany({
    include: { artist: true }
  })
  
  if (holders.length === 0) {
    console.log('   (no holders yet)')
  } else {
    holders.forEach(h => {
      console.log(`   ${h.userAddress.substring(0, 12)}... → ${h.artist.name} (Early50: ${h.isEarly50})`)
    })
  }

  // Stats
  console.log('\n📊 ARTIST STATS:')
  const stats = await prisma.artistStats.findMany({
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  if (stats.length === 0) {
    console.log('   (no stats yet)')
  } else {
    stats.forEach(s => {
      console.log(`   ${s.artist.name} @ Block ${s.blockNumber}: ${s.price} ETH, ${s.holderCount} holders`)
    })
  }

  // User Badges
  console.log('\n🏆 USER BADGES:')
  const userBadges = await prisma.userBadge.findMany({
    include: {
      badge: true,
      artist: true
    }
  })
  
  if (userBadges.length === 0) {
    console.log('   (no badges awarded yet)')
  } else {
    const groupedByUser = userBadges.reduce((acc, ub) => {
      if (!acc[ub.userAddress]) acc[ub.userAddress] = []
      acc[ub.userAddress].push(ub)
      return acc
    }, {} as Record<string, typeof userBadges>)

    for (const [user, badges] of Object.entries(groupedByUser)) {
      console.log(`   ${user.substring(0, 12)}... (${badges.length} badges):`)
      badges.forEach(ub => {
        const context = ub.artistId === null ? 'Global' : `${ub.artist?.name}`
        console.log(`      - ${ub.badge.displayName} (${context})`)
      })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`   Artists: ${artists.length}`)
  console.log(`   Holders: ${holders.length}`)
  console.log(`   Stats Entries: ${stats.length}`)
  console.log(`   Badges: ${badges.length}`)
  console.log(`   Badges Awarded: ${userBadges.length}`)
  console.log('=' .repeat(60) + '\n')

  await prisma.$disconnect()
}

main().catch(console.error)

