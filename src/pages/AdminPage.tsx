import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ShieldCheck, Loader2, Package } from "lucide-react";
import { formatKsh } from "@/lib/pricing";

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }
    void fetchAll();
  }, [user, isAdmin, authLoading, roleLoading]);

  async function fetchAll() {
    setLoading(true);
    const [m, o] = await Promise.all([
      supabase.from("manufacturers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (m.data) setManufacturers(m.data);
    if (o.data) setOrders(o.data);
    setLoading(false);
  }

  async function toggleVerify(id: string, verified: boolean) {
    const { error } = await supabase
      .from("manufacturers")
      .update({ is_verified: verified })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(verified ? "Manufacturer verified" : "Verification revoked");
    void fetchAll();
  }

  if (authLoading || roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pending = manufacturers.filter((m) => !m.is_verified);
  const verified = manufacturers.filter((m) => m.is_verified);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="applications">
          <TabsList>
            <TabsTrigger value="applications">
              Applications ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="verified">Verified ({verified.length})</TabsTrigger>
            <TabsTrigger value="orders">All Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <p className="text-muted-foreground">No pending applications.</p>
            ) : (
              pending.map((m) => (
                <ManufacturerCard key={m.id} m={m} onToggle={toggleVerify} />
              ))
            )}
          </TabsContent>

          <TabsContent value="verified" className="mt-4 space-y-3">
            {verified.map((m) => (
              <ManufacturerCard key={m.id} m={m} onToggle={toggleVerify} />
            ))}
          </TabsContent>

          <TabsContent value="orders" className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet.</p>
            ) : (
              orders.map((o) => (
                <Card key={o.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Package className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {o.product_type} × {o.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {formatKsh(o.total_cents / 100)} • {o.status} • {o.payment_status}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {new Date(o.created_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

function ManufacturerCard({
  m,
  onToggle,
}: {
  m: any;
  onToggle: (id: string, verified: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{m.company_name}</CardTitle>
          {m.is_verified ? (
            <Badge className="bg-green-600">Verified</Badge>
          ) : (
            <Badge variant="secondary">Pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {m.description && <p className="text-muted-foreground">{m.description}</p>}
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div>Contact: {m.contact_email}</div>
          {m.contact_phone && <div>Phone: {m.contact_phone}</div>}
          <div>Min order: {m.minimum_order_quantity} units</div>
          <div>Lead time: {m.lead_time_days} days</div>
        </div>
        {m.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {m.specialties.map((s: string) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {m.is_verified ? (
            <Button variant="outline" size="sm" onClick={() => onToggle(m.id, false)}>
              <XCircle className="h-4 w-4 mr-1" /> Revoke
            </Button>
          ) : (
            <Button size="sm" onClick={() => onToggle(m.id, true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminPage;
