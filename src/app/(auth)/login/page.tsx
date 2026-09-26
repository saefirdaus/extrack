"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type AuthActionState } from "@/actions/auth";

const initialState: AuthActionState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-4 py-2.5 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
    >
      {pending ? "Memproses..." : "Masuk"}
    </button>
  );
}

function FieldError({
  id,
  errors,
}: {
  id: string;
  errors?: string[];
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p id={`${id}-error`} className="mt-1 text-xs font-mono text-rose-600 dark:text-rose-400">
      {errors[0]}
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12 transition-colors">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand */}
        <div className="text-center">
          <Link href="/" className="inline-block font-mono text-xs font-bold tracking-wider px-2 py-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 mb-3">
            EXTRACK
          </Link>
          <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Masuk
          </h1>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 shadow-xs transition-colors">
          {state.message && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-mono text-rose-800 dark:text-rose-200"
            >
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                autoComplete="email"
                defaultValue={state.values?.email ?? ""}
                aria-invalid={Boolean(state.errors?.email)}
                aria-describedby={
                  state.errors?.email ? "email-error" : undefined
                }
                className={`block w-full rounded-lg border px-3 py-2 text-xs text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 placeholder-zinc-400 dark:placeholder-zinc-600 transition focus:outline-none focus:ring-1 ${
                  state.errors?.email
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400"
                }`}
              />
              <FieldError id="email" errors={state.errors?.email} />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(state.errors?.password)}
                aria-describedby={
                  state.errors?.password ? "password-error" : undefined
                }
                className={`block w-full rounded-lg border px-3 py-2 text-xs text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 placeholder-zinc-400 dark:placeholder-zinc-600 transition focus:outline-none focus:ring-1 ${
                  state.errors?.password
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400"
                }`}
              />
              <FieldError id="password" errors={state.errors?.password} />
            </div>

            <div className="pt-1">
              <SubmitButton />
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-900 dark:text-zinc-100 underline hover:opacity-80"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
