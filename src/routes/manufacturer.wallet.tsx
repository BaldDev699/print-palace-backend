import { createFileRoute } from "@tanstack/react-router";
import { ManufacturerWalletPage } from "@/pages/manufacturer/ManufacturerWalletPage";

export const Route = createFileRoute("/manufacturer/wallet")({
  component: ManufacturerWalletPage,
});
