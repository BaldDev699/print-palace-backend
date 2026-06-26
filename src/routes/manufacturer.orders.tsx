import { createFileRoute } from "@tanstack/react-router";
import { ManufacturerOrdersPage } from "@/pages/manufacturer/ManufacturerOrdersPage";

export const Route = createFileRoute("/manufacturer/orders")({
  component: ManufacturerOrdersPage,
});
