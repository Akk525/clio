/**
 * GET /api/stats
 * 
 * Returns global statistics about the badge system
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // CORS headers for temporary frontend
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Get counts
    const [
      totalArtists,
      totalHolders,
      totalBadgesAwarded,
      totalUsers,
      badgeDistribution,
    ] = await Promise.all([
      // Total artists (excluding Global placeholder)
      prisma.artist.count({
        where: {
          artistId: {
            not: 0,
          },
        },
      }),

      // Total holders
      prisma.artistHolder.count(),

      // Total badges awarded
      prisma.userBadge.count(),

      // Unique users with badges
      prisma.userBadge.findMany({
        select: {
          userAddress: true,
        },
        distinct: ['userAddress'],
      }),

      // Badge distribution
      prisma.userBadge.groupBy({
        by: ['badgeId'],
        _count: {
          badgeId: true,
        },
      }),
    ])

    // Get badge names
    const badges = await prisma.badge.findMany()
    const badgeMap = badges.reduce((acc, badge) => {
      acc[badge.badgeId] = badge.displayName
      return acc
    }, {} as Record<string, string>)

    // Format badge distribution
    const formattedDistribution = badgeDistribution.map((item) => ({
      badgeId: item.badgeId,
      displayName: badgeMap[item.badgeId] || item.badgeId,
      count: item._count.badgeId,
    }))

    const response = {
      totalArtists,
      totalHolders,
      totalBadgesAwarded,
      totalUsers: totalUsers.length,
      badgeDistribution: formattedDistribution,
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching stats:', error)
    const headers = {
      'Access-Control-Allow-Origin': '*',
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

