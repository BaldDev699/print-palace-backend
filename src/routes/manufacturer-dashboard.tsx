import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/manufacturer-dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/manufacturer/orders" });
  },
});
