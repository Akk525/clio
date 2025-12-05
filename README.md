# Clio

> **An onchain market for artists on Base, with a social layer that turns early belief into visible, tradable reputation.**

Clio is a Midwest Blockchain Conference (MBC) hackathon project built on **Base L2** and designed to plug into **Circle / USDC rails**.

Today, fans “support” artists with streams, likes, and reposts — but none of that is ownable, portable, or onchain. Discovering an artist early earns you nothing except vague bragging rights.

Clio changes that.

On Clio:

- Every **artist has a token** whose price is driven by a **bonding curve**.
- Fans **buy and sell artist tokens** to express belief.
- A **badge engine** turns trading behavior into a **reputation layer** (e.g. early supporter badges that unlock perks like podcast access).
- Everything is designed to feel less like a trading terminal and more like a **living map of culture**.

---

## Table of Contents

- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
  - [Artist Tokens](#artist-tokens)
  - [Bonding Curve Market](#bonding-curve-market)
  - [Fan Badge Reputation](#fan-badge-reputation)
- [User Flows](#user-flows)
  - [For Fans](#for-fans)
  - [For Artists](#for-artists)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install & Run](#install--run)
  - [Environment Variables](#environment-variables)
- [Contracts](#contracts)
- [Frontend](#frontend)
- [Hackathon Notes & Roadmap](#hackathon-notes--roadmap)
- [License](#license)

---

## Architecture

Clio is split into two main parts:

- **Onchain layer** (Hardhat + Solidity on Base Sepolia)
- **Frontend / social layer** (Next.js + wagmi + RainbowKit + Tailwind + shadcn/ui)

High-level:

- **Base L2**  
  - Contracts deployed to **Base Sepolia** for hackathon testing.
  - Bonding curve and artist registry live here.

- **Circle / USDC (Design Target)**  
  - Clio is designed around **USDC-denominated flows** and compatible with **Circle’s infrastructure**.
  - In the hackathon build, we focus on ETH-native flows, with USDC integration in the roadmap.

- **Next.js Frontend**  
  - Wallet connect via **RainbowKit + wagmi**.
  - Clean, minimal UI using **Tailwind** and **shadcn/ui**.
  - Screens for browsing artists, viewing bonding curve price, trading, and seeing **fan badges + perks**.

---

## Core Concepts

### Artist Tokens

- Every onboarded artist gets:
  - A unique **artist ID**.
  - An associated **ERC-20–style artist token** contract.
- Tokens represent:
  - **Economic belief** (people actually buy in).
  - **Discoverability** (the earlier and more conviction you show, the more it’s reflected in badges and portfolio).

### Bonding Curve Market

Clio uses a **BondingCurveMarket** contract to:

- Price tokens based on **total supply + reserve** (simple curve during hackathon; extendable to more complex math).
- Handle:
  - `buyArtistTokens(artistId, amount)`
  - `sellArtistTokens(artistId, amount)`
- Keep **reserve balances** per artist and route ETH (and later USDC) through the curve.

> For the hackathon, pricing is intentionally simple and readable so judges can follow the math quickly. The contract is structured so the pricing logic can be swapped out for a more sophisticated curve later.

### Fan Badge Reputation

Backing an artist isn’t just a trade — it becomes **part of your identity**.

Clio includes a **badge engine** that mints or displays badges based on user behavior. Examples:

- `PROMETHEAN_BACKER` – Early believer in an artist’s token.
- `ORACLE_OF_RISES` – Consistently backing artists before big price moves.
- `NEREID_NAVIGATOR` – Diversified explorer of emerging artists.
- `MUSE_WANDERER` – Active curator across many scenes.
- `TITAN_OF_SUPPORT` – Long-term holder / high-conviction backer.

For the MBC demo:

- Buying a specific artist (e.g., **The Weeknd** test profile) on the market:
  - Mints / unlocks the **PROMETHEAN_BACKER** badge on your profile.
  - Unlocks a **real-time perk** UI (e.g., early access to a “podcast” / exclusive content panel).
- These flows are currently **hardcoded for demo clarity** but structured so they can be generalized later.

---

## User Flows

### For Fans

1. **Connect wallet**  
   - Use RainbowKit to connect a wallet on **Base Sepolia**.

2. **Discover artists**
   - Browse the artist list and view:
     - Current price
     - Volume / holders (where available)
     - Short description

3. **Buy artist tokens**
   - Select an artist, choose how much to buy.
   - Confirm transaction via your wallet.
   - Bonding curve updates price based on new supply.

4. **Earn badges & perks**
   - After buying into the demo artist:
     - You see a **“Promethean Backer”** badge appear on your portfolio.
     - You’re shown a special **early-access panel** (e.g., a private “podcast” teaser UI).

5. **View portfolio**
   - See:
     - Your artist positions
     - Your earned badges
     - Links to associated perks.

### For Artists

> In the hackathon build, onboarding is primarily triggered by developers / admin functions. The flow is designed as:

1. **Artist is registered** via `ArtistRegistry`.
2. A **token + market entry** are created for them.
3. The frontend automatically picks up the new artist and displays:
   - Name
   - Description / tags
   - Live price and market stats.

Future work includes **self-service artist registration** from the UI.

---

Prerequisites

Node.js (LTS recommended, e.g. 18+)

npm or pnpm (examples use npm)

A wallet with Base Sepolia funds for testing (via faucet)

(Optional) Hardhat installed globally for local dev convenience

Install & Run

From the project root:

# Install root-level tooling (if any)
npm install

# Install contracts dependencies
cd contracts
npm install

# Install web dependencies
cd ../web
npm install

# Back to root
cd ..


To run everything together:

# From project root
npm run dev

Available Scripts

npm run dev – Runs both contracts (Hardhat in watch/test mode) and web concurrently.

npm run dev:web – Starts the Next.js dev server only.

npm run dev:contracts – Runs Hardhat tests in watch mode (or dev workflow, depending on your script setup).

From within contracts/:

npx hardhat test
# Run contract tests

npx hardhat run scripts/deploy.ts --network baseSepolia
# Example deployment command (adjust as needed)

Environment Variables

In web/, create a .env.local file with values like:

# RPC URL for Base Sepolia
NEXT_PUBLIC_BASE_RPC_URL="https://sepolia.base.org"

# Deployed contract addresses (fill in after deployment)
NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS="<deployed_registry_address>"
NEXT_PUBLIC_BONDING_CURVE_MARKET_ADDRESS="<deployed_market_address>"

# (Optional) Circle / USDC configs for future integration
NEXT_PUBLIC_USDC_TOKEN_ADDRESS="<usdc_on_base_or_test_token>"


Update these with your actual deployment addresses.

Contracts

Located in contracts/contracts/ (names may vary slightly depending on the final repo):

ArtistRegistry.sol

Keeps track of:

Which artists exist.

Their associated token contracts and IDs.

Core responsibilities:

registerArtist(...)

getArtistToken(...) (by address or ID, depending on implementation)

ArtistToken.sol

ERC-20–like token for each artist.

Minted/burned by the BondingCurveMarket.

BondingCurveMarket.sol

Holds the reserve balance for each artist.

Exposes:

buyArtistTokens(artistId, amountIn)

sellArtistTokens(artistId, amountOut)

Pricing helpers like getBuyPrice, getSellReturn.

Currently uses a simple pricing scheme suitable for hackathon demos; structured so the curve math can be upgraded later.

(Optional / WIP) Badge / Reputation Contracts

Depending on final implementation:

Could be onchain (soulbound ERC-1155 / ERC-721).

Or offchain / hybrid, surfaced via UI for now.

For MBC, at least one end-to-end flow is implemented:

Buying a specific artist token → PROMETHEAN_BACKER badge + associated perk in the UI.

Frontend

The Next.js app (web/) focuses on a simple, judge-friendly UX.

Stack

Next.js 13+ (App Router)

TypeScript

Tailwind CSS

shadcn/ui components

wagmi + RainbowKit for wallet connection

Key Screens

Home / Discover

List of artists with live pricing from the bonding curve.

Artist Detail

Token price.

Supply / reserve data (where available).

Buy / sell actions.

Portfolio

User holdings across artists.

Display of earned badges.

Perks / Early Access

Example: After earning PROMETHEAN_BACKER, the user sees a special “early access podcast” section tied to that badge.

Hackathon Notes & Roadmap
Built for MBC Hackathon (Base + Circle)

Base L2 alignment

Cheap, fast trades → more interactive “markets of culture.”

Onchain reputation primitives for artists and fans.

Circle / USDC alignment

Design is USDC-centric and ready to plug into Circle’s USDC + programmable wallet stack.

Future work:

Settling trades directly in USDC.

Using USDC as the base currency for bonding curves.

Unlocking cross-chain flows where appropriate.

Next Steps After Hackathon

Generalize the badge engine:

Onchain soulbound badges.

Nuanced rules: time of entry, conviction, holding periods, drawdowns.

Self-service artist onboarding, with:

Social verification.

Fair initial conditions for bonding curves.

Richer analytics:

Market depth visualization.

Curator leaderboards.

Full Circle integration:

USDC-native markets on Base.

Fiat on- / off-ramps for non-crypto-native fans.

