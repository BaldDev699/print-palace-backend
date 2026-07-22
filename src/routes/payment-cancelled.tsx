import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-cancelled")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Roge Print Studio" },
      { name: "description", content: "Your payment was cancelled." },
    ],
  }),
  component: PaymentCancelledPage,
});

function PaymentCancelledPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const orderId = search?.get("order_id");
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <XCircle className="h-16 w-16 mx-auto text-destructive" />
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="text-muted-foreground">
          No charge was made. Your order {orderId ? `#${orderId.slice(0, 8)}` : ""} is saved — you
          can retry payment from your profile.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/profile">Go to my orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
