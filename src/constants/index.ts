import { base as twBase, baseSepolia as twBaseSepolia } from "thirdweb/chains";
import { baseSepolia } from "wagmi/chains";

import { env } from "~/env";

export const APP_NAME = "Split It";
export const CHAIN = baseSepolia;
export const THIRDWEB_CHAIN = CHAIN === baseSepolia ? twBaseSepolia : twBase;

export const CHAIN_RPC = CHAIN === baseSepolia ? env.NEXT_PUBLIC_RPC_URL_SEPOLIA : env.NEXT_PUBLIC_RPC_URL;

export const SPLIT_IT_CONTRACT_ADDRESS: `0x${string}` = "0xccA19f942D48EF7B4e89B050f65b15ea9600648f"; //"0x54EE636146Bf634b56ffbb09ca689a8eAFC841bc"; // "0xBa427F34718A538f454Cf7Db73867b4d98AFB7A9"

export const USDC_ADDRESS: `0x${string}` = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; //"0xb4B45c165b35aD64421bD6aBFBc6A3781e7ADbF7"
export const USDC_DECIMALS = 6; // 18
export const USDC_IMAGE = "/images/usdc.png";
export const USDC_COLOR = "#2671C4";

export const MULTICALL: `0x${string}` = "0xcA11bde05977b3631167028862bE2a173976CA11"; // same address for mainnet and testnet base

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";