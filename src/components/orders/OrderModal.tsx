
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrderDetails } from './OrderDetails';

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

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  isManufacturer?: boolean;
  onOrderUpdate?: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  order,
  isOpen,
  onClose,
  isManufacturer = false,
  onOrderUpdate
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Order Details - {order.product_type}
          </DialogTitle>
        </DialogHeader>
        <OrderDetails 
          order={order} 
          isManufacturer={isManufacturer}
          onOrderUpdate={onOrderUpdate}
        />
      </DialogContent>
    </Dialog>
  );
};
