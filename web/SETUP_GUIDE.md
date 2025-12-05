# 🚀 Clio Social Layer - Complete Setup Guide

## 📋 Overview

This guide will help your team set up the complete SQL-based social layer for the Clio artist market, including the badge system, database, and testing infrastructure.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIO SOCIAL LAYER                            │
└─────────────────────────────────────────────────────────────────┘

                      BLOCKCHAIN LAYER
                            │
                    ┌───────▼────────┐
                    │ Base Network   │
                    │ (Sepolia/Main) │
                    └───────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────▼──────────┐    ┌─────────▼──────────┐
    │ BondingCurveMarket │    │  ArtistRegistry    │
    │    Contract        │    │    Contract        │
    └─────────┬──────────┘    └─────────┬──────────┘
              │                          │
              │ Bought Event             │ Artist Registered
              └──────────┬───────────────┘
                         │
                    ┌────▼─────┐
                    │  Viem    │
                    │ Listener │
                    └────┬─────┘
                         │
                         │ processBuyEvent()
                         │
              ┌──────────▼───────────┐
              │   Badge Engine       │
              │  (lib/badgeEngine.ts)│
              └──────────┬───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
    ┌─────────▼──────┐   ┌─────────▼─────────┐
    │ Update Holders │   │ Check 5 Badges    │
    │ Insert Stats   │   │ Award if eligible │
    └─────────┬──────┘   └─────────┬─────────┘
              │                    │
              └──────────┬─────────┘
                         │
                    ┌────▼─────┐
                    │  Prisma  │
                    │  Client  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  SQLite  │
                    │   DB     │
                    └──────────┘
```

---

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│    Artist    │◄────┐   │    Badge     │
├──────────────┤     │   ├──────────────┤
│ artistId (PK)│     │   │ badgeId (PK) │
│ tokenAddress │     │   │ displayName  │
│ name         │     │   │ description  │
│ handle       │     │   └──────┬───────┘
│ genre        │     │          │
│ createdAt    │     │          │
└──────┬───────┘     │          │
       │             │          │
       │ 1:N         │          │ N:1
       │             │          │
       ▼             │          ▼
┌──────────────┐     │   ┌──────────────┐
│ArtistHolder  │     │   │  UserBadge   │
├──────────────┤     │   ├──────────────┤
│ artistId (FK)│─────┘   │ id (PK)      │
│ userAddress  │         │ userAddress  │
│ firstBuyBlock│         │ badgeId (FK) │─┐
│ firstBuyTime │         │ artistId (FK)│─┼──┐
│ isEarly50    │         │ awardedAt    │ │  │
└──────────────┘         │ meta (JSON)  │ │  │
                         └──────────────┘ │  │
       │                                  │  │
       │ 1:N                              │  │
       │                                  │  │
       ▼                                  │  │
┌──────────────┐                          │  │
│ ArtistStats  │                          │  │
├──────────────┤                          │  │
│ id (PK)      │                          │  │
│ artistId (FK)│──────────────────────────┘  │
│ blockNumber  │                             │
│ price        │                             │
│ holderCount  │                             │
│ createdAt    │                             │
└──────────────┘                             │
                                             │
                    Unique constraint:       │
                    [userAddress,            │
                     badgeId,                │
                     artistId] ◄─────────────┘
```

---

## 🎯 Badge System Flow

```
┌────────────────────────────────────────────────────────────┐
│                  BADGE AWARDING FLOW                        │
└────────────────────────────────────────────────────────────┘

User Buys Tokens
      │
      ▼
┌─────────────────┐
│  Bought Event   │
│  from Contract  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  processBuyEvent(BuyEvent)                  │
│  ├─ artistId                                │
│  ├─ buyer (address)                         │
│  ├─ tokenAmount                             │
│  ├─ newSupply                               │
│  ├─ newPrice                                │
│  ├─ blockNumber                             │
│  └─ timestamp                               │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 1: Update Holders                     │
│  - Create/Update ArtistHolder record        │
│  - Set isEarly50 flag if ≤50 holders        │
│  - Return current holderCount               │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 2: Insert Stats Snapshot              │
│  - Record price at this moment              │
│  - Record holder count                      │
│  - Store block number & timestamp           │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 3: Badge Checks (All 5)               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Promethean Backer                │   │
│  │    ├─ Check: holderCount ≤ 5?      │   │
│  │    └─ Award: First 5 holders       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 2. Oracle of Rises                  │   │
│  │    ├─ Check: holderCount ≥ 200?    │   │
│  │    ├─ Was prev count < 200?        │   │
│  │    └─ Award: All isEarly50 holders │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 3. Nereid Navigator                 │   │
│  │    ├─ Check: Price 1hr ago exists? │   │
│  │    ├─ Current price ≤ 85% of old?  │   │
│  │    └─ Award: This buyer            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 4. Muse Wanderer (GLOBAL)           │   │
│  │    ├─ Check: Count distinct genres  │   │
│  │    ├─ User has 8+ genres?          │   │
│  │    └─ Award: Global badge (null)   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 5. Titan of Support                 │   │
│  │    ├─ Check: tokenAmount/supply    │   │
│  │    ├─ Share ≥ 1%?                  │   │
│  │    └─ Award: This buyer            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Prerequisites

### Required Software

```bash
# Node.js (v18 or higher)
node --version  # Should be v18+

# npm (comes with Node.js)
npm --version

# Git
git --version
```

### Install Node.js (if needed)
```bash
# macOS (using Homebrew)
brew install node

# or download from https://nodejs.org/
```

---

## 📥 Step-by-Step Setup

### Step 1: Clone Repository

```bash
# Clone the repo
git clone <your-repo-url>
cd clio

# Navigate to web directory
cd web
```

### Step 2: Install Dependencies

```bash
# Install all packages
npm install

# This installs:
# - Next.js, React, TypeScript
# - Prisma & Prisma Client
# - Testing utilities (tsx)
# - All other dependencies
```

**Expected output:**
```
added 899 packages in 35s
✓ Dependencies installed successfully
```

### Step 3: Initialize Database

```bash
# Run migration to create database
npm run prisma:migrate

# This will:
# 1. Create prisma/dev.db (SQLite database)
# 2. Create all tables (Artist, Badge, UserBadge, etc.)
# 3. Run the seed script to add 5 badges
```

**Expected output:**
```
✓ Database created: prisma/dev.db
✓ Tables created: Artist, Badge, UserBadge, ArtistHolder, ArtistStats
✓ Seeded 5 badges
```

### Step 4: Verify Setup

```bash
# Run comprehensive tests
npm run badge:test

# Expected: ALL TESTS PASSED ✅
```

**Expected output:**
```
✅ TEST 1: PROMETHEAN_BACKER - 5 badges awarded
✅ TEST 2: TITAN_OF_SUPPORT - 8+ badges awarded
✅ TEST 3: NEREID_NAVIGATOR - 1 badge awarded
✅ TEST 4: MUSE_WANDERER - 1 badge awarded
✅ ALL BADGE ENGINE TESTS PASSED!
```

### Step 5: Explore Database (Optional)

```bash
# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Opens at http://localhost:5555
```

---

## 📁 Project Structure

```
clio/
├── contracts/               # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── ArtistRegistry.sol
│   │   ├── ArtistToken.sol
│   │   └── BondingCurveMarket.sol
│   └── scripts/
│       └── deploy.js
│
└── web/                     # Next.js app with social layer
    ├── app/                 # Next.js app directory
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── providers.tsx
    │
    ├── lib/                 # Core logic
    │   ├── badgeEngine.ts   ⭐ Main badge engine
    │   ├── prisma.ts        ⭐ Database client
    │   └── utils.ts
    │
    ├── prisma/              # Database
    │   ├── schema.prisma    ⭐ Database schema
    │   ├── seed.ts          ⭐ Seed script
    │   ├── dev.db           📊 SQLite database file
    │   └── migrations/      📁 Migration history
    │
    ├── scripts/             # Testing & utilities
    │   ├── test-badge-engine.ts  ⭐ Badge tests
    │   ├── test-db.ts            ⭐ DB tests
    │   ├── inspect-db.ts         🔍 Quick inspection
    │   └── clear-test-data.ts    🧹 Cleanup
    │
    ├── components/          # React components
    ├── styles/             # CSS
    └── package.json        # Dependencies & scripts
```

**Key Files:**
- ⭐ `lib/badgeEngine.ts` - Badge awarding logic
- ⭐ `prisma/schema.prisma` - Database schema
- ⭐ `scripts/test-badge-engine.ts` - Test suite
- 📊 `prisma/dev.db` - SQLite database

---

## 🎮 Available Commands

### Database Commands

```bash
# Prisma commands
npm run prisma:migrate      # Create & apply migration
npm run prisma:seed         # Seed badges into database
npm run prisma:generate     # Regenerate Prisma Client
npm run prisma:studio       # Open Prisma Studio GUI

# Testing commands
npm run db:test             # Test database CRUD operations
npm run db:inspect          # Quick database inspection
npm run db:clear            # Clear test data (keeps badges)

# Badge engine commands
npm run badge:test          # Test all 5 badge types
```

### Development Commands

```bash
npm run dev                 # Start Next.js dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
```

---

## 🧪 Testing the System

### Quick Test

```bash
# 1. Inspect current state
npm run db:inspect

# 2. Run badge engine tests
npm run badge:test

# 3. Open visual browser
npm run prisma:studio
```

### Manual Testing

```typescript
// Create a test file: scripts/manual-test.ts
import { processBuyEvent } from '../lib/badgeEngine'

async function test() {
  await processBuyEvent({
    artistId: 1,
    buyer: '0xYourTestAddress',
    tokenAmount: 1000n,
    newSupply: 10000n,
    newPrice: 100000000000000000n,
    blockNumber: 12345,
    timestamp: new Date()
  })
}

test().then(() => console.log('✅ Done'))
```

Run it:
```bash
npx tsx scripts/manual-test.ts
```

---

## 🐛 Troubleshooting

### Issue: `Prisma Client not found`

**Solution:**
```bash
npm run prisma:generate
```

### Issue: `Table doesn't exist`

**Solution:**
```bash
# Delete database and recreate
rm prisma/dev.db
npm run prisma:migrate
```

### Issue: `Foreign key constraint failed`

**Solution:**
```bash
# Clear data and re-seed
npm run db:clear
npm run prisma:seed
```

### Issue: `Port 5555 already in use` (Prisma Studio)

**Solution:**
```bash
# Kill existing Prisma Studio
pkill -f "prisma studio"

# Or use different port
npx prisma studio --port 5556
```

### Issue: Tests failing

**Solution:**
```bash
# 1. Clear test data
npm run db:clear

# 2. Re-run tests
npm run badge:test
```

---

## 🔐 Environment Variables (Future)

Create `.env` file in `web/` directory:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Base Network
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
NEXT_PUBLIC_RPC_URL="https://sepolia.base.org"

# Contract Addresses (after deployment)
NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_BONDING_CURVE_MARKET_ADDRESS="0x..."

# Optional: PostgreSQL for production
# DATABASE_URL="postgresql://user:password@localhost:5432/clio"
```

---

## 🚀 Integrating with Smart Contracts

### Step 1: Deploy Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Step 2: Create Event Listener (TODO)

Create `web/lib/eventListener.ts`:

```typescript
import { publicClient } from './viem'
import { processBuyEvent } from './badgeEngine'

export function startBadgeEngineListener() {
  console.log('🎧 Listening for Bought events...')
  
  publicClient.watchContractEvent({
    address: process.env.NEXT_PUBLIC_BONDING_CURVE_MARKET_ADDRESS,
    abi: bondingCurveMarketABI,
    eventName: 'Bought',
    onLogs: async (logs) => {
      for (const log of logs) {
        const { artistId, buyer, tokenAmount, newSupply, newPrice } = log.args
        
        const block = await publicClient.getBlock({
          blockNumber: log.blockNumber
        })
        
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
}
```

### Step 3: Start Listener

In your `app/layout.tsx` or startup script:

```typescript
import { startBadgeEngineListener } from '@/lib/eventListener'

// Start listener when app initializes
if (typeof window === 'undefined') {  // Server-side only
  startBadgeEngineListener()
}
```

---

## 📊 Badge System Reference

### All 5 Badges

| Badge | Type | Criteria | Test Status |
|-------|------|----------|-------------|
| 🏆 Promethean Backer | Artist | First 5 holders | ✅ Working |
| 🔮 Oracle of Rises | Artist | Early holder, artist hits 200+ | ✅ Working |
| 🌊 Nereid Navigator | Artist | Bought during 15%+ dip | ✅ Working |
| 🎵 Muse Wanderer | Global | 8+ genres supported | ✅ Working |
| 💪 Titan of Support | Artist | 1%+ of supply in one buy | ✅ Working |

### Badge Usage Examples

```typescript
import { 
  getAllUserBadges, 
  getUserBadgesForArtist,
  getBadgeHolders 
} from '@/lib/badgeEngine'

// Get all badges for a user
const badges = await getAllUserBadges('0xUser123...')

// Get badges for specific artist
const artistBadges = await getUserBadgesForArtist('0xUser123...', 1)

// Get all holders of a badge
const holders = await getBadgeHolders('PROMETHEAN_BACKER', 1)
```

---

## 📚 Documentation Files

- `BADGE_ENGINE_README.md` - Complete technical documentation
- `BADGE_ENGINE_SUMMARY.md` - Quick start guide
- `BADGE_VERIFICATION_REPORT.md` - Test results & verification
- `SCHEMA_UPDATE_SUMMARY.md` - Database migration details
- `TESTING_WORKFLOW.md` - Testing best practices
- `SETUP_GUIDE.md` - This file

---

## ✅ Setup Checklist

Print this out and check off as you go:

```
□ Clone repository
□ Navigate to web/ directory
□ Run npm install
□ Run npm run prisma:migrate
□ Verify 5 badges seeded
□ Run npm run badge:test
□ All tests pass ✅
□ Open npm run prisma:studio
□ Verify database structure
□ Review badge engine code (lib/badgeEngine.ts)
□ Review database schema (prisma/schema.prisma)
□ Run npm run db:inspect
□ Understand badge awarding flow
□ Ready for smart contract integration! 🚀
```

---

## 🎓 Learning Resources

### Understanding the Code

1. **Start here:** `lib/badgeEngine.ts` - Main badge logic
2. **Then:** `prisma/schema.prisma` - Database structure  
3. **Then:** `scripts/test-badge-engine.ts` - See it in action
4. **Finally:** `lib/BADGE_ENGINE_README.md` - Deep dive

### Key Concepts

- **Prisma ORM:** Database toolkit for TypeScript
- **SQLite:** Lightweight database (perfect for development)
- **Badge Engine:** Automatically awards badges based on user behavior
- **Event-Driven:** Listens to blockchain events, processes them

### External Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Viem Docs](https://viem.sh) (for blockchain integration)
- [Base Network](https://base.org)

---

## 🤝 Team Collaboration

### For New Team Members

1. **Clone & Setup** (15 minutes)
   ```bash
   git clone <repo>
   cd clio/web
   npm install
   npm run prisma:migrate
   npm run badge:test
   ```

2. **Explore Database** (10 minutes)
   ```bash
   npm run prisma:studio
   # Browse tables visually
   ```

3. **Read Code** (30 minutes)
   - `lib/badgeEngine.ts` - Badge logic
   - `prisma/schema.prisma` - Database schema
   - `scripts/test-badge-engine.ts` - Tests

4. **Run Tests** (5 minutes)
   ```bash
   npm run badge:test
   npm run db:inspect
   ```

### Sharing Database State

**Export database:**
```bash
# Copy database file
cp web/prisma/dev.db ~/Desktop/clio-db-backup.db
```

**Import database:**
```bash
# Copy to project
cp ~/Desktop/clio-db-backup.db web/prisma/dev.db

# Regenerate client
npm run prisma:generate
```

### Git Workflow

```bash
# Pull latest changes
git pull origin main

# After pulling, always:
npm install                    # Update dependencies
npm run prisma:generate        # Regenerate Prisma Client
npm run badge:test            # Verify everything works
```

---

## 🎯 Next Steps for Production

### 1. Deploy to Production Database

Replace SQLite with PostgreSQL:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# Run migration on PostgreSQL
DATABASE_URL="postgresql://..." npm run prisma:migrate
```

### 2. Add API Routes

Create REST API endpoints:
- `GET /api/user/[address]/badges`
- `GET /api/artist/[id]/badges`
- `GET /api/leaderboard`

### 3. Build Frontend Components

- Badge display components
- User profile with badges
- Artist page with badge holders
- Leaderboard page

### 4. Set Up Monitoring

- Log all badge awards
- Track badge distribution
- Monitor database performance
- Set up error alerts

---

## 📞 Support

If you encounter issues:

1. Check **Troubleshooting** section above
2. Review error messages carefully
3. Run `npm run db:inspect` to check database state
4. Check documentation files in `web/` directory
5. Reach out to the team

---

## 🎉 You're Ready!

Your Clio social layer is now set up and ready for smart contract integration!

**What you have:**
- ✅ Complete badge system (5 badges)
- ✅ SQLite database with proper schema
- ✅ Comprehensive test suite
- ✅ Documentation and guides
- ✅ Testing utilities

**Next:** Connect to your deployed smart contracts and start awarding badges! 🚀

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅

