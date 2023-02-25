import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { contextProps } from "@trpc/react-query/shared";

export const serialRouter = createTRPCRouter({
    // return logs user has scope to
  getLogs: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.serialLog.findMany(/*{
        where: {
            kiosk : {
                scopeId: { in: ctx.session.user.scopeIds as string[] }
            }
        }
    }*/);
  }),

  log: protectedProcedure
    .input(z.object({ 
        fn: z.string(),
        tx: z.instanceof(Uint8Array),
        rx: z.instanceof(Uint8Array),
        kioskId: z.string().cuid()
    }))
    .mutation(async ({ctx, input}) => {
        const res = await ctx.prisma.serialLog.create({
            data: {
                kiosk: {
                    connect: {id: input.kioskId}
                },
                fn: input.fn,
                tx: Buffer.from(input.tx),
                rx: Buffer.from(input.rx),
            }
        });
    })
});
