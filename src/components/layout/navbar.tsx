"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Get the initial session
    supabase.auth.getUser().then(({ data }: { data: { user: SupabaseUser | null } }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "U";

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

          {/* Desktop CTA — Auth Aware */}
          <div className="hidden items-center gap-4 md:flex">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-pointer gap-2 rounded-full px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                    <User className="mr-2 h-3.5 w-3.5" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400">
                  Log in
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="cursor-pointer rounded-full bg-zinc-900 px-5 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-zinc-900/30 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
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
                  {user ? (
                    <>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer rounded-full border-red-200 text-red-600"
                        onClick={() => { handleLogout(); setOpen(false); }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full cursor-pointer rounded-full border-emerald-200">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setOpen(false)}>
                        <Button className="w-full cursor-pointer rounded-full bg-emerald-600 hover:bg-emerald-700">
                          Sign up free
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
