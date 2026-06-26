import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Canvas as FabricCanvas } from 'fabric';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@/lib/router-compat';
import { Send, Package, Clock, Calculator, RefreshCw, AlertCircle } from 'lucide-react';
import { calculatePricing, formatKsh, kshToCents } from '@/lib/pricing';
import { getProductQuantityRule, isValidQuantity, roundUpToValidQuantity, getEffectiveMinimum } from '@/lib/quantityRules';

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

export const OrderSubmission: React.FC<OrderSubmissionProps> = ({
  fabricCanvas,
  measurements,
  productType,
  printingMethod = 'DTG',
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [manufacturersLoading, setManufacturersLoading] = useState(true);
  const [manufacturersError, setManufacturersError] = useState<string>('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculatePricing(productType, printingMethod, quantity);
  }, [productType, printingMethod, quantity]);

  // Get product quantity rule
  const productRule = getProductQuantityRule(productType);

  // Set initial quantity based on product rule when component mounts or product changes
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

  const fetchManufacturers = async (retryCount = 0) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setManufacturersLoading(true);
    setManufacturersError('');

    try {
      const { data: allManufacturers, error } = await supabase
        .rpc('get_public_manufacturers')
        .abortSignal(signal);

      if (error) throw error;

      const list = allManufacturers || [];
      // Prefer verified manufacturers, sorted by lead time
      let data = list
        .filter((m: any) => m.is_verified)
        .sort((a: any, b: any) => (a.lead_time_days ?? 0) - (b.lead_time_days ?? 0));

      // Fallback to most recent manufacturers if none verified
      if (data.length === 0) {
        data = [...list]
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          .slice(0, 10);
      }

      setManufacturers(data as any);
      setManufacturersError('');

    } catch (error: any) {
      if (error.name === 'AbortError') return; // Request was cancelled

      console.error('Error fetching manufacturers:', error);
      
      // Retry logic
      if (retryCount < 2) {
        setTimeout(() => {
          fetchManufacturers(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      // Final error state
      setManufacturersError('Failed to load manufacturers. Please check your connection and try again.');
      setManufacturers([]);
    } finally {
      setManufacturersLoading(false);
    }
  };

  const retryFetchManufacturers = () => {
    fetchManufacturers();
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast.error('You must be logged in to submit an order');
      return;
    }

    if (!selectedManufacturer) {
      toast.error('Please select a manufacturer');
      return;
    }

    if (!fabricCanvas) {
      toast.error('No design available to submit');
      return;
    }

    setLoading(true);
    try {
      // Export canvas as JSON and image
      const designJson = fabricCanvas.toJSON();
      const designImage = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 2
      });

      const orderData = {
        customer_id: user.id,
        manufacturer_id: selectedManufacturer,
        design_data: {
          json: designJson,
          image: designImage,
          canvas_dimensions: {
            width: fabricCanvas.width,
            height: fabricCanvas.height
          }
        },
        measurements,
        product_type: productType,
        quantity,
        notes,
        status: 'pending',
        // Pricing fields
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
        pricing_breakdown: pricing.breakdown as any
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Order submitted successfully! Redirecting to your profile...');
      onClose();
      navigate('/profile', { 
        state: { 
          openOrdersTab: true, 
          newOrderId: data.id 
        } 
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  const selectedManufacturerData = manufacturers.find(m => m.id === selectedManufacturer);
  
  // Calculate effective minimum considering both product rules and manufacturer minimums
  const effectiveMinimum = selectedManufacturerData ? 
    getEffectiveMinimum(productType, selectedManufacturerData.minimum_order_quantity) : 
    (productRule?.minimumQuantity || 1);
  
  // Check if current quantity is valid
  const isQuantityValid = isValidQuantity(productType, quantity) && quantity >= effectiveMinimum;

  // Handle quantity change with automatic rounding
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= 0) {
      setQuantity(effectiveMinimum);
      return;
    }
    
    // Round up to valid quantity if needed
    const validQuantity = roundUpToValidQuantity(productType, numValue);
    setQuantity(Math.max(validQuantity, effectiveMinimum));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit Order to Manufacturer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Select Manufacturer *</Label>
            {manufacturersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <div className="text-sm text-muted-foreground">Loading manufacturers...</div>
              </div>
            ) : manufacturersError ? (
              <div className="space-y-2">
                <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Unable to load manufacturers</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{manufacturersError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryFetchManufacturers}
                    className="h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            ) : manufacturers.length === 0 ? (
              <div className="border border-muted bg-muted/30 rounded-lg p-4 text-center">
                <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No verified manufacturers available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryFetchManufacturers}
                  className="mt-2 h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            ) : (
              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{manufacturer.company_name}</span>
                        <span className="text-sm text-muted-foreground">
                          Min: {manufacturer.minimum_order_quantity} units • {manufacturer.lead_time_days} days
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedManufacturerData && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" />
                    Minimum Order: {selectedManufacturerData.minimum_order_quantity} units
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Lead Time: {selectedManufacturerData.lead_time_days} days
                  </div>
                   {selectedManufacturerData.specialties?.length > 0 && (
                     <div>
                       <p className="text-sm font-medium mb-1">Specialties:</p>
                       <div className="flex flex-wrap gap-1">
                         {selectedManufacturerData.specialties.map((specialty, index) => (
                           <Badge key={index} variant="secondary" className="text-xs">
                             {specialty}
                           </Badge>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={effectiveMinimum}
              step={productRule?.stepSize || 1}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder="Enter quantity"
              className={!isQuantityValid ? "border-destructive" : ""}
            />
            <div className="mt-1 space-y-1">
              {productRule && (
                <p className="text-sm text-muted-foreground">
                  {productRule.description} (minimum: {productRule.minimumQuantity})
                </p>
              )}
              {selectedManufacturerData && selectedManufacturerData.minimum_order_quantity > (productRule?.minimumQuantity || 0) && (
                <p className="text-sm text-muted-foreground">
                  Manufacturer minimum: {selectedManufacturerData.minimum_order_quantity} units
                </p>
              )}
              {!isQuantityValid && (
                <p className="text-sm text-destructive">
                  {quantity < effectiveMinimum 
                    ? `Minimum quantity is ${effectiveMinimum} units`
                    : `Must be in multiples of ${productRule?.stepSize || 1}`
                  }
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Order Details</Label>
            <div className="bg-muted p-4 rounded-lg space-y-4 text-sm">
              <div><strong>Product Type:</strong> {productType}</div>
              
              {fabricCanvas && (
                <div>
                  <strong>Design Preview:</strong>
                  <div className="mt-2 border rounded overflow-hidden bg-white">
                    <img 
                      src={fabricCanvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 0.5 })} 
                      alt="Design preview" 
                      className="w-full h-32 object-contain"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <strong>Measurements:</strong>
                <div className="grid grid-cols-2 gap-2 pl-4 mt-1">
                  {Object.entries(measurements).map(([key, value]) => (
                    <div key={key}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}cm
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" />
                Pricing Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Price ({quantity} × {formatKsh(pricing.breakdown.basePrice / quantity)}):</span>
                    <span>{formatKsh(pricing.breakdown.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Printing ({printingMethod}):</span>
                    <span>{formatKsh(pricing.breakdown.printingSurcharge)}</span>
                  </div>
                  {pricing.breakdown.quantityDiscount !== 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Quantity Discount:</span>
                      <span>{formatKsh(pricing.breakdown.quantityDiscount)}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatKsh(pricing.breakdown.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatKsh(pricing.breakdown.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">{formatKsh(pricing.breakdown.total)}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted/50 rounded">
                <p>• Prices include {printingMethod} printing method</p>
                <p>• Bulk discounts automatically applied for 10+ items</p>
                <p>• Final pricing will be confirmed by manufacturer</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or instructions for the manufacturer..."
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmitOrder}
              disabled={loading || manufacturersLoading || !selectedManufacturer || !isQuantityValid}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </Button>
            {(!selectedManufacturer && !manufacturersLoading && !manufacturersError) && (
              <p className="text-xs text-muted-foreground mt-1">Select a manufacturer to continue</p>
            )}
            {!isQuantityValid && (
              <p className="text-xs text-destructive mt-1">
                Please enter a valid quantity
              </p>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};