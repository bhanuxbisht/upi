"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfferFiltersProps {
  categories: { name: string; slug: string }[];
  paymentApps: { name: string; slug: string }[];
}

export function OfferFilters({ categories, paymentApps }: OfferFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeCategory = searchParams.get("category") ?? null;
  const activeApp = searchParams.get("payment_app") ?? null;
  const searchQuery = searchParams.get("search") ?? "";
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const activeBadgeClass = "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent";
  const inactiveBadgeClass = "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800";

  /** Build new URL with updated params and navigate */
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/offers?${qs}` : "/offers");
      });
    },
    [router, searchParams]
  );

  function handleCategoryClick(slug: string | null) {
    updateFilters({ category: activeCategory === slug ? null : slug });
  }

  function handleAppClick(slug: string | null) {
    updateFilters({ payment_app: activeApp === slug ? null : slug });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: localSearch.trim() || null });
  }

  function handleClearAll() {
    setLocalSearch("");
    startTransition(() => {
      router.push("/offers");
    });
  }

  const hasActiveFilters = activeCategory || activeApp || searchQuery;

  return (
    <Card className={cn(
      "sticky top-32 overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-opacity",
      isPending && "opacity-70"
    )}>
      <CardContent className="space-y-6 p-5">
        {/* Search */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Search
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search by merchant..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="border-border/50 bg-background/50 pl-9 pr-9 transition-colors focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(""); updateFilters({ search: null }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

        {/* Category filter */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                activeCategory === null ? activeBadgeClass : inactiveBadgeClass
              )}
              onClick={() => handleCategoryClick(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.slug}
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeCategory === cat.slug ? activeBadgeClass : inactiveBadgeClass
                )}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Payment App filter */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Payment App
          </label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeApp === null ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                activeApp === null ? activeBadgeClass : inactiveBadgeClass
              )}
              onClick={() => handleAppClick(null)}
            >
              All
            </Badge>
            {paymentApps.map((app) => (
              <Badge
                key={app.slug}
                variant={activeApp === app.slug ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  activeApp === app.slug ? activeBadgeClass : inactiveBadgeClass
                )}
                onClick={() => handleAppClick(app.slug)}
              >
                {app.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Clear all filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
