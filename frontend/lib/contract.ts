// import { ethers } from "ethers"
// import {
//   INSURANCE_POOL_ADDRESS,
//   USDT_ADDRESS,
//   INSURANCE_POOL_ABI,
//   ERC20_ABI,
//   SOMNIA_TESTNET,
// } from "./abi"

// // Get provider and signer
// export async function getProvider() {
//   // if (typeof window === "undefined" || !window.ethereum) {
//     if (typeof window === "undefined") {
//     throw new Error("No wallet found. Please install MetaMask.")
//   }
//   // return new ethers.BrowserProvider(window.ethereum)
// }

// export async function getSigner() {
//   const provider = await getProvider()
//   // return provider.getSigner()
// }

// // Get contract instances
// export async function getInsurancePool(withSigner = false) {
//   if (withSigner) {
//     const signer = await getSigner()
//     return new ethers.Contract(INSURANCE_POOL_ADDRESS, INSURANCE_POOL_ABI, signer)
//   }
//   const provider = await getProvider()
//   return new ethers.Contract(INSURANCE_POOL_ADDRESS, INSURANCE_POOL_ABI, provider)
// }

// export async function getUSDT(withSigner = false) {
//   if (withSigner) {
//     const signer = await getSigner()
//     // return new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer)
//   }
//   const provider = await getProvider()
//   // return new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider)
// }

// // Connect wallet and switch to Somnia
// export async function connectWallet(): Promise<string> {
//   // if (!window.ethereum) throw new Error("No wallet found")

//   // Request accounts
//   // const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

//   // Switch to Somnia testnet
//   try {
//     // await window.ethereum.request({
//     //   method: "wallet_switchEthereumChain",
//     //   params: [{ chainId: SOMNIA_TESTNET.chainId }],
//     // })
//   } catch (err: any) {
//     // Chain not added yet — add it
//     if (err.code === 4902) {
//       // await window.ethereum.request({
//       //   method: "wallet_addEthereumChain",
//       //   params: [SOMNIA_TESTNET],
//       // })
//     }
//   }

//   // return accounts[0]
// }

// // Format address for display
// export function shortAddress(address: string): string {
//   return `${address.slice(0, 6)}...${address.slice(-4)}`
// }

// // Format USDT amount (6 decimals)
// export function formatUSDT(amount: bigint): string {
//   return `$${(Number(amount) / 1e6).toFixed(2)}`
// }

// // Format token price (8 decimals from agent)
// export function formatPrice(price: bigint): string {
//   return `$${(Number(price) / 1e8).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// }

// // Format STT (18 decimals)
// export function formatSTT(amount: bigint): string {
//   return `${Number(ethers.formatEther(amount)).toFixed(4)} STT`
// }

// // Parse USDT amount to bigint (6 decimals)
// export function parseUSDT(amount: string): bigint {
//   return BigInt(Math.floor(Number(amount) * 1e6))
// }

// // Parse price to bigint (8 decimals)
// export function parsePrice(price: string): bigint {
//   return BigInt(Math.floor(Number(price) * 1e8))
// }

// // Calculate time remaining
// export function timeRemaining(expiresAt: bigint): string {
//   const now = Math.floor(Date.now() / 1000)
//   const remaining = Number(expiresAt) - now
//   if (remaining <= 0) return "Expired"
//   const days = Math.floor(remaining / 86400)
//   const hours = Math.floor((remaining % 86400) / 3600)
//   if (days > 0) return `${days}d ${hours}h left`
//   return `${hours}h left`
// }

// // Calculate progress percentage
// export function policyProgress(expiresAt: bigint, createdAt: bigint): number {
//   const now = Math.floor(Date.now() / 1000)
//   const total = Number(expiresAt) - Number(createdAt)
//   const elapsed = now - Number(createdAt)
//   return Math.min(100, Math.max(0, (elapsed / total) * 100))
// }

// // Buy insurance — approve then insureAsset
// export async function buyInsurance(params: {
//   triggerPrice: string
//   payoutAmount: string
//   tokenInsured: string
//   policyDuration: number // hours
// }) {
//   const signer = await getSigner()
//   const pool = await getInsurancePool(true)
//   const usdt = await getUSDT(true)

//   const payoutAmountBN = parseUSDT(params.payoutAmount)
//   const triggerPriceBN = parsePrice(params.triggerPrice)
//   const expiresAt = BigInt(Math.floor(Date.now() / 1000) + params.policyDuration * 3600)

//   // Calculate premium
//   const premium = await pool.calculatePremium(payoutAmountBN, BigInt(params.policyDuration))

//   // Check allowance
//   // const address = await signer.getAddress()
//   // const allowance = await usdt.allowance(address, INSURANCE_POOL_ADDRESS)

//   // if (allowance < premium) {
//   //   // const approveTx = await usdt.approve(INSURANCE_POOL_ADDRESS, premium)
//   //   // await approveTx.wait()
//   }

//   // Call insureAsset
//   const tx = await pool.insureAsset({
//     user: address,
//     triggerPrice: triggerPriceBN,
//     payoutAmount: payoutAmountBN,
//     tokenInsured: params.tokenInsured,
//     insuranceCost: premium,
//     expiresAt,
//     status: 0,
//   })

//   return tx.wait()
// }

// // Check policy — triggers agent
// export async function checkPolicy(policyId: number) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.checkPolicy(policyId)
//   return tx.wait()
// }

// // Deposit liquidity (owner)
// export async function depositLiquidity(amount: string) {
//   const pool = await getInsurancePool(true)
//   const usdt = await getUSDT(true)
//   const signer = await getSigner()
//   // const address = await signer.getAddress()

//   const amountBN = parseUSDT(amount)
//   // const allowance = await usdt.allowance(address, INSURANCE_POOL_ADDRESS)

//   // if (allowance < amountBN) {
//   //   // const approveTx = await usdt.approve(INSURANCE_POOL_ADDRESS, amountBN)
//   //   // await approveTx.wait()
//   // }

//   const tx = await pool.depositLiquidity(amountBN)
//   return tx.wait()
// }

// // Withdraw liquidity (owner)
// export async function withdrawLiquidity(amount: string) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.withdrawLiquidity(parseUSDT(amount))
//   return tx.wait()
// }

// // Fund STT (owner)
// export async function fundSTT(amount: string) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.fund({ value: ethers.parseEther(amount) })
//   return tx.wait()
// }

// // Withdraw STT (owner)
// export async function withdrawSTT(amount: string) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.withdraw(ethers.parseEther(amount))
//   return tx.wait()
// }

// // Add supported token (owner)
// export async function addSupportedToken(symbol: string, coinGeckoId: string) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.addSupportedToken(symbol, coinGeckoId)
//   return tx.wait()
// }

// // Update rate per hour (owner)
// export async function setRatePerHour(rate: number) {
//   const pool = await getInsurancePool(true)
//   const tx = await pool.setRatePerHour(rate)
//   return tx.wait()
// }

// // Fetch all user policies
// export async function getUserPolicies(address: string) {
//   const pool = await getInsurancePool()
//   const policyIds: bigint[] = await pool.getUserPolicies(address)
//   const policies = await Promise.all(
//     policyIds.map(async (id) => {
//       const policy = await pool.getPolicy(id)
//       return { id: Number(id), ...policy }
//     })
//   )
//   return policies
// }

// // Get pool stats
// export async function getPoolStats() {
//   const pool = await getInsurancePool()
//   const [poolBalance, sttBalance, ratePerHour] = await Promise.all([
//     pool.getPoolBalance(),
//     pool.getSTTBalance(),
//     pool.ratePerHour(),
//   ])
//   return { poolBalance, sttBalance, ratePerHour }
// }
