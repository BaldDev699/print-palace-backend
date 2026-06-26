import { createFileRoute } from "@tanstack/react-router";
import CollectionPage from "@/pages/CollectionPage";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collections — Roge Print Studio" },
      { name: "description", content: "Browse the Roge collections of customizable apparel." },
    ],
  }),
  component: CollectionPage,
});
