import React from "react";
import { NavLink, useLocation } from "@/lib/router-compat";
import { Package, ImageIcon, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Orders",
    url: "/manufacturer/orders",
    icon: Package,
  },
  {
    title: "Portfolio",
    url: "/manufacturer/portfolio",
    icon: ImageIcon,
  },
];

export const ManufacturerSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    `w-full ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}`;

  return (
    <Sidebar collapsible="icon">
      <div className="p-2">
        <SidebarTrigger className="w-full justify-start" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manufacturer Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
