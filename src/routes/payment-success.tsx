import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-success")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Payment Successful — Roge Print Studio" },
      { name: "description", content: "Your order payment was successful." },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const orderId = search?.get("order_id");
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <h1 className="text-2xl font-semibold">Payment received</h1>
        <p className="text-muted-foreground">
          Thanks! Your order {orderId ? `#${orderId.slice(0, 8)}` : ""} is confirmed and the
          manufacturer has been notified.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/profile">View my orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
