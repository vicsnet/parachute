// Contract addresses
export const INSURANCE_POOL_ADDRESS = "0x..." // replace after deployment
export const USDT_ADDRESS = "0x67B302E35Aef5EEE8c32D934F5856869EF428330" // Somnia mainnet USDT

// InsurancePool ABI
export const INSURANCE_POOL_ABI = [
  // Read functions
  "function policyCount() view returns (uint256)",
  "function ratePerHour() view returns (uint256)",
  "function getPolicy(uint256 policyId) view returns (tuple(address user, uint256 triggerPrice, uint256 payoutAmount, string tokenInsured, uint256 insuranceCost, uint256 expiresAt, uint8 status))",
  "function getUserPolicies(address user) view returns (uint256[])",
  "function calculatePremium(uint256 payoutAmount, uint256 policyDuration) view returns (uint256)",
  "function getPoolBalance() view returns (uint256)",
  "function getSTTBalance() view returns (uint256)",
  "function isTokenSupported(string tokenSymbol) view returns (bool)",
  "function getCoinGeckoId(string tokenSymbol) view returns (string)",
  "function latestPricePerToken(string token) view returns (uint256)",
  "function owner() view returns (address)",

  // Write functions
  "function insureAsset(tuple(address user, uint256 triggerPrice, uint256 payoutAmount, string tokenInsured, uint256 insuranceCost, uint256 expiresAt, uint8 status) policy) returns (bool)",
  "function checkPolicy(uint256 policyId)",
  "function depositLiquidity(uint256 amount)",
  "function withdrawLiquidity(uint256 amount)",
  "function addSupportedToken(string tokenSymbol, string coinGeckoId)",
  "function setRatePerHour(uint256 newRate)",
  "function fund() payable",
  "function withdraw(uint256 amount)",

  // Events
  "event PolicyCreated(uint256 indexed policyId, address indexed user, uint256 triggerPrice, uint256 payoutAmount, string tokenInsured, uint256 insuranceCost, uint256 expiresAt)",
  "event PolicyActivated(uint256 indexed policyId, uint256 currentPrice)",
  "event PolicyRejected(uint256 indexed policyId, string reason)",
  "event PolicyClaimed(uint256 indexed policyId, address indexed user, uint256 payoutAmount)",
  "event PriceReceived(uint256 indexed requestId, uint256 price)",
]

export const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
]

// Policy status enum
export enum PolicyStatus {
  Pending = 0,
  Active = 1,
  Claimed = 2,
  Expired = 3,
}

export const STATUS_LABELS: Record<PolicyStatus, string> = {
  [PolicyStatus.Pending]: "PENDING",
  [PolicyStatus.Active]: "ACTIVE",
  [PolicyStatus.Claimed]: "CLAIMED",
  [PolicyStatus.Expired]: "EXPIRED",
}

export const STATUS_COLORS: Record<PolicyStatus, string> = {
  [PolicyStatus.Pending]: "text-warning border-warning/20 bg-warning/10",
  [PolicyStatus.Active]: "text-accent border-accent/20 bg-accent/10",
  [PolicyStatus.Claimed]: "text-danger border-danger/20 bg-danger/10",
  [PolicyStatus.Expired]: "text-muted border-border bg-surface2",
}

// Supported tokens config
export const SUPPORTED_TOKENS = [
  { symbol: "ETH", name: "Ethereum", coinGeckoId: "ethereum", color: "#627eea", bg: "rgba(98,126,234,0.2)" },
  { symbol: "BTC", name: "Bitcoin", coinGeckoId: "bitcoin", color: "#f7931a", bg: "rgba(247,147,26,0.2)" },
]

// Somnia network config
export const SOMNIA_TESTNET = {
  chainId: "0xC498", // 50312
  chainName: "Somnia Testnet",
  rpcUrls: ["https://dream-rpc.somnia.network"],
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  blockExplorerUrls: ["https://shannon-explorer.somnia.network"],
}

export const SOMNIA_MAINNET = {
  chainId: "0x13A7", // 5031
  chainName: "Somnia Mainnet",
  rpcUrls: ["https://dream-rpc.somnia.network"],
  nativeCurrency: { name: "SOMI", symbol: "SOMI", decimals: 18 },
  blockExplorerUrls: ["https://explorer.somnia.network"],
}
