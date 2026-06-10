"use client"
import { PolicyCard, type Policy } from "@/components/PolicyCard"
import { InsureForm } from "@/components/InsureForm"
import { useAccount, useReadContract, useReadContracts } from "wagmi"
import { insurancePoolConfig } from "@/lib/contractAddress"

// const DUMMY_POLICIES: Policy[] = [
//   { id: 42, tokenInsured: "ETH", tokenName: "Ethereum", triggerPrice: "$2,000", payoutAmount: "$300", insuranceCost: "$5.76", timeLeft: "2d 14h left", progress: 40, status: "Active" },
//   { id: 38, tokenInsured: "BTC", tokenName: "Bitcoin", triggerPrice: "$60,000", payoutAmount: "$500", insuranceCost: "$9.60", timeLeft: "Pending", progress: 70, status: "Pending" },
//   { id: 31, tokenInsured: "ETH", tokenName: "Ethereum", triggerPrice: "$1,800", payoutAmount: "$200", insuranceCost: "$3.84", timeLeft: "Paid out 3d ago", progress: 100, status: "Claimed" },
// ]

const PRICES = [
  { symbol: "ETH", name: "Ethereum", bg: "rgba(98,126,234,0.25)", color: "#8fa8f8", price: "$2,418.50", change: "+2.4%", positive: true },
  { symbol: "BTC", name: "Bitcoin", bg: "rgba(247,147,26,0.25)", color: "#f7b84a", price: "$67,240.00", change: "-0.8%", positive: false },
]

const ACTIVITY = [
  { color: "#00e5a0", text: "Policy #0042 activated", sub: "— ETH verified at $2,418.50, above trigger of $2,000", time: "2m ago" },
  { color: "#f5a623", text: "Policy #0038 pending", sub: "— Agent fetching BTC price from CoinGecko", time: "5m ago" },
  { color: "#ff4d6a", text: "Policy #0031 claimed", sub: "— ETH dropped to $1,792 below $1,800. $200 USDT sent", time: "3d ago" },
]

function mapPolicy(raw: any): Policy | null {
  if (!raw) return null
  const data = Array.isArray(raw) ? raw : Object.values(raw)
  return {
    user: data[0],
    triggerPrice: data[1],
    payoutAmount: data[2],
    tokenInsured: data[3],
    insuranceCost: data[4],
    expiresAt: data[5],
    policyId: data[6],
    status: data[7],
  }
}
export default function Dashboard() {
  const { address } = useAccount()

  const { data: getUserPolicies } = useReadContract({
    ...insurancePoolConfig,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  })
  

  const { data: policiesData, refetch } = useReadContracts({
    contracts: (getUserPolicies ?? []).map((id) => ({
      ...insurancePoolConfig,
      functionName: 'policies',
      args: [id],
    })),
    query: {
       enabled: !!getUserPolicies && getUserPolicies.length > 0,
       refetchInterval: 5000
      }
  })

  // const policies: Policy[] = policiesData?.map((p) => p.result as unknown as Policy).filter(Boolean) ?? []

  const policies: Policy[] = (policiesData ?? [])
    .map((p) => {
      console.log("raw result:", p.result) // ← add this
      return mapPolicy(p.result)
    })
    .filter((p): p is Policy => p !== null)
  console.log("User policies:", policies)
  return (
    <div className="px-4 pt-20 py-10 md:px-10 md:py-8">

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 ">
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
            <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 pt-4 pb-4 font-medium">Live prices</div>
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
            <div className="flex flex-col gap-3">
              {policies && policies.length > 0 ? (
                policies.map((p, index) => (
                  <PolicyCard key={index} policy={p} />
                ))
              ) : (
                <div className="bg-[#0d1117] border border-[#1e2832] rounded-xl p-8 text-center text-[#5a7080] text-sm">
                  No policies yet
                </div>
              )}
            </div>
          </div>

          {/* Activity */}

        </div>

        {/* Form — below content on mobile, side panel on desktop */}
        <div>
          <div className="text-xs font-mono tracking-widest uppercase text-[#5a7080] mb-3 pt-4 pb-4 font-medium">New policy</div>
          <InsureForm />
        </div>
      </div>
    </div>
  )
}
