


// "use client"

// import { useEffect, useRef, useState } from "react"
// import { useChat } from "@ai-sdk/react"
// import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
// import { Bot, Send, Sparkles, X, Loader2 } from "lucide-react"
// import type { useRewardsData } from "@/lib/web3/use-rewards"
// import { useRewardsActions } from "@/lib/web3/use-rewards"
// import styles from "./ai-chat.module.css"

// type RewardsData = ReturnType<typeof useRewardsData>

// const SUGGESTIONS = [
//   "How many points do I have?",
//   "How many actions can I still do today?",
//   "Do 3 transactions for me",
// ]

// export function AiChat({ data }: { data: RewardsData }) {
//   const [open, setOpen] = useState(false)
//   const [input, setInput] = useState("")
//   const { batchExecuteAction } = useRewardsActions()
//   const scrollRef = useRef<HTMLDivElement>(null)

//   const { messages, sendMessage, status, addToolOutput } = useChat({
//     transport: new DefaultChatTransport({
//       api: "/api/chat",
//       prepareSendMessagesRequest: ({ messages }) => ({
//         body: { messages, userAddress: data.address },
//       }),
//     }),
//     sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
//     onToolCall: ({ toolCall }) => {
//       if (toolCall.dynamic) return
//       if (toolCall.toolName === "executeBatchActions") {
//         const { count } = toolCall.input as { count: number }
//         ;(async () => {
//           try {
//             const hash = await batchExecuteAction(count)
//             data.refetch()
//             addToolOutput({
//               tool: "executeBatchActions",
//               toolCallId: toolCall.toolCallId,
//               output: { status: "confirmed", count, txHash: hash },
//             })
//           } catch (e: any) {
//             addToolOutput({
//               tool: "executeBatchActions",
//               toolCallId: toolCall.toolCallId,
//               output: {
//                 status: "rejected",
//                 error: e?.shortMessage ?? e?.message ?? "User rejected the transaction.",
//               },
//             })
//           }
//         })()
//       }
//     },
//   })

//   useEffect(() => {
//     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
//   }, [messages])

//   function submit(text: string) {
//     const value = text.trim()
//     if (!value) return
//     sendMessage({ text: value })
//     setInput("")
//   }

//   return (
//     <>
//       <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open AI assistant">
//         <Sparkles size={24} />
//       </button>

//       {open ? (
//         <div className={styles.overlay} onClick={() => setOpen(false)}>
//           <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.panelHeader}>
//               <span className={styles.panelTitle}>
//                 <Bot size={18} />
//                 Rewards Assistant
//               </span>
//               <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
//                 <X size={20} />
//               </button>
//             </div>

//             <div className={styles.messages} ref={scrollRef}>
//               {messages.length === 0 ? (
//                 <div className={styles.empty}>
//                   Ask me about your points, or tell me to run some actions for you.
//                   <div className={styles.suggestions}>
//                     {SUGGESTIONS.map((s) => (
//                       <button key={s} className={styles.suggestion} onClick={() => submit(s)}>
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 messages.map((m) => (
//                   <MessageView key={m.id} message={m} />
//                 ))
//               )}

//               {(status === "submitted" || status === "streaming") && (!messages[messages.length - 1] || messages[messages.length - 1].role !== "assistant") && (
//                 <div className={styles.thinkingContainer}>
//                   <div className={styles.thinkingBubble}>
//                     <svg className={styles.thinkingSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     <span className={styles.thinkingText}>Thinking...</span>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <form
//               className={styles.form}
//               onSubmit={(e) => {
//                 e.preventDefault()
//                 submit(input)
//               }}
//             >
//               <input
//                 className={styles.input}
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 placeholder="Ask the assistant…"
//               />
//               <button
//                 className={styles.sendBtn}
//                 type="submit"
//                 disabled={status === "streaming" || status === "submitted" || !input.trim()}
//                 aria-label="Send"
//               >
//                 {status === "streaming" || status === "submitted" ? (
//                   <Loader2 size={18} className="spin" />
//                 ) : (
//                   <Send size={18} />
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       ) : null}
//     </>
//   )
// }

// function MessageView({ message }: { message: any }) {
//   return (
//     <>
//       {message.parts?.map((part: any, i: number) => {
//         if (part.type === "text") {
//           return (
//             <div
//               key={i}
//               className={`${styles.bubble} ${message.role === "user" ? styles.user : styles.assistant}`}
//             >
//               {part.text}
//             </div>
//           )
//         }

//         if (part.type === "tool-executeBatchActions") {
//           let label = "Preparing transaction…"
//           if (part.state === "input-available") label = "Waiting for wallet confirmation…"
//           if (part.state === "output-available") {
//             const out = part.output as { status?: string; count?: number }
//             label =
//               out?.status === "confirmed"
//                 ? `Confirmed ${out.count} action(s) on-chain`
//                 : "Transaction was not completed"
//           }
//           return (
//             <div key={i} className={styles.tool}>
//               <Sparkles size={14} />
//               {label}
//             </div>
//           )
//         }

//         if (part.type === "tool-getMyPoints" || part.type === "tool-getRemainingDailyTx") {
//           if (part.state !== "output-available") {
//             return (
//               <div key={i} className={styles.tool}>
//                 <Loader2 size={14} className="spin" />
//                 Reading the blockchain…
//               </div>
//             )
//           }
//         }

//         return null
//       })}
//     </>
//   )
// }



















"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { Bot, Send, Sparkles, X, Loader2, AlertCircle } from "lucide-react" 
import type { useRewardsData } from "@/lib/web3/use-rewards"
import { useRewardsActions } from "@/lib/web3/use-rewards"
import styles from "./ai-chat.module.css"
import Image from "next/image" 

type RewardsData = ReturnType<typeof useRewardsData>

const SUGGESTIONS = [
  "How many points do I have?",
  "How many actions can I still do today?",
  "Do 3 transactions for me",
]


const isMiniPay = () => {
  return (
    typeof window !== "undefined" && 
    (window as any).ethereum && 
    (window as any).ethereum.isMiniPay === true
  );
};

export function AiChat({ data }: { data: RewardsData }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [showPopup, setShowPopup] = useState(false) 
  
  const { batchExecuteAction } = useRewardsActions()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, userAddress: data.address },
      }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return
      
      if (toolCall.toolName === "executeBatchActions") {
        const { count } = toolCall.input as { count: number }
        
        
        if (!isMiniPay()) {
          setShowPopup(true); 
          
          addToolOutput({
            tool: "executeBatchActions",
            toolCallId: toolCall.toolCallId,
            output: {
              status: "rejected",
              error: "MiniPay wallet is required to perform this action.",
            },
          });
          return;
        }

        ;(async () => {
          try {
            const hash = await batchExecuteAction(count)
            data.refetch()
            addToolOutput({
              tool: "executeBatchActions",
              toolCallId: toolCall.toolCallId,
              output: { status: "confirmed", count, txHash: hash },
            })
          } catch (e: any) {
            addToolOutput({
              tool: "executeBatchActions",
              toolCallId: toolCall.toolCallId,
              output: {
                status: "rejected",
                error: e?.shortMessage ?? e?.message ?? "User rejected the transaction.",
              },
            })
          }
        })()
      }
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function submit(text: string) {
    const value = text.trim()
    if (!value) return
    sendMessage({ text: value })
    setInput("")
  }

  return (
    <>
      {/* <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open AI assistant">
        <Sparkles size={24} />
      </button> */}

      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open AI assistant">
        <Image 
          src="/logo.png" 
          alt="AI Assistant Logo" 
          width={60} 
          height={60} 
          className={styles.appLogo}
        />
      </button>

      {open ? (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>
                {/* <Bot size={18} /> */}
                <Image 
                  src="/logo1.png" 
                  alt="App Logo" 
                  width={20} 
                  height={20} 
                  className={styles.appLogo}
                />
                Rewards Assistant
              </span>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className={styles.messages} ref={scrollRef}>
              {messages.length === 0 ? (
                <div className={styles.empty}>
                  Ask me about your points, or tell me to run some actions for you.
                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className={styles.suggestion} onClick={() => submit(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <MessageView key={m.id} message={m} />
                ))
              )}

              {(status === "submitted" || status === "streaming") && (!messages[messages.length - 1] || messages[messages.length - 1].role !== "assistant") && (
                <div className={styles.thinkingContainer}>
                  <div className={styles.thinkingBubble}>
                    <svg className={styles.thinkingSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className={styles.thinkingText}>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault()
                submit(input)
              }}
            >
              <input
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the assistant…"
              />
              <button
                className={styles.sendBtn}
                type="submit"
                disabled={status === "streaming" || status === "submitted" || !input.trim()}
                aria-label="Send"
              >
                {status === "streaming" || status === "submitted" ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}

    
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
    </>
  )
}

function MessageView({ message }: { message: any }) {
  return (
    <>
      {message.parts?.map((part: any, i: number) => {
        if (part.type === "text") {
          return (
            <div
              key={i}
              className={`${styles.bubble} ${message.role === "user" ? styles.user : styles.assistant}`}
            >
              {part.text}
            </div>
          )
        }

        if (part.type === "tool-executeBatchActions") {
          let label = "Preparing transaction…"
          if (part.state === "input-available") label = "Waiting for wallet confirmation…"
          if (part.state === "output-available") {
            const out = part.output as { status?: string; count?: number; error?: string }
            
            label =
              out?.status === "confirmed"
                ? `Confirmed ${out.count} action(s) on-chain`
                : out?.error === "MiniPay wallet is required to perform this action."
                ? "Transaction blocked (Requires MiniPay)"
                : "Transaction was not completed"
          }
          return (
            <div key={i} className={styles.tool}>
              <Sparkles size={14} />
              {label}
            </div>
          )
        }

        if (part.type === "tool-getMyPoints" || part.type === "tool-getRemainingDailyTx") {
          if (part.state !== "output-available") {
            return (
              <div key={i} className={styles.tool}>
                <Loader2 size={14} className="spin" />
                Reading the blockchain…
              </div>
            )
          }
        }

        return null
      })}
    </>
  )
}