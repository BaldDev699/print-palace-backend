import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RogeBalanceData {
  totalBalance: number;
  availableBalance: number;
  pendingWithdrawals: number;
  isLoading: boolean;
  error: string | null;
}

export function useRogeBalance() {
  const [balanceData, setBalanceData] = useState<RogeBalanceData>({
    totalBalance: 0,
    availableBalance: 0,
    pendingWithdrawals: 0,
    isLoading: true,
    error: null
  });

  const loadBalance = async () => {
    try {
      setBalanceData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get total balance using the database function
      const { data: totalBalanceData, error: balanceError } = await supabase
        .rpc('get_user_roge_balance', { user_uuid: user.id });

      if (balanceError) throw balanceError;

      // Get pending withdrawals using the database function
      const { data: pendingWithdrawalsData, error: pendingError } = await supabase
        .rpc('get_pending_withdrawals', { user_uuid: user.id });

      if (pendingError) throw pendingError;

      const totalBalance = Number(totalBalanceData || 0);
      const pendingWithdrawals = Number(pendingWithdrawalsData || 0);
      const availableBalance = Math.max(0, totalBalance - pendingWithdrawals);

      setBalanceData({
        totalBalance,
        availableBalance,
        pendingWithdrawals,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error loading Roge balance:', error);
      setBalanceData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load balance'
      }));
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  return {
    ...balanceData,
    refetchBalance: loadBalance
  };
}