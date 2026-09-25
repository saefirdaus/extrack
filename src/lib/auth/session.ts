import { cookies } from "next/headers";

import {
  AUTH_COOKIE_NAME,
  signToken,
  type SessionPayload,
} from "@/src/lib/auth/jwt";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    ...sessionCookieOptions,
    name: AUTH_COOKIE_NAME,
    value: signToken(payload),
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);
}
