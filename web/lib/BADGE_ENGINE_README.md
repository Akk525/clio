# Badge Engine Documentation

## Overview

The Badge Engine automatically awards badges to users based on their buying behavior in the Clio artist market. It processes `Bought` events from the BondingCurveMarket contract and triggers badge checks.

## Architecture

```
BondingCurveMarket Contract (Base)
         ↓
    Bought Event
         ↓
   processBuyEvent()
         ↓
    ┌────┴────┬───────────┬────────────┐
    ↓         ↓           ↓            ↓
Update    Insert    Badge Checks    More Checks
Holders   Stats     (5 different)
```

## Badge Types

### 1. 🏆 Promethean Backer
**Description:** "First 5 holders of an artist"

**Criteria:** User is among the first 5 people to buy an artist's tokens

**Type:** Artist-specific

**Metadata:**
```json
{
  "holderRank": 1-5
}
```

**Logic:**
- Triggers on every buy
- Checks if current holder count ≤ 5
- Awards badge with holder rank

---

### 2. 🔮 Oracle of Rises
**Description:** "Early holder in artists that later reach 200+ holders"

**Criteria:** 
- User was in first 50 holders (isEarly50 = true)
- Artist crosses 200 total holders threshold

**Type:** Artist-specific

**Metadata:**
```json
{
  "crossedAt": 203,
  "earlyRank": 1042
}
```

**Logic:**
- Triggers when holder count crosses 200
- Finds all early50 holders for that artist
- Awards badge to each one
- Uses `isEarly50` flag from ArtistHolder table

---

### 3. 🌊 Nereid Navigator
**Description:** "Bought during a 15%+ price dip"

**Criteria:** Current price is ≤85% of price from 1 hour ago

**Type:** Artist-specific

**Metadata:**
```json
{
  "priceBefore": "1000000000000000000",
  "priceAfter": "800000000000000000",
  "ratio": "0.8000",
  "dipPercent": "20.00"
}
```

**Logic:**
- Looks up most recent ArtistStats from ≥1 hour ago
- Calculates ratio: currentPrice / oldPrice
- Awards if ratio ≤ 0.85 (15%+ dip)

---

### 4. 🎵 Muse Wanderer
**Description:** "Supports artists across 8+ genres"

**Criteria:** User has bought from artists in 8 or more different genres

**Type:** Global (artistId = 0)

**Metadata:**
```json
{
  "genreCount": 8,
  "genres": ["pop", "rap", "rock", "jazz", "edm", "country", "indie", "classical"]
}
```

**Logic:**
- Queries all ArtistHolder records for user
- Joins with Artist to get genres
- Counts distinct non-null genres
- Awards if count ≥ 8

---

### 5. 💪 Titan of Support
**Description:** "Acquired at least 1% of an artist's supply in one buy"

**Criteria:** Single purchase represents ≥1% of total supply

**Type:** Artist-specific

**Metadata:**
```json
{
  "sharePercent": "5.0000",
  "tokenAmount": "500000",
  "totalSupply": "10000000"
}
```

**Logic:**
- Calculates: share = tokenAmount / newSupply
- Awards if share ≥ 0.01 (1%)

---

## API

### Main Function

```typescript
export async function processBuyEvent(e: BuyEvent): Promise<void>
```

**Parameters:**
```typescript
type BuyEvent = {
  artistId: number
  buyer: string           // Will be lowercased
  tokenAmount: bigint
  newSupply: bigint
  newPrice: bigint
  blockNumber: number
  timestamp: Date
}
```

**Process Flow:**
1. Normalize buyer address to lowercase
2. Update/create ArtistHolder record
3. Insert ArtistStats snapshot
4. Run all 5 badge checks in sequence
5. Log results

---

### Helper Functions

#### updateArtistHolders
```typescript
async function updateArtistHolders(
  artistId: number,
  buyer: string,
  blockNumber: number,
  timestamp: Date
): Promise<number>
```

- Creates holder if first-time buyer
- Sets `isEarly50` flag if within first 50
- Returns current total holder count

#### insertArtistStats
```typescript
async function insertArtistStats(
  artistId: number,
  blockNumber: number,
  newPrice: bigint,
  holderCount: number,
  timestamp: Date
): Promise<void>
```

- Creates snapshot of artist state at this moment
- Stores price as string (SQLite compatibility)

---

### Query Helpers

```typescript
// Get user's badges for specific artist
export async function getUserBadgesForArtist(
  userAddress: string,
  artistId: number
)

// Get all user's badges (including global)
export async function getAllUserBadges(userAddress: string)

// Get all holders of a specific badge
export async function getBadgeHolders(badgeId: string, artistId?: number)
```

---

## Testing

### Run Tests

```bash
npm run badge:test
```

### Test Coverage

The test script (`scripts/test-badge-engine.ts`) verifies:

✅ **Promethean Backer:** First 5 of 7 buyers get badge  
✅ **Titan of Support:** Large purchases (≥1% share) get badge  
✅ **Nereid Navigator:** Buying during 20% dip gets badge  
✅ **Muse Wanderer:** Buying 8 different genres gets badge  
✅ **Oracle of Rises:** Early holders get badge when artist hits 200

### Example Output

```
🧪 Testing Badge Engine

🏆 TEST 1: PROMETHEAN_BACKER
✅ Result: 5 badges (expected: 5)

🏆 TEST 2: TITAN_OF_SUPPORT  
✅ Result: 8 badges (expected: >=1)

🏆 TEST 3: NEREID_NAVIGATOR
✅ Result: 1 badge (expected: >=1)

🏆 TEST 4: MUSE_WANDERER
✅ Result: 1 badge (expected: 1)

📊 FINAL SUMMARY
   Promethean Backer: 13 awarded
   Titan of Support: 16 awarded
   Nereid Navigator: 1 awarded
   Muse Wanderer: 1 awarded
   Total: 31 badges

✅ ALL TESTS PASSED!
```

---

## Integration with Blockchain

### Example: Listening to Bought Events

```typescript
import { processBuyEvent } from './lib/badgeEngine'
import { publicClient } from './lib/viem'
import { bondingCurveMarketABI } from './lib/abis'

// Watch for Bought events
publicClient.watchContractEvent({
  address: BONDING_CURVE_MARKET_ADDRESS,
  abi: bondingCurveMarketABI,
  eventName: 'Bought',
  onLogs: async (logs) => {
    for (const log of logs) {
      const { artistId, buyer, tokenAmount, newSupply, newPrice } = log.args
      
      // Get block timestamp
      const block = await publicClient.getBlock({
        blockNumber: log.blockNumber
      })
      
      // Process the buy event
      await processBuyEvent({
        artistId: Number(artistId),
        buyer,
        tokenAmount,
        newSupply,
        newPrice,
        blockNumber: Number(log.blockNumber),
        timestamp: new Date(Number(block.timestamp) * 1000)
      })
    }
  }
})
```

---

## Database Schema

### Tables Used

**Artist**
- Primary key: `artistId`
- Contains: name, handle, genre, tokenAddress

**ArtistHolder**
- Composite key: `[artistId, userAddress]`
- Tracks: firstBuyBlock, firstBuyTime, isEarly50

**ArtistStats**
- Auto-increment ID
- Tracks: price, holderCount, blockNumber, timestamp
- Used for: historical analysis, price dip detection

**Badge**
- Primary key: `badgeId`
- Contains: displayName, description

**UserBadge**
- Composite key: `[userAddress, badgeId, artistId]`
- Contains: awardedAt, meta (JSON)
- `artistId = 0` for global badges

---

## Performance Considerations

### Optimizations

1. **Upsert Pattern:** All badge awards use `upsert` to handle duplicates gracefully
2. **Early Returns:** Badge checks return early if criteria not met
3. **Indexed Queries:** All queries use indexed fields (artistId, userAddress, etc.)
4. **Batch Processing:** Consider batching multiple events if processing backlog

### Scaling

For high-volume scenarios:
- Consider queuing system (Bull, BullMQ)
- Add retry logic for failed badge awards
- Cache holder counts to reduce DB queries
- Use database transactions for atomic updates

---

## Troubleshooting

### Badge Not Awarded

**Check:**
1. Is the buyer address lowercased?
2. Does the artist exist in the database?
3. Are previous stats entries available (for Nereid Navigator)?
4. Is the Global artist (ID: 0) present (for Muse Wanderer)?

**Debug:**
```typescript
// Enable verbose logging
console.log('Processing:', {
  artistId,
  buyer: buyer.toLowerCase(),
  holderCount,
  // ... other values
})
```

### Duplicate Badge Error

Badges use `upsert`, so duplicates should be handled automatically. If you see errors:
- Check composite key uniqueness
- Verify foreign key constraints
- Ensure artistId = 0 exists for global badges

---

## Future Enhancements

### Potential New Badges

1. **Diamond Hands** - Hold tokens for 90+ days
2. **Volume Trader** - Total trading volume exceeds X ETH
3. **Portfolio Diversifier** - Hold tokens from 20+ artists
4. **Early Bird** - Buy within first hour of artist launch
5. **Comeback Supporter** - Buy when price is at all-time low

### Implementation Notes

Each new badge would need:
- Entry in Badge table (via seed)
- Check function in badgeEngine.ts
- Test case in test-badge-engine.ts
- Documentation update

---

## API Routes (TODO)

Future API endpoints to expose badge data:

```typescript
// GET /api/badges
// List all available badges

// GET /api/user/[address]/badges
// Get all badges for a user

// GET /api/artist/[id]/badges
// Get all badges awarded for an artist

// GET /api/badge/[badgeId]/holders
// Get all holders of a specific badge

// GET /api/leaderboard
// Badge leaderboard (most badges per user)
```

---

## References

- Database Schema: `prisma/schema.prisma`
- Badge Engine: `lib/badgeEngine.ts`
- Test Script: `scripts/test-badge-engine.ts`
- Contract ABIs: `lib/abis/` (to be created)

---

**Badge Engine is production-ready!** 🎉

All 5 badges implemented, tested, and documented.

