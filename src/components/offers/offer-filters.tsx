"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

interface OfferFiltersProps {
  categories: { name: string; slug: string }[];
  paymentApps: { name: string; slug: string }[];
}

export function OfferFilters({ categories, paymentApps }: OfferFiltersProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  return (
    <Card className="sticky top-20">
      <CardContent className="space-y-6 p-5">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search offers..." className="pl-9" />
          </div>
        </div>

        {/* Category filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.slug}
                variant={activeCategory === cat.slug ? "default" : "outline"}
                className="cursor-pointer"
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
          <label className="mb-2 block text-sm font-medium">Payment App</label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeApp === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveApp(null)}
            >
              All
            </Badge>
            {paymentApps.map((app) => (
              <Badge
                key={app.slug}
                variant={activeApp === app.slug ? "default" : "outline"}
                className="cursor-pointer"
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
