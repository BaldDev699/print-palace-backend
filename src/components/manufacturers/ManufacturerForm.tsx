import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Manufacturer {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  specialties: string[];
  minimum_order_quantity: number;
  lead_time_days: number;
  certifications: string[];
  website_url?: string;
  description?: string;
  is_verified: boolean;
}

interface ManufacturerFormProps {
  manufacturer?: Manufacturer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ManufacturerForm: React.FC<ManufacturerFormProps> = ({
  manufacturer,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: manufacturer?.company_name || "",
    contact_email: manufacturer?.contact_email || user?.email || "",
    contact_phone: manufacturer?.contact_phone || "",
    address: manufacturer?.address || "",
    minimum_order_quantity: manufacturer?.minimum_order_quantity || 50,
    lead_time_days: manufacturer?.lead_time_days || 14,
    website_url: manufacturer?.website_url || "",
    description: manufacturer?.description || "",
  });

  const [workDescription, setWorkDescription] = useState({
    services_offered: "",
    equipment_capabilities: "",
    quality_standards: "",
    experience_years: "",
    industries_served: "",
    production_capacity: "",
    unique_selling_points: "",
  });

  const [specialties, setSpecialties] = useState<string[]>(manufacturer?.specialties || []);
  const [certifications, setCertifications] = useState<string[]>(
    manufacturer?.certifications || [],
  );
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (certification: string) => {
    setCertifications(certifications.filter((c) => c !== certification));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a manufacturer profile");
      return;
    }

    setLoading(true);
    try {
      // Combine basic description with detailed work description
      const combinedDescription = [
        formData.description,
        workDescription.services_offered && `Services: ${workDescription.services_offered}`,
        workDescription.equipment_capabilities &&
          `Equipment: ${workDescription.equipment_capabilities}`,
        workDescription.production_capacity && `Capacity: ${workDescription.production_capacity}`,
        workDescription.quality_standards && `Quality: ${workDescription.quality_standards}`,
        workDescription.experience_years && `Experience: ${workDescription.experience_years}`,
        workDescription.industries_served && `Industries: ${workDescription.industries_served}`,
        workDescription.unique_selling_points && `USP: ${workDescription.unique_selling_points}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const manufacturerData = {
        ...formData,
        description: combinedDescription,
        specialties,
        certifications,
        user_id: user.id,
      };

      if (manufacturer) {
        const { error } = await supabase
          .from("manufacturers")
          .update(manufacturerData)
          .eq("id", manufacturer.id);

        if (error) throw error;
        toast.success("Manufacturer profile updated successfully");
      } else {
        const { error } = await supabase.from("manufacturers").insert([manufacturerData]);

        if (error) throw error;
        toast.success("Manufacturer profile created successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving manufacturer:", error);
      toast.error("Failed to save manufacturer profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {manufacturer ? "Edit Manufacturer Profile" : "Create Manufacturer Profile"}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Company Overview</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of your company and manufacturing focus..."
                rows={3}
              />
            </div>

            {/* Enhanced Work Description Section */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground">Detailed Work Description</h3>
              <p className="text-sm text-muted-foreground">
                Help customers understand your capabilities by providing detailed information about
                your work.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="services_offered">Services Offered *</Label>
                  <Textarea
                    id="services_offered"
                    value={workDescription.services_offered}
                    onChange={(e) =>
                      setWorkDescription({ ...workDescription, services_offered: e.target.value })
                    }
                    placeholder="e.g., CNC machining, 3D printing, injection molding, laser cutting..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment_capabilities">Equipment & Capabilities</Label>
                  <Textarea
                    id="equipment_capabilities"
                    value={workDescription.equipment_capabilities}
                    onChange={(e) =>
                      setWorkDescription({
                        ...workDescription,
                        equipment_capabilities: e.target.value,
                      })
                    }
                    placeholder="Describe your machinery, technology, and technical capabilities..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="production_capacity">Production Capacity</Label>
                  <Textarea
                    id="production_capacity"
                    value={workDescription.production_capacity}
                    onChange={(e) =>
                      setWorkDescription({
                        ...workDescription,
                        production_capacity: e.target.value,
                      })
                    }
                    placeholder="Volume capabilities, batch sizes, materials you work with..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="quality_standards">Quality Standards & Processes</Label>
                  <Textarea
                    id="quality_standards"
                    value={workDescription.quality_standards}
                    onChange={(e) =>
                      setWorkDescription({ ...workDescription, quality_standards: e.target.value })
                    }
                    placeholder="Quality control processes, testing procedures, standards compliance..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    value={workDescription.experience_years}
                    onChange={(e) =>
                      setWorkDescription({ ...workDescription, experience_years: e.target.value })
                    }
                    placeholder="e.g., 15+ years"
                  />
                </div>
                <div>
                  <Label htmlFor="industries_served">Industries Served</Label>
                  <Input
                    id="industries_served"
                    value={workDescription.industries_served}
                    onChange={(e) =>
                      setWorkDescription({ ...workDescription, industries_served: e.target.value })
                    }
                    placeholder="e.g., Automotive, Aerospace, Medical, Consumer Products..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="unique_selling_points">What Makes You Stand Out</Label>
                <Textarea
                  id="unique_selling_points"
                  value={workDescription.unique_selling_points}
                  onChange={(e) =>
                    setWorkDescription({
                      ...workDescription,
                      unique_selling_points: e.target.value,
                    })
                  }
                  placeholder="Your competitive advantages, unique capabilities, notable achievements..."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimum_order_quantity">Minimum Order Quantity</Label>
                <Input
                  id="minimum_order_quantity"
                  type="number"
                  min="1"
                  value={formData.minimum_order_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_order_quantity: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                <Input
                  id="lead_time_days"
                  type="number"
                  min="1"
                  value={formData.lead_time_days}
                  onChange={(e) =>
                    setFormData({ ...formData, lead_time_days: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Specialties</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add a specialty"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {specialty}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Certifications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map((certification, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {certification}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeCertification(certification)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : manufacturer ? "Update Profile" : "Create Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
