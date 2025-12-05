# Database Testing Workflow

This document outlines how to test and verify your SQLite database without a frontend.

## 🎯 Overview

Your Clio social layer database is fully functional and can be tested using multiple methods:

1. **Prisma Studio** (Visual GUI)
2. **Test Scripts** (Automated verification)
3. **Inspection Scripts** (Quick checks)
4. **Direct SQLite Access** (Advanced)

---

## 🖥️ Method 1: Prisma Studio (Visual GUI)

**Best for:** Visual inspection, manual data entry, exploring relationships

```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### What you can do:
- ✅ Browse all tables visually
- ✅ Add/edit/delete records with a GUI
- ✅ Filter and search data
- ✅ Follow relationships between tables
- ✅ Export data

**Use case:** When you want to manually verify badge awards, check artist data, or add test users.

---

## 🧪 Method 2: Comprehensive Test Script

**Best for:** Full system verification, automated testing

```bash
npx tsx scripts/test-db.ts
```

### What it tests:
1. ✅ Badge seeding (all 5 badges)
2. ✅ Artist creation
3. ✅ Artist holders tracking
4. ✅ Artist stats recording
5. ✅ Badge awarding (artist-specific and global)
6. ✅ Complex queries with relations
7. ✅ User badge lookups
8. ✅ Early holder identification
9. ✅ Aggregate statistics
10. ✅ Badge distribution analysis

**Use case:** Run after schema changes or before deploying to ensure everything works.

---

## 🔍 Method 3: Quick Inspection Script

**Best for:** Quick database state checks

```bash
npx tsx scripts/inspect-db.ts
```

### What it shows:
- 📋 All badges
- 🎨 All artists with counts
- 👥 All holders
- 📊 Recent stats (last 10)
- 🏆 All awarded badges by user
- 📈 Summary statistics

**Use case:** Quick sanity check of current database state.

---

## 💾 Method 4: Direct SQLite Access

**Best for:** Advanced queries, debugging

```bash
cd web/prisma
sqlite3 dev.db
```

### Useful SQLite commands:
```sql
-- List all tables
.tables

-- Show table schema
.schema Artist

-- Query data
SELECT * FROM Badge;
SELECT * FROM Artist WHERE genre = 'pop';
SELECT * FROM UserBadge WHERE userAddress LIKE '0xUser1%';

-- Count records
SELECT COUNT(*) FROM ArtistHolder WHERE isEarly50 = 1;

-- Exit
.exit
```

**Use case:** Custom queries, performance testing, debugging foreign keys.

---

## 🔄 Testing Your Badge Logic

### Scenario 1: Test "Promethean Backer" Badge
> "First 5 holders of an artist"

```typescript
// In a test script
import { prisma } from '../lib/prisma'

// Create artist
const artist = await prisma.artist.create({
  data: {
    artistId: 2,
    tokenAddress: '0xABC...',
    name: 'Drake',
    handle: '@drake',
    genre: 'rap'
  }
})

// Add 5 early holders
for (let i = 1; i <= 5; i++) {
  const holder = await prisma.artistHolder.create({
    data: {
      artistId: 2,
      userAddress: `0xEarlyHolder${i}`,
      firstBuyBlock: 1000 + i,
      firstBuyTime: new Date(),
      isEarly50: true
    }
  })
  
  // Award badge
  await prisma.userBadge.create({
    data: {
      userAddress: holder.userAddress,
      badgeId: 'PROMETHEAN_BACKER',
      artistId: 2,
      meta: JSON.stringify({ position: i })
    }
  })
}

// Verify
const badges = await prisma.userBadge.count({
  where: {
    badgeId: 'PROMETHEAN_BACKER',
    artistId: 2
  }
})
console.log(`Awarded ${badges} Promethean Backer badges`) // Should be 5
```

### Scenario 2: Test "Muse Wanderer" Badge
> "Supports artists across 8+ genres"

```typescript
// Award global badge
await prisma.userBadge.create({
  data: {
    userAddress: '0xMusicLover123',
    badgeId: 'MUSE_WANDERER',
    artistId: 0, // Global badge
    meta: JSON.stringify({
      genres: ['pop', 'rap', 'rock', 'jazz', 'edm', 'country', 'indie', 'classical']
    })
  }
})

// Query user's global badges
const globalBadges = await prisma.userBadge.findMany({
  where: {
    userAddress: '0xMusicLover123',
    artistId: 0
  },
  include: { badge: true }
})
```

---

## 📊 Testing Stats Tracking

```typescript
// Simulate price and holder growth
const snapshots = [
  { block: 1000, price: '0.01', holders: 5 },
  { block: 1100, price: '0.05', holders: 25 },
  { block: 1200, price: '0.15', holders: 50 },
  { block: 1300, price: '0.45', holders: 150 },
  { block: 1400, price: '0.80', holders: 250 },
]

for (const snap of snapshots) {
  await prisma.artistStats.create({
    data: {
      artistId: 1,
      blockNumber: snap.block,
      price: snap.price,
      holderCount: snap.holders,
      createdAt: new Date()
    }
  })
}

// Query growth
const growth = await prisma.artistStats.findMany({
  where: { artistId: 1 },
  orderBy: { blockNumber: 'asc' }
})

console.log('Price growth:', growth.map(g => g.price))
console.log('Holder growth:', growth.map(g => g.holderCount))
```

---

## 🧹 Cleanup & Reset

### Clear test data (keep badges):
```bash
npx tsx -e "
import { prisma } from './lib/prisma.js';
await prisma.userBadge.deleteMany();
await prisma.artistStats.deleteMany();
await prisma.artistHolder.deleteMany();
await prisma.artist.deleteMany({ where: { artistId: { not: 0 } } });
await prisma.\$disconnect();
console.log('Test data cleared!');
"
```

### Full reset (including badges):
```bash
# Delete database
rm web/prisma/dev.db

# Recreate and seed
cd web
npm run prisma:migrate
```

---

## 📝 Database Schema Summary

### Artist
- Primary Key: `artistId` (from blockchain)
- Unique: `tokenAddress`
- Relations: holders, stats, userBadges

### ArtistHolder
- Composite Key: `[artistId, userAddress]`
- Tracks: first buy block/time, early50 status
- Relations: artist

### ArtistStats
- Auto-increment ID
- Tracks: price, holder count, block number
- Relations: artist

### Badge
- Primary Key: `badgeId` (string constant)
- Contains: display name, description
- Relations: userBadges

### UserBadge
- Composite Key: `[userAddress, badgeId, artistId]`
- `artistId = 0` for global badges
- Optional: `meta` field for badge-specific data
- Relations: badge, artist

---

## 🎯 Current Database State

After running the test script:

```
📊 SUMMARY:
   Artists: 2 (1 Global placeholder + 1 Taylor Swift)
   Holders: 3
   Stats Entries: 6
   Badges: 5 (all seeded)
   Badges Awarded: 3
```

---

## ✅ Testing Checklist

Before building frontend features:

- [ ] All 5 badges exist in Badge table
- [ ] Can create artists with unique token addresses
- [ ] Can track holders with composite keys
- [ ] Can record stats over time
- [ ] Can award artist-specific badges (artistId > 0)
- [ ] Can award global badges (artistId = 0)
- [ ] Can query user's badges across artists
- [ ] Can identify early holders (isEarly50)
- [ ] Can track stats history per artist
- [ ] Foreign keys work correctly

---

## 🚀 Next Steps

1. **Build Badge Engine Logic**
   - Create `lib/badge-engine.ts`
   - Implement detection logic for each badge
   - Test with mock blockchain events

2. **Add Event Listeners**
   - Listen to `Bought` events from BondingCurveMarket
   - Trigger badge checks on each purchase
   - Update ArtistStats on price changes

3. **Create API Routes**
   - `GET /api/artist/[id]/badges` - Get badges for an artist's holders
   - `GET /api/user/[address]/badges` - Get badges for a user
   - `GET /api/artist/[id]/stats` - Get historical stats

4. **Build Frontend Components**
   - Badge display components
   - Artist stats charts
   - User profile with badges
   - Leaderboards

---

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [Prisma Studio Guide](https://www.prisma.io/docs/concepts/components/prisma-studio)

---

**Database is ready! 🎉**

All tests passing. You can now build badge logic and API routes with confidence.

