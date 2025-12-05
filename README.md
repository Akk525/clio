
You said:
 # Clio

A Base L2 hackathon project combining artist bonding-curve tokens with a social layer for early artist discovery and fan engagement.

## Structure

- /contracts - Solidity smart contracts (Hardhat + Base Sepolia)
- /web - Next.js frontend (TypeScript + Tailwind + wagmi + RainbowKit + shadcn/ui)

## Quick Start

bash
# Install dependencies
npm install
cd contracts && npm install
cd ../web && npm install

# Run everything
npm run dev


## Development

- npm run dev - Run both web and contracts in watch mode
- npm run dev:web - Run Next.js dev server only
- npm run dev:contracts - Run Hardhat tests in watch mode
