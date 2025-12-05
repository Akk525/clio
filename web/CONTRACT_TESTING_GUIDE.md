# Smart Contract Testing Guide

Complete guide for testing Clio smart contracts through the frontend interface.

## 🚀 Quick Start

### Option 1: Test Locally with Hardhat

```bash
# Terminal 1: Start Hardhat node
cd contracts
npx hardhat node

# Terminal 2: Deploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
cd web
npm run dev

# Terminal 4: Run automated tests (optional)
cd web
npx tsx scripts/test-contracts.ts
```

Then open http://localhost:3000/contracts in your browser.

### Option 2: Test on Base Sepolia

1. Get Base Sepolia ETH from a faucet
2. Deploy contracts to Base Sepolia
3. Set environment variables
4. Start frontend and test

## 📋 Prerequisites

### For Local Testing
- Node.js 20+
- Hardhat installed in contracts folder
- MetaMask or another Web3 wallet
- No testnet funds needed!

### For Base Sepolia Testing
- MetaMask with Base Sepolia network added
- Base Sepolia ETH (from faucet)
- Deployed contracts on Base Sepolia

## 🏗️ Local Setup (Detailed)

### Step 1: Start Hardhat Node

```bash
cd contracts
npx hardhat node
```

This will:
- Start a local Ethereum node on http://127.0.0.1:8545
- Create 20 test accounts with 10,000 ETH each
- Print account addresses and private keys

**Keep this terminal open!**

### Step 2: Deploy Contracts

In a new terminal:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
Deploying contracts with address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ArtistRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
BondingCurveMarket deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Note these addresses!** They're hardcoded in the frontend for localhost.

### Step 3: Configure MetaMask

1. **Add Localhost Network** (if not already added):
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Account**:
   - Copy a private key from Hardhat's output (Account #0 recommended)
   - In MetaMask: Account → Import Account → Paste private key
   - You should see 10,000 ETH balance

### Step 4: Start Frontend

```bash
cd web
npm run dev
```

Open http://localhost:3000/contracts

## 🧪 Testing Flow

### Test 1: Register an Artist

1. Connect wallet (make sure you're on Localhost network)
2. Go to "Register Artist" section
3. Fill in:
   - **Artist Name**: Your artist name (e.g., "Test Artist")
   - **Handle**: Twitter-style handle (e.g., "@testartist")
   - **Artist Wallet**: Use Account #1 from Hardhat (0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
4. Click "Register Artist"
5. Approve transaction in MetaMask
6. Wait for confirmation

**Expected Result**: ✅ Transaction confirmed, artist ID assigned (usually 1 for first artist)

### Test 2: View Artist Info

1. In "View Artist Info" section
2. Enter Artist ID: 1
3. Click "View Artist"

**Expected Result**: 
- Shows artist name, handle, wallet
- Token will be "Not set yet" (expected)
- Reserve balance: 0 ETH

### Test 3: Deploy Artist Token (Manual)

**Note**: This step requires deploying the ArtistToken contract separately. Here's how:

```bash
cd contracts
npx hardhat console --network localhost
```

Then in the console:
```javascript
const Market = await ethers.getContractAt("BondingCurveMarket", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
const Registry = await ethers.getContractAt("ArtistRegistry", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

// Deploy token
const Token = await ethers.getContractFactory("ArtistToken")
const token = await Token.deploy("Test Artist Token", "TEST", await Market.getAddress())
await token.waitForDeployment()
const tokenAddress = await token.getAddress()
console.log("Token deployed to:", tokenAddress)

// Link token to artist
await Registry.setArtistToken(1, tokenAddress)
console.log("Token linked!")
```

**Expected Result**: Token deployed and linked to artist ID 1

### Test 4: Buy Artist Tokens

After token is deployed and linked:

1. In "Buy Artist Tokens" section
2. Enter Artist ID: 1
3. Enter Amount: 0.01 (ETH)
4. Review calculation:
   - Artist Fee (3%): 0.0003 ETH
   - Tokens Out: ~0.0097 ETH worth
5. Click "Buy Tokens"
6. Approve transaction (with 0.01 ETH value)
7. Wait for confirmation

**Expected Result**:
- ✅ Transaction confirmed
- Artist receives 3% fee (0.0003 ETH)
- You receive ~9,700,000,000,000,000 tokens (18 decimals)
- Reserve increases by 0.0097 ETH

### Test 5: View Updated Info

1. View artist info again (Artist ID 1)
2. Should now show:
   - Token address (set)
   - Reserve balance: 0.0097 ETH
   - Total supply: ~9,700,000,000,000,000
   - Your balance: ~9,700,000,000,000,000

### Test 6: Sell Artist Tokens

1. In "Sell Artist Tokens" section
2. Enter Artist ID: 1
3. Enter Token Amount: 5000000000000000000 (half your tokens)
4. Review calculation: You'll receive ~0.005 ETH
5. Click "Sell Tokens"
6. Approve transaction
7. Wait for confirmation

**Expected Result**:
- ✅ Transaction confirmed
- Tokens burned from your account
- You receive ETH back
- Reserve decreases

## 🧪 Automated Tests

Run the automated test script:

```bash
cd web
npx tsx scripts/test-contracts.ts
```

This will:
1. Register a test artist
2. View artist info
3. Note about token deployment
4. Show what buy/sell would do

**Note**: Full buy/sell tests require manual token deployment (step 3).

## 🌐 Base Sepolia Testing

### Step 1: Get Testnet ETH

1. Get Base Sepolia ETH from:
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Bridge from Sepolia ETH

### Step 2: Deploy to Base Sepolia

```bash
cd contracts

# Make sure .env has:
# BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# PRIVATE_KEY=your_private_key

npx hardhat run scripts/deploy.js --network baseSepolia
```

**Save the deployed addresses!**

### Step 3: Configure Frontend

Create `web/.env.local`:

```bash
NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_BONDING_CURVE_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get WalletConnect Project ID from: https://cloud.walletconnect.com/

### Step 4: Test on Base Sepolia

1. Start frontend: `cd web && npm run dev`
2. Open http://localhost:3000/contracts
3. Connect wallet (MetaMask should prompt to switch to Base Sepolia)
4. Follow same testing flow as localhost
5. Transactions will take ~2 seconds to confirm (real blockchain)
6. View transactions on Base Sepolia explorer

## 📊 What to Verify

### ✅ Registration Works
- [x] Artist can be registered
- [x] Artist ID is assigned
- [x] Artist info is stored correctly
- [x] Event is emitted

### ✅ Token Deployment Works
- [x] Token can be deployed
- [x] Token can be linked to artist
- [x] Market is set as token owner/minter

### ✅ Buying Works
- [x] ETH is accepted
- [x] 3% fee goes to artist wallet
- [x] Tokens are minted to buyer
- [x] Reserve balance increases
- [x] Bought event is emitted

### ✅ Selling Works
- [x] Tokens are burned from seller
- [x] ETH is returned from reserve
- [x] Reserve balance decreases
- [x] Sold event is emitted

### ✅ Frontend Integration Works
- [x] Wallet connection works
- [x] Contract reads work (view functions)
- [x] Contract writes work (transactions)
- [x] Transaction status is displayed
- [x] Block explorer links work

## 🐛 Troubleshooting

### "Contracts not deployed"
- Make sure Hardhat node is running
- Re-run deploy script
- Check addresses match in frontend

### "Transaction reverted"
Common causes:
- **"Artist does not exist"**: Use valid artist ID (1 for first artist)
- **"No ETH sent"**: Make sure to send value with buy()
- **"Insufficient reserve"**: Can't sell more than reserve balance
- **"Artist token not set"**: Token hasn't been deployed/linked yet

### "Wrong network"
- Check MetaMask is on correct network
- For localhost: Chain ID 31337
- For Base Sepolia: Chain ID 84532

### "Nonce too high" after Hardhat restart
- MetaMask caches nonce for localhost
- Settings → Advanced → Clear activity tab data
- Or use a fresh account

## 📝 Contract Addresses Reference

### Localhost (Hardhat)
```
ArtistRegistry:     0x5FbDB2315678afecb367f032d93F642f64180aa3
BondingCurveMarket: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

These are Hardhat's default deployment addresses (deterministic).

### Base Sepolia
Check your deployment output or .env.local file.

## 🔗 Useful Links

- Base Sepolia Explorer: https://sepolia.basescan.org/
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- WalletConnect Cloud: https://cloud.walletconnect.com/
- Hardhat Docs: https://hardhat.org/docs

## 🎯 Success Criteria

Your smart contracts are working if:

- ✅ Can register artists on-chain
- ✅ Can view artist data from contract
- ✅ Can deploy and link artist tokens
- ✅ Can buy tokens with ETH (3% fee to artist)
- ✅ Can sell tokens back for ETH
- ✅ All transactions confirm successfully
- ✅ Events are emitted and can be indexed
- ✅ Frontend displays correct data
- ✅ No transaction reverts unexpectedly

## 🚀 Next Steps

Once contracts are tested and working:

1. **Deploy to mainnet** (Base mainnet when ready)
2. **Set up production indexer** to watch for events
3. **Build production UI** with proper UX
4. **Add proper bonding curve math** (currently 1:1)
5. **Implement artist onboarding flow**
6. **Add badge awarding** based on buy events

## ⚠️ Important Notes

- **Bonding curve is placeholder**: Currently uses 1 wei = 1 token. Real bonding curve math needs to be implemented.
- **Token deployment is manual**: In production, this should be automated in the artist registration flow.
- **No slippage protection in tests**: Tests use minTokensOut/minEthOut = 0. Production should calculate proper slippage.
- **Gas costs**: Transactions cost gas. On localhost it's free, on testnet it uses test ETH, on mainnet it costs real money.

## 📚 Additional Resources

- See `SETUP_GUIDE.md` for backend setup
- See `INDEXER_GUIDE.md` for event indexing
- See `BADGE_ENGINE_SUMMARY.md` for badge system
- Check contract tests: `contracts/test/`

---

**Happy Testing!** 🎉

If you encounter issues not covered here, check the contract source code or reach out for help.
