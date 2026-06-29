import { createRouter, publicQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
}

export const orderRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        customerName: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        city: z.string().min(1),
        addressDetail: z.string().optional(),
        deliveryNotes: z.string().optional(),
        paymentMethod: z.enum(["cod", "gcash"]),
        gcashRefNumber: z.string().length(13).optional(),
        receiptImage: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            productName: z.string(),
            price: z.number(),
            quantity: z.number().min(1),
          })
        ),
        subtotal: z.number(),
        shippingFee: z.number(),
        total: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderId = generateOrderId();

      // Insert order
      await db.insert(orders).values({
        orderId,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        city: input.city,
        addressDetail: input.addressDetail,
        deliveryNotes: input.deliveryNotes,
        paymentMethod: input.paymentMethod,
        gcashRefNumber: input.gcashRefNumber,
        receiptImage: input.receiptImage,
        subtotal: String(input.subtotal),
        shippingFee: String(input.shippingFee),
        total: String(input.total),
      });

      // Get the inserted order to get its ID
      const insertedOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.orderId, orderId))
        .limit(1);

      const orderDbId = insertedOrder[0].id;

      // Insert order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId: orderDbId,
          productId: item.productId,
          productName: item.productName,
          price: String(item.price),
          quantity: item.quantity,
          subtotal: String(item.price * item.quantity),
        });
      }

      return { orderId, id: orderDbId };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    // Fetch items for each order
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

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending_verification",
          "packed",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.id));

      const updated = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      return updated[0];
    }),
});
