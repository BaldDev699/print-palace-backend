import React from "react";
import { Outlet } from "@/lib/router-compat";
import { Header, Footer } from "@/components/layout";
import { ManufacturerSidebar } from "./ManufacturerSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const ManufacturerPortalLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />

        <div className="flex flex-1 w-full">
          <ManufacturerSidebar />

          {/* Footer lives inside this column (not as a sibling of the row
              above) so it gets pushed over by the sidebar's flex spacer
              like the rest of the page content. The sidebar's actual rail
              is position:fixed, so anything outside this flex row would
              sit underneath it instead of being offset - that's what was
              causing the overlap. */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* On mobile, ManufacturerSidebar renders as a hidden Sheet -
                its own internal trigger is trapped inside that hidden
                content, so there was previously no way to open it at all
                on mobile. This trigger lives outside the sidebar instead. */}
            <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">
                Manufacturer Portal
              </span>
            </div>

            <main className="flex-1 overflow-x-hidden">
              <div className="w-full max-w-7xl mx-auto px-6 py-6">
                <Outlet />
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};