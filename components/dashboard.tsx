// "use client"

// import { useState } from "react"
// import { Zap } from "lucide-react"
// import type { useRewardsData } from "@/lib/web3/use-rewards"
// import { useRewardsActions } from "@/lib/web3/use-rewards"
// import styles from "./dashboard.module.css"

// type RewardsData = ReturnType<typeof useRewardsData>

// export function Dashboard({ data }: { data: RewardsData }) {
//   const { executeAction } = useRewardsActions()
//   const [busy, setBusy] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const remaining = Number(data.remaining)
//   const limit = Number(data.dailyLimit)
//   const canAct = remaining > 0 && !busy

//   async function handleAction() {
//     setError(null)
//     setBusy(true)
//     try {
//       await executeAction()
//       data.refetch()
//     } catch (e: any) {
//       setError(e?.shortMessage ?? e?.message ?? "Transaction failed")
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <>
//       <section className={styles.hero}>
//         <span className={styles.heroLabel}>Total Points</span>
//         <span className={styles.heroPoints}>
//           {data.points.toString()}
//           <span className={styles.heroUnit}>pts</span>
//         </span>
//       </section>

//       <section className={styles.stats}>
//         <div className={styles.statCard}>
//           <span className={styles.statValue}>{remaining}</span>
//           <span className={styles.statLabel}>Actions left today</span>
//         </div>
//         <div className={styles.statCard}>
//           <span className={styles.statValue}>{limit}</span>
//           <span className={styles.statLabel}>Daily limit</span>
//         </div>
//       </section>

//       <button className={styles.actionBtn} onClick={handleAction} disabled={!canAct}>
//         <Zap size={20} />
//         {busy ? "Confirm in wallet…" : remaining > 0 ? "Execute Action" : "Daily limit reached"}
//       </button>

//       {error ? <p className={styles.note}>{error}</p> : null}
//     </>
//   )
// }

































"use client"

import { useState, useEffect } from "react"
import { Zap, Trophy, Sparkles, AlertCircle } from "lucide-react"
import type { useRewardsData } from "@/lib/web3/use-rewards"
import { useRewardsActions } from "@/lib/web3/use-rewards"
import { useWaitForTransactionReceipt } from "wagmi"
import styles from "./dashboard.module.css"

type RewardsData = ReturnType<typeof useRewardsData>

// MiniPay চেক করার ফাংশন
const isMiniPay = () => {
  return (
    typeof window !== "undefined" && 
    (window as any).ethereum && 
    (window as any).ethereum.isMiniPay === true
  );
};

export function Dashboard({ data }: { data: RewardsData }) {
  const { executeAction } = useRewardsActions()
  
  // States
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  // ব্লকচেইনে মাইন হওয়ার জন্য অপেক্ষা করার হুক
  const { isSuccess: isConfirmed, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const remaining = Number(data.remaining)
  const limit = Number(data.dailyLimit)
  
  const canAct = remaining > 0 && !busy

  // ট্রানজেকশন সাকসেস বা ফেইল হলে পয়েন্ট রিফ্রেশ করা
  useEffect(() => {
    const fetchUpdatedData = async () => {
      if (isConfirmed) {
        // RPC নোড আপডেট হওয়ার জন্য ২ সেকেন্ড অপেক্ষা করবে (Sync delay fix)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // এরপর নতুন পয়েন্ট রিফেচ করবে
        await data.refetch();
        
        // পয়েন্ট আপডেট হওয়ার পর স্টেট ক্লিয়ার করবে
        setTxHash(undefined);
        setBusy(false);
      }
      
      if (isTxError) {
        setError("Transaction failed on blockchain.");
        setTxHash(undefined);
        setBusy(false);
      }
    };

    if (isConfirmed || isTxError) {
      fetchUpdatedData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, isTxError])

  async function handleAction() {
    // MiniPay চেক করা
    if (!isMiniPay()) {
      setShowPopup(true);
      return;
    }

    setError(null)
    setBusy(true) // "Confirm in wallet..." শুরু হবে
    setTxHash(undefined)
    
    try {
      const hash = await executeAction()
      setTxHash(hash as `0x${string}`) // হুকটি "Sending points..." স্টেট চালু করবে
    } catch (e: any) {
      // ইউজার ওয়ালেট থেকে ক্যানসেল করলে সুন্দর মেসেজ দেখাবে
      const errorMsg = e?.shortMessage?.toLowerCase() || e?.message?.toLowerCase() || "";
      if (errorMsg.includes("user rejected") || errorMsg.includes("denied") || errorMsg.includes("cancel")) {
        setError("Transaction cancelled by user.");
      } else {
        setError(e?.shortMessage ?? e?.message ?? "Transaction failed");
      }
      setBusy(false); // ক্যানসেল করলে আবার বাটন আগের মতো হয়ে যাবে
    }
  }

  // বাটন টেক্সট লজিক
  let buttonText = "Earn +5 Points"
  if (busy && !txHash) {
    buttonText = "Confirm in wallet…"
  } else if (busy && txHash) {
    buttonText = "Sending points…" // Confirming এর জায়গায় Sending points...
  } else if (remaining <= 0) {
    buttonText = "Daily limit reached"
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* 🏆 Premium Rewards Announcement Card */}
      <div className={styles.premiumRewardCard}>
        <div className={styles.rewardHeader}>
          <Trophy size={22} className={styles.goldIcon} />
          <h2 className={styles.rewardTitle}>Exclusive Monthly Rewards</h2>
          <Sparkles size={18} className={styles.goldIcon} />
        </div>
        <p className={styles.rewardDescription}>
          Climb the ranks and claim your share! At the end of every month, the <strong>Top 5 MiniPay Users</strong> with the highest accumulated points will be airdropped exclusive premium rewards directly to their wallets. Execute your daily actions, maximize your points, and secure your spot on the elite leaderboard.
        </p>
      </div>

      {/* 💎 Hero Section */}
      <section className={styles.hero}>
        <span className={styles.heroLabel}>Total Points</span>
        <span className={styles.heroPoints}>
          {data.points.toString()}
          <span className={styles.heroUnit}>pts</span>
        </span>
      </section>

      {/* 📊 Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{remaining}</span>
          <span className={styles.statLabel}>Actions left today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{limit}</span>
          <span className={styles.statLabel}>Daily limit</span>
        </div>
      </section>

      {/* ⚡ Action Button */}
      <button className={styles.actionBtn} onClick={handleAction} disabled={!canAct}>
        <Zap size={20} />
        {buttonText}
      </button>

      {/* ❌ Error Note */}
      {error ? <p className={styles.note}>{error}</p> : null}

      {/* 🚨 Premium MiniPay Popup Modal */}
      {showPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIconContainer}>
              <AlertCircle size={40} className={styles.alertIcon} />
            </div>
            <h3 className={styles.modalTitle}>MiniPay Required</h3>
            <p className={styles.modalText}>
              Please open this dApp inside the <strong>Opera MiniPay</strong> wallet application to execute transactions and earn points!
            </p>
            <button className={styles.modalOkBtn} onClick={() => setShowPopup(false)}>
              OK, Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}