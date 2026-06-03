



"use client"

import { useState, useEffect } from "react"
import { Zap, Trophy, Sparkles, AlertCircle, Award, Gift, Clock } from "lucide-react"
import type { useRewardsData } from "@/lib/web3/use-rewards"
import { useRewardsActions } from "@/lib/web3/use-rewards"
import { useWaitForTransactionReceipt } from "wagmi"
import styles from "./dashboard.module.css"

type RewardsData = ReturnType<typeof useRewardsData>


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
  const [timeLeft, setTimeLeft] = useState<string>("") 


  const { isSuccess: isConfirmed, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const remaining = Number(data.remaining)
  const limit = Number(data.dailyLimit)
  const canAct = remaining > 0 && !busy


  useEffect(() => {
    const fetchUpdatedData = async () => {
      if (isConfirmed) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await data.refetch();
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

 
useEffect(() => {
    if (remaining > 0) return;

    const updateTimer = () => {
      const now = new Date();
   
      
      let nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 0, 0));

      
      if (now.getTime() >= nextReset.getTime()) {
        nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 6, 0, 0));
      }

      const diff = nextReset.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00h 00m 00s");
        data.refetch(); 
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [remaining, data]);

  async function handleAction() {
    if (!isMiniPay()) {
      setShowPopup(true);
      return;
    }

    setError(null)
    setBusy(true)
    setTxHash(undefined)
    
    try {
      const hash = await executeAction()
      setTxHash(hash as `0x${string}`)
    } catch (e: any) {
      const errorMsg = e?.shortMessage?.toLowerCase() || e?.message?.toLowerCase() || "";
      if (errorMsg.includes("user rejected") || errorMsg.includes("denied") || errorMsg.includes("cancel")) {
        setError("Transaction cancelled by user.");
      } else {
        setError(e?.shortMessage ?? e?.message ?? "Transaction failed");
      }
      setBusy(false);
    }
  }

 
  let buttonText = "Earn +5 Points"
  let ButtonIcon = Zap

  if (busy && !txHash) {
    buttonText = "Confirm in wallet…"
  } else if (busy && txHash) {
    buttonText = "Sending points…"
  } else if (remaining <= 0) {
    buttonText = `Resets in ${timeLeft}`
    ButtonIcon = Clock 
  }

  return (
    <div className={styles.dashboardContainer}>


      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
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
      <button 
        className={`${styles.actionBtn} ${remaining <= 0 ? styles.timerBtn : ''}`} 
        onClick={handleAction} 
        disabled={!canAct}
      >
        <ButtonIcon size={20} className={remaining <= 0 ? styles.spinSlow : ''} />
        {buttonText}
      </button>

      {/* 🏆 Premium Rewards Announcement Card */}
      <div className={styles.premiumRewardCard}>
        <div className={styles.prizeBadge}>
          <span className={styles.pulseDot}></span>
          $5 Monthly Prize Pool
        </div>

        <div className={styles.rewardHeader}>
          <Trophy size={24} className={styles.goldIcon} />
          <h2 className={styles.rewardTitle}>Monthly Leaderboard Challenge</h2>
          <Sparkles size={20} className={styles.goldIcon} />
        </div>

        <p className={styles.rewardDescription}>
          Climb the ranks and claim your share! At the end of every month, the <strong>Top 5 MiniPay Users</strong> on the leaderboard will receive an exclusive airdrop of <strong>$1 directly to their wallets</strong>.
        </p>


        <div className={styles.rewardSteps}>
          <div className={styles.step}>
            <Zap size={16} className={styles.stepIcon} />
            <span>Do Actions</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <Award size={16} className={styles.stepIcon} />
            <span>Earn Points</span>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <Gift size={16} className={styles.stepIcon} />
            <span>Win $1</span>
          </div>
        </div>
      </div>

 
      {error ? <p className={styles.note}>{error}</p> : null}


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