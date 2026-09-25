"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type AuthActionState } from "@/src/actions/auth";

const initialState: AuthActionState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
    <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">
      {errors[0]}
    </p>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <p className="text-sm font-bold tracking-[0.25em] text-blue-600">
            EXTRACK
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
            Masuk ke Akun Anda
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Kelola catatan keuanganmu dengan lebih teratur.
          </p>
        </header>

        <div className="w-full rounded-xl border border-gray-100 bg-white px-4 py-8 shadow-sm sm:px-10">
          {state.message && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@mahasiswa.ac.id"
                autoComplete="email"
                defaultValue={state.values?.email ?? ""}
                aria-invalid={Boolean(state.errors?.email)}
                aria-describedby={
                  state.errors?.email ? "email-error" : undefined
                }
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 ${state.errors?.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-600"}`}
              />
              <FieldError id="email" errors={state.errors?.email} />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Masukkan password"
                autoComplete="current-password"
                aria-invalid={Boolean(state.errors?.password)}
                aria-describedby={
                  state.errors?.password ? "password-error" : undefined
                }
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 ${state.errors?.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-600"}`}
              />
              <FieldError id="password" errors={state.errors?.password} />
            </div>

            <SubmitButton />
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Daftar akun baru
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
