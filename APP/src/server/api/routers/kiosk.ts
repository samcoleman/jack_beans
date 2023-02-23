import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { contextProps } from "@trpc/react-query/shared";

export const kioskRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.kiosk.findMany();
  }),

  checkValid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ctx, input}) => {
        const kiosk = await ctx.prisma.kiosk.findFirst({where: {id: input.id}});
        if (kiosk){
            return kiosk

        }else{
            return null
        }
    })
});
