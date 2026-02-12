"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OfferFiltersProps {
  categories: { name: string; slug: string }[];
  paymentApps: { name: string; slug: string }[];
}

export function OfferFilters({ categories, paymentApps }: OfferFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const getBadgeVariant = (isActive: boolean) => isActive ? "default" : "outline";
  
  const activeBadgeClass = "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent";
  const inactiveBadgeClass = "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800";

  return (
    <Card className="sticky top-32 overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
      <CardContent className="space-y-6 p-5">
        {/* Search */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input 
              placeholder="Search by merchant..." 
              className="border-border/50 bg-background/50 pl-9 transition-colors focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20" 
            />
          </div>
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
              onClick={() => setActiveCategory(null)}
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
                onClick={() =>
                  setActiveCategory(
                    activeCategory === cat.slug ? null : cat.slug
                  )
                }
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
              onClick={() => setActiveApp(null)}
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
                onClick={() =>
                  setActiveApp(activeApp === app.slug ? null : app.slug)
                }
              >
                {app.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
