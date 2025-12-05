/**
 * GET /api/leaderboard
 * 
 * Returns leaderboard of users with most badges
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // CORS headers for temporary frontend
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400, headers }
      )
    }

    // Get badge counts by user
    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['userAddress'],
      _count: {
        badgeId: true,
      },
      orderBy: {
        _count: {
          badgeId: 'desc',
        },
      },
      take: limit,
    })

    // Get details for top users
    const leaderboard = await Promise.all(
      badgeCounts.map(async (item) => {
        // Get unique badges for this user
        const badges = await prisma.userBadge.findMany({
          where: {
            userAddress: item.userAddress,
          },
          include: {
            badge: {
              select: {
                displayName: true,
              },
            },
          },
        })

        // Count unique badge types
        const uniqueBadgeTypes = new Set(badges.map((b) => b.badgeId))

        return {
          userAddress: item.userAddress,
          totalBadges: item._count.badgeId,
          uniqueBadgeTypes: uniqueBadgeTypes.size,
          badges: badges.map((b) => ({
            badgeId: b.badgeId,
            displayName: b.badge.displayName,
            artistId: b.artistId,
          })),
        }
      })
    )

    return NextResponse.json(leaderboard, { headers })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
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

