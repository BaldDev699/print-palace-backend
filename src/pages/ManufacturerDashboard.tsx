import React, { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Package, CheckCircle, Edit, Eye, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ManufacturerForm } from "@/components/manufacturers/ManufacturerForm";
import { OrderModal } from "@/components/orders/OrderModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatKsh } from "@/lib/pricing";

interface Manufacturer {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  specialties: string[] | null;
  minimum_order_quantity: number;
  lead_time_days: number;
  certifications: string[] | null;
  website_url?: string;
  description?: string;
  is_verified: boolean;
}

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
  updated_at: string;
  payment_status: string;
  delivery_status: string;
  shipping_address?: any;
  shipping_final_cents: number;
  total_cents: number;
  tracking_number?: string;
}

const ManufacturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchManufacturerData();
    fetchOrders();
  }, [user, navigate]);

  const fetchManufacturerData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("manufacturers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        navigate("/manufacturers");
        return;
      }

      setManufacturer(data as any);
    } catch (error) {
      console.error("Error fetching manufacturer:", error);
      toast.error("Failed to load manufacturer profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data: manufacturerData, error: manufacturerError } = await supabase
        .from("manufacturers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (manufacturerError) throw manufacturerError;
      if (!manufacturerData) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("manufacturer_id", manufacturerData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as any);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    fetchManufacturerData();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleOrderUpdate = () => {
    fetchOrders();
    setShowOrderModal(false);
  };

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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!manufacturer) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                {manufacturer.company_name}
                {manufacturer.is_verified && <CheckCircle className="h-6 w-6 text-green-500" />}
              </h1>
              <p className="text-muted-foreground">
                {manufacturer.description?.split("\n\n")[0] || "Manufacturing Partner Dashboard"}
              </p>
            </div>
            <Button onClick={() => setShowEditForm(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {/* Edit Form Modal */}
          {showEditForm && (
            <ManufacturerForm
              manufacturer={manufacturer}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowEditForm(false)}
            />
          )}

          {/* Order Details Modal */}
          <OrderModal
            order={selectedOrder}
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            isManufacturer={true}
            onOrderUpdate={handleOrderUpdate}
          />

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Received Orders
                  </CardTitle>
                  <CardDescription>
                    Manage and track orders assigned to your manufacturing facility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders received yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Orders will appear here when customers select your manufacturing services
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{order.product_type}</h3>
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">
                                    {order.payment_status.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Package className="h-4 w-4" />
                                    Qty: {order.quantity}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </span>
                                  <span>Total: {formatKsh(order.total_cents / 100)}</span>
                                </div>
                                {order.notes && (
                                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                                View & Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Company Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {manufacturer.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {manufacturer.address}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {manufacturer.lead_time_days} days lead time
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Min order: {manufacturer.minimum_order_quantity} units
                  </div>

                  {(manufacturer.specialties?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-2">
                        {manufacturer.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(manufacturer.certifications?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {manufacturer.certifications?.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Published Services</CardTitle>
                  <CardDescription>
                    Manage the services and capabilities displayed on your public profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Service Description</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {manufacturer.description || "No description provided"}
                      </p>
                    </div>

                    <Button onClick={() => setShowEditForm(true)} className="w-full">
                      Update Services & Capabilities
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManufacturerDashboard;
