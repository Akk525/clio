/**
 * GET /api/artists/[artistId]/supporters
 * 
 * Returns all supporters (holders) of an artist and their badges
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    // CORS headers for temporary frontend
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    const { artistId } = params

    // Validate artistId is a number
    const artistIdNum = parseInt(artistId, 10)
    if (isNaN(artistIdNum) || artistIdNum < 0) {
      return NextResponse.json(
        { error: 'Invalid artist ID' },
        { status: 400, headers }
      )
    }

    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { artistId: artistIdNum },
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404, headers }
      )
    }

    // Get all holders of this artist
    const holders = await prisma.artistHolder.findMany({
      where: {
        artistId: artistIdNum,
      },
      orderBy: {
        firstBuyTime: 'asc', // Earliest supporters first
      },
    })

    // Get all badges for this artist
    const artistBadges = await prisma.userBadge.findMany({
      where: {
        artistId: artistIdNum,
      },
      include: {
        badge: {
          select: {
            badgeId: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        awardedAt: 'desc',
      },
    })

    // Group badges by user address
    const badgesByUser = artistBadges.reduce((acc, ub) => {
      if (!acc[ub.userAddress]) {
        acc[ub.userAddress] = []
      }
      acc[ub.userAddress].push({
        badgeId: ub.badgeId,
        displayName: ub.badge.displayName,
        awardedAt: ub.awardedAt.toISOString(),
      })
      return acc
    }, {} as Record<string, Array<{ badgeId: string; displayName: string; awardedAt: string }>>)

    // Build response: all holders with their badges
    const response = holders.map((holder) => ({
      userAddress: holder.userAddress,
      badges: badgesByUser[holder.userAddress] || [],
    }))

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching artist supporters:', error)
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

