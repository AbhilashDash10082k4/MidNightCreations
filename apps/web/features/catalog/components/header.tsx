"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CartButton } from "../../cart/components/cart-button";

type HeaderProps = {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  } | null;
};

export function Header({ user }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl shrink-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-white hover:cursor-pointer"
          >
            MIDNIGHT<span className="text-indigo-400">CREATIONS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors hover:cursor-pointer">
            Catalog
          </Link>
          <Link href="/quote" className="hover:text-white transition-colors hover:cursor-pointer">
            Custom Quote
          </Link>
          <Link
            href="/fundraisers"
            className="hover:text-white transition-colors hover:cursor-pointer"
          >
            Fundraisers
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <CartButton />
          
          {/* Auth section */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition hover:cursor-pointer"
                >
                  {user.firstName || "Account"}
                </Link>
                <form action="/api/v1/auth/logout" method="post" className="inline">
                  <button
                    type="submit"
                    className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/5 transition hover:cursor-pointer text-white"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium text-neutral-300 hover:text-white transition hover:cursor-pointer"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 transition shadow-lg shadow-indigo-500/25 hover:cursor-pointer"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <div
        className={`md:hidden border-t border-white/5 bg-neutral-950 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-80 opacity-100 py-4 px-6 space-y-4" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-400">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors hover:cursor-pointer"
          >
            Catalog
          </Link>
          <Link
            href="/quote"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors hover:cursor-pointer"
          >
            Custom Quote
          </Link>
          <Link
            href="/fundraisers"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors hover:cursor-pointer"
          >
            Fundraisers
          </Link>
        </nav>

        {/* Mobile auth links (under sm breakpoint) */}
        <div className="flex sm:hidden flex-col gap-3 pt-3 border-t border-white/5">
          {user ? (
            <div className="flex items-center justify-between">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition hover:cursor-pointer"
              >
                {user.firstName || "Account"}
              </Link>
              <form action="/api/v1/auth/logout" method="post" className="inline">
                <button
                  type="submit"
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/5 transition hover:cursor-pointer text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-neutral-300 hover:text-white transition hover:cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition hover:cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
