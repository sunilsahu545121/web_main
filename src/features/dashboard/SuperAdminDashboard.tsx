// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, ShoppingBag, Users, Store, RotateCcw, MapPin, TrendingUp, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { KPICard } from '@/components/tables/KPICard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import { useMemo } from 'react';

export function SuperAdminDashboard() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['admin-kpis'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const [revenue, monthRevenueRes, commissionRes, orders, customers, sellers, returns, zones] = await Promise.all([
        supabase.from('orders').select('total_amount').eq('status', 'delivered').gte('created_at', today),
        supabase.from('orders').select('total_amount').eq('status', 'delivered').gte('created_at', monthStart),
        supabase.from('system_settings').select('platform_commission').single(),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller').eq('kyc_status', 'approved'),
        supabase.from('returns').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('zones').select('id', { count: 'exact', head: true }),
      ]);
      const monthTotal = monthRevenueRes.data?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0;
      const commissionRate = commissionRes.data?.platform_commission ?? 5; // Default 5% if not found

      return {
        revenue: revenue.data?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0,
        monthRevenue: monthTotal,
        monthCommission: monthTotal * (commissionRate / 100),
        orders: orders.count ?? 0,
        customers: customers.count ?? 0,
        sellers: sellers.count ?? 0,
        returns: returns.count ?? 0,
        zones: zones.count ?? 0,
      };
    },
    refetchInterval: 30_000,
  });

  const { data: revenueSeries } = useQuery({
    queryKey: ['revenue-30d'],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'delivered')
        .gte('created_at', since);
      // Group by day
      const map = new Map<string, number>();
      data?.forEach((o) => {
        const day = o.created_at.split('T')[0];
        map.set(day, (map.get(day) ?? 0) + Number(o.total_amount));
      });
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, total]) => ({ date, total }));
    },
  });

  const chartData = useMemo(() => ({
    labels: revenueSeries?.map((r) => r.date) ?? [],
    datasets: [{
      label: 'Revenue (₹)',
      data: revenueSeries?.map((r) => r.total) ?? [],
      borderColor: 'hsl(250, 84%, 64%)',
      backgroundColor: 'hsl(250, 84%, 64% / 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }), [revenueSeries]);

  if (isLoading) return <div className="text-muted-foreground">Loading dashboard…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Today's Revenue" value={`₹${kpis?.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} trend="up" delta={12.4} href="/admin/reports" />
        <KPICard title="Total Orders" value={kpis?.orders ?? 0} icon={ShoppingBag} trend="up" delta={8.1} href="/admin/orders" />
        <KPICard title="Customers" value={kpis?.customers ?? 0} icon={Users} trend="neutral" delta={2.3} href="#" />
        <KPICard title="Active Sellers" value={kpis?.sellers ?? 0} icon={Store} trend="up" delta={5.7} href="/admin/kyc" />
        <KPICard title="Pending Returns" value={kpis?.returns ?? 0} icon={RotateCcw} trend="down" delta={3.2} href="/admin/returns" />
        <KPICard title="Total Zones" value={kpis?.zones ?? 0} icon={MapPin} trend="neutral" delta={0} href="/admin/zones" />
        <KPICard title="Month Revenue" value={`₹${kpis?.monthRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} trend="up" delta={18.9} href="/admin/reports" />
        <KPICard title="Month Commission" value={`₹${kpis?.monthCommission.toLocaleString('en-IN')}`} icon={Percent} trend="up" delta={11.2} href="/admin/reports" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
