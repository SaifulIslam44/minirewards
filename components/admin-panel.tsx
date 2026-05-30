"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import type { useRewardsData } from "@/lib/web3/use-rewards"
import { useRewardsActions } from "@/lib/web3/use-rewards"
import styles from "./admin-panel.module.css"

type RewardsData = ReturnType<typeof useRewardsData>

export function AdminPanel({ data }: { data: RewardsData }) {
  const { setDailyTxLimit, setPointsPerTx } = useRewardsActions()
  const [limit, setLimit] = useState("")
  const [points, setPoints] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function save(kind: "limit" | "points") {
    setMsg(null)
    setBusy(kind)
    try {
      if (kind === "limit") {
        await setDailyTxLimit(BigInt(limit || "0"))
        setLimit("")
      } else {
        await setPointsPerTx(BigInt(points || "0"))
        setPoints("")
      }
      data.refetch()
      setMsg("Updated. Changes apply after confirmation.")
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Transaction failed")
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        <Settings size={18} />
        Admin Panel
        <span className={styles.badge}>Owner</span>
      </h2>

      <div className={styles.field}>
        <label className={styles.label}>Daily transaction limit</label>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="number"
            min="1"
            inputMode="numeric"
            placeholder={`Current: ${data.dailyLimit.toString()}`}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
          <button
            className={styles.saveBtn}
            disabled={busy === "limit" || !limit}
            onClick={() => save("limit")}
          >
            {busy === "limit" ? "…" : "Save"}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Points per transaction</label>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Set new value"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <button
            className={styles.saveBtn}
            disabled={busy === "points" || !points}
            onClick={() => save("points")}
          >
            {busy === "points" ? "…" : "Save"}
          </button>
        </div>
      </div>

      {msg ? <p className={styles.note}>{msg}</p> : null}
    </section>
  )
}
