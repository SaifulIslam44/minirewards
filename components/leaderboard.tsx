"use client"

import { Trophy } from "lucide-react"
import styles from "./leaderboard.module.css"

type Entry = { address: `0x${string}`; points: bigint }

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function Leaderboard({ entries, self }: { entries: Entry[]; self?: string }) {
  const top = [...entries].sort((a, b) => (b.points > a.points ? 1 : -1)).slice(0, 10)

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        <Trophy size={18} />
        Leaderboard
      </h2>

      {top.length === 0 ? (
        <p className={styles.empty}>No points earned yet. Be the first!</p>
      ) : (
        <ol className={styles.list}>
          {top.map((entry, i) => {
            const isSelf = self && entry.address.toLowerCase() === self.toLowerCase()
            return (
              <li
                key={entry.address}
                className={`${styles.row} ${isSelf ? styles.rowSelf : ""}`}
              >
                <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ""}`}>
                  {i + 1}
                </span>
                <span className={styles.addr}>
                  {shorten(entry.address)}
                  {isSelf ? <span className={styles.you}>You</span> : null}
                </span>
                <span className={styles.pts}>{entry.points.toString()} pts</span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
