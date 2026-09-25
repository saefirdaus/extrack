import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  signToken,
  verifyToken,
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

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export const MOCK_USER: SessionUser = {
  id: 1,
  name: "John Doe",
  email: "john@kampus.ac.id",
};

/**
 * Mendapatkan identitas user terotentikasi.
 * Mengembalikan user dari token session (jika ada) atau mock user untuk pengujian development.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (authToken) {
    const verified = verifyToken(authToken);
    if (verified) {
      return {
        id: verified.userId,
        name: verified.name,
        email: verified.email,
      };
    }
  }

  return MOCK_USER;
}
