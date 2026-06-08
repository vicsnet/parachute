// "use client"
// import { useState, useEffect, useCallback } from "react"
// import { connectWallet, shortAddress } from "@/lib/contract"

// export function useWallet() {
//   const [address, setAddress] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Auto-connect if already connected
//   useEffect(() => {
//     if (typeof window === "undefined" || !window.ethereum) return
//     window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
//       if (accounts.length > 0) setAddress(accounts[0])
//     })

//     // Listen for account changes
//     window.ethereum.on("accountsChanged", (accounts: string[]) => {
//       setAddress(accounts.length > 0 ? accounts[0] : null)
//     })
//   }, [])

//   const connect = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const addr = await connectWallet()
//       setAddress(addr)
//     } catch (err: any) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   const disconnect = useCallback(() => {
//     setAddress(null)
//   }, [])

//   return {
//     address,
//     shortAddress: address ? shortAddress(address) : null,
//     isConnected: !!address,
//     loading,
//     error,
//     connect,
//     disconnect,
//   }
// }
