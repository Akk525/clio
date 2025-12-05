/**
 * Badge Engine - Processes buy events and awards badges
 * 
 * This module handles all badge detection logic for the Clio artist market.
 * It processes Bought events from the BondingCurveMarket contract and
 * awards badges based on user behavior and artist growth.
 */

import { prisma } from './prisma'

export type BuyEvent = {
  artistId: number
  buyer: string
  tokenAmount: bigint
  newSupply: bigint
  newPrice: bigint
  blockNumber: number
  timestamp: Date
}

/**
 * Main entry point for processing a buy event
 * 
 * Flow:
 * 1. Update artist holders and get current holder count
 * 2. Insert stats snapshot
 * 3. Run all badge checks
 */
export async function processBuyEvent(e: BuyEvent): Promise<void> {
  console.log(`\n🎯 Processing buy event for Artist ${e.artistId}`)
  console.log(`   Buyer: ${e.buyer}`)
  console.log(`   Amount: ${e.tokenAmount}`)
  console.log(`   Block: ${e.blockNumber}`)

  try {
    // Normalize address to lowercase
    const buyer = e.buyer.toLowerCase()

    // 1. Update artist holders and get holder count
    const holderCount = await updateArtistHolders(
      e.artistId,
      buyer,
      e.blockNumber,
      e.timestamp
    )
    console.log(`   ✅ Updated holders (total: ${holderCount})`)

    // 2. Insert artist stats snapshot
    await insertArtistStats(
      e.artistId,
      e.blockNumber,
      e.newPrice,
      holderCount,
      e.timestamp
    )
    console.log(`   ✅ Inserted stats snapshot`)

    // 3. Run all badge checks
    console.log(`   🏆 Running badge checks...`)
    
    await checkPrometheanBacker(e.artistId, buyer, holderCount)
    await checkOracleOfRises(e.artistId, holderCount)
    await checkNereidNavigator(e.artistId, buyer, e.newPrice, e.timestamp)
    await checkMuseWanderer(buyer)
    await checkTitanOfSupport(e.artistId, buyer, e.tokenAmount, e.newSupply)

    console.log(`   ✨ Buy event processed successfully\n`)
  } catch (error) {
    console.error(`   ❌ Error processing buy event:`, error)
    throw error
  }
}

/**
 * Update or create artist holder record
 * 
 * - Creates new holder if first time buying this artist
 * - Sets isEarly50 flag if within first 50 holders
 * - Returns current total holder count
 */
async function updateArtistHolders(
  artistId: number,
  buyer: string,
  blockNumber: number,
  timestamp: Date
): Promise<number> {
  // Ensure artist exists (auto-create if from blockchain event)
  const artist = await prisma.artist.findUnique({
    where: { artistId }
  })

  if (!artist) {
    // Auto-create artist if it doesn't exist
    // In production, this would come from ArtistRegistry events
    await prisma.artist.create({
      data: {
        artistId,
        tokenAddress: `0x${artistId.toString(16).padStart(40, '0')}`, // Placeholder
        name: `Artist ${artistId}`,
        handle: `@artist${artistId}`,
        genre: null,
        createdAt: timestamp,
      },
    })
    console.log(`   ℹ️  Auto-created artist ${artistId} (will be updated from ArtistRegistry)`)
  }

  // Check if holder already exists
  const existingHolder = await prisma.artistHolder.findUnique({
    where: {
      artistId_userAddress: {
        artistId,
        userAddress: buyer,
      },
    },
  })

  // If new holder, create record
  if (!existingHolder) {
    await prisma.artistHolder.create({
      data: {
        artistId,
        userAddress: buyer,
        firstBuyBlock: blockNumber,
        firstBuyTime: timestamp,
        isEarly50: false, // Will update below if needed
      },
    })
  }

  // Count total distinct holders for this artist
  const holderCount = await prisma.artistHolder.count({
    where: { artistId },
  })

  // Update isEarly50 flag if within first 50 holders
  if (!existingHolder && holderCount <= 50) {
    await prisma.artistHolder.update({
      where: {
        artistId_userAddress: {
          artistId,
          userAddress: buyer,
        },
      },
      data: {
        isEarly50: true,
      },
    })
  }

  return holderCount
}

/**
 * Insert a stats snapshot for this artist at this moment
 * 
 * Stores: price, holder count, block number, timestamp
 */
async function insertArtistStats(
  artistId: number,
  blockNumber: number,
  newPrice: bigint,
  holderCount: number,
  timestamp: Date
): Promise<void> {
  await prisma.artistStats.create({
    data: {
      artistId,
      blockNumber,
      price: newPrice.toString(), // Store as string for SQLite
      holderCount,
      createdAt: timestamp,
    },
  })
}

/**
 * BADGE CHECK: Promethean Backer
 * 
 * "First 5 holders of an artist"
 * 
 * Awards badge if this buyer is among the first 5 holders
 */
async function checkPrometheanBacker(
  artistId: number,
  buyer: string,
  holderCount: number
): Promise<void> {
  // Only award if within first 5 holders
  if (holderCount > 5) return

  try {
    // Check if badge already exists
    const existing = await prisma.userBadge.findFirst({
      where: {
        userAddress: buyer,
        badgeId: 'PROMETHEAN_BACKER',
        artistId,
      },
    })

    if (!existing) {
      await prisma.userBadge.create({
        data: {
          userAddress: buyer,
          badgeId: 'PROMETHEAN_BACKER',
          artistId,
          meta: JSON.stringify({ holderRank: holderCount }),
        },
      })
      console.log(`      🏆 Awarded PROMETHEAN_BACKER to ${buyer.substring(0, 10)}...`)
    }
  } catch (error) {
    // Likely duplicate, ignore
    console.log(`      ℹ️  PROMETHEAN_BACKER already awarded to ${buyer.substring(0, 10)}...`)
  }
}

/**
 * BADGE CHECK: Oracle of Rises
 * 
 * "Early holder in artists that later reach 200+ holders"
 * 
 * When an artist crosses 200 holders, award badge to all early50 holders
 */
async function checkOracleOfRises(
  artistId: number,
  currentHolderCount: number
): Promise<void> {
  // Only trigger when crossing the 200 holder threshold
  if (currentHolderCount < 200) return

  // Get previous stats to check if we just crossed threshold
  const previousStats = await prisma.artistStats.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
    take: 2, // Current and previous
  })

  // Need at least 2 stats entries to compare
  if (previousStats.length < 2) return

  const prevHolderCount = previousStats[1].holderCount

  // Check if we just crossed the threshold
  if (prevHolderCount >= 200) return // Already crossed before

  console.log(`      🎯 Artist ${artistId} crossed 200 holders! Awarding ORACLE_OF_RISES...`)

  // Find all early50 holders for this artist
  const earlyHolders = await prisma.artistHolder.findMany({
    where: {
      artistId,
      isEarly50: true,
    },
  })

  // Award badge to each early holder
  for (const holder of earlyHolders) {
    try {
      // Check if badge already exists
      const existing = await prisma.userBadge.findFirst({
        where: {
          userAddress: holder.userAddress,
          badgeId: 'ORACLE_OF_RISES',
          artistId,
        },
      })

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userAddress: holder.userAddress,
            badgeId: 'ORACLE_OF_RISES',
            artistId,
            meta: JSON.stringify({
              crossedAt: currentHolderCount,
              earlyRank: holder.firstBuyBlock,
            }),
          },
        })
        console.log(`      🏆 Awarded ORACLE_OF_RISES to ${holder.userAddress.substring(0, 10)}...`)
      }
    } catch (error) {
      // Likely duplicate, continue
    }
  }
}

/**
 * BADGE CHECK: Nereid Navigator
 * 
 * "Bought during a 15%+ price dip"
 * 
 * Compares current price to price from 1 hour ago
 * Awards if price dropped by 15% or more
 */
async function checkNereidNavigator(
  artistId: number,
  buyer: string,
  currentPrice: bigint,
  now: Date
): Promise<void> {
  // Calculate timestamp from 1 hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  // Get the most recent stat from at least 1 hour ago
  const oldStats = await prisma.artistStats.findFirst({
    where: {
      artistId,
      createdAt: {
        lte: oneHourAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // If no historical data, can't determine dip
  if (!oldStats) return

  const priceOneHourAgo = BigInt(oldStats.price)
  
  // Guard against division by zero
  if (priceOneHourAgo === 0n) return

  // Calculate ratio: currentPrice / priceOneHourAgo
  // If ratio <= 0.85, it's a 15%+ dip
  const ratio = Number(currentPrice) / Number(priceOneHourAgo)

  if (ratio <= 0.85) {
    try {
      // Check if badge already exists
      const existing = await prisma.userBadge.findFirst({
        where: {
          userAddress: buyer,
          badgeId: 'NEREID_NAVIGATOR',
          artistId,
        },
      })

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userAddress: buyer,
            badgeId: 'NEREID_NAVIGATOR',
            artistId,
            meta: JSON.stringify({
              priceBefore: priceOneHourAgo.toString(),
              priceAfter: currentPrice.toString(),
              ratio: ratio.toFixed(4),
              dipPercent: ((1 - ratio) * 100).toFixed(2),
            }),
          },
        })
        console.log(`      🏆 Awarded NEREID_NAVIGATOR to ${buyer.substring(0, 10)}... (bought during ${((1 - ratio) * 100).toFixed(1)}% dip)`)
      }
    } catch (error) {
      // Likely duplicate
    }
  }
}

/**
 * BADGE CHECK: Muse Wanderer
 * 
 * "Supports artists across 8+ genres"
 * 
 * Global badge (artistId = 0)
 * Counts distinct genres this buyer has purchased from
 */
async function checkMuseWanderer(buyer: string): Promise<void> {
  // Get all artists this buyer holds, with genre info
  const holdersWithGenres = await prisma.artistHolder.findMany({
    where: {
      userAddress: buyer,
    },
    include: {
      artist: {
        select: {
          genre: true,
        },
      },
    },
  })

  // Extract unique non-null genres
  const uniqueGenres = new Set(
    holdersWithGenres
      .map(h => h.artist.genre)
      .filter(g => g !== null && g !== undefined)
  )

  const genreCount = uniqueGenres.size

  // Award if 8+ genres
  if (genreCount >= 8) {
    try {
      // Check if badge already exists
      const existing = await prisma.userBadge.findFirst({
        where: {
          userAddress: buyer,
          badgeId: 'MUSE_WANDERER',
          artistId: undefined, // Global badge
        },
      })

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userAddress: buyer,
            badgeId: 'MUSE_WANDERER',
            artistId: undefined, // Global badge
            meta: JSON.stringify({
              genreCount,
              genres: Array.from(uniqueGenres),
            }),
          },
        })
        console.log(`      🏆 Awarded MUSE_WANDERER to ${buyer.substring(0, 10)}... (${genreCount} genres)`)
      }
    } catch (error) {
      // Likely duplicate
    }
  }
}

/**
 * BADGE CHECK: Titan of Support
 * 
 * "Acquired at least 1% of an artist's supply in one buy"
 * 
 * Calculates share = tokenAmount / newSupply
 * Awards if share >= 1%
 */
async function checkTitanOfSupport(
  artistId: number,
  buyer: string,
  tokenAmount: bigint,
  newSupply: bigint
): Promise<void> {
  // Guard against division by zero
  if (newSupply === 0n) return

  // Calculate share as a percentage
  const share = Number(tokenAmount) / Number(newSupply)
  const sharePercent = share * 100

  // Award if 1% or more
  if (share >= 0.01) {
    try {
      // Check if badge already exists
      const existing = await prisma.userBadge.findFirst({
        where: {
          userAddress: buyer,
          badgeId: 'TITAN_OF_SUPPORT',
          artistId,
        },
      })

      if (!existing) {
        await prisma.userBadge.create({
          data: {
            userAddress: buyer,
            badgeId: 'TITAN_OF_SUPPORT',
            artistId,
            meta: JSON.stringify({
              sharePercent: sharePercent.toFixed(4),
              tokenAmount: tokenAmount.toString(),
              totalSupply: newSupply.toString(),
            }),
          },
        })
        console.log(`      🏆 Awarded TITAN_OF_SUPPORT to ${buyer.substring(0, 10)}... (${sharePercent.toFixed(2)}% share)`)
      }
    } catch (error) {
      // Likely duplicate
    }
  }
}

/**
 * Helper: Get user's badges for a specific artist
 */
export async function getUserBadgesForArtist(
  userAddress: string,
  artistId: number | undefined
) {
  const badges = await prisma.userBadge.findMany({
    where: {
      userAddress: userAddress.toLowerCase(),
      artistId,
    },
    include: {
      badge: true,
    },
  })
  return badges
}

/**
 * Helper: Get all user's badges (including global)
 */
export async function getAllUserBadges(userAddress: string) {
  const badges = await prisma.userBadge.findMany({
    where: {
      userAddress: userAddress.toLowerCase(),
    },
    include: {
      badge: true,
      artist: true,
    },
  })
  return badges
}

/**
 * Helper: Get all badge holders for a specific badge and artist
 */
export async function getBadgeHolders(badgeId: string, artistId?: number) {
  const where: { badgeId: string; artistId?: number } = { badgeId }
  
  if (artistId !== undefined) {
    where.artistId = artistId
  }

  const holders = await prisma.userBadge.findMany({
    where,
    include: {
      badge: true,
      artist: true,
    },
  })
  return holders
}

