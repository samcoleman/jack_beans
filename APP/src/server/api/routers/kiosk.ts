import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { contextProps } from "@trpc/react-query/shared";
import middleware from "../../../middleware";

export const kioskRouter = createTRPCRouter({
  getAll: protectedProcedure
  .query(({ ctx }) => {
    return ctx.prisma.kiosk.findMany({
        where: {
            scopeId: { in: ctx.session.user.scopeIds as string[] }
        }
    });
  }),

  checkValid: protectedProcedure
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
