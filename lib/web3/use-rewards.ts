// "use client"

// import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi"
// import { DIAMOND_ADDRESS, REWARDS_ABI } from "./contract"

// /** Reads the connected user's points, remaining daily tx, and the leaderboard. */
// export function useRewardsData() {
//   const { address } = useAccount()

//   const userReads = useReadContracts({
//     allowFailure: true,
//     query: { enabled: Boolean(address), refetchInterval: 8000 },
//     contracts: [
//       {
//         address: DIAMOND_ADDRESS,
//         abi: REWARDS_ABI,
//         functionName: "getUserPoints",
//         args: address ? [address] : undefined,
//       },
//       {
//         address: DIAMOND_ADDRESS,
//         abi: REWARDS_ABI,
//         functionName: "getRemainingDailyTx",
//         args: address ? [address] : undefined,
//       },
//       {
//         address: DIAMOND_ADDRESS,
//         abi: REWARDS_ABI,
//         functionName: "dailyTxLimit",
//       },
//       {
//         address: DIAMOND_ADDRESS,
//         abi: REWARDS_ABI,
//         functionName: "admin",
//       },
//     ],
//   })

//   const leaderboard = useReadContract({
//     address: DIAMOND_ADDRESS,
//     abi: REWARDS_ABI,
//     functionName: "getLeaderboard",
//     query: { refetchInterval: 12000 },
//   })

//   const [pointsRes, remainingRes, limitRes, adminRes] = userReads.data ?? []

//   const points = (pointsRes?.result as bigint | undefined) ?? 0n
//   const remaining = (remainingRes?.result as bigint | undefined) ?? 0n
//   const dailyLimit = (limitRes?.result as bigint | undefined) ?? 0n
//   const admin = (adminRes?.result as `0x${string}` | undefined) ?? undefined

//   const isAdmin = Boolean(
//     address && admin && address.toLowerCase() === admin.toLowerCase(),
//   )

//   const lb = leaderboard.data as readonly [readonly `0x${string}`[], readonly bigint[]] | undefined
//   const entries =
//     lb?.[0].map((addr, i) => ({ address: addr, points: lb[1][i] ?? 0n })) ?? []

//   return {
//     address,
//     points,
//     remaining,
//     dailyLimit,
//     admin,
//     isAdmin,
//     leaderboard: entries,
//     isLoading: userReads.isLoading || leaderboard.isLoading,
//     refetch: () => {
//       userReads.refetch()
//       leaderboard.refetch()
//     },
//   }
// }

// /** Write helpers for user + admin actions. */
// export function useRewardsActions() {
//   const { writeContractAsync, isPending } = useWriteContract()

//   const executeAction = () =>
//     writeContractAsync({
//       address: DIAMOND_ADDRESS,
//       abi: REWARDS_ABI,
//       functionName: "executeAction",
//     })

//   const batchExecuteAction = (count: number) =>
//     writeContractAsync({
//       address: DIAMOND_ADDRESS,
//       abi: REWARDS_ABI,
//       functionName: "batchExecuteAction",
//       args: [count],
//     })

//   const setDailyTxLimit = (limit: bigint) =>
//     writeContractAsync({
//       address: DIAMOND_ADDRESS,
//       abi: REWARDS_ABI,
//       functionName: "setDailyTxLimit",
//       args: [limit],
//     })

//   const setPointsPerTx = (points: bigint) =>
//     writeContractAsync({
//       address: DIAMOND_ADDRESS,
//       abi: REWARDS_ABI,
//       functionName: "setPointsPerTx",
//       args: [points],
//     })

//   return { executeAction, batchExecuteAction, setDailyTxLimit, setPointsPerTx, isPending }
// }








"use client"

import { useConnections, useReadContract, useReadContracts, useWriteContract } from "wagmi"
import { DIAMOND_ADDRESS, REWARDS_ABI } from "./contract"

// Celo Mainnet Chain ID (Testnet Alfajores হলে 44787 দিন)
const CELO_CHAIN_ID = 42220 

/** Reads the connected user's points, remaining daily tx, and the leaderboard. */
export function useRewardsData() {
  const connections = useConnections()
  const address = connections?.[0]?.accounts?.[0]

  const userReads = useReadContracts({
    allowFailure: true,
    query: { enabled: Boolean(address), refetchInterval: 8000 },
    contracts: [
      {
        address: DIAMOND_ADDRESS,
        abi: REWARDS_ABI,
        functionName: "getUserPoints",
        args: address ? [address] : undefined,
      },
      {
        address: DIAMOND_ADDRESS,
        abi: REWARDS_ABI,
        functionName: "getRemainingDailyTx",
        args: address ? [address] : undefined,
      },
      {
        address: DIAMOND_ADDRESS,
        abi: REWARDS_ABI,
        functionName: "dailyTxLimit",
      },
    ],
  })

  const leaderboard = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: REWARDS_ABI,
    functionName: "getLeaderboard",
    query: { refetchInterval: 12000 },
  })

  const readsData = userReads.data || []
  
  const pointsRes = readsData[0]
  const remainingRes = readsData[1]
  const limitRes = readsData[2]

  const points = (pointsRes?.result as bigint) ?? BigInt(0)
  const remaining = (remainingRes?.result as bigint) ?? BigInt(0)
  const dailyLimit = (limitRes?.result as bigint) ?? BigInt(0)

  const lb = leaderboard.data as readonly [readonly `0x${string}`[], readonly bigint[]] | undefined
  const entries = lb?.[0]?.map((addr, i) => ({ 
    address: addr, 
    points: lb[1][i] ?? BigInt(0) 
  })) ?? []

  return {
    address,
    points,
    remaining,
    dailyLimit,
    leaderboard: entries,
    isLoading: userReads.isLoading || leaderboard.isLoading,
    refetch: () => {
      userReads.refetch()
      leaderboard.refetch()
    },
  }
}

/** Write helpers for user actions. */
export function useRewardsActions() {
  const { mutateAsync, isPending } = useWriteContract()

  const executeAction = async () => {
    return mutateAsync({
      chainId: CELO_CHAIN_ID,
      address: DIAMOND_ADDRESS,
      abi: REWARDS_ABI,
      functionName: "executeAction",
    })
  }

  const batchExecuteAction = async (count: number) => {
    return mutateAsync({
      chainId: CELO_CHAIN_ID,
      address: DIAMOND_ADDRESS,
      abi: REWARDS_ABI,
      functionName: "batchExecuteAction",
      args: [count],
    })
  }

  return { executeAction, batchExecuteAction, isPending }
}