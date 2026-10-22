import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Canvas as FabricCanvas } from "fabric";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@/lib/router-compat";
import {
  ArrowLeft,
  X,
  Package,
  Clock,
  RefreshCw,
  AlertCircle,
  Minus,
  Plus,
  Send,
  Receipt,
} from "lucide-react";
import { calculatePricing, formatKsh, kshToCents } from "@/lib/pricing";
import { notifyOrderEvent } from "@/lib/notifications.functions";
import {
  getProductQuantityRule,
  isValidQuantity,
  roundUpToValidQuantity,
  getEffectiveMinimum,
} from "@/lib/quantityRules";

interface Manufacturer {
  id: string;
  company_name: string;
  minimum_order_quantity: number;
  lead_time_days: number;
  specialties: string[];
}

interface OrderSubmissionProps {
  fabricCanvas: FabricCanvas | null;
  measurements: Record<string, number>;
  productType: string;
  printingMethod?: string;
  onClose: () => void;
}

const SectionTitle: React.FC<{ step?: number; children: React.ReactNode }> = ({
  step,
  children,
}) => (
  <div className="flex items-center gap-2 mb-3">
    {step && (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
        {step}
      </span>
    )}
    <h3 className="text-sm font-semibold text-foreground">{children}</h3>
  </div>
);

export const OrderSubmission: React.FC<OrderSubmissionProps> = ({
  fabricCanvas,
  measurements,
  productType,
  printingMethod = "DTG",
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [manufacturersLoading, setManufacturersLoading] = useState(true);
  const [manufacturersError, setManufacturersError] = useState<string>("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate the preview image once (not on every re-render)
  const previewImage = useMemo(() => {
    if (!fabricCanvas) return "";
    return fabricCanvas.toDataURL({ format: "png", quality: 0.8, multiplier: 0.5 });
  }, [fabricCanvas]);

  const pricing = useMemo(() => {
    return calculatePricing(productType, printingMethod, quantity);
  }, [productType, printingMethod, quantity]);

  const productRule = getProductQuantityRule(productType);

  useEffect(() => {
    if (productRule) {
      setQuantity(productRule.minimumQuantity);
    }
  }, [productType, productRule]);

  useEffect(() => {
    fetchManufacturers();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fetchManufacturers = async (retryCount = 0) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setManufacturersLoading(true);
    setManufacturersError("");

    try {
      const { data: allManufacturers, error } = await supabase
        .rpc("get_public_manufacturers")
        .abortSignal(signal);

      if (error) throw error;

      const list = allManufacturers || [];
      let data = list
        .filter((m: any) => m.is_verified)
        .sort((a: any, b: any) => (a.lead_time_days ?? 0) - (b.lead_time_days ?? 0));

      if (data.length === 0) {
        data = [...list]
          .sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          .slice(0, 10);
      }

      setManufacturers(data as any);
      setManufacturersError("");
    } catch (error: any) {
      if (error.name === "AbortError") return;

      console.error("Error fetching manufacturers:", error);

      if (retryCount < 2) {
        setTimeout(
          () => {
            fetchManufacturers(retryCount + 1);
          },
          1000 * (retryCount + 1),
        );
        return;
      }

      setManufacturersError(
        "Failed to load manufacturers. Please check your connection and try again.",
      );
      setManufacturers([]);
    } finally {
      setManufacturersLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error("You must be logged in to submit an order");
      return;
    }

    if (!selectedManufacturer) {
      toast.error("Please select a manufacturer");
      return;
    }

    if (!fabricCanvas) {
      toast.error("No design available to submit");
      return;
    }

    setLoading(true);
    try {
      const designJson = fabricCanvas.toJSON();
      const designImage = fabricCanvas.toDataURL({
        format: "png",
        quality: 0.8,
        multiplier: 2,
      });

      const orderData = {
        customer_id: user.id,
        manufacturer_id: selectedManufacturer,
        design_data: {
          json: designJson,
          image: designImage,
          canvas_dimensions: {
            width: fabricCanvas.width,
            height: fabricCanvas.height,
          },
        },
        measurements,
        product_type: productType,
        quantity,
        notes,
        status: "pending",
        currency: pricing.currency,
        printing_method: printingMethod,
        base_price_cents: kshToCents(pricing.breakdown.basePrice),
        printing_surcharge_cents: kshToCents(pricing.breakdown.printingSurcharge),
        quantity_discount_cents: kshToCents(pricing.breakdown.quantityDiscount),
        design_coverage_adjustment_cents: kshToCents(pricing.breakdown.designCoverageAdjustment),
        subtotal_cents: kshToCents(pricing.breakdown.subtotal),
        tax_cents: kshToCents(pricing.breakdown.tax),
        shipping_cents: kshToCents(pricing.breakdown.shipping),
        total_cents: kshToCents(pricing.breakdown.total),
        pricing_breakdown: pricing.breakdown as any,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select("id")
        .single();

      if (error) throw error;

      try {
        await notifyOrderEvent({ data: { orderId: data.id, event: "order_submitted" } });
      } catch (notifyErr) {
        console.error("Failed to notify manufacturer:", notifyErr);
      }

      toast.success("Order sent to the manufacturer for review — we'll notify you once confirmed.");
      onClose();
      navigate("/profile", {
        state: { openOrdersTab: true, newOrderId: data.id },
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to submit order");
    } finally {
      setLoading(false);
    }
  };

  const selectedManufacturerData = manufacturers.find((m) => m.id === selectedManufacturer);

  const effectiveMinimum = selectedManufacturerData
    ? getEffectiveMinimum(productType, selectedManufacturerData.minimum_order_quantity)
    : productRule?.minimumQuantity || 1;

  const step = productRule?.stepSize || 1;
  const isQuantityValid = isValidQuantity(productType, quantity) && quantity >= effectiveMinimum;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= 0) {
      setQuantity(effectiveMinimum);
      return;
    }
    const validQuantity = roundUpToValidQuantity(productType, numValue);
    setQuantity(Math.max(validQuantity, effectiveMinimum));
  };

  const decrease = () => setQuantity((q) => Math.max(effectiveMinimum, q - step));
  const increase = () => setQuantity((q) => q + step);

  const canSubmit = !loading && !manufacturersLoading && !!selectedManufacturer && isQuantityValid;

  const measurementEntries = Object.entries(measurements);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col bg-card text-card-foreground sm:rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to designer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold leading-tight truncate">
              Submit order to manufacturer
            </h2>
            <p className="text-xs text-muted-foreground">
              The manufacturer reviews your design first. You only pay once they confirm.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-5 gap-6 p-4 sm:p-6">
            {/* LEFT: form */}
            <div className="lg:col-span-3 space-y-7">
              {/* Manufacturer */}
              <div>
                <SectionTitle step={1}>Choose a manufacturer</SectionTitle>

                {manufacturersLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-11 w-full rounded-xl" />
                    <p className="text-xs text-muted-foreground">Loading manufacturers...</p>
                  </div>
                ) : manufacturersError ? (
                  <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-center gap-2 text-destructive mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Unable to load manufacturers</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{manufacturersError}</p>
                    <Button variant="outline" size="sm" onClick={() => fetchManufacturers()}>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Retry
                    </Button>
                  </div>
                ) : manufacturers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No manufacturers available yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => fetchManufacturers()}
                    >
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Choose a manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{m.company_name}</span>
                            <span className="text-xs text-muted-foreground">
                              Min {m.minimum_order_quantity} units · {m.lead_time_days} days
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedManufacturerData && (
                  <div className="mt-3 rounded-xl border border-border bg-background/40 p-4 space-y-3">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        Min order:{" "}
                        <b className="text-foreground">
                          {selectedManufacturerData.minimum_order_quantity} units
                        </b>
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        Lead time:{" "}
                        <b className="text-foreground">
                          {selectedManufacturerData.lead_time_days} days
                        </b>
                      </span>
                    </div>
                    {selectedManufacturerData.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedManufacturerData.specialties.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <SectionTitle step={2}>Quantity</SectionTitle>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden">
                    <button
                      type="button"
                      onClick={decrease}
                      disabled={quantity <= effectiveMinimum}
                      aria-label="Decrease quantity"
                      className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      id="quantity"
                      type="number"
                      min={effectiveMinimum}
                      step={step}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className={`h-11 w-20 rounded-none border-0 border-x border-border text-center text-base font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                        !isQuantityValid ? "text-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={increase}
                      aria-label="Increase quantity"
                      className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {productRule && (
                    <span className="text-sm text-muted-foreground">{productRule.description}</span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  {selectedManufacturerData &&
                    selectedManufacturerData.minimum_order_quantity >
                      (productRule?.minimumQuantity || 0) && (
                      <p className="text-muted-foreground">
                        This manufacturer requires at least{" "}
                        {selectedManufacturerData.minimum_order_quantity} units.
                      </p>
                    )}
                  {!isQuantityValid && (
                    <p className="text-destructive">
                      {quantity < effectiveMinimum
                        ? `Minimum quantity is ${effectiveMinimum} units`
                        : `Must be in multiples of ${step}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <SectionTitle step={3}>Notes for the manufacturer</SectionTitle>
                <Label htmlFor="notes" className="sr-only">
                  Additional notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fabric, colors, deadlines, or any special instructions..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>
            </div>

            {/* RIGHT: summary */}
            <aside className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Your design</h3>
                  <Badge variant="outline" className="capitalize">
                    {productType.replace(/-/g, " ")}
                  </Badge>
                </div>

                <div className="rounded-lg overflow-hidden bg-white border border-border">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Design preview"
                      className="w-full h-48 object-contain"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                      No preview
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Measurements</p>
                  {measurementEntries.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {measurementEntries.map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="capitalize truncate">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </span>
                          <span className="font-medium text-foreground">{value}cm</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Standard size (default measurements)</p>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl border border-border bg-background/40 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Receipt className="h-4 w-4 text-primary" />
                  Pricing estimate
                </h3>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">
                      Base ({quantity} × {formatKsh(pricing.breakdown.basePrice / quantity)})
                    </dt>
                    <dd>{formatKsh(pricing.breakdown.basePrice)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Printing ({printingMethod})</dt>
                    <dd>{formatKsh(pricing.breakdown.printingSurcharge)}</dd>
                  </div>
                  {pricing.breakdown.quantityDiscount !== 0 && (
                    <div className="flex justify-between gap-3 text-green-500">
                      <dt>Quantity discount</dt>
                      <dd>{formatKsh(pricing.breakdown.quantityDiscount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd>{formatKsh(pricing.breakdown.tax)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{formatKsh(pricing.breakdown.shipping)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-border pt-3 text-base font-bold">
                    <dt>Total</dt>
                    <dd className="text-primary">{formatKsh(pricing.breakdown.total)}</dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs text-muted-foreground">
                  Final pricing is confirmed by the manufacturer. Bulk discounts apply from 10
                  items.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border bg-card px-4 sm:px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {!canSubmit && !loading && !manufacturersLoading && (
            <p className="mb-2 text-xs text-muted-foreground">
              {!selectedManufacturer
                ? "Select a manufacturer to continue."
                : !isQuantityValid
                  ? "Please enter a valid quantity."
                  : ""}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block mr-auto">
              <p className="text-xs text-muted-foreground">Estimated total</p>
              <p className="text-xl font-bold leading-tight">
                {formatKsh(pricing.breakdown.total)}
              </p>
            </div>
            <Button variant="outline" onClick={onClose} className="sm:w-auto">
              Back
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={!canSubmit}
              className="flex-1 sm:flex-none sm:min-w-48 gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};