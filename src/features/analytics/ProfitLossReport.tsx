// @ts-nocheck
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar } from 'lucide-react';
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
);

export function ProfitLossReport() {
  const [dateRange, setDateRange] = useState('this_month');

  const lineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Gross Revenue (₹)',
        data: [120000, 190000, 150000, 220000],
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Total Expenses (₹)',
        data: [80000, 120000, 95000, 130000],
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const breakdownData = {
    labels: ['Product Sales', 'Shipping Fees Collected', 'Platform Fees', 'Marketing'],
    datasets: [
      {
        label: 'Revenue vs Cost Breakdown',
        data: [600000, 80000, -25000, -15000],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
      },
    ],
  };

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
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
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
          <p className="text-3xl font-bold text-gray-900">₹6,80,000</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" /> <span>+12.5% from last period</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹4,25,000</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <TrendingUp className="h-4 w-4" /> <span>+5.2% from last period</span>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Net Profit</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold">₹2,55,000</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
            <TrendingUp className="h-4 w-4" /> <span>37.5% Net Margin</span>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Orders Processed</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">4,208</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" /> <span>+8.1% from last period</span>
          </div>
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
              {[
                { date: '2023-10-25', desc: 'Order #ORD-9921 Commission', cat: 'Income', amount: 450.00 },
                { date: '2023-10-25', desc: 'Logistics Partner Payout (Shadowfax)', cat: 'Expense', amount: -12500.00 },
                { date: '2023-10-24', desc: 'Order #ORD-9918 Commission', cat: 'Income', amount: 320.00 },
                { date: '2023-10-24', desc: 'Refund Processed (#ORD-9905)', cat: 'Expense', amount: -1200.00 },
                { date: '2023-10-23', desc: 'Seller Registration Fee', cat: 'Income', amount: 999.00 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {row.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.desc}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.cat === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.cat}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${row.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.amount > 0 ? '+' : ''}{row.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
