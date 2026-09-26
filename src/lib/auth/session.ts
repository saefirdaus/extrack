import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  signToken,
  verifyToken,
  type SessionPayload,
} from "@/lib/auth/jwt";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60,
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const token = await signToken(payload);

  cookieStore.set({
    ...sessionCookieOptions,
    name: AUTH_COOKIE_NAME,
    value: token,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Mendapatkan user terotentikasi dari cookie session JWT.
 * Mengembalikan SessionUser jika token valid, atau null jika tidak ada sesi.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!authToken) {
    return null;
  }

  const verified = await verifyToken(authToken);
  if (!verified) {
    return null;
  }

  return {
    id: verified.userId,
    name: verified.name,
    email: verified.email,
  };
}
