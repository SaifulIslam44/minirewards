









// import { streamText, tool, stepCountIs, convertToModelMessages, type UIMessage } from "ai"
// import { google } from "@ai-sdk/google" 
// import { z } from "zod"
// import { publicClient } from "@/lib/web3/server-client"
// import { DIAMOND_ADDRESS, REWARDS_ABI } from "@/lib/web3/contract"

// export const maxDuration = 30


// const rateLimitMap = new Map<string, { count: number; startTime: number }>();

// function isRateLimited(ip: string): boolean {
//   const now = Date.now();
//   const windowMs = 60000; 
//   const maxRequests = 15; 

//   const record = rateLimitMap.get(ip);
  
//   if (!record || now - record.startTime > windowMs) {
//     rateLimitMap.set(ip, { count: 1, startTime: now });
//     return false; 
//   }

 
//   if (record.count >= maxRequests) {
//     return true; 
//   }

//   record.count += 1;
//   return false;
// }

// export async function POST(req: Request) {
//   const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  
//   if (isRateLimited(ip)) {
//     return new Response("Too Many Requests. Please try again after a minute.", {
//       status: 429,
//     });
//   }

//   const { messages, userAddress }: { messages: UIMessage[]; userAddress?: `0x${string}` } =
//     await req.json()

//   const commonConfig = {
//     system: [
//       "Your exact name is 'ST Lifestyle'.",
//       "Never identify yourself as Gemini, Google AI, or a large language model.",
//       "CRITICAL LANGUAGE RULE: Your DEFAULT language is strictly ENGLISH. You MUST reply in English if the user types in English.",
//       "SECONDARY LANGUAGE RULE: If the user writes in another language (e.g., Bengali, Banglish, Hindi, Spanish), automatically detect it and reply in that EXACT same language.",
//       "If someone asks your name in Bengali or Banglish, say exactly: 'আমি ST Lifestyle, আপনার MiniRewards অ্যাসিস্ট্যান্ট!'.",
//       "If someone asks your name in English, say exactly: 'I am ST Lifestyle, your MiniRewards assistant!'.",
//       "You are the in-app assistant for MiniRewards, a Celo MiniPay dApp where users earn points for daily on-chain actions.",
//       "Be concise and friendly — replies are read on a small mobile screen.",
//       userAddress
//         ? `The connected user's wallet address is ${userAddress}.`
//         : "No wallet is connected yet; ask the user to connect first.",
//       "Use the getMyPoints and getRemainingDailyTx tools to answer questions about the user's standing.",
//       "When the user asks to perform or 'do' transactions/actions, call the executeBatchActions tool with the requested count.",
//       "TRANSACTION LIMIT RULE: If the user asks to perform MORE than 8 transactions at once, DO NOT call the executeBatchActions tool. Instead, simply reply and warn them that the maximum limit is 8 per request.",
//       "IMPORTANT: You never sign or send transactions yourself. The executeBatchActions tool only prepares the request; the MiniPay wallet will ask the user to confirm. After the tool returns, confirm the result to the user in plain language.",
//     ].join(" "),
//     messages: await convertToModelMessages(messages),
//     stopWhen: stepCountIs(6),
//     tools: {
//       getMyPoints: tool({
//         description: "Read the connected user's total reward points from the blockchain.",
//         inputSchema: z.object({}),
//         execute: async () => {
//           if (!userAddress) return { error: "No wallet connected." }
//           try {
//             const points = (await publicClient.readContract({
//               address: DIAMOND_ADDRESS,
//               abi: REWARDS_ABI,
//               functionName: "getUserPoints",
//               args: [userAddress],
//             })) as bigint
//             return { points: points.toString() }
//           } catch (e: any) {
//             return { error: e?.shortMessage ?? "Could not read points." }
//           }
//         },
//       }),
//       getRemainingDailyTx: tool({
//         description: "Read how many actions the connected user can still perform today.",
//         inputSchema: z.object({}),
//         execute: async () => {
//           if (!userAddress) return { error: "No wallet connected." }
//           try {
//             const remaining = (await publicClient.readContract({
//               address: DIAMOND_ADDRESS,
//               abi: REWARDS_ABI,
//               functionName: "getRemainingDailyTx",
//               args: [userAddress],
//             })) as bigint
//             return { remaining: remaining.toString() }
//           } catch (e: any) {
//             return { error: e?.shortMessage ?? "Could not read remaining transactions." }
//           }
//         },
//       }),

//       executeBatchActions: tool({
//         description:
//           "Prepare a batch of on-chain reward actions for the user to confirm in their MiniPay wallet.",
//         inputSchema: z.object({
//           count: z.number().int().min(1).describe("Number of actions to perform"),
//         }),
//       }),
//     },
//   }

//   try {
//     const result = streamText({
//       model: google("gemini-3.1-flash-lite"),
//       ...commonConfig,
//     })

//     return result.toUIMessageStreamResponse()

//   } catch (error) {
//     console.log("Fallback triggered: Switching to Gemma 4 26B...")
    
//     const fallbackResult = streamText({
//       model: google("gemma-4-26b-a4b-it"),
//       ...commonConfig,
//     })

//     return fallbackResult.toUIMessageStreamResponse()
//   }
// }


















import { streamText, tool, stepCountIs, convertToModelMessages, type UIMessage } from "ai"
import { google } from "@ai-sdk/google" 
import { z } from "zod"
import { publicClient } from "@/lib/web3/server-client"
import { DIAMOND_ADDRESS, REWARDS_ABI, ACTIVE_CHAIN } from "@/lib/web3/contract"
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const maxDuration = 30

const rateLimitMap = new Map<string, { count: number; startTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; 
  const maxRequests = 15; 

  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.startTime > windowMs) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false; 
  }

  if (record.count >= maxRequests) {
    return true; 
  }

  record.count += 1;
  return false;
}


const privateKey = process.env.AGENT_PRIVATE_KEY;
const rpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL;

if (!privateKey) throw new Error("Missing AGENT_PRIVATE_KEY in env");

const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

const agentClient = createWalletClient({
  account,
  chain: ACTIVE_CHAIN,
  transport: http(rpcUrl),
}).extend(publicActions);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  
  if (isRateLimited(ip)) {
    return new Response("Too Many Requests. Please try again after a minute.", {
      status: 429,
    });
  }

  const { messages, userAddress }: { messages: UIMessage[]; userAddress?: `0x${string}` } =
    await req.json()

  const commonConfig = {
    system: [
      "Your exact name is 'ST Lifestyle'.",
      "Never identify yourself as Gemini, Google AI, or a large language model.",
      "CRITICAL LANGUAGE RULE: Your DEFAULT language is strictly ENGLISH. You MUST reply in English if the user types in English.",
      "SECONDARY LANGUAGE RULE: If the user writes in another language (e.g., Bengali, Banglish, Hindi, Spanish), automatically detect it and reply in that EXACT same language.",
      "If someone asks your name in Bengali or Banglish, say exactly: 'আমি ST Lifestyle, আপনার MiniRewards অ্যাসিস্ট্যান্ট!'.",
      "If someone asks your name in English, say exactly: 'I am ST Lifestyle, your MiniRewards assistant!'.",
      "You are the in-app assistant for MiniRewards, a Celo MiniPay dApp where users earn points for daily on-chain actions.",
      "Be concise and friendly — replies are read on a small mobile screen.",
      userAddress
        ? `The connected user's wallet address is ${userAddress}.`
        : "No wallet is connected yet; ask the user to connect first.",
      "Use the getMyPoints and getRemainingDailyTx tools to answer questions about the user's standing.",
      "When the user asks to perform or 'do' transactions/actions, call the executeBatchActions tool with the requested count.",
      "TRANSACTION LIMIT RULE: If the user asks to perform MORE than 8 transactions at once, DO NOT call the executeBatchActions tool. Instead, simply reply and warn them that the maximum limit is 8 per request.",
      "IMPORTANT: The executeBatchActions tool will automatically execute the transaction silently in the background. Wait for the tool result and then confirm the success to the user. You MUST ALWAYS provide the transaction hash (txHash) to the user in your final text response so they can track it."
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

      executeBatchActions: tool({
        description: "Silently execute a batch of on-chain reward actions for the user. Call this when the user asks to do actions.",
        inputSchema: z.object({
          count: z.number().int().min(1).describe("Number of actions to perform"),
        }),
        execute: async ({ count }) => {
          if (!userAddress) return { error: "No wallet connected." }
          try {
            
            const hash = await agentClient.writeContract({
              address: DIAMOND_ADDRESS,
              abi: REWARDS_ABI,
              functionName: "batchExecuteAction",
              args: [userAddress as `0x${string}`, count], 
            });
            return { status: "success", count, txHash: hash }
          } catch (e: any) {
            return { status: "error", error: e?.shortMessage ?? e?.message ?? "Transaction failed." }
          }
        }
      }),
    },
  }

  try {
    const result = streamText({
      model: google("gemini-3.1-flash-lite"),
      ...commonConfig,
    })

    return result.toUIMessageStreamResponse()

  } catch (error) {
    console.log("Fallback triggered: Switching to Gemma 4 26B...")
    
    const fallbackResult = streamText({
      model: google("gemma-4-26b-a4b-it"),
      ...commonConfig,
    })

    return fallbackResult.toUIMessageStreamResponse()
  }
}