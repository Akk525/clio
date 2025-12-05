Clio

An onchain market for artists on Base, with a social layer that turns early belief into visible, tradable reputation.

Clio is an MBC hackathon project built on Base L2 and designed to plug into Circle / USDC rails.

Today, fans “support” artists with streams, likes, and reposts — but none of that is ownable, portable, or onchain. Discovering an artist early only earns you bragging rights that are hard to prove.

Clio changes that:

Every artist has a token whose price is driven by a bonding curve.

Fans buy and sell artist tokens to express belief.

A badge engine turns trading behavior into a reputation layer (e.g. early supporter badges that unlock perks like early podcast access).

The UI is designed to feel less like a trading terminal and more like a living map of culture.

Table of Contents

Overview

Architecture

Features

Tech Stack

Getting Started

Prerequisites

Install & Run

Available Scripts

Environment Variables

Contracts

Frontend

Hackathon Notes & Roadmap

License

Overview

Clio makes taste visible onchain:

Fans back artists by buying their tokens.

A bonding-curve market prices each artist.

A badge system captures how and when you backed them (not just how much).

Badges unlock perks (e.g. early access content), forming a social layer on top of trading.

Example demo flow:

Connect your wallet on Base Sepolia.

Buy a test artist (e.g. a The Weeknd profile).

You are awarded the PROMETHEAN_BACKER badge as an early supporter.

Your portfolio shows the badge and unlocks an early access podcast UI tied to that badge.

Architecture

The project is split into two main parts:

Onchain layer

Solidity contracts deployed to Base Sepolia via Hardhat.

Handles artist registry, artist tokens, bonding curve pricing, and reserve balances.

Frontend / social layer

Next.js app that connects to Base through wagmi + RainbowKit.

UI shows:

Artist list + live pricing

Buy/sell interactions

Portfolio view

Badge + perks view

Repository Structure
.
├── contracts/         # Hardhat project for smart contracts
│   ├── contracts/     # Solidity contracts (ArtistRegistry, ArtistToken, BondingCurveMarket, etc.)
│   ├── scripts/       # Deployment scripts
│   ├── test/          # Hardhat tests
│   └── hardhat.config.*
└── web/               # Next.js frontend
    ├── app/           # Routes and pages (App Router)
    ├── components/    # Shared React components
    ├── lib/           # Contract helpers and config
    ├── public/        # Static assets
    ├── styles/        # Tailwind styles
    └── next.config.mjs

Features

🧑‍🎤 Artist Tokens

Each artist has their own ERC-20–style token.

Tokens represent belief and exposure to that artist’s “trajectory”.

📈 Bonding Curve Market

Simple, readable bonding curve pricing for hackathon demo.

Price increases as more tokens are bought and falls as they are sold.

Reserve balances tracked per artist.

🏅 Fan Badge Reputation

Trading behavior mints or unlocks badges such as:

PROMETHEAN_BACKER – early supporter.

ORACLE_OF_RISES – consistently backs artists before price rises.

NEREID_NAVIGATOR – explores many emerging artists.

MUSE_WANDERER – wide, eclectic portfolio.

TITAN_OF_SUPPORT – long-term, high-conviction holder.

Demo: buying into the test artist mints PROMETHEAN_BACKER and unlocks an early access perk.

🎧 Perks Layer

Badges map to real-time perks in the UI (e.g. gated podcast content, special sections).

For the hackathon, at least one perk is wired end-to-end for judges to click through.

🔵 Base + Circle Ready

Built on Base L2 for low fees and fast interactions.

Designed to be USDC-native and compatible with Circle programmable wallets in future work.

Tech Stack

Onchain

Solidity

Hardhat

Base Sepolia testnet

Frontend

Next.js 13+ (App Router)

TypeScript

Tailwind CSS

shadcn/ui

wagmi

RainbowKit

Getting Started
Prerequisites

Node.js (LTS recommended, e.g. 18+)

npm or pnpm (examples below use npm)

A wallet configured for Base Sepolia with test funds (from faucet)

(Optional) Hardhat installed globally for convenience

Install & Run

From the project root:

# Install any root-level tooling (if present)
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

At the root:

npm run dev
Runs both contracts (Hardhat in watch/test mode) and web concurrently.

Inside web/:

npm run dev
Starts the Next.js dev server only.

Inside contracts/:

# Run contract tests
npx hardhat test

# Example deployment command (update script/params as needed)
npx hardhat run scripts/deploy.ts --network baseSepolia

Environment Variables

In web/, create a .env.local file:

# RPC URL for Base Sepolia
NEXT_PUBLIC_BASE_RPC_URL="https://sepolia.base.org"

# Deployed contract addresses (fill these in after deployment)
NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS="<deployed_registry_address>"
NEXT_PUBLIC_BONDING_CURVE_MARKET_ADDRESS="<deployed_market_address>"

# (Optional) Circle / USDC configs for future integration
NEXT_PUBLIC_USDC_TOKEN_ADDRESS="<usdc_on_base_or_test_token>"


Update these with your actual deployment addresses once the contracts are deployed.

Contracts

All contracts live in contracts/contracts/. Names may vary slightly depending on refactors, but the core pieces are:

ArtistRegistry.sol

Responsible for:

Tracking which artists exist.

Linking artist IDs to their token contracts.

Core responsibilities include:

registerArtist(...) – create a new artist + token entry.

getArtistToken(...) – read token address by artist ID (or artist address, depending on design).

ArtistToken.sol

ERC-20–style token representing each artist.

Minted and burned by the bonding curve market contract.

Used as the unit of belief and exposure for each artist.

BondingCurveMarket.sol

Handles:

Reserve balances per artist.

Buy/sell logic, e.g.:

buyArtistTokens(artistId, amountIn)

sellArtistTokens(artistId, amountOut)

Pricing helpers:

getBuyPrice(...)

getSellReturn(...)

For the hackathon, the pricing function is intentionally simple and easy to audit, but the contract is structured so that more complex bonding curve math can be plugged in later.

Badge / Reputation (WIP / Hybrid)

Depending on the current commit, badges may be:

Prototype onchain (e.g. ERC-1155 or ERC-721, potentially soulbound).

Or hybrid/offchain, with logic enforced in the frontend for demo purposes.

For the MBC demo, we implement at least one full flow:

Buy the token for the demo artist → earn PROMETHEAN_BACKER → badge appears on portfolio → early access “podcast” UI unlocks.

Frontend

The Next.js app under web/ focuses on a clean, judge-friendly experience.

Stack

Next.js (App Router)

TypeScript

Tailwind CSS

shadcn/ui

wagmi + RainbowKit for wallet connections

Key Screens

Home / Discover

List of artists.

Current price / basic stats fed from the bonding curve.

Artist Detail

Token price.

Supply and reserve data (where available).

Buy / sell actions wired into the contracts.

Portfolio

User holdings across artists.

Display of earned badges.

Quick view of how your onchain “taste profile” evolves.

Perks / Early Access

Example: After earning PROMETHEAN_BACKER, the user sees a special “early access podcast” section tied to that badge.

Hackathon Notes & Roadmap
Built for MBC Hackathon (Base + Circle)

Base L2 alignment

Cheap, fast trades → more interactive “markets of culture.”

Onchain reputation primitives for artists and fans.

Circle / USDC alignment

Design is USDC-centric and ready to plug into Circle’s USDC + programmable wallet stack.

Planned post-hackathon improvements:

Settling trades directly in USDC.

Using USDC as the base currency for bonding curves.

Unlocking cross-chain flows where appropriate.

Next Steps After Hackathon

Generalize the badge engine

Fully onchain, soulbound badges.

Nuanced rules: time of entry, conviction, holding periods, drawdowns.

Self-service artist onboarding

Artist-initiated registration from the frontend.

Social verification and fair initial conditions for the bonding curve.

Richer analytics

Market depth visualization.

Curator leaderboards and social graphs.

Full Circle integration

USDC-native markets on Base.

Fiat on-/off-ramps so non-crypto-native fans can still participate.
