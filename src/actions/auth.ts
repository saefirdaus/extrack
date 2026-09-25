"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { redirect } from "next/navigation";

import { users } from "@/src/db/schema/users";
import { clearSession, createSession } from "@/src/lib/auth/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 100;
const REGISTER_ERROR_MESSAGE = "Gagal memproses pendaftaran. Coba lagi.";
const SERVER_ERROR_MESSAGE =
  "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.";
const LOGIN_ERROR_MESSAGE = "Email atau password yang Anda masukkan salah.";
const DUPLICATE_EMAIL_MESSAGE =
  "Email ini sudah terdaftar. Silakan gunakan email lain.";

type AuthField = "name" | "email" | "password";

type AuthFieldErrors = Partial<Record<AuthField, string[]>>;

type AuthFormValues = {
  name?: string;
  email?: string;
};

export type AuthActionState = {
  success: false;
  errors?: AuthFieldErrors;
  message?: string;
  values?: AuthFormValues;
};

function getFormString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  return drizzle({ connection: databaseUrl });
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "23505";
}

function validateRegisterInput(input: {
  name: string;
  email: string;
  password: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!input.name) {
    errors.name = ["Nama wajib diisi."];
  } else if (input.name.length < 2) {
    errors.name = ["Nama minimal 2 karakter."];
  } else if (input.name.length > 100) {
    errors.name = ["Nama maksimal 100 karakter."];
  }

  if (!input.email) {
    errors.email = ["Email wajib diisi."];
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.email = ["Format email tidak valid."];
  } else if (input.email.length > 150) {
    errors.email = ["Email maksimal 150 karakter."];
  }

  if (!input.password) {
    errors.password = ["Password wajib diisi."];
  } else if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = ["Password minimal 6 karakter."];
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = ["Password maksimal 100 karakter."];
  }

  return errors;
}

function validateLoginInput(input: {
  email: string;
  password: string;
}): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!input.email) {
    errors.email = ["Email wajib diisi."];
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.email = ["Format email tidak valid."];
  }

  if (!input.password) {
    errors.password = ["Password wajib diisi."];
  }

  return errors;
}

export async function registerAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const name = getFormString(formData.get("name")).trim();
  const email = getFormString(formData.get("email")).trim().toLowerCase();
  const password = getFormString(formData.get("password")).trim();
  const values = { name, email };
  const errors = validateRegisterInput({ name, email, password });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  try {
    const db = getDatabase();
    const existingUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return {
        success: false,
        errors: { email: [DUPLICATE_EMAIL_MESSAGE] },
        values,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        errors: { email: [DUPLICATE_EMAIL_MESSAGE] },
        values,
      };
    }

    console.error("Register action failed:", error);

    return {
      success: false,
      message: REGISTER_ERROR_MESSAGE,
      values,
    };
  }

  redirect("/dashboard");
}

export async function loginAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const email = getFormString(formData.get("email")).trim().toLowerCase();
  const password = getFormString(formData.get("password")).trim();
  const values = { email };
  const errors = validateLoginInput({ email, password });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, values };
  }

  try {
    const db = getDatabase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        success: false,
        message: LOGIN_ERROR_MESSAGE,
        values,
      };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login action failed:", error);

    return {
      success: false,
      message: SERVER_ERROR_MESSAGE,
      values,
    };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
