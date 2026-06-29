import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders } from "@db/schema";
import { desc } from "drizzle-orm";
import { z } from "zod";

export const chatRouter = createRouter({
  adminInsight: adminQuery
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Fetch recent order data for context
      const recentOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(50);

      const totalRevenue = recentOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );
      const totalOrders = recentOrders.length;
      const pendingCount = recentOrders.filter(
        (o) => o.status === "pending_verification"
      ).length;
      const codCount = recentOrders.filter(
        (o) => o.paymentMethod === "cod"
      ).length;
      const gcashCount = recentOrders.filter(
        (o) => o.paymentMethod === "gcash"
      ).length;

      // Build context for the AI
      const context = `
You are Galvanize AI, an intelligent assistant for the Galvanize Egg Chickens admin dashboard.
You help analyze order data and provide business insights.

Current Business Data:
- Total Orders: ${totalOrders}
- Total Revenue: ₱${totalRevenue.toLocaleString()}
- Pending Verification: ${pendingCount}
- COD Orders: ${codCount}
- GCash Orders: ${gcashCount}

Recent Orders:
${recentOrders
  .slice(0, 10)
  .map(
    (o) =>
      `- ${o.orderId}: ₱${Number(o.total).toLocaleString()} (${o.paymentMethod}, ${o.status}, ${o.city})`
  )
  .join("\n")}

Admin's Question: ${input.message}

Provide a helpful, concise response based on the data above. Be professional and data-driven.
      `.trim();

      // Try to call external AI service, fallback to local response
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful business analytics assistant for a poultry equipment e-commerce store in Cebu, Philippines.",
              },
              { role: "user", content: context },
            ],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const jsonData = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
          return {
            reply:
              jsonData.choices?.[0]?.message?.content ||
              generateLocalResponse(input.message, {
                totalOrders,
                totalRevenue,
                pendingCount,
                codCount,
                gcashCount,
              }),
          };
        }
      } catch {
        // Fallback to local response
      }

      return {
        reply: generateLocalResponse(input.message, {
          totalOrders,
          totalRevenue,
          pendingCount,
          codCount,
          gcashCount,
        }),
      };
    }),
});

function generateLocalResponse(
  message: string,
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingCount: number;
    codCount: number;
    gcashCount: number;
  }
): string {
  const lower = message.toLowerCase();

  if (lower.includes("revenue") || lower.includes("sales")) {
    return `Your total revenue is **₱${stats.totalRevenue.toLocaleString()}** across **${stats.totalOrders} orders**. Average order value is **₱${Math.round(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toLocaleString()}**.`;
  }

  if (lower.includes("pending") || lower.includes("verification")) {
    return `You have **${stats.pendingCount} orders** awaiting verification. These need to be reviewed and confirmed before processing. Check the orders table to view details and update their status.`;
  }

  if (lower.includes("payment") || lower.includes("gcash") || lower.includes("cod")) {
    return `Payment method breakdown: **${stats.codCount} COD orders** and **${stats.gcashCount} GCash orders**. COD represents ${Math.round((stats.codCount / Math.max(stats.totalOrders, 1)) * 100)}% of all transactions.`;
  }

  if (lower.includes("order") || lower.includes("status")) {
    return `You have **${stats.totalOrders} total orders**. Of these, **${stats.pendingCount} are pending verification**. The rest have been processed through the fulfillment pipeline. Total revenue stands at **₱${stats.totalRevenue.toLocaleString()}**.`;
  }

  return `I'm your Galvanize AI assistant. Here's a quick summary: **${stats.totalOrders} orders**, **₱${stats.totalRevenue.toLocaleString()} revenue**, **${stats.pendingCount} pending verification**. You can ask me about revenue trends, order status, payment methods, or fulfillment insights.`;
}
