import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Package, Clock, Calendar, MapPin, CreditCard, Truck, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatKsh } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/stripe-checkout.functions";
import { OrderChat } from "./OrderChat";

interface Order {
  id: string;
  customer_id: string;
  design_data: any;
  measurements: any;
  quantity: number;
  status: string;
  product_type: string;
  notes?: string;
  created_at: string;
  payment_status: string;
  delivery_status: string;
  shipping_address?: any;
  shipping_final_cents: number;
  total_cents: number;
  tracking_number?: string;
  manufacturer_notes?: string | null;
  decline_reason?: string | null;
  delivery_notes?: string | null;
}

interface OrderDetailsProps {
  order: Order;
  isManufacturer?: boolean;
  onOrderUpdate?: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  isManufacturer = false,
  onOrderUpdate,
}) => {
  const [shippingLocation, setShippingLocation] = useState("");
  const [estimatedShipping, setEstimatedShipping] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const estimateShipping = () => {
    if (!shippingLocation.trim()) {
      toast.error("Please enter shipping location");
      return;
    }

    // Simple shipping estimation logic - in reality, you'd use a shipping API
    const location = shippingLocation.toLowerCase();
    let estimate = 0;

    if (location.includes("nairobi")) {
      estimate = 500; // 5 KSh in cents
    } else if (location.includes("mombasa") || location.includes("kisumu")) {
      estimate = 800;
    } else if (location.includes("kenya")) {
      estimate = 1200;
    } else {
      estimate = 2000; // International
    }

    setEstimatedShipping(estimate);
    toast.success(`Shipping estimated at ${formatKsh(estimate / 100)}`);
  };

  const updateOrderStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      if (error) throw error;
      toast.success("Order status updated");
      onOrderUpdate?.();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const updateShipping = async () => {
    setLoading(true);
    try {
      const updates: any = {
        shipping_final_cents: estimatedShipping,
      };

      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
        updates.delivery_status = "shipped";
      }

      const { error } = await supabase.from("orders").update(updates).eq("id", order.id);

      if (error) throw error;
      toast.success("Shipping information updated");
      onOrderUpdate?.();
    } catch (error) {
      console.error("Error updating shipping:", error);
      toast.error("Failed to update shipping information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {order.product_type} • Quantity: {order.quantity}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant="outline">{order.payment_status.toUpperCase()}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Total: {formatKsh(order.total_cents / 100)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Delivery: {order.delivery_status}</span>
            </div>
          </div>

          {order.design_data?.image && (
            <div>
              <h4 className="font-medium mb-2">Design Preview</h4>
              <div className="border rounded overflow-hidden bg-white max-w-md">
                <img
                  src={order.design_data.image}
                  alt="Order design"
                  className="w-full h-48 object-contain"
                />
              </div>
            </div>
          )}

          {order.notes && (
            <div>
              <h4 className="font-medium mb-2">Order Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{order.notes}</p>
            </div>
          )}

          {order.status === "pending" && (
            <div className="text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 rounded p-3">
              Waiting on the manufacturer to review feasibility. You'll be notified once they
              confirm and you can proceed to payment.
            </div>
          )}

          {order.status === "manufacturer_confirmed" && order.manufacturer_notes && (
            <div>
              <h4 className="font-medium mb-2">Manufacturer's Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {order.manufacturer_notes}
              </p>
            </div>
          )}

          {order.status === "manufacturer_declined" && (
            <div className="text-sm bg-red-50 text-red-800 border border-red-200 rounded p-3">
              <p className="font-medium mb-1">This manufacturer couldn't take on the order.</p>
              {order.decline_reason && <p>{order.decline_reason}</p>}
            </div>
          )}

          {order.status === "completed" && order.delivery_notes && (
            <div>
              <h4 className="font-medium mb-2">Delivery Details</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {order.delivery_notes}
              </p>
            </div>
          )}

          {!isManufacturer &&
            order.status === "manufacturer_confirmed" &&
            order.payment_status !== "paid" &&
            order.total_cents > 0 && (
            <div className="pt-2">
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await createCheckoutSession({ data: { orderId: order.id } });
                    if (res?.url) window.location.href = res.url;
                    else toast.error("Could not start payment");
                  } catch (e: any) {
                    toast.error(e?.message || "Payment failed to start");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? "Starting checkout…" : `Pay ${formatKsh(order.total_cents / 100)}`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manufacturer Controls */}
      {isManufacturer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Order Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Update Order Status</Label>
              <Select value={order.status} onValueChange={updateOrderStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Shipping Estimation</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter customer location (e.g., Nairobi, Kenya)"
                  value={shippingLocation}
                  onChange={(e) => setShippingLocation(e.target.value)}
                />
                <Button onClick={estimateShipping} variant="outline">
                  Estimate
                </Button>
              </div>

              {estimatedShipping > 0 && (
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm">
                    Estimated shipping cost: <strong>{formatKsh(estimatedShipping / 100)}</strong>
                  </p>
                </div>
              )}

              <div>
                <Label>Tracking Number (Optional)</Label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <Button
                onClick={updateShipping}
                disabled={loading || estimatedShipping === 0}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Shipping Information"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Chat */}
      <OrderChat orderId={order.id} customerName="Customer" manufacturerName="Manufacturer" />
    </div>
  );
};
