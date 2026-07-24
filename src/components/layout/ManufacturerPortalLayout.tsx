import React from "react";
import { Outlet } from "@/lib/router-compat";
import { Header, Footer } from "@/components/layout";
import { ManufacturerSidebar } from "./ManufacturerSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const ManufacturerPortalLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />

        <div className="flex flex-1 w-full">
          <ManufacturerSidebar />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-7xl mx-auto px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};
