import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Template } from "@/hooks/useTemplates";
import { Input } from "@/components/ui/input";
import { Star, Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
}

export const Templates: React.FC<TemplatesProps> = ({
  open,
  onOpenChange,
  templates,
  onTemplateSelect,
}) => {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["all", "popular", ...Array.from(new Set(templates.map((t) => t.category)))],
    [templates],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      const inCategory =
        category === "all" ? true : category === "popular" ? t.popular : t.category === category;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      return inCategory && matchesQuery;
    });
  }, [templates, category, query]);

  const handleSelect = (template: Template) => {
    onTemplateSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[88dvh] sm:h-[80vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl bg-background">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-1 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Choose your product
          </DialogTitle>
          <DialogDescription>
            Pick a template to start designing. You can switch any time.
          </DialogDescription>
        </DialogHeader>

        {/* Search + categories */}
        <div className="px-6 pb-4 space-y-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products (e.g. hoodie, banner, mug)"
              className="pl-9 h-11 rounded-xl"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((template) => {
                const hasPhoto = !!template.thumbnail && template.thumbnail !== "/placeholder.svg";
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelect(template)}
                    className="group text-left rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white">
                      {hasPhoto ? (
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                          <Package className="h-8 w-8" />
                          <span className="text-[11px]">Preview coming soon</span>
                        </div>
                      )}

                      {template.popular && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          <Star className="h-3 w-3 fill-current" />
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.category}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Search className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search or category.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};