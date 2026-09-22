import { createFileRoute } from "@tanstack/react-router";
import DesignerPage from "@/pages/DesignerPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/designer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Design Studio — Roge Print Studio" },
      {
        name: "description",
        content: "Create your custom apparel design in the Roge online design studio.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <DesignerPage />
    </ProtectedRoute>
  ),
});
