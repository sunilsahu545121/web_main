// @ts-nocheck
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, ShoppingBag, Coins, Package, CheckCircle2, 
  AlertTriangle, Users, Crown
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { clsx } from 'clsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

function KPICard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br', colorClass)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-yellow-100 text-yellow-800',
    picked_up: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-dashboard', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const [ordersRes, productsRes, kycRes, profileRes] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at, customer:profiles!customer_id(full_name, phone)').eq('seller_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, sku, stock_quantity, low_stock_threshold').eq('seller_id', user!.id),
        supabase.from('seller_kyc').select('business_name, plan_selected, submitted_at').eq('seller_id', user!.id).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('id', user!.id).maybeSingle()
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const kyc = kycRes.data;
      const profile = profileRes.data;

      const ordersToday = orders.filter(o => new Date(o.created_at) >= today).length;
      const monthOrders = orders.filter(o => new Date(o.created_at) >= monthStart && o.status === 'delivered');
      const monthRevenue = monthOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      
      // Calculate earnings (assuming 10% platform fee for demonstration if seller_earning not available)
      const monthEarnings = monthRevenue * 0.9;

      const activeProducts = products.length; // Assuming all are active for now
      const lowStockProducts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 5));
      const totalCustomers = new Set(orders.map(o => o.customer?.phone)).size;

      let subscriptionDaysLeft = 365;
      if (kyc?.submitted_at) {
         const daysPassed = Math.floor((new Date().getTime() - new Date(kyc.submitted_at).getTime()) / (1000 * 3600 * 24));
         subscriptionDaysLeft = Math.max(0, 365 - daysPassed);
      }

      // Chart Data: Last 7 Days Sales
      const salesByDay: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        salesByDay[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
      orders.forEach(o => {
        const d = new Date(o.created_at);
        if (d >= sevenDaysAgo) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          if (salesByDay[dayName] !== undefined) {
            salesByDay[dayName] += Number(o.total_amount);
          }
        }
      });

      // Chart Data: Order Status
      const statusCounts = { placed: 0, packed: 0, delivered: 0, cancelled: 0 };
      orders.forEach(o => {
        if (o.status === 'placed' || o.status === 'confirmed') statusCounts.placed++;
        else if (o.status === 'packed' || o.status === 'out_for_delivery') statusCounts.packed++;
        else if (o.status === 'delivered') statusCounts.delivered++;
        else if (o.status === 'cancelled') statusCounts.cancelled++;
      });

      return {
        profile,
        kyc,
        ordersToday,
        monthRevenue,
        monthEarnings,
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        totalCustomers,
        subscriptionDaysLeft,
        recentOrders: orders.slice(0, 6),
        chartData: {
          salesLabels: Object.keys(salesByDay),
          salesValues: Object.values(salesByDay),
          statusCounts: [statusCounts.placed, statusCounts.packed, statusCounts.delivered, statusCounts.cancelled]
        }
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome, {data.profile?.full_name || 'Seller'}! 🎉</h2>
        <p className="mt-1 text-orange-100">
          {data.kyc?.business_name || 'Your Store'} • {data.kyc?.plan_selected ? data.kyc.plan_selected.replace('_', ' ').toUpperCase() : 'BASIC'} Plan
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Orders Today" value={data.ordersToday} icon={ShoppingBag} colorClass="from-blue-500 to-blue-600" />
        <KPICard title="Month Revenue" value={`₹${data.monthRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} colorClass="from-green-500 to-green-600" />
        <KPICard title="Your Earnings" value={`₹${data.monthEarnings.toLocaleString('en-IN')}`} icon={Coins} colorClass="from-purple-500 to-purple-600" />
        <KPICard title="Total Products" value={data.totalProducts} icon={Package} colorClass="from-orange-500 to-orange-600" />
        <KPICard title="Active Products" value={data.activeProducts} icon={CheckCircle2} colorClass="from-green-500 to-green-600" />
        <KPICard title="Low Stock" value={data.lowStockProducts.length} icon={AlertTriangle} colorClass="from-red-500 to-red-600" />
        <KPICard title="Customers" value={data.totalCustomers} icon={Users} colorClass="from-blue-500 to-blue-600" />
        <KPICard title="Subscription" value={`${data.subscriptionDaysLeft}d left`} icon={Crown} colorClass="from-yellow-500 to-yellow-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-bold text-gray-800">Sales Trend (Last 7 Days)</h3>
          <div className="h-64">
            <Line 
              data={{
                labels: data.chartData.salesLabels,
                datasets: [{
                  label: 'Revenue (₹)',
                  data: data.chartData.salesValues,
                  borderColor: '#f97316', // orange-500
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-bold text-gray-800">Order Status</h3>
          <div className="flex h-64 items-center justify-center">
            <Doughnut 
              data={{
                labels: ['Placed', 'Packed', 'Delivered', 'Cancelled'],
                datasets: [{
                  data: data.chartData.statusCounts,
                  backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#ef4444'], // blue, yellow, green, red
                  borderWidth: 0
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <button onClick={() => navigate('/seller/orders')} className="text-sm font-medium text-orange-500 hover:underline">
              View All →
            </button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
            {data.recentOrders.length > 0 ? data.recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div>
                  <p className="text-sm font-medium">#{o.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{(o.customer as any)?.full_name || 'Customer'} • {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
                  <span className={clsx('mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', statusBadge(o.status))}>
                    {o.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            )) : (
              <p className="py-4 text-center text-gray-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-gray-800">⚠️ Low Stock Alert</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
            {data.lowStockProducts.length > 0 ? data.lowStockProducts.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 p-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">SKU: {p.sku || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{p.stock_quantity} left</p>
                  <button onClick={() => navigate('/seller/products')} className="mt-1 text-xs font-medium text-orange-500 hover:underline">
                    + Add Stock
                  </button>
                </div>
              </div>
            )) : (
              <p className="py-4 text-center text-gray-500">All products well stocked ✅</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
