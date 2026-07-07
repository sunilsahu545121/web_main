import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setIsLoading(true);
    // Fetch pending debits from wallet_transactions along with the user profile
    // @ts-ignore
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*, profiles:user_id(full_name, email)')
      .eq('type', 'debit')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load payouts');
      console.error(error);
    } else {
      setPayouts(data || []);
    }
    setIsLoading(false);
  };

  const handleSettle = async (id: string) => {
    // @ts-ignore
    const { error } = await supabase
      .from('wallet_transactions')
      // @ts-ignore
      .update({ status: 'completed', description: 'Settled to Bank Account' } as any)
      // @ts-ignore
      .eq('id', id);

    if (error) {
      toast.error('Failed to settle payout');
    } else {
      toast.success('Payout marked as settled');
      fetchPayouts();
    }
  };

  if (isLoading) return <div>Loading payouts...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Payouts</h1>
        <p className="text-sm text-gray-500">Manage and settle seller payout requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Seller</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No payout requests found</td>
                  </tr>
                ) : (
                  payouts.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{tx.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{tx.profiles?.email}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ₹{Number(tx.amount).toFixed(2)}
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
                      <td className="p-4">
                        {tx.status === 'pending' && (
                          <button
                            onClick={() => handleSettle(tx.id)}
                            className="rounded bg-green-500 px-3 py-1 text-xs font-bold text-white hover:bg-green-600"
                          >
                            Mark Settled
                          </button>
                        )}
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
