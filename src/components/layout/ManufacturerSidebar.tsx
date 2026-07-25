import React, { useState } from "react";
import { NavLink, useLocation } from "@/lib/router-compat";
import { Package, ImageIcon, Menu, CreditCard } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Orders", url: "/manufacturer/orders", icon: Package },
  { title: "Payments", url: "/manufacturer/payments", icon: CreditCard },
  { title: "Portfolio", url: "/manufacturer/portfolio", icon: ImageIcon },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <NavLink
            key={item.title}
            to={item.url}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent/50"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// Simple, self-contained nav for the manufacturer portal.
// Deliberately NOT built on the shadcn Sidebar primitive: that component's
// desktop mode uses position:fixed for its visible rail, which sat outside
// normal document flow and ended up overlapping page content (the Footer)
// further down the page regardless of layout structure around it. A plain
// static column has no such failure mode - it's just normal-flow content
// that can never overlap anything, and it stays fully expanded (no
// collapse-to-icon/hover-tooltip state) as requested.
export const ManufacturerSidebar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: plain static column, always in normal document flow */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 border-r bg-sidebar text-sidebar-foreground p-3">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Manufacturer Portal
        </div>
        <NavItems />
      </aside>

      {/* Mobile: trigger + Sheet drawer */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Manufacturer Portal</span>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-4">
          <SheetHeader className="mb-4">
            <SheetTitle>Manufacturer Portal</SheetTitle>
          </SheetHeader>
          <NavItems onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};
