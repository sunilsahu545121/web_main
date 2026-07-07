// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export function ReturnRefundModule() {
  const qc = useQueryClient();
  const { data: returns, isLoading } = useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select('*, order:orders(total_amount, payment_method, razorpay_payment_id), customer:profiles!customer_id(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [active, setActive] = useState<any | null>(null);
  const [method, setMethod] = useState<'wallet' | 'bank_transfer' | 'razorpay_original'>('wallet');
  const [amount, setAmount] = useState('');

  const processRefund = useMutation({
    mutationFn: async () => invokeEdgeFunction({
      functionName: 'process-refund',
      body: { order_id: active.order_id, method, amount: Number(amount), reason: active.reason },
    }),
    onSuccess: () => {
      toast.success('Refund processed');
      setActive(null);
      setAmount('');
      qc.invalidateQueries({ queryKey: ['returns'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Returns & Refunds</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-6 text-center">Loading…</td></tr>}
              {returns?.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-4 py-3 font-mono text-xs">{r.order_id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{r.customer?.full_name}</td>
                  <td className="px-4 py-3">₹{r.order?.total_amount}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{r.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => { setActive(r); setAmount(String(r.order?.total_amount ?? 0)); }}>Process</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!active} onClose={() => setActive(null)} title="Process Refund">
        {active && (
          <div className="space-y-3">
            <div className="text-sm">
              <p>Order: <span className="font-mono">{active.order_id}</span></p>
              <p>Original payment: <strong>{active.order?.payment_method}</strong></p>
              {active.order?.payment_method === 'razorpay' && (
                <p className="text-xs text-muted-foreground">Razorpay ID: {active.order.razorpay_payment_id}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Refund method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="wallet">Wallet credit</option>
                <option value="bank_transfer">Bank transfer (NEFT/IMPS)</option>
                {active.order?.payment_method === 'razorpay' && (
                  <option value="razorpay_original">Original source (Razorpay)</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={() => processRefund.mutate()} loading={processRefund.isPending} className="w-full">
              Confirm Refund
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
