import React from "react";
import { useManufacturer } from "@/hooks/useManufacturer";
import { useRogeBalance } from "@/hooks/useRogeBalance";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import WithdrawalModal from "@/components/wallet/WithdrawalModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, DollarSign, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const ManufacturerWalletPage: React.FC = () => {
  const { manufacturer, loading: manufacturerLoading } = useManufacturer();
  const { totalBalance, availableBalance, pendingWithdrawals, isLoading, refetchBalance } =
    useRogeBalance();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  if (manufacturerLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          Wallet
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${totalBalance.toLocaleString()} ROGE`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Your total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${availableBalance.toLocaleString()} ROGE`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                `${pendingWithdrawals.toLocaleString()} ROGE`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsWithdrawalModalOpen(true)}
            disabled={availableBalance <= 0}
            className="w-full sm:w-auto"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw ROGE Coins
          </Button>
        </CardContent>
      </Card>

      <TransactionHistory currentBalance={totalBalance} />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        currentBalance={availableBalance}
      />
    </div>
  );
};
