"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-6 z-50 w-full flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto w-full max-w-4xl rounded-full border border-black/5 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <div className="mx-auto flex h-14 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex items-center justify-center p-1">
               <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/10" />
            </div>
            <span className="text-lg font-bold tracking-[-0.02em] text-foreground">{APP_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full bg-zinc-900 px-5 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-zinc-900/30 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Sign up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="rounded-b-3xl border-b border-white/20 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="flex items-center gap-2 mb-6 justify-center">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                {APP_NAME}
              </SheetTitle>
              <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
              <nav className="flex flex-col gap-4 text-center">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-emerald-600"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3 px-8">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full border-emerald-200">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700">
                      Sign up free
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
