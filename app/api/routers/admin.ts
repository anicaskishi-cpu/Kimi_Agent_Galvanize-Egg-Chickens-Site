import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const allOrders = await db.select().from(orders);

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending_verification"
    ).length;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(
      (o) => o.createdAt && new Date(o.createdAt) >= today
    ).length;

    // Total revenue
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue,
    };
  }),

  recentOrders: adminQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 20;

      const allOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit);

      const ordersWithItems = await Promise.all(
        allOrders.map(async (order) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return { ...order, items };
        })
      );

      return ordersWithItems;
    }),
});
