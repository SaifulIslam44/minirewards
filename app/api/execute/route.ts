// File: app/api/execute/route.ts

import { NextResponse } from "next/server";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { DIAMOND_ADDRESS, REWARDS_ABI, ACTIVE_CHAIN } from "@/lib/web3/contract";

const privateKey = process.env.AGENT_PRIVATE_KEY;
const rpcUrl = process.env.NEXT_PUBLIC_CELO_RPC_URL;

if (!privateKey) {
  throw new Error("Missing AGENT_PRIVATE_KEY in env");
}


const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);


const client = createWalletClient({
  account,
  chain: ACTIVE_CHAIN,
  transport: http(rpcUrl),
}).extend(publicActions);

export async function POST(request: Request) {
  try {
    const { userAddress } = await request.json();

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address is required" }, { status: 400 });
    }


    const hash = await client.writeContract({
      address: DIAMOND_ADDRESS, 
      abi: REWARDS_ABI,      
      functionName: "executeAction",
      args: [userAddress as `0x${string}`], 
    });

    return NextResponse.json({ success: true, hash });
  } catch (error: any) {
    console.error("API Error executing action:", error);
    return NextResponse.json(
      { success: false, error: error.shortMessage || error.message || "Transaction failed" },
      { status: 500 }
    );
  }
}