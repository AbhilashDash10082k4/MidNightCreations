import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "../../../lib/auth";

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
          <h1 className="mt-3 text-3xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Save orders, checkout faster, and track quote requests.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error === "email_in_use"
              ? "That email is already registered."
              : "Unable to create account."}
          </div>
        ) : null}

        <form action="/api/v1/auth/register" method="post" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-200">
                First name
              </span>
              <input
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-indigo-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-200">
                Last name
              </span>
              <input
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-indigo-400"
              />
            </label>
          </div>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 px-4 py-3 text-white outline-none ring-0 transition focus:border-indigo-400"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 hover:cursor-pointer"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-300 hover:text-indigo-200 hover:cursor-pointer">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}