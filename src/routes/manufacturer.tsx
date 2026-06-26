import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ManufacturerPortalLayout } from "@/components/layout/ManufacturerPortalLayout";

export const Route = createFileRoute("/manufacturer")({
  ssr: false,
  component: () => (
    <ProtectedRoute>
      <ManufacturerPortalLayout />
    </ProtectedRoute>
  ),
});
