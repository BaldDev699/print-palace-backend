import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/pages/AdminPage";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin — Roge" }],
  }),
  component: AdminPage,
});
