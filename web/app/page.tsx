import { WalletConnectButton } from "@/components/connect-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Clio
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Artist bonding-curve tokens with a social layer for early artist discovery and fan engagement.
        </p>
        <div className="flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    </main>
  );
}

