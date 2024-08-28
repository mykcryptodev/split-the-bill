import { kyberswapRouter } from "~/server/api/routers/kyberswap";
import { simpleHashRouter } from "~/server/api/routers/simpleHash";
import { splitRouter } from "~/server/api/routers/split";
import { stripeRouter } from "~/server/api/routers/stripe";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  kyberswap: kyberswapRouter,
  simpleHash: simpleHashRouter,
  split: splitRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
