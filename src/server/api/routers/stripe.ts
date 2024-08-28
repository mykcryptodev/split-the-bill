import Stripe from "stripe";
import { z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const stripeRouter = createTRPCRouter({
  getPaymentIntent: publicProcedure
    .input(z.object({
      amount: z.number(),
    }))
    .mutation(async ({ input }) => {
      console.log({ input })
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt((input.amount * 100).toString()),
        currency: "usd",
      });
      console.log({ paymentIntent })
      return paymentIntent.client_secret;
    }),
});