import { useState, useEffect } from 'react';
import { getRogeBalanceFn } from '@/lib/roge-balance.functions';

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

      const { totalBalance, availableBalance, pendingWithdrawals } = await getRogeBalanceFn();

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
