/**
 * GET /api/profile/[address]/badges
 * 
 * Returns all badges earned by a wallet address
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

    // Fetch all badges for this address
    const userBadges = await prisma.userBadge.findMany({
      where: {
        userAddress: normalizedAddress,
      },
      include: {
        badge: true,
        artist: {
          select: {
            artistId: true,
            name: true,
            handle: true,
          },
        },
      },
      orderBy: {
        awardedAt: 'desc', // Newest first
      },
    })

    // Transform to response format
    const response = userBadges.map((ub) => ({
      badgeId: ub.badgeId,
      displayName: ub.badge.displayName,
      description: ub.badge.description,
      artistId: ub.artistId,
      artistName: ub.artist?.name || null,
      artistHandle: ub.artist?.handle || null,
      awardedAt: ub.awardedAt.toISOString(),
      meta: ub.meta ? JSON.parse(ub.meta) : null,
    }))

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching user badges:', error)
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

