/**
 * Clear Test Data Script
 * 
 * Removes all test data but keeps the Badge table and Global artist intact.
 * Run with: npx tsx scripts/clear-test-data.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('\n🧹 Clearing test data...\n')

  try {
    // Clear in order (respecting foreign keys)
    const userBadges = await prisma.userBadge.deleteMany()
    console.log(`✅ Deleted ${userBadges.count} user badges`)

    const stats = await prisma.artistStats.deleteMany()
    console.log(`✅ Deleted ${stats.count} artist stats`)

    const holders = await prisma.artistHolder.deleteMany()
    console.log(`✅ Deleted ${holders.count} artist holders`)

    // Delete all artists except Global (artistId = 0)
    const artists = await prisma.artist.deleteMany({
      where: {
        artistId: {
          not: 0
        }
      }
    })
    console.log(`✅ Deleted ${artists.count} artists (kept Global)`)

    console.log('\n✨ Test data cleared! Badge definitions and Global artist remain.\n')

    // Show what's left
    const remainingBadges = await prisma.badge.count()
    const remainingArtists = await prisma.artist.count()
    
    console.log('📊 Remaining data:')
    console.log(`   Badges: ${remainingBadges}`)
    console.log(`   Artists: ${remainingArtists} (Global placeholder)`)
    console.log('')

  } catch (error) {
    console.error('\n❌ Error clearing data:', error)
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

