import { createConfig, http } from "wagmi"
import { celo, celoAlfajores } from "wagmi/chains"
import { injected } from "wagmi/connectors"

/**
 * wagmi config tuned for the Opera MiniPay embedded browser.
 *
 * MiniPay injects an EIP-1193 provider at `window.ethereum`, so the plain
 * `injected()` connector detects and connects to it automatically. We register
 * both Celo mainnet and Alfajores so the same build works on either network.
 */
export const wagmiConfig = createConfig({
  chains: [celo, celoAlfajores],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL),
    [celoAlfajores.id]: http(),
  },
  ssr: true,
})

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig
  }
}
