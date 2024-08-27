import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { z } from "zod";

import { SPLIT_IT, SPLIT_SUBGRAPH_URL } from "~/constants";
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
  getFeed: publicProcedure
    .query(async () => {
    const response = await fetch(SPLIT_SUBGRAPH_URL, {
      headers: {
        "X-GHOST-KEY": env.GHOST_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            splits(orderBy: "timestamp", orderDirection: "desc", limit: 5) {
              items {
                id
                isFullyPaid
                amountPerPerson
                creatorName
                creator
                billName
                timestamp
              }
            },
            payments(orderBy: "timestamp", orderDirection: "desc", limit: 5) {
              items {
                id
                splitId
                amount
                payee
                payeeName
                comment
                timestamp
              }
            }
          }
        `,
      }),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch splits: ${response.statusText}`);
    }


    type PaymentFromGraph = {
      id: string;
      splitId: string;
      amount: number;
      payee: string;
      payeeName: string;
      comment: string;
      timestamp: number;
    };

    type SplitFromGraph = {
      id: string;
      isFullyPaid: boolean;
      amountPerPerson: number;
      creatorName: string;
      creator: string;
      billName: string;
      timestamp: number;
      payment?: PaymentFromGraph;
    };

    type GraphResponse = {
      data: {
        splits: {
          items: SplitFromGraph[];
        };
        payments: {
          items: PaymentFromGraph[];
        };
      };
    };

    const json = await response.json() as GraphResponse;

    // for each of the latest payments, get the split id and then fetch the split from the subgraph unless it's already in the latest items
    const splitsToFetch = json.data.payments.items.map(payment => ({
      splitId: payment.splitId,
      paymentId: payment.id,
    }));

    const splitsWithLatestPaymentsResponse = await fetch(SPLIT_SUBGRAPH_URL, {
      headers: {
        "X-GHOST-KEY": env.GHOST_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            splits(where: { id_in: [${splitsToFetch.map(split => `"${split.splitId}"`).join(",")}] }) {
              items {
                id
                isFullyPaid
                amountPerPerson
                creatorName
                creator
                billName
                timestamp
              }
            }
          }
        `,
      }),
      method: "POST",
    });

    if (!splitsWithLatestPaymentsResponse.ok) {
      throw new Error(`Failed to fetch splits: ${splitsWithLatestPaymentsResponse.statusText}`);
    }

    const splitsWithLatestPaymentsJson = await splitsWithLatestPaymentsResponse.json() as GraphResponse;

    // add a split object to each of the latest payments
    const paymentsWithSplits = json.data.payments.items.map(payment => {
      const split = splitsWithLatestPaymentsJson.data.splits.items.find(split => split.id === payment.splitId);
      return {
        ...split,
        payment,
        timestamp: payment.timestamp,
      };
    });

    return [...json.data.splits.items, ...paymentsWithSplits].sort((a, b) => b.timestamp - a.timestamp);
  }),
});