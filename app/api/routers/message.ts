import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages } from "@db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

export const messageRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(messages).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        content: input.content,
      });

      const result = await db
        .select()
        .from(messages)
        .orderBy(desc(messages.id))
        .limit(1);

      return result[0];
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }),
});
