import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["roge_transactions"]["Row"];
type WithdrawalRequest = Database["public"]["Tables"]["withdrawal_requests"]["Row"];

interface TransactionHistoryProps {
  currentBalance: number;
}

export default function TransactionHistory({ currentBalance }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactionData();
  }, []);

  const loadTransactionData = async () => {
    try {
      const [transactionsResult, withdrawalsResult] = await Promise.all([
        supabase
          .from("roge_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("withdrawal_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;

      setTransactions(transactionsResult.data || []);
      setWithdrawals(withdrawalsResult.data || []);
    } catch (error) {
      console.error("Error loading transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: Transaction["transaction_type"]) => {
    switch (type) {
      case "earned":
      case "bonus":
      case "referral":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "spent":
      case "withdrawn":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: Transaction["transaction_type"]) => {
    switch (type) {
      case "earned":
      case "bonus":
      case "referral":
        return "text-green-600";
      case "spent":
      case "withdrawn":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getWithdrawalStatusIcon = (status: WithdrawalRequest["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getWithdrawalStatusColor = (status: WithdrawalRequest["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading transaction history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.transaction_type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || "No description"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}
                      >
                        {["spent", "withdrawn"].includes(transaction.transaction_type) ? "-" : "+"}
                        {Number(transaction.amount).toLocaleString()} RC
                      </p>
                      {transaction.blockchain_tx_hash && (
                        <Button variant="ghost" size="sm" className="mt-1 p-0 h-auto">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on blockchain
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            {withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getWithdrawalStatusIcon(withdrawal.status)}
                        <span className="font-medium">
                          {Number(withdrawal.amount).toLocaleString()} RC
                        </span>
                        <Badge className={getWithdrawalStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                      <Badge variant="outline">{withdrawal.network}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p>
                          Network Fee: {Number(withdrawal.network_fee || 0).toLocaleString()} RC
                        </p>
                        <p>
                          Final Amount: {Number(withdrawal.final_amount || 0).toLocaleString()} RC
                        </p>
                      </div>
                      <div>
                        <p>
                          Address: {withdrawal.wallet_address.slice(0, 6)}...
                          {withdrawal.wallet_address.slice(-4)}
                        </p>
                        <p>
                          Date:{" "}
                          {formatDistanceToNow(new Date(withdrawal.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    {withdrawal.blockchain_tx_hash && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Transaction
                        </Button>
                      </div>
                    )}

                    {withdrawal.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Notes:</strong> {withdrawal.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
