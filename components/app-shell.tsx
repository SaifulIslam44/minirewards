



// "use client"

// import { useState, useEffect } from "react"
// import { useAccount, useConnect, useDisconnect } from "wagmi"
// import { Gem, Wallet, Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes" 
// import { Providers } from "@/app/providers"
// import { Dashboard } from "@/components/dashboard"
// import { Leaderboard } from "@/components/leaderboard"
// import { AiChat } from "@/components/ai-chat"
// import { useRewardsData } from "@/lib/web3/use-rewards"
// import styles from "./app-shell.module.css"

// function shorten(addr?: string) {
//   if (!addr) return ""
//   return `${addr.slice(0, 6)}…${addr.slice(-4)}`
// }

// function AppContent() {
//   const { isConnected, address } = useAccount()
//   const { connect, connectors, isPending } = useConnect()
//   const { disconnect } = useDisconnect()
//   const data = useRewardsData()

//   // 🌓 থিম কন্ট্রোল
//   const { theme, setTheme, resolvedTheme } = useTheme()
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => setMounted(true), [])
//   const currentTheme = theme === "system" ? resolvedTheme : theme

//   const injected = connectors.find((c) => c.type === "injected")

//   return (
//     <div className={styles.app}>
//       <header className={styles.header}>
//         <div className={styles.brand}>
//           <span className={styles.logo}>
//             <Gem size={18} />
//           </span>
//           MiniRewards
//         </div>
        
//         {/* 🌟 ডান পাশের অ্যাকশন এরিয়া */}
//         <div className={styles.headerActions}>
//           {isConnected ? (
//             <button className={styles.wallet} onClick={() => disconnect()}>
//               <span className={styles.dot} />
//               {shorten(address)}
//             </button>
//           ) : null}

//           {/* 🌓 থিম টগল বাটন */}
//           <button 
//             className={styles.themeToggle} 
//             onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
//             aria-label="Toggle Theme"
//           >
//             {mounted ? (
//               currentTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />
//             ) : (
//               <div style={{ width: 18, height: 18 }} />
//             )}
//           </button>
//         </div>
//       </header>

//       {isConnected ? (
//         <main className={styles.main}>
//           <Dashboard data={data} />
//           <Leaderboard entries={data.leaderboard} self={address} />
//         </main>
//       ) : (
//         <div className={styles.gate}>
//           <span className={styles.gateIcon}>
//             <Wallet size={32} />
//           </span>
//           <h1 className={styles.gateTitle}>Welcome to MiniRewards</h1>
//           <p className={styles.gateText}>
//             Earn points for daily on-chain actions on Celo. Open this app inside Opera
//             MiniPay to connect automatically, or tap below.
//           </p>
//           <button
//             className={styles.connectBtn}
//             disabled={isPending || !injected}
//             onClick={() => injected && connect({ connector: injected })}
//           >
//             {isPending ? "Connecting…" : "Connect Wallet"}
//           </button>
//         </div>
//       )}

//       {isConnected ? <AiChat data={data} /> : null}
//     </div>
//   )
// }

// export function AppShell() {
//   return (
//     <Providers>
//       <AppContent />
//     </Providers>
//   )
// }



















"use client"

import { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Gem, Wallet, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes" 
import { Providers } from "@/app/providers"
import { Dashboard } from "@/components/dashboard"
import { Leaderboard } from "@/components/leaderboard"
import { AiChat } from "@/components/ai-chat"
import { BottomNav } from "@/components/bottom-nav" 
import { useRewardsData } from "@/lib/web3/use-rewards"
import Image from "next/image" 
import styles from "./app-shell.module.css"

function shorten(addr?: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function AppContent() {
  const { isConnected, address } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const data = useRewardsData()

  // 🌓 থিম কন্ট্রোল
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 🔘 ট্যাব কন্ট্রোল (ডিফল্টভাবে ড্যাশবোর্ড ওপেন থাকবে)
  const [activeTab, setActiveTab] = useState<"dashboard" | "leaderboard">("dashboard")

  useEffect(() => setMounted(true), [])
  const currentTheme = theme === "system" ? resolvedTheme : theme

  const injected = connectors.find((c) => c.type === "injected")

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          {/* <span className={styles.logo}> */}
          <span>
            {/* <Gem size={18} /> */}
            <Image 
              src="/logo.png" 
              alt="App Logo" 
              width={30} 
              height={30} 
              className={styles.appLogo}
              />
          </span>
          MiniRewards
        </div>
        
       
        <div className={styles.headerActions}>
          {isConnected ? (
            <button className={styles.wallet} onClick={() => disconnect()}>
              <span className={styles.dot} />
              {shorten(address)}
            </button>
          ) : null}

          
          <button 
            className={styles.themeToggle} 
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {mounted ? (
              currentTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />
            ) : (
              <div style={{ width: 18, height: 18 }} />
            )}
          </button>
        </div>
      </header>

      {isConnected ? (
       
        <main className={styles.main} style={{ paddingBottom: "80px" }}>
          
          {activeTab === "dashboard" ? (
            <Dashboard data={data} />
          ) : (
            <Leaderboard entries={data.leaderboard} self={address} />
          )}

        </main>
      ) : (
        <div className={styles.gate}>
          <span className={styles.gateIcon}>
            <Wallet size={32} />
          </span>
          <h1 className={styles.gateTitle}>Welcome to MiniRewards</h1>
          <p className={styles.gateText}>
            Earn points for daily on-chain actions on Celo. Open this app inside Opera
            MiniPay to connect automatically, or tap below.
          </p>
          <button
            className={styles.connectBtn}
            disabled={isPending || !injected}
            onClick={() => injected && connect({ connector: injected })}
          >
            {isPending ? "Connecting…" : "Connect Wallet"}
          </button>
        </div>
      )}

      {isConnected ? <AiChat data={data} /> : null}

 
      {isConnected ? (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : null}
    </div>
  )
}

export function AppShell() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}