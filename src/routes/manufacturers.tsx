import { createFileRoute } from "@tanstack/react-router";
import ManufacturersPage from "@/pages/ManufacturersPage";

export const Route = createFileRoute("/manufacturers")({
  head: () => ({
    meta: [
      { title: "Manufacturers — Roge Print Studio" },
      { name: "description", content: "Discover verified apparel manufacturers on Roge Print Studio." },
    ],
  }),
  component: ManufacturersPage,
});
