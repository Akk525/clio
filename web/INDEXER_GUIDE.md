# 📡 On-Chain Indexer Guide

## Overview

The indexer watches Base Sepolia for `Bought` events from your deployed BondingCurveMarket contract and automatically processes them through the badge engine.

```
Base Sepolia Blockchain
         ↓
    Bought Event
         ↓
    Indexer Script  ← You are here
         ↓
   Badge Engine
         ↓
    SQLite DB
```

---

## 🚀 Quick Start

### 1. Create `.env` file

```bash
cd web
cp .env.example .env
```

Edit `.env`:
```env
RPC_URL=https://sepolia.base.org
BONDING_CURVE_ADDRESS=0xYourDeployedContractAddress
```

### 2. Run the indexer

```bash
npm run indexer
```

**Expected output:**
```
╔════════════════════════════════════════════════════════════╗
║           🎨 CLIO BADGE INDEXER STARTING 🎨               ║
╚════════════════════════════════════════════════════════════╝

📡 Configuration:
   Chain: Base Sepolia (84532)
   RPC: https://sepolia.base.org
   Contract: 0x...

✅ Connected to Base Sepolia (block: 12345678)

🎧 Watching for Bought events...
   (Press Ctrl+C to stop)
```

### 3. When a buy happens

```
📡 Bought event detected:
   Artist ID: 1
   Buyer: 0xabc...def
   Amount: 1000
   New Supply: 50000
   New Price: 100000000000000000
   Block: 12345679
   Time: 2024-12-05T10:30:45.000Z

🎯 Processing buy event for Artist 1
   ✅ Updated holders (total: 15)
   ✅ Inserted stats snapshot
   🏆 Running badge checks...
      🏆 Awarded TITAN_OF_SUPPORT to 0xabc...def (2.00% share)
   ✨ Buy event processed successfully

✅ Event processed successfully
```

---

## 📋 Setup Details

### Prerequisites

✅ Deployed BondingCurveMarket contract
✅ RPC endpoint (free from Alchemy, Infura, or use public)
✅ `.env` file configured

### Environment Variables

Create `web/.env`:

```env
# Required: Base Sepolia RPC URL
RPC_URL=https://sepolia.base.org

# Or use Alchemy/Infura for better reliability
# RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Required: Your deployed contract address
BONDING_CURVE_ADDRESS=0xYourContractAddressHere

# Optional: Database URL (default is fine)
DATABASE_URL=file:./prisma/dev.db
```

### Get a Free RPC URL

**Option 1: Public RPC (Simple)**
```env
RPC_URL=https://sepolia.base.org
```

**Option 2: Alchemy (Recommended)**
1. Sign up at https://www.alchemy.com/
2. Create a new app for "Base Sepolia"
3. Copy your RPC URL
```env
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**Option 3: Infura**
1. Sign up at https://www.infura.io/
2. Create a new project
3. Enable Base Sepolia
```env
RPC_URL=https://base-sepolia.infura.io/v3/YOUR_PROJECT_ID
```

---

## 🎮 Commands

### Start Indexer
```bash
npm run indexer
```

### Development Mode (Auto-restart)
```bash
npm run indexer:dev
```

### Stop Indexer
Press `Ctrl+C` in the terminal

---

## 🔍 What It Does

### 1. Connects to Base Sepolia
- Uses your RPC_URL
- Validates connection
- Shows current block number

### 2. Watches for Events
```solidity
event Bought(
    uint256 indexed artistId,
    address indexed buyer,
    uint256 tokenAmount,
    uint256 cost,
    uint256 newSupply,
    uint256 newPrice
)
```

### 3. Processes Each Event
- Fetches block timestamp
- Converts to `BuyEvent` type
- Calls `processBuyEvent()`
- Awards eligible badges

### 4. Logs Everything
- Event detection
- Badge awarding
- Errors (if any)

---

## 🧪 Testing

### Test with Real Contract

If you have a deployed contract:

```bash
# 1. Update .env with real contract address
# 2. Start indexer
npm run indexer

# 3. Make a test purchase on Base Sepolia
# 4. Watch the indexer log the event and award badges!
```

### Test with Mock Data

While developing, use the test script:

```bash
npm run badge:test
```

This simulates buy events without needing a deployed contract.

---

## 🐛 Troubleshooting

### Error: "Missing RPC_URL"

**Solution:**
```bash
# Create .env file
cp .env.example .env

# Edit it
nano .env  # or use your editor
```

Add:
```env
RPC_URL=https://sepolia.base.org
```

### Error: "Missing BONDING_CURVE_ADDRESS"

**Solution:**
Deploy your contract first, then add the address to `.env`:
```env
BONDING_CURVE_ADDRESS=0xYourContractAddress
```

### Error: "Failed to connect to RPC"

**Causes:**
1. Invalid RPC URL
2. No internet connection
3. RPC endpoint down

**Solutions:**
- Check your internet connection
- Verify RPC_URL in .env
- Try a different RPC provider
- Use public RPC: `https://sepolia.base.org`

### No Events Being Detected

**Checks:**
1. ✅ Contract address correct?
2. ✅ Contract deployed to Base Sepolia?
3. ✅ Anyone making purchases?
4. ✅ Indexer still running?

**Debug:**
```bash
# Check current block
curl https://sepolia.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verify contract exists
curl https://sepolia.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xYourContractAddress","latest"],"id":1}'
```

### Database Errors

**Issue:** Badge engine failing

**Solution:**
```bash
# Check database
npm run db:inspect

# Regenerate Prisma Client
npm run prisma:generate

# Reset if needed
npm run db:clear
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────┐
│    Base Sepolia Blockchain                  │
│    - BondingCurveMarket Contract            │
└──────────────────┬──────────────────────────┘
                   │
                   │ emits Bought event
                   │
                   ▼
┌─────────────────────────────────────────────┐
│    scripts/startIndexer.ts                  │
│    - Watches for events via Viem            │
│    - Fetches block timestamps               │
│    - Converts to BuyEvent type              │
└──────────────────┬──────────────────────────┘
                   │
                   │ calls processBuyEvent()
                   │
                   ▼
┌─────────────────────────────────────────────┐
│    lib/badgeEngine.ts                       │
│    - Updates holders                        │
│    - Records stats                          │
│    - Checks 5 badge criteria                │
│    - Awards badges if eligible              │
└──────────────────┬──────────────────────────┘
                   │
                   │ via Prisma Client
                   │
                   ▼
┌─────────────────────────────────────────────┐
│    prisma/dev.db (SQLite)                   │
│    - Stores artists, holders, badges        │
└─────────────────────────────────────────────┘
```

---

## 🔧 Advanced Configuration

### Custom Block Range

To process historical events:

```typescript
// In startIndexer.ts, modify the watch call:

client.watchContractEvent({
  address: BONDING_CURVE_ADDRESS,
  abi: BondingCurveMarketABI,
  eventName: 'Bought',
  fromBlock: 12000000n, // Start from specific block
  onLogs: async (logs) => {
    // ... 
  }
})
```

### Multiple Contracts

Watch multiple contracts:

```typescript
const contracts = [
  { address: '0xContract1...', name: 'Market1' },
  { address: '0xContract2...', name: 'Market2' },
]

for (const contract of contracts) {
  client.watchContractEvent({
    address: contract.address,
    // ...
  })
}
```

### Rate Limiting

Add delays between processing:

```typescript
async function processBoughtEvent(log: Log): Promise<void> {
  try {
    // ... process event
    
    // Add delay to avoid overwhelming database
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    // ...
  }
}
```

---

## 📈 Monitoring

### Log to File

```bash
npm run indexer > logs/indexer.log 2>&1
```

### Use PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start indexer with PM2
pm2 start npm --name "clio-indexer" -- run indexer

# Monitor
pm2 logs clio-indexer

# Stop
pm2 stop clio-indexer
```

### Health Check

Create `scripts/check-indexer.ts`:

```typescript
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL),
})

async function check() {
  try {
    const block = await client.getBlockNumber()
    console.log(`✅ Indexer healthy (block: ${block})`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Indexer unhealthy:', error)
    process.exit(1)
  }
}

check()
```

---

## 🚀 Deployment

### Run in Background

**Option 1: tmux**
```bash
tmux new -s indexer
npm run indexer
# Ctrl+B then D to detach
```

**Option 2: nohup**
```bash
nohup npm run indexer > indexer.log 2>&1 &
```

**Option 3: PM2** (Recommended)
```bash
pm2 start npm --name clio-indexer -- run indexer
pm2 save
pm2 startup  # Set up auto-start on reboot
```

### Environment Variables on Server

```bash
# On your server
cd /path/to/clio/web
nano .env

# Add your production values
RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BONDING_CURVE_ADDRESS=0xYourProductionContract
```

---

## ✅ Verification

Your indexer is working if:

✅ Starts without errors
✅ Shows "Connected to Base Sepolia"
✅ Shows "Watching for Bought events"
✅ Processes events when buys happen
✅ Awards badges automatically
✅ `npm run db:inspect` shows increasing badge counts

---

## 📚 Related Files

- `scripts/startIndexer.ts` - Main indexer script
- `abis/BondingCurveMarket.json` - Contract ABI
- `lib/badgeEngine.ts` - Badge processing logic
- `.env.example` - Environment template
- `INDEXER_GUIDE.md` - This file

---

## 🎉 Success!

When you see events being processed and badges being awarded, your indexer is live and working! 🚀

```
📡 Bought event detected: ✅
🎯 Processing buy event: ✅
🏆 Badge awarded: ✅
✅ Event processed successfully: ✅
```

**Your Clio social layer is now fully operational!**

