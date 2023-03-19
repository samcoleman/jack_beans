import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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

  log: publicProcedure
    .input(z.object({ 
        tx: z.instanceof(Uint8Array).optional(),
        rx: z.instanceof(Uint8Array).optional(),
        error: z.string().optional(),
        kioskId: z.string().cuid()
    }))
    .mutation(async ({ctx, input}) => {
        const res = await ctx.prisma.serialLog.create({
            data: {
                kiosk: {
                    connect: {id: input.kioskId}
                },
                tx: input.tx ? Buffer.from(input.tx) : undefined,
                rx: input.rx ? Buffer.from(input.rx) : undefined,
                error: input.error
            }
        });
    })
});
