"use client"

export type PolicyStatus = 0 | 1 | 2 | 3

export interface Policy {
  user: `0x${string}`
  triggerPrice: bigint
  payoutAmount: bigint
  tokenInsured: string
  insuranceCost: bigint
  expiresAt: bigint
  status: PolicyStatus
}

const TOKEN_STYLES: Record<string, { bg: string; color: string }> = {
  ETH: { bg: "rgba(98,126,234,0.25)", color: "#8fa8f8" },
  BTC: { bg: "rgba(247,147,26,0.25)", color: "#f7b84a" },
}

const STATUS_STYLES: Record<PolicyStatus, string> = {
  0: "bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30",
  1: "bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30",
  2: "bg-[#ff4d6a]/15 text-[#ff4d6a] border border-[#ff4d6a]/30",
  3: "bg-[#1e2832] text-[#5a7080] border border-[#253040]",
}

const STATUS_ICONS: Record<PolicyStatus, string> = {
  0: "◌",
  1: "●",
  2: "✓",
  3: "✕",
}

const STATUS_LABELS: Record<PolicyStatus, string> = {
  0: "Pending",
  1: "Active",
  2: "Claimed",
  3: "Expired",
}

// format bigint price to readable string
function formatAmount(amount: bigint): string {
  return `$${(Number(amount) / 1e6).toFixed(2)}`
}

// calculate time left from expiresAt
function timeLeft(expiresAt: bigint): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = Number(expiresAt) - now
  if (remaining <= 0) return "Expired"
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}

// calculate progress percentage
function progress(expiresAt: bigint): number {
  const now = Math.floor(Date.now() / 1000)
  const duration = 3 * 24 * 3600 // assume 3 days default
  const remaining = Number(expiresAt) - now
  return Math.min(100, Math.max(0, Math.round(((duration - remaining) / duration) * 100)))
}

export function PolicyCard({ policy }: { policy: Policy }) {
  const tokenStyle = TOKEN_STYLES[policy.tokenInsured] ?? { bg: "#1e2832", color: "#e8edf3" }

  return (
    <div className={`rounded-2xl p-4 md:p-6 transition-all ${policy.status === 1
        ? "bg-[#0d1520] border border-[#00e5a0]/25 shadow-[0_0_20px_rgba(0,229,160,0.05)]"
        : policy.status === 0
          ? "bg-[#0d1117] border border-[#f5a623]/20"
          : "bg-[#0d1117] border border-[#1e2832]"
      }`}>
     
      {/* Top */}
      <div className="flex items-center justify-between mb-4 md:mb-5">
        <div className="flex items-center gap-3">
          
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono"
            style={{ background: tokenStyle.bg, color: tokenStyle.color }}
          >
            {policy.tokenInsured} {/* tokenInsured */}
          </div>
          <div>
            <div className="font-bold text-sm md:text-base text-white">{policy.tokenInsured === "ETH" ? "Ethereum" : policy.tokenInsured === "BTC" ? "Bitcoin" : policy.tokenInsured}</div>
             <div className="text-xs text-[#5a7080] font-mono">ID: {policy.user.slice(0, 6)}...{policy.user.slice(-4)}</div>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 ${STATUS_STYLES[policy.status]}`}>
          <span>{STATUS_ICONS[policy.status]}</span>
          <span className="hidden sm:inline">{STATUS_LABELS[policy.status]}</span>
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
        {[
          { label: "Trigger", value: policy.triggerPrice?.toString(), color: "text-[#ff6b80]" },
          { label: "Payout", value: policy.payoutAmount?.toString(), color: "text-[#00e5a0]" },
          { label: "Premium", value: policy.insuranceCost?.toString(), color: "text-[#a0b4c0]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#080b0f] border border-[#1e2832] rounded-xl px-3 py-2.5 md:px-4 md:py-3">
            <div className="text-xs text-[#5a7080] font-mono uppercase tracking-wider mb-1 md:mb-1.5">{s.label}</div>
            <div className={`text-sm md:text-base font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#1e2832]">
        <span className="text-xs font-mono text-[#5a7080] whitespace-nowrap min-w-[80px] md:min-w-[100px]">
          {policy.status === 0 ? "Verifying..." : timeLeft(policy.expiresAt)}
        </span>
        <div className="flex-1 h-1 bg-[#1e2832] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress(policy.expiresAt)}%`,
              background: policy.status === 2
                ? "#ff4d6a"
                : policy.status === 0
                  ? "#f5a623"
                  : "#00e5a0",
            }}
          />
        </div>
        {policy.status === 1 && (
          <button className="text-xs font-mono font-bold px-3 py-1.5 md:px-4 md:py-2 border border-[#253040] rounded-xl text-[#a0b4c0] hover:border-[#00e5a0] hover:text-[#00e5a0] transition-colors whitespace-nowrap">
            Check
          </button>
        )}
        {policy.status === 2 && (
          <button className="text-xs font-mono font-bold px-3 py-1.5 md:px-4 md:py-2 border border-[#253040] rounded-xl text-[#5a7080] hover:text-[#a0b4c0] transition-colors">
            Receipt
          </button>
        )}
      </div>
    </div>
  )
}