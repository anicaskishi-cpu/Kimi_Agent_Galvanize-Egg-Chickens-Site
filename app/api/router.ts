import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter } from "./routers/product";
import { orderRouter } from "./routers/order";
import { messageRouter } from "./routers/message";
import { localAuthRouter } from "./routers/localAuth";
import { adminRouter } from "./routers/admin";
import { chatRouter } from "./routers/chat";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  product: productRouter,
  order: orderRouter,
  message: messageRouter,
  admin: adminRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
