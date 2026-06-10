"use client"
import { useEffect, useRef, useState } from "react"
import { useReadContract, useWaitForTransactionReceipt, useWriteContract, useAccount, usePublicClient } from "wagmi"
import { erc20Config, insurancePoolConfig } from "../lib/contractAddress"
import { ReadContractErrorType } from "wagmi/actions"
import { erc20Abi } from "../lib/erc20Abi"
import { INSURANCE_ABI } from "../lib/insuranceAbi"
// import { Policy } from "./PolicyCard"
export interface Policy {
  user: `0x${string}`,
  triggerPrice: bigint,
  payoutAmount: bigint,
  tokenInsured: string,
  insuranceCost: bigint,
  expiresAt: bigint,
  policyId: bigint,
  status: 0,
}

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", bg: "rgba(98,126,234,0.25)", color: "#8fa8f8" },
  { symbol: "BTC", name: "Bitcoin", bg: "rgba(247,147,26,0.25)", color: "#f7b84a" },
]

export function InsureForm() {
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [triggerPrice, setTriggerPrice] = useState("")
  const [payoutAmount, setPayoutAmount] = useState("")
  const [duration, setDuration] = useState("96")

  const { address } = useAccount()
  const pendingPolicyRef = useRef<Policy | null>(null)

  // const [premiumPrice, setPremiumPrice] = useState<string | null>(null)
  // const [premiumPending, setPremiumPending] = useState(false)
  // const [premiumError, setPremiumError] = useState<ReadContractErrorType | null>(null)

  const durationDays = duration ? Math.round(Number(duration) / 24) : 0
  const premium =
    payoutAmount && duration
      ? ((Number(payoutAmount) * 3 * Number(duration)) / 10000).toFixed(2)
      : null

  const inputClass = "w-full bg-[#131920] border border-[#253040] rounded-xl px-4 py-3 md:py-3.5 text-sm font-mono text-white placeholder:text-[#3a5060] outline-none focus:border-[#00e5a0] focus:bg-[#0d1520] transition-all"
  const labelClass = "block text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-2 md:mb-2.5 font-medium"




  const {
    data: hashTokenApprove,
    isPending: tokenApprovePending,
    writeContract: tokenApprove
  } = useWriteContract()


  const client = usePublicClient()
  const {
    data: hashInsure,
    isPending: tokenInsurePending,
    writeContract: tokenInsure
  } = useWriteContract()


  const durationInHours = BigInt(Number(duration))

  const { isSuccess: tokenApproveConfirmed,  } = useWaitForTransactionReceipt({
    hash: hashTokenApprove,
    query: { enabled: !!hashTokenApprove },
  })

    const { isSuccess: insureApproveConfirmed } = useWaitForTransactionReceipt({
    hash: hashInsure,
    query: { enabled: !!hashInsure },
  })

  const { data: premiumPrice, isPending: premiumPending, error: premiumError } = useReadContract({
    ...insurancePoolConfig,
    functionName: 'calculatePremium',
    args: [
      BigInt(Number(payoutAmount)), durationInHours],
    query: {
      enabled: !!triggerPrice && !!payoutAmount && !!duration,
    }
  })


  const insureToken = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const durationInHours = Number(duration)
      const expiresAt = BigInt(Math.floor(Date.now() / 1000) + durationInHours * 3600)
      console.log(selectedToken)
      const policy: Policy = {
        user: address as `0x${string}`,
        triggerPrice: BigInt(triggerPrice),
        payoutAmount: BigInt(payoutAmount),
        tokenInsured: selectedToken,
        insuranceCost: premiumPrice as bigint,
        expiresAt: expiresAt,
        policyId: BigInt(0),
        status: 0,

      }

      console.log(policy)
      pendingPolicyRef.current = policy;
      await tokenApprove({
        address: erc20Config.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [insurancePoolConfig.address, policy.insuranceCost as bigint],
      })



              const result = await client?.simulateContract({
        address: insurancePoolConfig.address,
        abi: INSURANCE_ABI,
        functionName: 'insureAsset',
        args: [policy],
        account: address,
      })
      //         }

      console.log("policy hash:", hashInsure)
    }
    catch (error) {
      console.error("Error during insurance process:", error)
    }




  }
  useEffect(() => {
    if (tokenApproveConfirmed) {
      console.log("Token approved, now insuring...")
      if (pendingPolicyRef.current) {
        tokenInsure({
          address: insurancePoolConfig.address,
          abi: INSURANCE_ABI,
          functionName: 'insureAsset',
          args: [pendingPolicyRef.current],
        })
      }
    }

  }, [tokenApproveConfirmed])
  return (
    <div className="bg-[#0d1117] border border-[#1e2832] rounded-2xl overflow-hidden md:sticky md:top-20 ">
      {/* Tabs */}
      <div className="flex border-b border-[#1e2832]">
        {["Insure", "My Policies"].map((tab, i) => (
          <div
            key={tab}
            className={`flex-1 py-3.5 md:py-4 text-center text-sm font-bold cursor-pointer transition-colors ${i === 0
              ? "text-[#00e5a0] border-b-2 border-[#00e5a0] -mb-px bg-[#00e5a0]/3"
              : "text-[#5a7080] hover:text-[#a0b4c0]"
              }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5">
        {/* Token selector */}
        <div className="w-full">
          <label className={labelClass}>Select token</label>
          <div className="grid grid-cols-2 gap-2">
            {TOKENS.map((token) => {
              const sel = selectedToken === token.symbol
              return (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token.symbol)}
                  className={`flex items-center gap-2 md:gap-3 p-3 md:p-3.5 rounded-xl border text-sm font-bold transition-all ${sel
                    ? "border-[#00e5a0] bg-[#00e5a0]/8 text-white"
                    : "border-[#253040] bg-[#131920] text-[#a0b4c0] hover:border-[#3a5060]"
                    }`}
                >
                  <div className={`w-2 h-2 rounded-full transition-all ${sel ? "bg-[#00e5a0]" : "bg-[#253040]"}`} />
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono" style={{ background: token.bg, color: token.color }}>
                    {token.symbol.slice(0, 1)}
                  </div>
                  <span className="text-xs md:text-sm">{token.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full">
          <label className={labelClass}>Trigger price (USD)</label>
          <input type="number" placeholder="e.g. 2000" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Payout amount (USDT)</label>
          <input type="number" placeholder="e.g. 300" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>
            Duration (hours)
            {durationDays > 0 && <span className="text-[#00e5a0] ml-2 normal-case">— {durationDays} day{durationDays > 1 ? "s" : ""}</span>}
          </label>
          <input type="number" placeholder="e.g. 96" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
        </div>

        {/* Premium breakdown */}
        {premium && (
          <div className="bg-[#080b0f] border border-[#1e2832] rounded-xl p-4">
            <div className="space-y-2 mb-3">
              {[
                { label: "Coverage", value: `${payoutAmount} USDT` },
                { label: "Duration", value: `${duration}h` },
                { label: "Rate", value: "0.03% / hr" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-[#5a7080] font-mono">{r.label}</span>
                  <span className="font-mono text-[#a0b4c0]">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold pt-3 border-t border-[#1e2832]">
              <span className="text-[#a0b4c0] font-mono"> Premium </span>
              <span className="font-mono text-[#00e5a0] text-base">{String(premiumPrice)} wei</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button onClick={insureToken} className="w-full bg-[#00e5a0] text-black font-mono text-sm font-bold py-3.5 md:py-4 rounded-xl hover:bg-[#00b87a] transition-colors shadow-[0_4px_20px_rgba(0,229,160,0.2)]">
          Approve & Insure →
        </button>

        {/* Notice */}
        <div className="p-3 md:p-4 bg-[#00e5a0]/5 border border-[#00e5a0]/15 rounded-xl">
          <p className="text-xs font-mono text-[#5a7080] leading-relaxed">
            🤖 A Somnia Agent verifies the current <span className="text-[#a0b4c0]">{selectedToken}</span> price before activating your policy. If the price is already below your trigger, your premium is refunded automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
