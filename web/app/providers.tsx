"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
import { useState } from "react";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

type RainbowConfig = ReturnType<typeof getDefaultConfig>;

declare global {
  // eslint-disable-next-line no-var
  var __clioWagmiConfig: RainbowConfig | undefined;
}

const wagmiConfig: RainbowConfig = globalThis.__clioWagmiConfig ??
  getDefaultConfig({
    appName: "Clio",
    projectId,
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__clioWagmiConfig = wagmiConfig;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

