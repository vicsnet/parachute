import { ERC20_ABI } from "./abi";
import {INSURANCE_ABI} from "./insuranceAbi";

export const erc20Token = "0x7Bd0E4FD28C3226e53670A34B57eb8Ae8b06a622";

export const insurancePoolAddress = "0xde158184f7DadcDCAb9C2584c2c720aE10E53D48";

export const insurancePoolConfig = {
  address:  insurancePoolAddress,
  abi: INSURANCE_ABI,
} as const

export const erc20Config = {
  address:  erc20Token,
  abi: ERC20_ABI,
} as const