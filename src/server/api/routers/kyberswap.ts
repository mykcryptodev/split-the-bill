import { z } from "zod";

import { USDC_ADDRESS } from "~/constants";
import { env } from "~/env";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { type KyberswapApiResponse, type RouteBuildApiResponse,type RouteSummary } from "~/types/kyberswap";

const KYBER_BASE_URL = `https://aggregator-api.kyberswap.com`;

const CHAIN_NAME_MAP = {
  [1]: "ethereum",
  [56]: "bsc",
  [42161]: "arbitrum",
  [137]: "polygon",
  [10]: "optimism",
  [43114]: "avalanche",
  [8453]: "base",
  [25]: "cronos",
  [324]: "zksync",
  [250]: "fantom",
  [59144]: "linea",
  [1101]: "polygon-zkevm",
  [1313161554]: "aurora",
  [199]: "bittorrent",
  [534352]: "scroll",
} as Record<number, string>;

export const kyberswapRouter = createTRPCRouter({
  getConversionData: publicProcedure
    .input(z.object({
      paymentToken: z.string(),
      paymentAmount: z.string(),
      from: z.string(),
      to: z.string(),
      chainId: z.number(),
      deadline: z.number().optional(),
      slippage: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { paymentAmount, paymentToken, from, to, chainId } = input;
      if (!paymentAmount || !paymentToken || !from || !to || !chainId) {
        throw new Error('Missing required parameters');
      }

      const deadline = input.deadline ?? new Date().getTime() + 20 * 60 * 1000;
      const slippage = input.slippage ?? 500; // 5%

      const tokenIn = paymentToken;
      const chainName = CHAIN_NAME_MAP[chainId];

      if (!chainName) {
        throw new Error('Unsupported chain');
      }

      const amountIn = paymentAmount;
      const tokenOut = USDC_ADDRESS;
      const swapRoute = await getSwapRoute(
        chainName, tokenIn, tokenOut, amountIn
      );

      const routeSummary = swapRoute.data.routeSummary;
      console.log({ sm: JSON.stringify(routeSummary) })
      const swapEncodedData = await getSwapEncodedData(
        routeSummary, chainName, slippage, deadline, from, to
      );
      return swapEncodedData;
    }),
});

async function getSwapRoute (chainName: string, tokenIn: string, tokenOut: string, amountIn: string) {
  const srcSwapParams = new URLSearchParams({
    tokenIn,
    tokenOut,
    amountIn,
  }).toString();

  const swapRes = await fetch(`${KYBER_BASE_URL}/${chainName}/api/v1/routes?${srcSwapParams}`, {
    headers: {
      "Content-Type": "application/json",
      "x-client-id": env.KYBERSWAP_CLIENT_ID,
    },
  });
  return await swapRes.json() as KyberswapApiResponse;
}

async function getSwapEncodedData (routeSummary: RouteSummary, chainName: string, slippage: number, deadline: number, from: string, to: string) {
  const srcChainSwapEncodedRes = await fetch(`${KYBER_BASE_URL}/${chainName}/api/v1/route/build`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "x-client-id": env.KYBERSWAP_CLIENT_ID,
    },
    body: JSON.stringify({
      "routeSummary": routeSummary,
      "slippageTolerance": slippage,
      "deadline": deadline,
      "sender": from,
      "recipient": to,
    }),
  });
  const srcChainSwapEncodedData = await srcChainSwapEncodedRes.json() as RouteBuildApiResponse;
  return srcChainSwapEncodedData;
}