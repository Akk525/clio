/**
 * GET /api/profile/[address]
 * 
 * Returns complete profile for a wallet address:
 * - Artists they hold
 * - Badges they've earned
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    // CORS headers for temporary frontend
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    const { address } = params

    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400, headers }
      )
    }

    // Normalize to lowercase
    const normalizedAddress = address.toLowerCase()

    // Fetch all artists this user holds
    const artistHoldings = await prisma.artistHolder.findMany({
      where: {
        userAddress: normalizedAddress,
      },
      include: {
        artist: {
          select: {
            artistId: true,
            name: true,
            handle: true,
            genre: true,
          },
        },
      },
      orderBy: {
        firstBuyTime: 'asc', // Oldest first (first supporter shows first)
      },
    })

    // Fetch all badges
    const userBadges = await prisma.userBadge.findMany({
      where: {
        userAddress: normalizedAddress,
      },
      select: {
        badgeId: true,
        artistId: true,
        awardedAt: true,
      },
      orderBy: {
        awardedAt: 'desc',
      },
    })

    // Build response
    const response = {
      address: normalizedAddress,
      artists: artistHoldings.map((ah) => ({
        artistId: ah.artist.artistId,
        name: ah.artist.name,
        handle: ah.artist.handle,
        genre: ah.artist.genre,
      })),
      badges: userBadges.map((ub) => ({
        badgeId: ub.badgeId,
        artistId: ub.artistId,
        awardedAt: ub.awardedAt.toISOString(),
      })),
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching user profile:', error)
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

