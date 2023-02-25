import { createTRPCRouter } from "./trpc";
import { kioskRouter } from "./routers/kiosk";
import { serialRouter } from "./routers/serial";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  kiosk: kioskRouter,
  serial: serialRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
