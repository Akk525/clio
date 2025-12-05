"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { WalletConnectButton } from "@/components/connect-button";

export default function Home() {
  const { address } = useAccount();
  const router = useRouter();

  // Wallet gate: only redirect AFTER wallet connects, with a 2s delay
  useEffect(() => {
    if (!address) return; // do nothing if not connected

    const timer = setTimeout(() => {
      router.push("/artists");
    }, 2000);

    return () => clearTimeout(timer);
  }, [address, router]);

  const isConnected = !!address;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#050509] to-black text-white overflow-hidden">
      {/* Subtle background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full px-6 text-center flex flex-col items-center gap-8 relative z-10">
        {/* Logo / name with WHITE glow (no gradient text) */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <Image
              src="/clio-logo.png"
              alt="Clio"
              width={200}
              height={80}
              className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(249,250,251,0.5)] drop-shadow-[0_0_35px_rgba(16,185,129,0.2)]"
              priority
            />
          </div>
          <p className="text-sm sm:text-base text-zinc-300">
            Invest in artist tokens on Base. Discover tomorrow&apos;s headliners before they go mainstream.
          </p>
        </div>

        {/* Wallet connect card */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="relative w-full">
            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/70 hover:border-emerald-400/60 transition-colors">
              <div className="flex flex-col items-center gap-4">
                <WalletConnectButton />

                {!isConnected ? (
                  <p className="text-xs text-zinc-400">
                    Connect your wallet to enter <span className="font-semibold text-zinc-100">Clio</span>.
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xs text-emerald-200 font-medium">
                      Wallet connected. Loading artist markets…
                    </p>

                    {/* Simple glowing ring loader (no bar) */}
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border border-emerald-400/70 glow-ring" />
                      <div className="absolute inset-2 rounded-full bg-emerald-400/20 blur-sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tiny disclaimer */}
        <p className="text-[10px] text-zinc-600 max-w-md">
          Experimental onchain markets for creators. Not financial advice. Built for a hackathon on Base Sepolia.
        </p>
      </div>

      {/* Glow styles */}
      <style jsx>{`
        .glow-text {
          color: #f9fafb;
          text-shadow:
            0 0 8px rgba(249, 250, 251, 0.5),
            0 0 20px rgba(16, 185, 129, 0.35),
            0 0 35px rgba(16, 185, 129, 0.2);
        }

        @keyframes ringPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .glow-ring {
          animation: ringPulse 1.6s infinite;
        }
      `}</style>
    </main>
  );
}
