import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, ArrowRight, Wallet, Shield, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BlockchainNetwork = Database['public']['Enums']['blockchain_network'];
type WithdrawalStatus = Database['public']['Enums']['withdrawal_status'];

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

interface NetworkOption {
  id: BlockchainNetwork;
  name: string;
  symbol: string;
  fee: number;
  minAmount: number;
  icon: string;
}

interface UserWallet {
  id: string;
  network: BlockchainNetwork;
  wallet_address: string;
  wallet_name?: string;
  is_default: boolean;
}

const NETWORKS: NetworkOption[] = [
  { id: 'TRC20', name: 'USDT - TRC20', symbol: 'USDT', fee: 1, minAmount: 10, icon: '₮' },
  { id: 'ERC20', name: 'USDT - ERC20', symbol: 'USDT', fee: 15, minAmount: 20, icon: '₮' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', fee: 0.005, minAmount: 0.01, icon: 'Ξ' },
];

export default function WithdrawalModal({ isOpen, onClose, currentBalance }: WithdrawalModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [userWallets, setUserWallets] = useState<UserWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletName, setNewWalletName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUserWallets();
    }
  }, [isOpen]);

  const loadUserWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      setUserWallets(data || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const addNewWallet = async () => {
    if (!selectedNetwork || !newWalletAddress.trim()) {
      toast.error('Please select a network and enter a wallet address');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          network: selectedNetwork.id,
          wallet_address: newWalletAddress.trim(),
          wallet_name: newWalletName.trim() || `${selectedNetwork.name} Wallet`,
          is_default: userWallets.length === 0
        });

      if (error) throw error;

      toast.success('Wallet address added successfully');
      setNewWalletAddress('');
      setNewWalletName('');
      setShowAddWallet(false);
      loadUserWallets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add wallet address');
    }
  };

  const calculateFinalAmount = () => {
    if (!amount || !selectedNetwork) return 0;
    const withdrawAmount = parseFloat(amount);
    return Math.max(0, withdrawAmount - selectedNetwork.fee);
  };

  const handleWithdraw = async () => {
    if (!selectedNetwork || !amount || !selectedWallet) {
      toast.error('Please fill in all required fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < selectedNetwork.minAmount) {
      toast.error(`Minimum withdrawal amount is ${selectedNetwork.minAmount} RC`);
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const finalAmount = calculateFinalAmount();

      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: withdrawAmount,
          network: selectedNetwork.id,
          wallet_address: selectedWallet.wallet_address,
          network_fee: selectedNetwork.fee,
          final_amount: finalAmount
        });

      if (error) throw error;

      toast.success('Withdrawal request submitted successfully');
      onClose();
      setAmount('');
      setSelectedWallet(null);
      setSelectedNetwork(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Withdraw Roge Coins
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Available Balance
                </span>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Instant Payout
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{currentBalance.toLocaleString()} RC</div>
              <p className="text-sm text-muted-foreground mt-1">Ready for withdrawal</p>
            </CardContent>
          </Card>

          {/* Payout Method */}
          <div className="space-y-2">
            <Label>Payout method</Label>
            <Select value="digital" disabled>
              <SelectTrigger>
                <SelectValue placeholder="Digital currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital currency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Network Selection */}
          <div className="space-y-2">
            <Label>Network</Label>
            <Select value={selectedNetwork?.id || ''} onValueChange={(value) => {
              const network = NETWORKS.find(n => n.id === value);
              setSelectedNetwork(network || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-lg">{network.icon}</span>
                        {network.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Fee: {network.fee} {network.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount (RC)</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={selectedNetwork?.minAmount || 0}
              max={currentBalance}
            />
            {selectedNetwork && (
              <div className="text-xs text-muted-foreground">
                Minimum: {selectedNetwork.minAmount} RC
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>Withdrawal address</Label>
            {!showAddWallet ? (
              <Select 
                value={selectedWallet?.id || ''} 
                onValueChange={(value) => {
                  if (value === 'add_new') {
                    setShowAddWallet(true);
                  } else {
                    const wallet = userWallets.find(w => w.id === value);
                    setSelectedWallet(wallet || null);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or add wallet address" />
                </SelectTrigger>
                <SelectContent>
                  {userWallets
                    .filter(wallet => !selectedNetwork || wallet.network === selectedNetwork.id)
                    .map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{wallet.wallet_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new">
                    <span className="text-primary">+ Add new address</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Wallet Name (Optional)</Label>
                  <Input
                    placeholder="My Wallet"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    placeholder="Enter wallet address"
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addNewWallet}>Add Wallet</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddWallet(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Fee Summary */}
          {selectedNetwork && amount && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Withdrawal amount:</span>
                      <span>{amount} RC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network fee:</span>
                      <span>-{selectedNetwork.fee} RC</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>You will receive:</span>
                      <span>{calculateFinalAmount()} RC</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={!selectedNetwork || !amount || !selectedWallet || isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Withdraw
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}