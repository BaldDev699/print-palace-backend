import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Manufacturer {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  description?: string;
  specialties?: string[];
  certifications?: string[];
  minimum_order_quantity?: number;
  lead_time_days?: number;
  is_verified: boolean;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export function useManufacturer() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManufacturer = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('manufacturers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching manufacturer:', error);
          // If no manufacturer profile found, redirect to create one
          if (error.code === 'PGRST116') {
            navigate('/manufacturers');
          }
          return;
        }

        setManufacturer(data as any);
      } catch (error) {
        console.error('Error:', error);
        navigate('/manufacturers');
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturer();
  }, [user, authLoading, navigate]);

  return { manufacturer, loading, refetch: () => window.location.reload() };
}