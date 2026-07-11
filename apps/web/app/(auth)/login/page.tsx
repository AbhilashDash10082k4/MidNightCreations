import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../../../lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const error = resolvedSearchParams?.error;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300/80">
            Midnight Creations
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Access your orders, saved addresses, and quote history.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error === "invalid_credentials"
              ? "Email or password is incorrect."
              : "Unable to sign in."}
          </div>
        ) : null}

        <form action="/api/v1/auth/login" method="post" className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-200">
              Email
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-indigo-400"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-200">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-indigo-400"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 hover:cursor-pointer"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-400">
          New here?{" "}
          <Link href="/register" className="text-indigo-300 hover:text-indigo-200 hover:cursor-pointer">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}