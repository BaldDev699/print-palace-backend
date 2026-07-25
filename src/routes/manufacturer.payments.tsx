import { createFileRoute } from "@tanstack/react-router";
import { ManufacturerPaymentsPage } from "@/pages/manufacturer/ManufacturerPaymentsPage";

export const Route = createFileRoute("/manufacturer/payments")({
  component: ManufacturerPaymentsPage,
});
