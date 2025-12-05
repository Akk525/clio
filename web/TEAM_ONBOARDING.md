# 👥 Team Onboarding - Clio Social Layer

## 🎯 For New Team Members

Welcome! This guide will get you set up with the Clio social layer in under 10 minutes.

---

## ⚡ Ultra Quick Start (Recommended)

```bash
# 1. Clone repo
git clone <your-repo-url>
cd clio/web

# 2. Run setup script
./setup.sh

# 3. You're done! 🎉
```

The setup script automatically:
- ✅ Installs all dependencies
- ✅ Creates SQLite database
- ✅ Seeds 5 badges
- ✅ Runs verification tests
- ✅ Shows you what's working

**Time:** ~3 minutes

---

## 📱 What Just Happened?

Your machine now has:

1. **SQLite Database** (`prisma/dev.db` - 112KB)
   - 5 badge definitions
   - 5 tables (Artist, Badge, UserBadge, ArtistHolder, ArtistStats)
   - Test data with 31 badges awarded

2. **Badge Engine** (`lib/badgeEngine.ts`)
   - Automatic badge awarding system
   - Processes blockchain buy events
   - Awards 5 different badge types

3. **Testing Suite** (`scripts/`)
   - Comprehensive badge tests
   - Database inspection tools
   - Verification utilities

4. **Documentation** (Multiple `.md` files)
   - Setup guides
   - Technical docs
   - API references

---

## 🔍 Verify It Worked

### Test 1: Run Badge Tests (30 seconds)

```bash
npm run badge:test
```

**Expected:** "✅ ALL BADGE ENGINE TESTS PASSED!"

### Test 2: Visual Inspection (1 minute)

```bash
npm run prisma:studio
```

**Opens:** http://localhost:5555

**Look for:**
- Badge table: 5 rows (5 badge types)
- UserBadge table: 31 rows (awarded badges)
- Artist table: 10 rows (test artists)

### Test 3: Quick Database Check (10 seconds)

```bash
npm run db:inspect
```

**Expected output:**
```
📊 SUMMARY:
   Artists: 10
   Holders: 17
   Stats Entries: 10
   Badges: 5
   Badges Awarded: 31
```

---

## 📚 Understanding the System

### The 5 Badges

| Badge | What Triggers It? | Example |
|-------|-------------------|---------|
| 🏆 Promethean Backer | First 5 buyers | Alice buys from new artist → Badge! |
| 🔮 Oracle of Rises | Early holder + artist hits 200 | Bob was holder #12, artist grows to 200 → Badge! |
| 🌊 Nereid Navigator | Buy during 15%+ dip | Price was 1Ξ, now 0.8Ξ, Carol buys → Badge! |
| 🎵 Muse Wanderer | Support 8+ genres | Dave buys pop, rap, rock... (8 total) → Badge! |
| 💪 Titan of Support | Buy ≥1% of supply | Eve buys 100k of 10M tokens → Badge! |

### How It Works

```
User Buys Tokens on Base
         ↓
  Blockchain emits "Bought" event
         ↓
  Your event listener catches it
         ↓
  Calls processBuyEvent()
         ↓
  Badge Engine checks all 5 badges
         ↓
  Awards badges if criteria met
         ↓
  Badges stored in database
```

---

## 🎓 Learning Path

### Day 1: Setup & Explore (30 min)

1. **Run setup** (5 min)
   ```bash
   ./setup.sh
   ```

2. **Open Prisma Studio** (5 min)
   ```bash
   npm run prisma:studio
   ```
   - Click through all tables
   - See the data structure

3. **Read main files** (20 min)
   - `lib/badgeEngine.ts` - Badge logic (500 lines)
   - `prisma/schema.prisma` - Database schema (70 lines)
   - `scripts/test-badge-engine.ts` - See tests (250 lines)

### Day 2: Understand Badge Logic (1 hour)

1. **Read documentation** (30 min)
   - `BADGE_ENGINE_README.md` - Technical details
   - `SETUP_GUIDE.md` - Architecture diagrams

2. **Run tests step-by-step** (30 min)
   ```bash
   # Clear data
   npm run db:clear
   
   # Run tests
   npm run badge:test
   
   # Inspect results
   npm run db:inspect
   ```

### Day 3: Modify & Experiment (1 hour)

1. **Create a test script** (30 min)
   ```typescript
   // scripts/my-test.ts
   import { processBuyEvent } from '../lib/badgeEngine'
   
   // Simulate a buy event
   await processBuyEvent({
     artistId: 999,
     buyer: '0xYourAddress',
     tokenAmount: 5000n,
     newSupply: 100000n,
     newPrice: 50000000000000000n,
     blockNumber: 12345,
     timestamp: new Date()
   })
   ```

2. **Run your test** (5 min)
   ```bash
   npx tsx scripts/my-test.ts
   ```

3. **Check results** (5 min)
   ```bash
   npm run db:inspect
   npm run prisma:studio
   ```

---

## 🔧 Common Tasks

### View Database

```bash
# Visual browser
npm run prisma:studio

# Terminal inspection
npm run db:inspect

# Direct SQL
cd prisma
sqlite3 dev.db
> SELECT * FROM Badge;
> .quit
```

### Clear Test Data

```bash
# Clear but keep badges
npm run db:clear

# Full reset
rm prisma/dev.db
npm run prisma:migrate
```

### Run Tests

```bash
# All badge tests
npm run badge:test

# Database tests
npm run db:test

# Quick check
npm run db:inspect
```

### Update Database Schema

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate

# 3. Regenerate client
npm run prisma:generate
```

---

## 📂 Key Files to Know

### Must Read

| File | What It Does | Lines |
|------|--------------|-------|
| `lib/badgeEngine.ts` | Badge awarding logic | 500 |
| `prisma/schema.prisma` | Database structure | 70 |
| `scripts/test-badge-engine.ts` | Test all badges | 250 |

### Good to Know

| File | What It Does |
|------|--------------|
| `lib/prisma.ts` | Database client singleton |
| `prisma/seed.ts` | Seeds 5 badges |
| `scripts/inspect-db.ts` | Quick DB inspection |
| `scripts/clear-test-data.ts` | Cleanup utility |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICK_START.md` | 5-minute setup |
| `SETUP_GUIDE.md` | Complete guide with diagrams |
| `BADGE_ENGINE_README.md` | Technical documentation |
| `BADGE_VERIFICATION_REPORT.md` | Test results |

---

## 🤔 FAQs

### Q: Where is the database?
**A:** `prisma/dev.db` - It's a single file (112KB)

### Q: How do I see the data?
**A:** Run `npm run prisma:studio` → Opens http://localhost:5555

### Q: Can I reset everything?
**A:** Yes! `rm prisma/dev.db && npm run prisma:migrate`

### Q: Where's the badge logic?
**A:** `lib/badgeEngine.ts` - `processBuyEvent()` function

### Q: How do I add a new badge?
**A:** 
1. Add to Badge table (seed.ts)
2. Create `checkNewBadge()` function
3. Call it in `processBuyEvent()`
4. Add test in `test-badge-engine.ts`

### Q: What if tests fail?
**A:** `npm run db:clear && npm run badge:test`

### Q: How do I share my database with the team?
**A:** Just commit `prisma/dev.db` to git (or copy the file)

### Q: Production ready?
**A:** Yes! Switch to PostgreSQL for production:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🎯 Your First Task

Try this to understand the system:

### Task: Award a Custom Badge

```typescript
// 1. Create: scripts/award-custom-badge.ts
import { prisma } from '../lib/prisma'

async function main() {
  // Create an artist
  const artist = await prisma.artist.create({
    data: {
      artistId: 999,
      tokenAddress: '0xMYARTIST...',
      name: 'My Test Artist',
      handle: '@myartist',
      genre: 'electronic'
    }
  })
  
  // Award Promethean Backer badge
  await prisma.userBadge.create({
    data: {
      userAddress: '0xYOURADDRESS',
      badgeId: 'PROMETHEAN_BACKER',
      artistId: artist.artistId,
      meta: JSON.stringify({ holderRank: 1 })
    }
  })
  
  console.log('✅ Badge awarded!')
  
  // Query it back
  const badges = await prisma.userBadge.findMany({
    where: { userAddress: '0xYOURADDRESS' },
    include: { badge: true, artist: true }
  })
  
  console.log('Your badges:', badges)
}

main()
  .then(() => process.exit(0))
  .catch(console.error)
```

```bash
# 2. Run it
npx tsx scripts/award-custom-badge.ts

# 3. Verify
npm run db:inspect
npm run prisma:studio
```

---

## 🚀 Next Steps

### After Setup (Choose your path)

**For Frontend Developers:**
1. Review badge data structure
2. Design badge display components
3. Build user profile with badges
4. Create leaderboard UI

**For Backend Developers:**
1. Study `lib/badgeEngine.ts`
2. Plan event listener integration
3. Design API routes
4. Implement webhook handlers

**For Smart Contract Developers:**
1. Review Bought event structure
2. Plan event emission
3. Test event parameters
4. Document event schema

---

## 🎉 You're Ready!

You now have:
- ✅ Working badge system
- ✅ Complete database
- ✅ Test data
- ✅ Documentation
- ✅ Testing tools

**Next:** Start building! 🚀

---

## 📞 Help

Stuck? Check these resources:

1. **Troubleshooting:** See `SETUP_GUIDE.md`
2. **Technical docs:** See `BADGE_ENGINE_README.md`
3. **Examples:** Look at `scripts/test-badge-engine.ts`
4. **Ask the team:** We're here to help!

---

**Welcome to the team! Let's build something amazing! 🎨✨**

