"use client"

import { useEffect, useState, type ReactNode } from "react"
import { WagmiProvider, useConnect } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/web3/wagmi"

const queryClient = new QueryClient()

/**
 * Auto-connects to the MiniPay injected provider on mount. MiniPay exposes
 * `window.ethereum.isMiniPay === true`; in that environment we connect silently
 * so the user never has to tap a "connect" button.
 */
function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect()

  useEffect(() => {
    const eth = typeof window !== "undefined" ? (window as any).ethereum : undefined
    if (eth?.isMiniPay) {
      const injectedConnector = connectors.find((c) => c.type === "injected")
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      }
    }
  }, [connect, connectors])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  // Avoid hydration mismatches from wallet state by mounting after first paint.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniPayAutoConnect />
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
