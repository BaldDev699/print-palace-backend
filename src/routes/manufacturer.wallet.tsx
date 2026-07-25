import { createFileRoute, redirect } from "@tanstack/react-router";

// The Roge Coin wallet system is on hold pending a feasibility review of
// using an app-currency as the payment rail between customers and
// manufacturers (see product notes). Redirecting rather than deleting the
// feature outright - ManufacturerWalletPage.tsx and its supporting code
// are untouched and ready to re-enable later.
export const Route = createFileRoute("/manufacturer/wallet")({
  beforeLoad: () => {
    throw redirect({ to: "/manufacturer/orders" });
  },
});
