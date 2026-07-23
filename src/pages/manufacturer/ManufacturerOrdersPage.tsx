import React, { useState, useEffect } from "react";
import { useManufacturer } from "@/hooks/useManufacturer";
import { supabase } from "@/integrations/supabase/client";
import { OrderModal } from "@/components/orders/OrderModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    setUpdatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      newStatus === "manufacturer_confirmed"
        ? "Order accepted — customer can now proceed to pay."
        : newStatus === "manufacturer_declined"
          ? "Order declined."
          : "Order updated",
    );
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
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
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
                    <div className="flex flex-wrap gap-2">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            disabled={updatingId === order.id}
                            onClick={() => updateStatus(order.id, "manufacturer_confirmed")}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === order.id}
                            onClick={() => updateStatus(order.id, "manufacturer_declined")}
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
                            onClick={() => updateStatus(order.id, "in_production")}
                          >
                            Start Production
                          </Button>
                        )}
                      {order.status === "in_production" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(order.id, "completed")}
                        >
                          Mark Completed
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
    </div>
  );
};
