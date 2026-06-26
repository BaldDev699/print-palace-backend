import { createFileRoute } from "@tanstack/react-router";
import { ManufacturerPortfolioPage } from "@/pages/manufacturer/ManufacturerPortfolioPage";

export const Route = createFileRoute("/manufacturer/portfolio")({
  component: ManufacturerPortfolioPage,
});
