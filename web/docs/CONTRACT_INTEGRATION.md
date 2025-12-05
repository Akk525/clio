# Contract Integration Guide

This document explains how to swap dummy invest logic for real contract calls.

## Overview

When ready to connect to real contracts:

1. **Buy/Sell Operations**: Use `useWriteContract` from wagmi for `BondingCurveMarket.buy()` and `sell()`
2. **Read Balances**: Use `useReadContract` to fetch token balances
3. **Metrics**: Keep dummy metrics (price history, volume) off-chain in DB or static files for hackathon

## Contract Addresses

Update `web/config/contracts.ts` with deployed contract addresses after running:
```bash
cd contracts
npm run deploy:base-sepolia
```

## Example: Buy/Sell Hooks

See `web/hooks/useBuySell.ts` for ready-to-use hooks that wrap wagmi's `useWriteContract`.

## Example: Balance Reading

Use `useReadContract` to read ERC-20 balances:

```tsx
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';

const { data: balance } = useReadContract({
  address: tokenAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

## Migration Steps

1. Replace `handleConfirm()` in `/artists/[id]/page.tsx` with real contract calls
2. Replace dummy `userPosition` with `useReadContract` for balance
3. Keep chart data and volume metrics as mock data for hackathon
4. Add transaction status tracking (pending, success, error)

