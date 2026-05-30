import { streamText, tool, stepCountIs, convertToModelMessages, type UIMessage } from "ai"
import { z } from "zod"
import { publicClient } from "@/lib/web3/server-client"
import { DIAMOND_ADDRESS, REWARDS_ABI } from "@/lib/web3/contract"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, userAddress }: { messages: UIMessage[]; userAddress?: `0x${string}` } =
    await req.json()

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: [
      "You are the in-app assistant for MiniRewards, a Celo MiniPay dApp where users earn points for daily on-chain actions.",
      "Be concise and friendly — replies are read on a small mobile screen.",
      userAddress
        ? `The connected user's wallet address is ${userAddress}.`
        : "No wallet is connected yet; ask the user to connect first.",
      "Use the getMyPoints and getRemainingDailyTx tools to answer questions about the user's standing.",
      "When the user asks to perform or 'do' transactions/actions, call the executeBatchActions tool with the requested count.",
      "IMPORTANT: You never sign or send transactions yourself. The executeBatchActions tool only prepares the request; the MiniPay wallet will ask the user to confirm. After the tool returns, confirm the result to the user in plain language.",
    ].join(" "),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(6),
    tools: {
      getMyPoints: tool({
        description: "Read the connected user's total reward points from the blockchain.",
        inputSchema: z.object({}),
        execute: async () => {
          if (!userAddress) return { error: "No wallet connected." }
          try {
            const points = (await publicClient.readContract({
              address: DIAMOND_ADDRESS,
              abi: REWARDS_ABI,
              functionName: "getUserPoints",
              args: [userAddress],
            })) as bigint
            return { points: points.toString() }
          } catch (e: any) {
            return { error: e?.shortMessage ?? "Could not read points." }
          }
        },
      }),
      getRemainingDailyTx: tool({
        description: "Read how many actions the connected user can still perform today.",
        inputSchema: z.object({}),
        execute: async () => {
          if (!userAddress) return { error: "No wallet connected." }
          try {
            const remaining = (await publicClient.readContract({
              address: DIAMOND_ADDRESS,
              abi: REWARDS_ABI,
              functionName: "getRemainingDailyTx",
              args: [userAddress],
            })) as bigint
            return { remaining: remaining.toString() }
          } catch (e: any) {
            return { error: e?.shortMessage ?? "Could not read remaining transactions." }
          }
        },
      }),
      // No `execute`: this is a CLIENT-SIDE tool. The browser intercepts the
      // call, prompts the MiniPay wallet to sign batchExecuteAction(count),
      // and returns the result via addToolOutput.
      executeBatchActions: tool({
        description:
          "Prepare a batch of on-chain reward actions for the user to confirm in their MiniPay wallet. Use the count the user requested.",
        inputSchema: z.object({
          count: z.number().int().min(1).max(255).describe("Number of actions to perform"),
        }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
