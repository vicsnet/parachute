"use client"
import { PolicyCard, type Policy } from "@/components/PolicyCard"
import { InsureForm } from "@/components/InsureForm"

const DUMMY_POLICIES: Policy[] = [
  { id: 42, tokenInsured: "ETH", tokenName: "Ethereum", triggerPrice: "$2,000", payoutAmount: "$300", insuranceCost: "$5.76", timeLeft: "2d 14h left", progress: 40, status: "Active" },
  { id: 38, tokenInsured: "BTC", tokenName: "Bitcoin", triggerPrice: "$60,000", payoutAmount: "$500", insuranceCost: "$9.60", timeLeft: "Pending", progress: 70, status: "Pending" },
  { id: 31, tokenInsured: "ETH", tokenName: "Ethereum", triggerPrice: "$1,800", payoutAmount: "$200", insuranceCost: "$3.84", timeLeft: "Paid out 3d ago", progress: 100, status: "Claimed" },
]

const PRICES = [
  { symbol: "ETH", name: "Ethereum", bg: "rgba(98,126,234,0.25)", color: "#8fa8f8", price: "$2,418.50", change: "+2.4%", positive: true },
  { symbol: "BTC", name: "Bitcoin", bg: "rgba(247,147,26,0.25)", color: "#f7b84a", price: "$67,240.00", change: "-0.8%", positive: false },
]

const ACTIVITY = [
  { color: "#00e5a0", text: "Policy #0042 activated", sub: "— ETH verified at $2,418.50, above trigger of $2,000", time: "2m ago" },
  { color: "#f5a623", text: "Policy #0038 pending", sub: "— Agent fetching BTC price from CoinGecko", time: "5m ago" },
  { color: "#ff4d6a", text: "Policy #0031 claimed", sub: "— ETH dropped to $1,792 below $1,800. $200 USDT sent", time: "3d ago" },
]

export default function Dashboard() {
  return (
    <div className="mt-20 px-4 py-6 md:px-10 md:py-8">
      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 mt-[50px]">
        {[
          { label: "Pool Balance", value: "$284,500", green: true },
          { label: "Active Policies", value: "1,247", green: false },
          { label: "Total Paid Out", value: "$48,320", green: true },
          { label: "Avg Premium", value: "1.92%", green: false },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d1117] border border-[#1e2832] rounded-2xl p-4 md:p-6">
            <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-2 md:mb-3 font-medium leading-tight">{s.label}</div>
            <div className={`text-xl md:text-3xl font-black font-mono ${s.green ? "text-[#00e5a0]" : "text-white"}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Main — single col on mobile, two col on desktop */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Live prices */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 font-medium">Live prices</div>
            <div className="flex flex-col gap-3">
              {PRICES.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between px-4 py-3.5 md:px-5 md:py-4 bg-[#0d1117] border border-[#1e2832] rounded-2xl hover:border-[#253040] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono" style={{ background: token.bg, color: token.color }}>
                      {token.symbol}
                    </div>
                    <div>
                      <div className="font-bold text-sm md:text-base text-white">{token.name}</div>
                      <div className="text-xs text-[#5a7080] font-mono mt-0.5 hidden sm:block">{token.symbol}/USD</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className={`text-xs font-mono font-bold px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg ${token.positive ? "bg-[#00e5a0]/10 text-[#00e5a0]" : "bg-[#ff4d6a]/10 text-[#ff4d6a]"}`}>
                      {token.change}
                    </span>
                    <span className="font-mono font-bold text-base md:text-lg text-white">{token.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 font-medium">My policies</div>
            <div className="flex flex-col gap-3 md:gap-4">
              {DUMMY_POLICIES.map((p) => <PolicyCard key={p.id} policy={p} />)}
            </div>
          </div>

          {/* Activity */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 font-medium">Agent activity</div>
            <div className="bg-[#0d1117] border border-[#1e2832] rounded-2xl overflow-hidden">
              {ACTIVITY.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 md:gap-4 px-4 py-4 md:px-6 md:py-5 ${i < ACTIVITY.length - 1 ? "border-b border-[#1e2832]" : ""}`}>
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 text-xs md:text-sm leading-relaxed min-w-0">
                    <span className="text-white font-bold">{item.text}</span>
                    <span className="text-[#5a7080]"> {item.sub}</span>
                  </div>
                  <span className="text-xs font-mono text-[#3a5060] whitespace-nowrap pt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form — below content on mobile, side panel on desktop */}
        <div>
          <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 font-medium">New policy</div>
          <InsureForm />
        </div>
      </div>
    </div>
  )
}
