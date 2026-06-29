import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashSync, compareSync } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || "galvanize-local-auth-secret-key-2025"
);

async function createToken(userId: number, username: string, role: string) {
  return new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload as { userId: number; username: string; role: string };
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(6),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if username already exists
      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Username already taken");
      }

      const passwordHash = hashSync(input.password, 10);

      await db.insert(localUsers).values({
        username: input.username,
        displayName: input.displayName || input.username,
        passwordHash,
      });

      const user = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      const token = await createToken(
        user[0].id,
        user[0].username,
        user[0].role
      );

      return { success: true, token };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const user = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (user.length === 0) {
        throw new Error("Invalid username or password");
      }

      const valid = compareSync(input.password, user[0].passwordHash);
      if (!valid) {
        throw new Error("Invalid username or password");
      }

      const token = await createToken(
        user[0].id,
        user[0].username,
        user[0].role
      );

      return { success: true, token };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader =
      ctx.req.headers.get("x-local-auth-token") ||
      ctx.req.headers.get("X-Local-Auth-Token");

    if (!authHeader) {
      return null;
    }

    const payload = await verifyLocalToken(authHeader);
    if (!payload) {
      return null;
    }

    const db = getDb();
    const user = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, payload.userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return {
      id: user[0].id,
      username: user[0].username,
      displayName: user[0].displayName,
      name: user[0].displayName || user[0].username,
      role: user[0].role,
    };
  }),
});
