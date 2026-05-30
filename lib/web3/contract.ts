import { celo, celoAlfajores } from "viem/chains"

/**
 * Address of the Diamond Proxy that has the RewardsFacet cut into it.
 * Replace with your deployed Diamond address. Configurable via env so you can
 * point the same frontend at testnet or mainnet without code changes.
 */
export const DIAMOND_ADDRESS = (process.env.NEXT_PUBLIC_DIAMOND_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`

/** Toggle between Celo mainnet and Alfajores testnet via env. */
export const ACTIVE_CHAIN =
  process.env.NEXT_PUBLIC_CELO_NETWORK === "mainnet" ? celo : celoAlfajores

/**
 * ABI for the RewardsFacet functions. Because the Diamond proxies calls to the
 * facet, we interact with the Diamond ADDRESS using the FACET's ABI.
 */
export const REWARDS_ABI = [
  // --- events ---
  {
    type: "event",
    name: "ActionExecuted",
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "count", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "pointsAwarded", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "totalPoints", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "DailyTxLimitUpdated",
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newLimit", type: "uint256" }],
  },
  {
    type: "event",
    name: "PointsPerTxUpdated",
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newPoints", type: "uint256" }],
  },
  {
    type: "event",
    name: "ResetOffsetUpdated",
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newOffset", type: "uint256" }],
  },
  {
    type: "event",
    name: "RewardsInitialized",
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "admin", type: "address" }],
  },
  {
    type: "event",
    name: "TimeWindowUpdated",
    anonymous: false,
    inputs: [{ indexed: false, internalType: "uint256", name: "newDuration", type: "uint256" }],
  },

  // --- writes ---
  {
    type: "function",
    name: "batchExecuteAction",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint8", name: "count", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function",
    name: "executeAction",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "initRewards",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "address", name: "_admin", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setDailyTxLimit",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "limit", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setPointsPerTx",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "points", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setResetOffset",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "offsetInSeconds", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setTimeWindowDuration",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "durationInSeconds", type: "uint256" }],
    outputs: [],
  },

  // --- views ---
  {
    type: "function",
    name: "admin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    type: "function",
    name: "dailyTxLimit",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getLeaderboard",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { internalType: "address[]", name: "addresses", type: "address[]" },
      { internalType: "uint256[]", name: "points", type: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "getRemainingDailyTx",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getUserPoints",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "pointsPerTx",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "resetOffset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "timeWindowDuration",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
] as const;