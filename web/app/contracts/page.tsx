"use client";

import { WalletConnectButton } from "@/components/connect-button";
import { Button } from "@/components/ui/button";
import { 
  ARTIST_REGISTRY_ABI, 
  BONDING_CURVE_MARKET_ABI,
  ARTIST_TOKEN_ABI,
  getContractAddresses,
  formatEth,
  formatTokenAmount,
  calculateTokensOut,
} from "@/lib/contracts";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, type Address } from "viem";

export default function ContractsTestPage() {
  const { address, chain, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  // Get contract addresses for current chain
  const contracts = chain ? getContractAddresses(chain.id) : getContractAddresses(84532);

  // Form states
  const [artistName, setArtistName] = useState("");
  const [artistHandle, setArtistHandle] = useState("");
  const [artistWallet, setArtistWallet] = useState("");
  const [buyArtistId, setBuyArtistId] = useState("1");
  const [buyAmount, setBuyAmount] = useState("0.01");
  const [sellArtistId, setSellArtistId] = useState("1");
  const [sellAmount, setSellAmount] = useState("0");
  const [viewArtistId, setViewArtistId] = useState("1");
  const [viewTokenAddress, setViewTokenAddress] = useState<Address | "">("");

  // Read contract data
  const { data: artistCount } = useReadContract({
    address: contracts.artistRegistry,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'artistCount',
    query: { enabled: !!contracts.artistRegistry },
  });

  const { data: artistData, refetch: refetchArtist } = useReadContract({
    address: contracts.artistRegistry,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'getArtist',
    args: [BigInt(viewArtistId || 1)],
    query: { enabled: !!contracts.artistRegistry && !!viewArtistId },
  });

  const { data: reserveBalance } = useReadContract({
    address: contracts.bondingCurveMarket,
    abi: BONDING_CURVE_MARKET_ABI,
    functionName: 'reserveBalance',
    args: [BigInt(viewArtistId || 1)],
    query: { enabled: !!contracts.bondingCurveMarket && !!viewArtistId },
  });

  const { data: tokenBalance } = useReadContract({
    address: viewTokenAddress || undefined,
    abi: ARTIST_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!viewTokenAddress && !!address },
  });

  const { data: totalSupply } = useReadContract({
    address: viewTokenAddress || undefined,
    abi: ARTIST_TOKEN_ABI,
    functionName: 'totalSupply',
    query: { enabled: !!viewTokenAddress },
  });

  // Contract interactions
  const handleRegisterArtist = async () => {
    if (!artistName || !artistHandle || !artistWallet) {
      alert("Please fill in all fields");
      return;
    }

    try {
      writeContract({
        address: contracts.artistRegistry!,
        abi: ARTIST_REGISTRY_ABI,
        functionName: 'registerArtist',
        args: [artistWallet as Address, artistName, artistHandle],
      });
    } catch (error) {
      console.error("Error registering artist:", error);
    }
  };

  const handleBuyTokens = async () => {
    if (!buyArtistId || !buyAmount) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const value = parseEther(buyAmount);
      writeContract({
        address: contracts.bondingCurveMarket!,
        abi: BONDING_CURVE_MARKET_ABI,
        functionName: 'buy',
        args: [BigInt(buyArtistId), 0n], // minTokensOut = 0 for testing
        value,
      });
    } catch (error) {
      console.error("Error buying tokens:", error);
    }
  };

  const handleSellTokens = async () => {
    if (!sellArtistId || !sellAmount) {
      alert("Please fill in all fields");
      return;
    }

    try {
      writeContract({
        address: contracts.bondingCurveMarket!,
        abi: BONDING_CURVE_MARKET_ABI,
        functionName: 'sell',
        args: [BigInt(sellArtistId), parseEther(sellAmount), 0n], // minEthOut = 0 for testing
      });
    } catch (error) {
      console.error("Error selling tokens:", error);
    }
  };

  const handleViewArtist = async () => {
    await refetchArtist();
    if (artistData && artistData.token !== "0x0000000000000000000000000000000000000000") {
      setViewTokenAddress(artistData.token as Address);
    } else {
      setViewTokenAddress("");
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Smart Contract Testing</h1>
            <p className="text-gray-600">
              Test all Clio smart contract functions
            </p>
          </div>
          <WalletConnectButton />
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Wallet:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {address}
                </code>
              </p>
              <p className="text-sm">
                <span className="font-medium">Chain:</span> {chain?.name || "Unknown"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Registry:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {contracts.artistRegistry || "Not configured"}
                </code>
              </p>
              <p className="text-sm">
                <span className="font-medium">Market:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {contracts.bondingCurveMarket || "Not configured"}
                </code>
              </p>
              <p className="text-sm">
                <span className="font-medium">Total Artists:</span>{" "}
                {artistCount?.toString() || "0"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Not connected. Please connect your wallet.</p>
          )}
        </div>

        {/* Transaction Status */}
        {(hash || writeError) && (
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Transaction Status</h2>
            {hash && (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Hash:</span>{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                    {hash}
                  </code>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  {isConfirming && "⏳ Confirming..."}
                  {isConfirmed && "✅ Confirmed!"}
                  {!isConfirming && !isConfirmed && "📤 Submitted"}
                </p>
                {chain?.blockExplorers && (
                  <a
                    href={`${chain.blockExplorers.default.url}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on block explorer →
                  </a>
                )}
              </div>
            )}
            {writeError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Error:</span>{" "}
                  {writeError.message}
                </p>
              </div>
            )}
          </div>
        )}

        {!isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-medium mb-4">
              Please connect your wallet to interact with contracts
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Register Artist */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">1️⃣ Register Artist</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. Taylor Swift"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Handle</label>
                  <input
                    type="text"
                    value={artistHandle}
                    onChange={(e) => setArtistHandle(e.target.value)}
                    placeholder="e.g. @taylorswift"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Artist Wallet Address</label>
                  <input
                    type="text"
                    value={artistWallet}
                    onChange={(e) => setArtistWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleRegisterArtist}
                  disabled={isPending || !contracts.artistRegistry}
                  className="w-full"
                >
                  {isPending ? "Registering..." : "Register Artist"}
                </Button>
                <p className="text-xs text-gray-500">
                  * After registering, the owner needs to deploy and link an ArtistToken contract
                </p>
              </div>
            </div>

            {/* View Artist */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">2️⃣ View Artist Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Artist ID</label>
                  <input
                    type="number"
                    value={viewArtistId}
                    onChange={(e) => setViewArtistId(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <Button onClick={handleViewArtist} className="w-full">
                  View Artist
                </Button>
                {artistData && (
                  <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {artistData.name}
                    </p>
                    <p>
                      <span className="font-medium">Handle:</span> {artistData.handle}
                    </p>
                    <p>
                      <span className="font-medium">Wallet:</span>{" "}
                      <code className="text-xs bg-white px-1 py-0.5 rounded">
                        {artistData.artistWallet}
                      </code>
                    </p>
                    <p>
                      <span className="font-medium">Token:</span>{" "}
                      <code className="text-xs bg-white px-1 py-0.5 rounded">
                        {artistData.token === "0x0000000000000000000000000000000000000000"
                          ? "Not set yet"
                          : artistData.token}
                      </code>
                    </p>
                    {reserveBalance !== undefined && (
                      <p>
                        <span className="font-medium">Reserve:</span>{" "}
                        {formatEth(reserveBalance)}
                      </p>
                    )}
                    {totalSupply !== undefined && (
                      <p>
                        <span className="font-medium">Total Supply:</span>{" "}
                        {formatTokenAmount(totalSupply)} tokens
                      </p>
                    )}
                    {tokenBalance !== undefined && (
                      <p>
                        <span className="font-medium">Your Balance:</span>{" "}
                        {formatTokenAmount(tokenBalance)} tokens
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Buy Tokens */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">3️⃣ Buy Artist Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Artist ID</label>
                  <input
                    type="number"
                    value={buyArtistId}
                    onChange={(e) => setBuyArtistId(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.01"
                    step="0.001"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {buyAmount && (
                  <div className="bg-blue-50 rounded p-3 text-sm">
                    <p className="font-medium text-blue-900 mb-1">Calculation:</p>
                    <p className="text-blue-800">
                      Artist Fee (3%): {formatEth(calculateArtistFee(parseEther(buyAmount)))}
                    </p>
                    <p className="text-blue-800">
                      Tokens Out: ~{formatTokenAmount(calculateTokensOut(parseEther(buyAmount)))}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleBuyTokens}
                  disabled={isPending || !contracts.bondingCurveMarket}
                  className="w-full"
                >
                  {isPending ? "Buying..." : "Buy Tokens"}
                </Button>
                <p className="text-xs text-gray-500">
                  * Sends ETH, receives artist tokens (3% fee goes to artist)
                </p>
              </div>
            </div>

            {/* Sell Tokens */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">4️⃣ Sell Artist Tokens</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Artist ID</label>
                  <input
                    type="number"
                    value={sellArtistId}
                    onChange={(e) => setSellArtistId(e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Amount</label>
                  <input
                    type="number"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="1000000000000000000"
                    step="1000000000000000000"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                {sellAmount && (
                  <div className="bg-green-50 rounded p-3 text-sm">
                    <p className="font-medium text-green-900 mb-1">You'll receive:</p>
                    <p className="text-green-800">
                      ~{formatEth(parseEther(sellAmount))}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleSellTokens}
                  disabled={isPending || !contracts.bondingCurveMarket}
                  className="w-full"
                  variant="outline"
                >
                  {isPending ? "Selling..." : "Sell Tokens"}
                </Button>
                <p className="text-xs text-gray-500">
                  * Sends tokens back to contract, receives ETH
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">📚 Testing Instructions</h2>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mt-4 mb-2">For Local Testing (Hardhat):</h3>
            <ol className="space-y-2">
              <li>
                <strong>Start Hardhat node:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                  cd contracts && npx hardhat node
                </pre>
              </li>
              <li>
                <strong>Deploy contracts:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                  npx hardhat run scripts/deploy.js --network localhost
                </pre>
              </li>
              <li>
                <strong>Connect MetaMask to localhost network</strong> (http://127.0.0.1:8545, Chain ID: 31337)
              </li>
              <li>
                <strong>Import a test account</strong> from Hardhat's output (accounts with 10000 ETH)
              </li>
            </ol>

            <h3 className="text-lg font-semibold mt-4 mb-2">For Base Sepolia Testing:</h3>
            <ol className="space-y-2">
              <li>Get Base Sepolia ETH from a faucet</li>
              <li>
                Set environment variables in <code>.env.local</code>:
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
{`NEXT_PUBLIC_ARTIST_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_BONDING_CURVE_ADDRESS=0x...`}
                </pre>
              </li>
              <li>Deploy contracts to Base Sepolia</li>
              <li>Connect your wallet to Base Sepolia</li>
            </ol>

            <h3 className="text-lg font-semibold mt-4 mb-2">Testing Flow:</h3>
            <ol className="space-y-2">
              <li><strong>Register an artist</strong> (you can use your own wallet as artist wallet)</li>
              <li><strong>View the artist</strong> to confirm registration (note: token won't be set yet)</li>
              <li><strong>Deploy ArtistToken</strong> and link it (requires owner permissions)</li>
              <li><strong>Buy tokens</strong> with ETH</li>
              <li><strong>View artist again</strong> to see your balance and total supply</li>
              <li><strong>Sell tokens</strong> back to get ETH</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
