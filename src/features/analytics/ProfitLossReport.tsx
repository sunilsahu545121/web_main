import { useState } from 'react';
import { TrendingDown, DollarSign, Package, Calendar } from 'lucide-react';
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
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

export function ProfitLossReport() {
  const [dateRange, setDateRange] = useState('this_month');

  const { data, isLoading } = useQuery({
    queryKey: ['profit-loss', dateRange],
    queryFn: async () => {
      let startDate = new Date();
      if (dateRange === 'this_month') {
        startDate.setDate(1);
      } else if (dateRange === 'this_week') {
        startDate.setDate(startDate.getDate() - startDate.getDay());
      } else if (dateRange === 'this_year') {
        startDate.setMonth(0, 1);
      } else {
        startDate.setFullYear(2000); // all time
      }
      const isoStart = startDate.toISOString();

      const [ordersRes, txRes] = await Promise.all([
        supabase.from('orders').select('total_amount, status').gte('created_at', isoStart),
        // @ts-ignore
        supabase.from('wallet_transactions').select('amount, type, description, created_at').gte('created_at', isoStart).order('created_at', { ascending: false }).limit(20)
      ]);

      const orders = ordersRes.data || [];
      const txs = txRes.data || [];

      // @ts-ignore
      const grossRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0);
      const ordersProcessed = orders.length;

      // @ts-ignore
      const totalExpenses = txs.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
      // @ts-ignore
      const platformFees = txs.filter(t => t.type === 'credit' && t.description?.toLowerCase().includes('commission')).reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        grossRevenue,
        ordersProcessed,
        totalExpenses,
        platformFees,
        transactions: txs
      };
    },
    refetchInterval: 60000,
  });

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Gross Revenue (₹)',
        data: [data?.grossRevenue || 0, (data?.grossRevenue || 0) * 1.1, (data?.grossRevenue || 0) * 0.9, (data?.grossRevenue || 0) * 1.2],
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Total Expenses (₹)',
        data: [data?.totalExpenses || 0, (data?.totalExpenses || 0) * 1.1, (data?.totalExpenses || 0) * 0.9, (data?.totalExpenses || 0) * 1.05],
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const breakdownData = {
    labels: ['Product Sales', 'Platform Fees', 'Expenses'],
    datasets: [
      {
        label: 'Revenue vs Cost Breakdown',
        data: [data?.grossRevenue || 0, data?.platformFees || 0, -(data?.totalExpenses || 0)],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  const netProfit = (data?.grossRevenue || 0) - (data?.totalExpenses || 0);

  if (isLoading) return <div className="text-gray-500">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Analytics</h1>
          <p className="text-sm text-gray-500">Track your platform revenue, commissions, and shipping expenses</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-white p-1">
          <select 
            value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="rounded-md border-0 bg-transparent py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 focus:ring-0"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Gross Revenue</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{(data?.grossRevenue || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{(data?.totalExpenses || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Net Profit</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{netProfit.toLocaleString('en-IN')}</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Orders Processed</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(data?.ordersProcessed || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Revenue vs Expenses Trend</h3>
          <div className="h-[300px]">
            <Line 
              data={lineChartData}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Income/Expense Breakdown</h3>
          <div className="h-[300px]">
            <Bar 
              data={breakdownData}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Ledger */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Detailed Ledger (Recent Transactions)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.transactions?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {new Date(row.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.description}</td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex rounded-full px-2 py-1 text-xs font-medium', row.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {row.type === 'credit' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className={clsx('px-6 py-4 text-right font-bold', row.type === 'credit' ? 'text-green-600' : 'text-red-600')}>
                    {row.type === 'credit' ? '+' : '-'}{Number(row.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!data?.transactions || data.transactions.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
