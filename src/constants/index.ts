import { base as twBase, baseSepolia as twBaseSepolia } from "thirdweb/chains";
import { 
  arbitrum, 
  avalanche, 
  base, 
  baseSepolia, 
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";

import { env } from "~/env";
import { isBaseMainnet } from "~/helpers/isBaseMainnet";

export const APP_NAME = "Bill Split";
export const CHAIN = isBaseMainnet({ chainId: Number(env.NEXT_PUBLIC_CHAIN_ID) }) ? base : baseSepolia;
export const SUPPORTED_CHAINS = [
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
] as const;

export const THIRDWEB_CHAIN = isBaseMainnet({ chainId: CHAIN.id }) ? twBase : twBaseSepolia;

export const CHAIN_RPC = isBaseMainnet({ chainId: CHAIN.id }) ? env.NEXT_PUBLIC_RPC_URL : env.NEXT_PUBLIC_RPC_URL_SEPOLIA;

type ContractAddress = Record<number, `0x${string}`>;

export const SPLIT_IT: ContractAddress = {
  [base.id]: "0xA5dFbdDe359946a1C91B58185ad618D23920B587",
  [baseSepolia.id]: "0xd87565CA95BFfB2a8cf756c2EA7b1D563F2F012A",
}

export const SPLIT_IT_CONTRACT_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0xA5dFbdDe359946a1C91B58185ad618D23920B587" : "0xd87565CA95BFfB2a8cf756c2EA7b1D563F2F012A";

export const USDC: ContractAddress = {
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [avalanche.id]: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  [mainnet.id]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  [optimism.id]: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  [polygon.id]: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
}

export const GLIDE_RELAYER: `0x${string}` = "0x078bf499222bfcbbfb50ebb191270a9bac93ce44";

export const USDC_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const USDC_DECIMALS = 6;
export const USDC_IMAGE = "/images/usdc.png";
export const USDC_COLOR = "#2671C4";

export const MULTICALL: `0x${string}` = "0xcA11bde05977b3631167028862bE2a173976CA11"; // same address for mainnet and testnet base

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const AGGREGATOR_ADDRESS = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"; // kyberswap

export const TRANSFER_BALANCE_ADDRESS = "0x56D419c602C738E38Ea57E34b8c71E99d10D8521";

export const SPLIT_SUBGRAPH_URL = "https://api.ghostlogs.xyz/gg/pub/33c41a02-2d01-48cd-9403-9e4b04a9c37b/ghostgraph";