import React, { useEffect, useState } from "react";
import { useManufacturer } from "@/hooks/useManufacturer";
import { createConnectOnboardingLink, getConnectAccountStatus } from "@/lib/stripe-connect.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, CreditCard, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const ManufacturerPaymentsPage: React.FC = () => {
  const { manufacturer, loading: manufacturerLoading } = useManufacturer();
  const [status, setStatus] = useState<{
    connected: boolean;
    chargesEnabled: boolean;
    detailsSubmitted: boolean;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const refreshStatus = async () => {
    setCheckingStatus(true);
    try {
      const result = await getConnectAccountStatus();
      setStatus(result);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not check payment setup status");
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (manufacturer) refreshStatus();
  }, [manufacturer]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await createConnectOnboardingLink();
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      throw new Error("No onboarding URL returned");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not start Stripe onboarding");
      setConnecting(false);
    }
  };

  if (manufacturerLoading || checkingStatus) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isFullyConnected = status?.chargesEnabled;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Payments</h1>
      <p className="text-muted-foreground mb-6">
        Connect a Stripe account to receive payment for orders directly. Roge keeps a{" "}
        {((manufacturer as any)?.commission_rate ?? 0.1) * 100}% commission on each order;
        the rest transfers to your account automatically.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Account
          </CardTitle>
          <CardDescription>
            {isFullyConnected
              ? "Your account is connected and ready to receive payments."
              : status?.connected
                ? "Setup started but not finished yet — Stripe needs a bit more information from you."
                : "You haven't connected a Stripe account yet. Customers can't pay for your orders until this is done."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullyConnected ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              Connected and ready to receive payouts
            </div>
          ) : (
            <div className="space-y-4">
              {status?.connected && (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  Stripe still needs more details from you to finish setup (this can happen if
                  you didn't complete every step, or Stripe needs to verify something).
                </div>
              )}
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting to Stripe...
                  </>
                ) : status?.connected ? (
                  "Continue Stripe setup"
                ) : (
                  "Connect with Stripe"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
