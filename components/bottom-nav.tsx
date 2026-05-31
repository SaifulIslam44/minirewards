"use client"

import { LayoutDashboard, Trophy } from "lucide-react"
import styles from "./bottom-nav.module.css"

// প্রপস হিসেবে activeTab এবং সেটি চেঞ্জ করার ফাংশন নিচ্ছি
interface BottomNavProps {
  activeTab: "dashboard" | "leaderboard";
  setActiveTab: (tab: "dashboard" | "leaderboard") => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className={styles.navContainer}>
      <button 
        onClick={() => setActiveTab("dashboard")}
        className={`${styles.navItem} ${activeTab === "dashboard" ? styles.active : ""}`}
      >
        <LayoutDashboard size={24} />
        <span>Dashboard</span>
      </button>
      
      <button 
        onClick={() => setActiveTab("leaderboard")}
        className={`${styles.navItem} ${activeTab === "leaderboard" ? styles.active : ""}`}
      >
        <Trophy size={24} />
        <span>Leaderboard</span>
      </button>
    </nav>
  )
}