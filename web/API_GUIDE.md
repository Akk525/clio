# 🌐 API Routes Documentation

## Overview

Complete REST API for the Clio social layer. All routes return JSON and use Prisma for database queries.

---

## 📍 Available Endpoints

### User Profile Routes

#### 1. GET `/api/profile/[address]/badges`
Get all badges earned by a wallet address.

**Parameters:**
- `address` - Ethereum wallet address (0x...)

**Response:**
```json
[
  {
    "badgeId": "PROMETHEAN_BACKER",
    "displayName": "Promethean Backer",
    "description": "First 5 holders of an artist",
    "artistId": 1,
    "artistName": "Taylor Swift",
    "artistHandle": "@taylorswift",
    "awardedAt": "2024-12-05T10:30:45.000Z",
    "meta": {
      "holderRank": 1
    }
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/profile/0xABC...DEF/badges
```

---

#### 2. GET `/api/profile/[address]`
Get complete profile for a wallet address.

**Parameters:**
- `address` - Ethereum wallet address (0x...)

**Response:**
```json
{
  "address": "0xabc...def",
  "artists": [
    {
      "artistId": 1,
      "name": "Taylor Swift",
      "handle": "@taylorswift",
      "genre": "pop"
    }
  ],
  "badges": [
    {
      "badgeId": "PROMETHEAN_BACKER",
      "artistId": 1,
      "awardedAt": "2024-12-05T10:30:45.000Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/profile/0xABC...DEF
```

---

### Artist Routes

#### 3. GET `/api/artists/[artistId]/supporters`
Get all supporters (holders) and their badges for an artist.

**Parameters:**
- `artistId` - Artist ID (number)

**Response:**
```json
[
  {
    "userAddress": "0xabc...def",
    "badges": [
      {
        "badgeId": "PROMETHEAN_BACKER",
        "displayName": "Promethean Backer",
        "awardedAt": "2024-12-05T10:30:45.000Z"
      }
    ]
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/artists/1/supporters
```

---

### Global Routes

#### 4. GET `/api/stats`
Get global statistics about the badge system.

**Response:**
```json
{
  "totalArtists": 42,
  "totalHolders": 1337,
  "totalBadgesAwarded": 523,
  "totalUsers": 420,
  "badgeDistribution": [
    {
      "badgeId": "PROMETHEAN_BACKER",
      "displayName": "Promethean Backer",
      "count": 125
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/stats
```

---

#### 5. GET `/api/leaderboard`
Get leaderboard of users with most badges.

**Query Parameters:**
- `limit` - Number of results (1-100, default: 10)

**Response:**
```json
[
  {
    "userAddress": "0xabc...def",
    "totalBadges": 15,
    "uniqueBadgeTypes": 5,
    "badges": [
      {
        "badgeId": "PROMETHEAN_BACKER",
        "displayName": "Promethean Backer",
        "artistId": 1
      }
    ]
  }
]
```

**Example:**
```bash
curl http://localhost:3000/api/leaderboard?limit=20
```

---

## 🧪 Testing the APIs

### Using curl

```bash
# Test profile badges
curl http://localhost:3000/api/profile/0xTestBuyer123456789012345678901234567890/badges

# Test full profile
curl http://localhost:3000/api/profile/0xTestBuyer123456789012345678901234567890

# Test artist supporters
curl http://localhost:3000/api/artists/100/supporters

# Test stats
curl http://localhost:3000/api/stats

# Test leaderboard
curl http://localhost:3000/api/leaderboard?limit=5
```

### Using JavaScript/TypeScript

```typescript
// Get user badges
const badges = await fetch(
  `http://localhost:3000/api/profile/${address}/badges`
).then(res => res.json())

// Get full profile
const profile = await fetch(
  `http://localhost:3000/api/profile/${address}`
).then(res => res.json())

// Get artist supporters
const supporters = await fetch(
  `http://localhost:3000/api/artists/${artistId}/supporters`
).then(res => res.json())

// Get stats
const stats = await fetch(
  'http://localhost:3000/api/stats'
).then(res => res.json())

// Get leaderboard
const leaderboard = await fetch(
  'http://localhost:3000/api/leaderboard?limit=10'
).then(res => res.json())
```

### Using React

```tsx
// Example: Display user badges
import { useEffect, useState } from 'react'

function UserBadges({ address }: { address: string }) {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/profile/${address}/badges`)
      .then(res => res.json())
      .then(data => {
        setBadges(data)
        setLoading(false)
      })
  }, [address])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Badges ({badges.length})</h2>
      {badges.map((badge) => (
        <div key={`${badge.badgeId}-${badge.artistId}`}>
          <h3>{badge.displayName}</h3>
          <p>{badge.description}</p>
          {badge.artistName && <p>Artist: {badge.artistName}</p>}
        </div>
      ))}
    </div>
  )
}
```

---

## 🔍 Error Handling

All routes return appropriate HTTP status codes:

### 200 - Success
```json
{
  "data": "..."
}
```

### 400 - Bad Request
```json
{
  "error": "Invalid wallet address format"
}
```

### 404 - Not Found
```json
{
  "error": "Artist not found"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📊 Response Formats

### Badge Object
```typescript
{
  badgeId: string          // e.g., "PROMETHEAN_BACKER"
  displayName: string      // e.g., "Promethean Backer"
  description: string      // e.g., "First 5 holders..."
  artistId: number | null  // null for global badges
  artistName: string | null
  artistHandle: string | null
  awardedAt: string        // ISO 8601 timestamp
  meta: any                // Badge-specific data
}
```

### Artist Object
```typescript
{
  artistId: number
  name: string
  handle: string
  genre: string | null
}
```

### Supporter Object
```typescript
{
  userAddress: string
  badges: Array<{
    badgeId: string
    displayName: string
    awardedAt: string
  }>
}
```

---

## 🚀 Performance Considerations

### Caching

Consider adding caching for frequently accessed data:

```typescript
// Example: Cache stats for 5 minutes
export const revalidate = 300 // seconds

export async function GET() {
  // ... fetch stats
}
```

### Pagination

For large datasets, add pagination:

```typescript
const { searchParams } = new URL(request.url)
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')

const skip = (page - 1) * limit

const results = await prisma.userBadge.findMany({
  skip,
  take: limit,
  // ...
})
```

### Indexes

Ensure database indexes exist for common queries:

```prisma
model UserBadge {
  // ...
  
  @@index([userAddress])
  @@index([artistId])
  @@index([badgeId])
}
```

---

## 🔐 Security Considerations

### Rate Limiting

Add rate limiting in production:

```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: /* ... */,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function GET(request: Request) {
  const identifier = request.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // ... rest of handler
}
```

### Input Validation

All routes validate input parameters:
- Wallet addresses must be 42 characters starting with 0x
- Artist IDs must be positive integers
- Limits must be within bounds

### CORS

Add CORS headers if needed:

```typescript
const response = NextResponse.json(data)
response.headers.set('Access-Control-Allow-Origin', '*')
return response
```

---

## 📁 File Structure

```
app/api/
├── profile/
│   └── [address]/
│       ├── badges/
│       │   └── route.ts       # User badges
│       └── route.ts           # Full profile
├── artists/
│   └── [artistId]/
│       └── supporters/
│           └── route.ts       # Artist supporters
├── stats/
│   └── route.ts               # Global stats
└── leaderboard/
    └── route.ts               # Badge leaderboard
```

---

## 🧪 Development Testing

### Start the Server

```bash
npm run dev
```

### Test with Sample Data

```bash
# Run badge tests to populate DB
npm run badge:test

# Then test APIs
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/leaderboard
```

### Inspect Database

```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

---

## 🎯 Usage Examples

### Frontend Components

```tsx
// components/UserProfile.tsx
export function UserProfile({ address }: { address: string }) {
  const { data, loading } = useSWR(
    `/api/profile/${address}`,
    fetcher
  )
  
  if (loading) return <Skeleton />
  
  return (
    <div>
      <h1>Profile: {address}</h1>
      <section>
        <h2>Artists ({data.artists.length})</h2>
        {data.artists.map(artist => (
          <ArtistCard key={artist.artistId} {...artist} />
        ))}
      </section>
      <section>
        <h2>Badges ({data.badges.length})</h2>
        {data.badges.map(badge => (
          <BadgeCard key={badge.badgeId} {...badge} />
        ))}
      </section>
    </div>
  )
}
```

---

## ✅ Verification

Your APIs are working if:

✅ `curl http://localhost:3000/api/stats` returns data
✅ `curl http://localhost:3000/api/leaderboard` returns users
✅ Profile endpoints return user data
✅ Artist endpoints return supporters
✅ No 500 errors in console

---

## 📚 Related Files

- `app/api/*/route.ts` - API route handlers
- `lib/prisma.ts` - Database client
- `prisma/schema.prisma` - Database schema
- `API_GUIDE.md` - This file

---

**Your API is production-ready!** 🚀

Connect your frontend and start displaying badges!

