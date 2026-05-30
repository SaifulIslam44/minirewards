import { createPublicClient, http } from "viem"
import { ACTIVE_CHAIN } from "./contract"

/**
 * Read-only viem client used inside server-side AI tools to fetch on-chain
 * data (points, remaining tx). Never holds a private key — it only reads.
 */
export const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(),
})
