import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/tables/KPICard';
import { Package, Truck, IndianRupee, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export function HubDashboard() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['hub-kpis'],
    queryFn: async () => {
      const [pending, transit, codOrders, walletRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'out_for_delivery'),
        supabase.from('orders').select('total_amount').eq('payment_method', 'cod').eq('status', 'delivered'),
        // @ts-ignore
        supabase.from('wallet_transactions').select('amount').eq('status', 'completed')
      ]);

      // @ts-ignore
      const codBalance = codOrders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
      // @ts-ignore
      const walletBalance = walletRes.data?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

      return {
        pending: pending.count ?? 0,
        transit: transit.count ?? 0,
        codBalance,
        walletBalance,
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hub / Operations Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard title="Pending Dispatch" value={kpis?.pending ?? 0} icon={Package} href="/hub/orders" />
        <KPICard title="In Transit" value={kpis?.transit ?? 0} icon={Truck} href="/hub/orders" />
        <KPICard title="COD Balance" value={`₹${kpis?.codBalance.toLocaleString('en-IN')}`} icon={IndianRupee} href="/hub/ledger" />
        <KPICard title="Wallet" value={`₹${kpis?.walletBalance.toLocaleString('en-IN')}`} icon={Wallet} href="/hub/ledger" />
      </div>
      <Card>
        <CardHeader><CardTitle>Dispatch Queue</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Live order dispatch queue, COD reconciliation, and field agent assignment tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
