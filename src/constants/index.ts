import { base as twBase, baseSepolia as twBaseSepolia } from "thirdweb/chains";
import { base, baseSepolia } from "wagmi/chains";
import { env } from "~/env";

const isBaseMainnet = ({ chainId }: { chainId: number }) => chainId === base.id;

export const APP_NAME = "Split The Bill";
export const CHAIN = isBaseMainnet({ chainId: Number(env.NEXT_PUBLIC_CHAIN_ID) }) ? base : baseSepolia;


export const THIRDWEB_CHAIN = isBaseMainnet({ chainId: CHAIN.id }) ? twBase : twBaseSepolia;

export const CHAIN_RPC = isBaseMainnet({ chainId: CHAIN.id }) ? env.NEXT_PUBLIC_RPC_URL : env.NEXT_PUBLIC_RPC_URL_SEPOLIA;

export const SPLIT_IT_CONTRACT_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0xA242dC8f4b07aD29D94Bb4e7e118adbB91B43dBD" : "0x5e4F467913238f53184fB27326C769296D959840";

export const USDC_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const USDC_DECIMALS = 6;
export const USDC_IMAGE = "/images/usdc.png";
export const USDC_COLOR = "#2671C4";

export const MULTICALL: `0x${string}` = "0xcA11bde05977b3631167028862bE2a173976CA11"; // same address for mainnet and testnet base

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";