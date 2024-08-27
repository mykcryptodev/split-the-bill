import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { z } from "zod";

import { SPLIT_IT } from "~/constants";
import { env } from "~/env";
import { isBaseMainnet } from "~/helpers/isBaseMainnet";
import { transformSplit } from "~/helpers/transformSplit";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPayments, splits } from "~/thirdweb/8453/0xa5dfbdde359946a1c91b58185ad618d23920b587";

const client = createThirdwebClient({
  secretKey: env.THIRDWEB_SECRET_KEY,
});

export const splitRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({
      chainId: z.number(),
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const chain = isBaseMainnet({ chainId: input.chainId }) ? base : baseSepolia;
      if (!SPLIT_IT[chain.id]) {
        throw new Error(`No split contract for chain ${chain.id}`);
      }
      const split = await splits({
        contract: getContract({
          client,
          chain,
          address: SPLIT_IT[chain.id] as string,
        }),
        arg_0: BigInt(input.id),
      });
      return transformSplit(split);
    }),
  getPayments: publicProcedure
    .input(z.object({
      chainId: z.number(),
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const chain = isBaseMainnet({ chainId: input.chainId }) ? base : baseSepolia;
      if (!SPLIT_IT[chain.id]) {
        throw new Error(`No split contract for chain ${chain.id}`);
      }
      return await getPayments({
        contract: getContract({
          client,
          chain,
          address: SPLIT_IT[chain.id] as string,
        }),
        splitId: BigInt(input.id),
      });
    }),
});