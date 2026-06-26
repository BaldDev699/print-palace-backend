import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roge Print Studio — Custom Apparel Printing & Design" },
      {
        name: "description",
        content:
          "Design and order custom printed apparel — t-shirts, hoodies, caps and more. Create your design online and connect with verified manufacturers.",
      },
      { property: "og:title", content: "Roge Print Studio — Custom Apparel Printing & Design" },
      {
        property: "og:description",
        content:
          "Design custom printed apparel online and order from verified manufacturers.",
      },
    ],
  }),
  component: Index,
});
