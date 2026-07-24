import React, { useState, useEffect } from "react";
import { useManufacturer } from "@/hooks/useManufacturer";
import { supabase } from "@/integrations/supabase/client";
import { notifyOrderEvent, type OrderNotificationEvent } from "@/lib/notifications.functions";
import { OrderModal } from "@/components/orders/OrderModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";

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
}

type PendingAction = {
  orderId: string;
  kind: "confirm" | "decline" | "complete";
} | null;

const ACTION_COPY: Record<
  NonNullable<PendingAction>["kind"],
  { title: string; label: string; placeholder: string; event: OrderNotificationEvent }
> = {
  confirm: {
    title: "Confirm feasibility",
    label: "Notes for the customer (optional)",
    placeholder: "e.g. confirmed, lead time is 10 days as quoted",
    event: "quote_ready",
  },
  decline: {
    title: "Decline order",
    label: "Reason for declining",
    placeholder: "e.g. quantity below our minimum order for this product",
    event: "order_declined",
  },
  complete: {
    title: "Mark order complete",
    label: "Delivery details for the customer",
    placeholder: "e.g. shipped via courier, expect delivery in 3-5 days, tracking below",
    event: "order_completed",
  },
};

export const ManufacturerOrdersPage: React.FC = () => {
  const { manufacturer, loading: manufacturerLoading } = useManufacturer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!manufacturer) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("manufacturer_id", manufacturer.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setOrders((data || []) as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturer]);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionNote, setActionNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const openAction = (orderId: string, kind: NonNullable<PendingAction>["kind"]) => {
    setActionNote("");
    setPendingAction({ orderId, kind });
  };

  const submitAction = async () => {
    if (!pendingAction) return;
    const { orderId, kind } = pendingAction;
    if (kind === "decline" && !actionNote.trim()) {
      toast.error("Please give the customer a reason for declining.");
      return;
    }

    setSubmittingAction(true);
    setUpdatingId(orderId);

    const updates: import("@/integrations/supabase/types").TablesUpdate<"orders"> =
      kind === "confirm"
        ? {
            status: "manufacturer_confirmed",
            manufacturer_notes: actionNote.trim() || null,
            manufacturer_confirmed_at: new Date().toISOString(),
          }
        : kind === "decline"
          ? {
              status: "manufacturer_declined",
              decline_reason: actionNote.trim(),
              manufacturer_declined_at: new Date().toISOString(),
            }
          : {
              status: "completed",
              delivery_notes: actionNote.trim() || null,
              completed_at: new Date().toISOString(),
            };

    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);

    if (error) {
      toast.error(error.message);
      setSubmittingAction(false);
      setUpdatingId(null);
      return;
    }

    try {
      await notifyOrderEvent({ data: { orderId, event: ACTION_COPY[kind].event } });
    } catch (notifyErr) {
      console.error("Notification failed:", notifyErr);
    }

    toast.success(
      kind === "confirm"
        ? "Order accepted — the customer has been notified to pay."
        : kind === "decline"
          ? "Order declined — the customer has been notified."
          : "Order marked complete — the customer has been notified with delivery details.",
    );

    setSubmittingAction(false);
    setUpdatingId(null);
    setPendingAction(null);
    fetchOrders();
  };

  const startProduction = async (orderId: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: "in_production" })
      .eq("id", orderId);
    setUpdatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Production started.");
    fetchOrders();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500",
      manufacturer_confirmed: "bg-blue-500",
      manufacturer_declined: "bg-red-500",
      confirmed: "bg-blue-500",
      production: "bg-purple-500",
      in_production: "bg-purple-500",
      shipped: "bg-green-500",
      delivered: "bg-emerald-500",
      cancelled: "bg-red-500",
      completed: "bg-emerald-600",
    };
    return map[status] || "bg-gray-500";
  };

  if (manufacturerLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {orders.length} Total
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No orders received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === "pending";
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] items-start">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">{order.product_type}</h3>
                        <Badge className={`text-white ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="outline">{order.payment_status}</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        Quantity: {order.quantity} • Total: KSh{" "}
                        {(order.total_cents / 100).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ordered on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.notes && (
                        <p className="text-sm bg-muted/50 rounded p-2">
                          <span className="font-medium">Note:</span> {order.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:flex-shrink-0">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => openAction(order.id, "confirm")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === order.id}
                            onClick={() => openAction(order.id, "decline")}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {order.status === "manufacturer_confirmed" &&
                        order.payment_status === "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === order.id}
                            onClick={() => startProduction(order.id)}
                          >
                            Start Production
                          </Button>
                        )}
                      {order.status === "in_production" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === order.id}
                          onClick={() => openAction(order.id, "complete")}
                        >
                          <PackageCheck className="h-4 w-4 mr-1" /> Mark Completed
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => handleViewOrder(order)}>
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isManufacturer={true}
        onOrderUpdate={fetchOrders}
      />

      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          {pendingAction && (
            <>
              <DialogHeader>
                <DialogTitle>{ACTION_COPY[pendingAction.kind].title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="action-note">{ACTION_COPY[pendingAction.kind].label}</Label>
                <Textarea
                  id="action-note"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={ACTION_COPY[pendingAction.kind].placeholder}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  The customer will be notified with this message.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPendingAction(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={submitAction}
                  disabled={submittingAction}
                  variant={pendingAction.kind === "decline" ? "destructive" : "default"}
                >
                  {submittingAction ? "Submitting..." : ACTION_COPY[pendingAction.kind].title}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
