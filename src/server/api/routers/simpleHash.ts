import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TokenPriceResponse } from "~/types/simpleHash";

export const simpleHashRouter = createTRPCRouter({
  getTokenPrice: publicProcedure
    .input(z.object({ address: z.string().optional() }))
    .query(async ({ input }) => {
      const WETH = "0x4200000000000000000000000000000000000006";
      const { address } = input;
      const selectedAddress = !address || address === '' ? WETH : address;
      const url = new URL(`https://api.simplehash.com/api/v0/fungibles/assets`);
      url.searchParams.set("fungible_ids", `base.${selectedAddress}`);
      url.searchParams.set("include_prices", "1");
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-KEY': env.SIMPLEHASH_API_KEY,
        },
      });
      const json = await response.json() as TokenPriceResponse;
      // get the median price in value_usd_string
      if (json.prices.length === 0) {
        return null;
      }
      const prices = json.prices.map(price => parseFloat(price.value_usd_string));
      prices.sort();
      const median = prices[Math.floor(prices.length / 2)];
      return median;
    }),
});
