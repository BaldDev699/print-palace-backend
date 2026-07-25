import React from "react";
import { Outlet } from "@/lib/router-compat";
import { Header, Footer } from "@/components/layout";
import { ManufacturerSidebar } from "./ManufacturerSidebar";

export const ManufacturerPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />

      {/* Plain flexbox row, no position:fixed children involved - the
          sidebar is normal-flow content, so it can never overlap the
          Footer (or anything else) regardless of scroll position or
          page height. */}
      <div className="flex flex-col md:flex-row flex-1 w-full">
        <ManufacturerSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto px-6 py-6">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
