import { base as twBase, baseSepolia as twBaseSepolia } from "thirdweb/chains";
import { base, baseSepolia } from "wagmi/chains";
import { env } from "~/env";

const isBaseMainnet = ({ chainId }: { chainId: number }) => chainId === base.id;

export const APP_NAME = "Split The Bill";
export const CHAIN = isBaseMainnet({ chainId: Number(env.NEXT_PUBLIC_CHAIN_ID) }) ? base : baseSepolia;


export const THIRDWEB_CHAIN = isBaseMainnet({ chainId: CHAIN.id }) ? twBase : twBaseSepolia;

export const CHAIN_RPC = isBaseMainnet({ chainId: CHAIN.id }) ? env.NEXT_PUBLIC_RPC_URL : env.NEXT_PUBLIC_RPC_URL_SEPOLIA;

export const SPLIT_IT_CONTRACT_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0xD38B207576Fe5C027354280F1D6D210a6f6D166e" : "0x231a651Fc448ac56d80a2e7685591af5dcE8A691";

export const USDC_ADDRESS: `0x${string}` = isBaseMainnet({ chainId: CHAIN.id }) ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
export const USDC_DECIMALS = 6;
export const USDC_IMAGE = "/images/usdc.png";
export const USDC_COLOR = "#2671C4";

export const MULTICALL: `0x${string}` = "0xcA11bde05977b3631167028862bE2a173976CA11"; // same address for mainnet and testnet base

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const AGGREGATOR_ADDRESS = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"; // kyberswap

export const TRANSFER_BALANCE_ADDRESS = "0x56D419c602C738E38Ea57E34b8c71E99d10D8521";