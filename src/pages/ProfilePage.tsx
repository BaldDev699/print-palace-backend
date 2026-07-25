import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Edit3,
  UploadCloud,
  Store,
  ArrowRight,
  Package,
  Eye,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { OrderModal } from "@/components/orders/OrderModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatKsh } from "@/lib/pricing";


// Define the structure for a saved design
interface SavedDesign {
  id: string;
  name: string;
  imageUrl: string;
  lastEdited: string;
}

// Define the structure for a reseller application
interface ResellerApplication {
  id: string;
  productName: string;
  description: string;
  price: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

// Define the structure for an order
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

const ProfilePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // User data state
  const [username, setUsername] = useState("CreativeUser123");

  // Saved designs state
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Reseller applications state
  const [resellerApplications, setResellerApplications] = useState<ResellerApplication[]>([]);

  // New application form state
  const [newApplication, setNewApplication] = useState({
    productName: "",
    description: "",
    price: "",
    image: null as File | null,
  });

  // Dialog state
  const [isResellerDialogOpen, setIsResellerDialogOpen] = useState(false);

  // Get state from navigation (for redirect from order submission)
  const locationState = location.state as { openOrdersTab?: boolean; newOrderId?: string } | null;
  const [activeTab, setActiveTab] = useState("orders");
  void locationState;


  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Load saved designs from localStorage on component mount
  useEffect(() => {
    const loadedDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
    setSavedDesigns(loadedDesigns);

    // Load reseller applications from localStorage
    const loadedApplications = JSON.parse(localStorage.getItem("resellerApplications") || "[]");
    setResellerApplications(loadedApplications);
  }, []);

  // Fetch user orders
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Handle opening new order if redirected from order submission
  useEffect(() => {
    if (locationState?.newOrderId && orders.length > 0) {
      const newOrder = orders.find((order) => order.id === locationState.newOrderId);
      if (newOrder) {
        setSelectedOrder(newOrder);
        setIsOrderModalOpen(true);
        // Clear the state to prevent reopening
        navigate(location.pathname, { replace: true });
      }
    }
  }, [locationState?.newOrderId, orders, navigate, location.pathname]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as any);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    }
  };

  // Handle input changes for reseller application form
  const handleApplicationInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewApplication((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload for reseller application
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewApplication((prev) => ({ ...prev, image: e.target.files?.[0] || null }));
    }
  };

  // Submit a new reseller application
  const submitApplication = () => {
    if (!newApplication.productName || !newApplication.description || !newApplication.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const reader = new FileReader();

    const createApplication = (imageUrl: string | null) => {
      const application: ResellerApplication = {
        id: `app-${Date.now()}`,
        productName: newApplication.productName,
        description: newApplication.description,
        price: newApplication.price,
        imageUrl,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      const updatedApplications = [application, ...resellerApplications];
      setResellerApplications(updatedApplications);
      localStorage.setItem("resellerApplications", JSON.stringify(updatedApplications));

      // Reset form
      setNewApplication({
        productName: "",
        description: "",
        price: "",
        image: null,
      });

      setIsResellerDialogOpen(false);
      toast.success("Reseller application submitted successfully!");
    };

    if (newApplication.image) {
      reader.onloadend = () => {
        createApplication(reader.result as string);
      };
      reader.readAsDataURL(newApplication.image);
    } else {
      createApplication(null);
    }
  };

  // Function to delete a saved design
  const deleteDesign = (designId: string) => {
    const updatedDesigns = savedDesigns.filter((design) => design.id !== designId);
    setSavedDesigns(updatedDesigns);
    localStorage.setItem("savedDesigns", JSON.stringify(updatedDesigns));
    toast.info("Design deleted successfully");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          <Button variant="outline" asChild>
            <Link to="/designer">
              <Edit3 className="mr-2 h-4 w-4" /> Create New Design
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Information Section */}
          <div className="md:col-span-1 bg-card p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2">
                <UploadCloud className="h-4 w-4" />
                Change Picture
              </Button>
              <input type="file" className="hidden" accept="image/*" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-2">{username}</h2>
            <p className="text-muted-foreground text-center mb-6">Joined May 2024</p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Username
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Email
                </label>
                <Input id="email" type="email" defaultValue="user@example.com" disabled />
              </div>
              <Button className="w-full">Update Profile</Button>
            </div>
          </div>

          {/* Saved Designs and Reseller Sections */}
          <div className="md:col-span-2 space-y-8">
            {/* Tabs for Orders, Designs, and Reseller */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="bg-card p-6 rounded-lg shadow-lg"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="designs">My Saved Designs</TabsTrigger>
                <TabsTrigger value="reseller">Reseller Applications</TabsTrigger>
              </TabsList>


              <TabsContent value="orders">
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">
                              {order.product_type} - Qty: {order.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatKsh(order.total_cents / 100)} • Status: {order.status} •{" "}
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    You haven't placed any orders yet.{" "}
                    <Link to="/designer" className="text-primary hover:underline">
                      Start creating!
                    </Link>
                  </p>
                )}
              </TabsContent>




              <TabsContent value="designs">
                {savedDesigns.length > 0 ? (
                  <div className="space-y-4">
                    {savedDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={design.imageUrl}
                            alt={design.name}
                            className="w-16 h-16 rounded object-cover bg-muted"
                          />
                          <div>
                            <p className="font-medium">{design.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Last edited: {design.lastEdited}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/designer?id=${design.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteDesign(design.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    You haven't saved any designs yet.{" "}
                    <Link to="/designer" className="text-primary hover:underline">
                      Start creating!
                    </Link>
                  </p>
                )}
              </TabsContent>

              <TabsContent value="reseller">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium">Become a Reseller</h4>
                  <Dialog open={isResellerDialogOpen} onOpenChange={setIsResellerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Store className="h-4 w-4 mr-2" />
                        Submit New Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Submit a Product for Reselling</DialogTitle>
                        <DialogDescription>
                          Share your product details to get featured in our collection page.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div>
                          <label htmlFor="productName" className="block text-sm font-medium mb-1">
                            Product Name
                          </label>
                          <Input
                            id="productName"
                            name="productName"
                            value={newApplication.productName}
                            onChange={handleApplicationInputChange}
                            placeholder="E.g. Vintage Graphic Tee"
                          />
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium mb-1">
                            Description
                          </label>
                          <Textarea
                            id="description"
                            name="description"
                            value={newApplication.description}
                            onChange={handleApplicationInputChange}
                            placeholder="Brief description of your product"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label htmlFor="price" className="block text-sm font-medium mb-1">
                            Price
                          </label>
                          <Input
                            id="price"
                            name="price"
                            value={newApplication.price}
                            onChange={handleApplicationInputChange}
                            placeholder="E.g. $29.99"
                          />
                        </div>

                        <div>
                          <label htmlFor="productImage" className="block text-sm font-medium mb-1">
                            Product Image
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById("productImage")?.click()}
                              type="button"
                            >
                              <UploadCloud className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {newApplication.image
                                ? newApplication.image.name
                                : "No file selected"}
                            </span>
                            <input
                              type="file"
                              id="productImage"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsResellerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={submitApplication}>Submit Application</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {resellerApplications.length > 0 ? (
                  <div className="space-y-4">
                    {resellerApplications.map((app) => (
                      <div key={app.id} className="p-4 border border-border rounded-md">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded">
                            {app.imageUrl && (
                              <img
                                src={app.imageUrl}
                                alt={app.productName}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{app.productName}</p>
                              <span
                                className={`px-2 py-0.5 text-xs rounded ${
                                  app.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : app.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{app.price}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Store className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't submitted any reseller applications yet.
                    </p>
                    <Button onClick={() => setIsResellerDialogOpen(true)}>
                      Submit Your First Product <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />

      {/* Order Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        isManufacturer={false}
        onOrderUpdate={fetchOrders}
      />
    </div>

  );
};

export default ProfilePage;
