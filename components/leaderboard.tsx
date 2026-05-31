"use client"

import { Trophy, Crown, Sparkles, Gift } from "lucide-react"
import styles from "./leaderboard.module.css"

type Entry = { address: `0x${string}`; points: bigint }

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function Leaderboard({ entries, self }: { entries: Entry[]; self?: string }) {
  const top = [...entries].sort((a, b) => (b.points > a.points ? 1 : -1)).slice(0, 10)

  return (
    <div className={styles.container}>
      <div className={styles.rewardBanner}>
        <div className={styles.badgeWrapper}>
          <span className={styles.pulseDot}></span>
          $5 Monthly Prize Pool
        </div>
        <h3 className={styles.rewardTitle}>
          <Crown size={22} className={styles.goldIcon} />
          Top 5 Winners
          <Sparkles size={18} className={styles.goldIcon} />
        </h3>
        <p className={styles.rewardText}>
          Climb the ranks! At the end of every month, the <strong>Top 5 MiniPay Users</strong> will each receive an exclusive <strong>$1 airdrop</strong> directly to their wallets.
        </p>
      </div>

      <section className={styles.card}>
        <h2 className={styles.title}>
          <Trophy size={18} className={styles.titleIcon} />
           Monthly Leaderboard
           <Trophy size={18} className={styles.titleIcon} />
        </h2>

        {top.length === 0 ? (
          <p className={styles.empty}>No points earned yet. Be the first to claim the top spot!</p>
        ) : (
          <ol className={styles.list}>
            {top.map((entry, i) => {
              const isSelf = self && entry.address.toLowerCase() === self.toLowerCase()
              const isWinner = i < 5
              
              return (
                <li
                  key={entry.address}
                  className={`${styles.row} ${isSelf ? styles.rowSelf : ""} ${isWinner ? styles.rowWinner : ""}`}
                >
                  <span className={`${styles.rank} 
                    ${i === 0 ? styles.rank1 : ""} 
                    ${i === 1 ? styles.rank2 : ""} 
                    ${i === 2 ? styles.rank3 : ""} 
                    ${i > 2 && i < 5 ? styles.rankTop5 : ""}
                  `}>
                    {i === 0 ? <Crown size={14} /> : i + 1}
                  </span>
                  
                  <span className={styles.addr}>
                    {shorten(entry.address)}
                    {isSelf ? <span className={styles.you}>You</span> : null}
                  </span>
                  
                  <div className={styles.ptsWrapper}>
                    <span className={styles.pts}>{entry.points.toString()} pts</span>
                    {isWinner && <Gift size={14} className={styles.giftIcon} />}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}