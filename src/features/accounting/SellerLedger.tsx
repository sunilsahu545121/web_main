import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { IndianRupee, ArrowDownToLine, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  description: string | null;
  created_at: string | null;
}

const normalizeTransaction = (tx: {
  id: string;
  amount: number;
  type: string;
  status: string | null;
  description: string | null;
  created_at: string | null;
}): Transaction => ({
  id: tx.id,
  amount: Number(tx.amount || 0),
  type: tx.type === 'debit' ? 'debit' : 'credit',
  status: tx.status === 'failed' || tx.status === 'pending' ? tx.status : 'completed',
  description: tx.description,
  created_at: tx.created_at,
});

export function SellerLedger() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchLedger();
  }, [user]);

  const fetchLedger = async () => {
    setIsLoading(true);
    // In a real app, this would sum up completed orders minus commission
    // Since we don't have a dedicated ledger table, we'll fetch wallet_transactions
    // @ts-ignore
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load ledger');
      console.error(error);
    } else {
      const rows = (data || []).map(normalizeTransaction);
      setTransactions(rows);
      const total = rows.reduce((acc: number, t) => {
        if (t.status === 'completed' && t.type === 'credit') return acc + Number(t.amount);
        if (t.status === 'completed' && t.type === 'debit') return acc - Number(t.amount);
        return acc;
      }, 0);
      setBalance(total);
    }
    setIsLoading(false);
  };

  const handleRequestPayout = async () => {
    if (balance <= 0) {
      toast.error('Insufficient balance to request payout');
      return;
    }
    // @ts-ignore
    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user!.id,
        amount: balance,
        type: 'debit',
        status: 'pending',
        description: 'Payout Request to Bank Account',
      } as any);
    
    if (error) {
      toast.error('Failed to request payout');
    } else {
      toast.success('Payout requested successfully!');
      fetchLedger();
    }
  };

  if (isLoading) return <div>Loading ledger...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ledger & Payouts</h1>
          <p className="text-sm text-gray-500">View your earnings and request settlements</p>
        </div>
        <button
          onClick={handleRequestPayout}
          disabled={balance <= 0}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
        >
          <ArrowDownToLine className="h-4 w-4" /> Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-3xl font-bold text-gray-900">₹{balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No transactions found</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-4">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}</td>
                      <td className="p-4">{tx.description || '-'}</td>
                      <td className="p-4 font-bold">
                        <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
