import { useState, useMemo } from 'react';
import { TrendingDown, DollarSign, Package, Calendar, TrendingUp, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ===== Type Definitions =====
type DateRange = 'this_week' | 'this_month' | 'this_year' | 'all_time';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  created_at: string;
}

interface GroupedBucket {
  label: string;
  start: Date;
  end: Date;
  revenue: number;
  expenses: number;
  orders: number;
}

// ===== Utility: Group by Day =====
function groupByDay(orders: Order[], txs: WalletTransaction[], days: number): GroupedBucket[] {
  const buckets: GroupedBucket[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayOrders = orders.filter(
      (o) => new Date(o.created_at) >= dayStart && new Date(o.created_at) <= dayEnd
    );
    const dayTxs = txs.filter(
      (t) => new Date(t.created_at) >= dayStart && new Date(t.created_at) <= dayEnd
    );

    const revenue = dayOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    const expenses = dayTxs
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    buckets.push({
      label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      start: dayStart,
      end: dayEnd,
      revenue,
      expenses,
      orders: dayOrders.length,
    });
  }
  return buckets;
}

// ===== Utility: Group by Week =====
function groupByWeek(orders: Order[], txs: WalletTransaction[], weeks: number): GroupedBucket[] {
  const buckets: GroupedBucket[] = [];
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekOrders = orders.filter(
      (o) => new Date(o.created_at) >= weekStart && new Date(o.created_at) <= weekEnd
    );
    const weekTxs = txs.filter(
      (t) => new Date(t.created_at) >= weekStart && new Date(t.created_at) <= weekEnd
    );

    const revenue = weekOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    const expenses = weekTxs
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    buckets.push({
      label: `W${weeks - i}`,
      start: weekStart,
      end: weekEnd,
      revenue,
      expenses,
      orders: weekOrders.length,
    });
  }
  return buckets;
}

// ===== Utility: Group by Month =====
function groupByMonth(orders: Order[], txs: WalletTransaction[], months: number): GroupedBucket[] {
  const buckets: GroupedBucket[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthOrders = orders.filter(
      (o) => new Date(o.created_at) >= monthStart && new Date(o.created_at) <= monthEnd
    );
    const monthTxs = txs.filter(
      (t) => new Date(t.created_at) >= monthStart && new Date(t.created_at) <= monthEnd
    );

    const revenue = monthOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    
    const expenses = monthTxs
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    buckets.push({
      label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      start: monthStart,
      end: monthEnd,
      revenue,
      expenses,
      orders: monthOrders.length,
    });
  }
  return buckets;
}

// ===== Main Component =====
export function ProfitLossReport() {
  const [dateRange, setDateRange] = useState<DateRange>('this_month');

  const { data, isLoading } = useQuery({
    queryKey: ['profit-loss', dateRange],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (dateRange) {
        case 'this_week':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
          break;
        case 'all_time':
          startDate = new Date(2020, 0, 1, 0, 0, 0, 0);
          break;
      }
      endDate.setHours(23, 59, 59, 999);
      const isoStart = startDate.toISOString();

      const [ordersRes, txRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .gte('created_at', isoStart)
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('wallet_transactions')
          .select('id, amount, type, description, created_at')
          .gte('created_at', isoStart)
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (txRes.error) throw txRes.error;

      const orders: Order[] = (ordersRes.data || []) as Order[];
      const txs: WalletTransaction[] = (txRes.data || []) as WalletTransaction[];

      // Group data based on date range
      let grouped: GroupedBucket[] = [];
      if (dateRange === 'this_week') {
        grouped = groupByDay(orders, txs, 7);
      } else if (dateRange === 'this_month') {
        grouped = groupByWeek(orders, txs, 4);
      } else if (dateRange === 'this_year') {
        grouped = groupByMonth(orders, txs, 12);
      } else {
        grouped = groupByMonth(orders, txs, 12);
      }

      // Overall metrics
      const grossRevenue = grouped.reduce((sum, b) => sum + b.revenue, 0);
      const totalExpenses = grouped.reduce((sum, b) => sum + b.expenses, 0);
      const netProfit = grossRevenue - totalExpenses;
      const ordersProcessed = orders.filter((o) => o.status === 'delivered').length;
      const platformFees = txs
        .filter(
          (t) => t.type === 'credit' && t.description?.toLowerCase().includes('commission')
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { grouped, grossRevenue, totalExpenses, netProfit, ordersProcessed, platformFees, orders, txs };
    },
  });

  // ===== Chart Data (Memoized for performance) =====
  const lineChartData = useMemo(() => {
    const grouped = data?.grouped || [];
    return {
      labels: grouped.map((b) => b.label),
      datasets: [
        {
          label: 'Gross Revenue',
          data: grouped.map((b) => b.revenue),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: 'Total Expenses',
          data: grouped.map((b) => b.expenses),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
        {
          label: 'Net Profit',
          data: grouped.map((b) => b.revenue - b.expenses),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          borderDash: [5, 5],
        },
      ],
    };
  }, [data]);

  const breakdownData = useMemo(() => {
    const grouped = data?.grouped || [];
    return {
      labels: grouped.map((b) => b.label),
      datasets: [
        {
          label: 'Orders Processed',
          data: grouped.map((b) => b.orders),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  }, [data]);

  // ===== Chart Options =====
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 12, weight: 500 } } },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => '₹' + value.toLocaleString('en-IN'),
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: { grid: { display: false } },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  const formatCurrency = (value: number) => {
    return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const profitMargin = data && data.grossRevenue > 0 
    ? ((data.netProfit / data.grossRevenue) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profit & Loss Report</h1>
          <p className="text-sm text-slate-500 mt-1">Financial overview for the super admin</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500 ml-2" />
          {(['this_week', 'this_month', 'this_year', 'all_time'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                dateRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {range === 'this_week' && 'Week'}
              {range === 'this_month' && 'Month'}
              {range === 'this_year' && 'Year'}
              {range === 'all_time' && 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Gross Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(data?.grossRevenue || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(data?.totalExpenses || 0)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Net Profit</p>
                  <p className={clsx(
                    'text-2xl font-bold mt-1',
                    (data?.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                  )}>
                    {formatCurrency(data?.netProfit || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Margin: {profitMargin}%</p>
                </div>
                <div className={clsx(
                  'p-3 rounded-lg',
                  (data?.netProfit || 0) >= 0 ? 'bg-blue-100' : 'bg-red-100'
                )}>
                  <TrendingUp className={clsx(
                    'w-6 h-6',
                    (data?.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                  )} />
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Delivered Orders</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.ordersProcessed || 0}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart - Revenue vs Expenses */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Revenue vs Expenses</h3>
                  <p className="text-sm text-slate-500">Trend over selected period</p>
                </div>
                <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-80">
                <Line data={lineChartData} options={lineChartOptions as any} />
              </div>
            </div>

            {/* Bar Chart - Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Orders Breakdown</h3>
                  <p className="text-sm text-slate-500">Daily/Weekly orders</p>
                </div>
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-80">
                <Bar data={breakdownData} options={barChartOptions as any} />
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Period Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Period</th>
                    <th className="px-6 py-3">Orders</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Expenses</th>
                    <th className="px-6 py-3">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data?.grouped.map((bucket, idx) => {
                    const net = bucket.revenue - bucket.expenses;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{bucket.label}</td>
                        <td className="px-6 py-4 text-slate-600">{bucket.orders}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">
                          {formatCurrency(bucket.revenue)}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-medium">
                          {formatCurrency(bucket.expenses)}
                        </td>
                        <td className={clsx(
                          'px-6 py-4 font-semibold',
                          net >= 0 ? 'text-blue-600' : 'text-red-600'
                        )}>
                          {formatCurrency(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
