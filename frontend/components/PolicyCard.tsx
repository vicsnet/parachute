"use client"

export type PolicyStatus = "Active" | "Pending" | "Claimed" | "Expired"

export interface Policy {
  id: number
  tokenInsured: string
  tokenName: string
  triggerPrice: string
  payoutAmount: string
  insuranceCost: string
  timeLeft: string
  progress: number
  status: PolicyStatus
}

const TOKEN_STYLES: Record<string, { bg: string; color: string }> = {
  ETH: { bg: "rgba(98,126,234,0.25)", color: "#8fa8f8" },
  BTC: { bg: "rgba(247,147,26,0.25)", color: "#f7b84a" },
}

const STATUS_STYLES: Record<PolicyStatus, string> = {
  Active: "bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30",
  Pending: "bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30",
  Claimed: "bg-[#ff4d6a]/15 text-[#ff4d6a] border border-[#ff4d6a]/30",
  Expired: "bg-[#1e2832] text-[#5a7080] border border-[#253040]",
}

const STATUS_ICONS: Record<PolicyStatus, string> = {
  Active: "●", Pending: "◌", Claimed: "✓", Expired: "✕",
}

export function PolicyCard({ policy }: { policy: Policy }) {
  const tokenStyle = TOKEN_STYLES[policy.tokenInsured] ?? { bg: "#1e2832", color: "#e8edf3" }

  return (
    <div className={`rounded-2xl p-4 md:p-6 transition-all ${
      policy.status === "Active"
        ? "bg-[#0d1520] border border-[#00e5a0]/25 shadow-[0_0_20px_rgba(0,229,160,0.05)]"
        : policy.status === "Pending"
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
            {policy.tokenInsured}
          </div>
          <div>
            <div className="font-bold text-sm md:text-base text-white">{policy.tokenName}</div>
            <div className="text-xs text-[#5a7080] font-mono mt-0.5">Policy #{String(policy.id).padStart(4, "0")}</div>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 ${STATUS_STYLES[policy.status]}`}>
          <span>{STATUS_ICONS[policy.status]}</span>
          <span className="hidden sm:inline">{policy.status.toUpperCase()}</span>
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
        {[
          { label: "Trigger", value: policy.triggerPrice, color: "text-[#ff6b80]" },
          { label: "Payout", value: policy.payoutAmount, color: "text-[#00e5a0]" },
          { label: "Premium", value: policy.insuranceCost, color: "text-[#a0b4c0]" },
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
          {policy.status === "Pending" ? "Verifying..." : policy.timeLeft}
        </span>
        <div className="flex-1 h-1 bg-[#1e2832] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${policy.progress}%`,
              background: policy.status === "Claimed" ? "#ff4d6a" : policy.status === "Pending" ? "#f5a623" : "#00e5a0",
            }}
          />
        </div>
        {policy.status === "Active" && (
          <button className="text-xs font-mono font-bold px-3 py-1.5 md:px-4 md:py-2 border border-[#253040] rounded-xl text-[#a0b4c0] hover:border-[#00e5a0] hover:text-[#00e5a0] transition-colors whitespace-nowrap">
            Check
          </button>
        )}
        {policy.status === "Claimed" && (
          <button className="text-xs font-mono font-bold px-3 py-1.5 md:px-4 md:py-2 border border-[#253040] rounded-xl text-[#5a7080] hover:text-[#a0b4c0] transition-colors">
            Receipt
          </button>
        )}
      </div>
    </div>
  )
}
