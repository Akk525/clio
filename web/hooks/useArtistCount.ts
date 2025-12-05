"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { getArtistCount } from "@/lib/contracts";

export function useArtistCount() {
  const publicClient = usePublicClient();
  const [count, setCount] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const value = await getArtistCount(publicClient);
        if (!cancelled) {
          setCount(value);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load artist count");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  return {
    count,
    loading,
    error,
    countNumber: count !== null ? Number(count) : null,
  };
}
