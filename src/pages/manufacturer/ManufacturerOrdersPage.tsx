import React, { useState, useEffect } from 'react';
import { useManufacturer } from '@/hooks/useManufacturer';
import { supabase } from '@/integrations/supabase/client';
import { OrderModal } from '@/components/orders/OrderModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!manufacturer) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('manufacturer_id', manufacturer.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data || []) as any);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [manufacturer]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOrderUpdate = () => {
    // Refresh orders
    window.location.reload();
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      production: 'bg-purple-500',
      shipped: 'bg-green-500',
      delivered: 'bg-emerald-500',
      cancelled: 'bg-red-500',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-500';
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {orders.length} Total Orders
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
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-lg">{order.product_type}</h3>
                      <Badge className={`text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Quantity: {order.quantity} • Total: KSh {(order.total_cents / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ordered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => handleViewOrder(order)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isManufacturer={true}
        onOrderUpdate={handleOrderUpdate}
      />
    </div>
  );
};