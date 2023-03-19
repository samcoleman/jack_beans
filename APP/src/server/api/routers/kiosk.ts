import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const kioskRouter = createTRPCRouter({
  getAll: protectedProcedure
  .query(({ ctx }) => {
    return ctx.prisma.kiosk.findMany({
        where: {
            scopeId: { in: ctx.session.user.scopeIds as string[] }
        }
    });
  }),

  checkValid: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ctx, input}) => {
        const kiosk = await ctx.prisma.kiosk.findFirst({where: {id: input.id}});
        if (kiosk){
            return kiosk

        }else{
            return undefined
        }
    })
});
