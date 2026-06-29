import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./routers/localAuth";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  role: "user" | "admin";
  authType: "oauth" | "local";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  unifiedUser?: UnifiedUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth first
  try {
    const oauthUser = await authenticateRequest(opts.req.headers);
    if (oauthUser) {
      ctx.user = oauthUser;
      ctx.unifiedUser = {
        id: oauthUser.id,
        name: oauthUser.name || "User",
        email: oauthUser.email || undefined,
        avatar: oauthUser.avatar || undefined,
        role: oauthUser.role as "user" | "admin",
        authType: "oauth",
      };
      return ctx;
    }
  } catch {
    // OAuth failed, try local auth
  }

  // Try local auth via header
  try {
    const localToken =
      opts.req.headers.get("x-local-auth-token") ||
      opts.req.headers.get("X-Local-Auth-Token");

    if (localToken) {
      const payload = await verifyLocalToken(localToken);
      if (payload) {
        const db = getDb();
        const user = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.id, payload.userId))
          .limit(1);

        if (user.length > 0) {
          // Create a compatible user object for middleware
          ctx.user = {
            id: user[0].id,
            unionId: `local_${user[0].id}`,
            name: user[0].displayName || user[0].username,
            email: null,
            avatar: null,
            role: user[0].role as "user" | "admin",
            createdAt: user[0].createdAt,
            updatedAt: user[0].createdAt,
            lastSignInAt: user[0].createdAt,
          };
          ctx.unifiedUser = {
            id: user[0].id,
            name: user[0].displayName || user[0].username,
            role: user[0].role as "user" | "admin",
            authType: "local",
          };
        }
      }
    }
  } catch {
    // Local auth failed
  }

  return ctx;
}
