import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock, CheckCircle2, Truck, Package, ShoppingBag, MapPin,
  Phone, User, ChevronRight, Search, Filter, RefreshCw,
  AlertCircle, ChefHat, Bike, Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
type OrderStatus = 'new' | 'preparing' | 'out_for_pickup' | 'out_for_delivery' | 'delivered';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  vendor_id: string;
  vendor_name: string;
  delivery_partner_id: string | null;
  delivery_partner_name: string | null;
  total_amount: number;
  delivery_address: string;
  status: OrderStatus;
  payment_status: 'paid' | 'pending' | 'failed';
  items_count: number;
  created_at: string;
  updated_at: string;
  expected_delivery: string;
}

const STATUS_TABS: { key: OrderStatus; label: string; icon: any; color: string }[] = [
  { key: 'new', label: 'New Orders', icon: ShoppingBag, color: 'blue' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'orange' },
  { key: 'out_for_pickup', label: 'Out for Pickup', icon: Package, color: 'purple' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'indigo' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'green' },
];

export function OrderBoard() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, customer_id, vendor_id, delivery_partner_id,
          total_amount, delivery_address, status, payment_status,
          created_at, updated_at, expected_delivery,
          customer:customer_id(full_name, phone),
          vendor:vendor_id(business_name),
          delivery_partner:delivery_partner_id(full_name),
          order_items(count)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        customer_id: o.customer_id,
        customer_name: o.customer?.full_name || 'N/A',
        customer_phone: o.customer?.phone || 'N/A',
        vendor_id: o.vendor_id,
        vendor_name: o.vendor?.business_name || 'N/A',
        delivery_partner_id: o.delivery_partner_id,
        delivery_partner_name: o.delivery_partner?.full_name || null,
        total_amount: Number(o.total_amount),
        delivery_address: o.delivery_address,
        status: o.status,
        payment_status: o.payment_status,
        items_count: o.order_items?.[0]?.count || 0,
        created_at: o.created_at,
        updated_at: o.updated_at,
        expected_delivery: o.expected_delivery,
      })) as Order[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Update order status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['new', 'preparing', 'out_for_pickup', 'out_for_delivery', 'delivered'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = STATUS_TABS.find((s) => s.key === status);
    return config || STATUS_TABS[0];
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length} {STATUS_TABS.find((s) => s.key === activeTab)?.label.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={clsx('px-3 py-1.5 text-sm font-medium rounded-md', viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-600')}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={clsx('px-3 py-1.5 text-sm font-medium rounded-md', viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-600')}
            >
              Kanban
            </button>
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={clsx('w-4 h-4 text-slate-600', isRefetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-3">No orders in this status</p>
        </div>
      ) : viewMode === 'table' ? (
        <OrderTable
          orders={filteredOrders}
          onUpdateStatus={(id, status) => updateStatus.mutate({ orderId: id, newStatus: status })}
          getNextStatus={getNextStatus}
          getStatusBadge={getStatusBadge}
        />
      ) : (
        <KanbanView
          orders={filteredOrders}
          onUpdateStatus={(id, status) => updateStatus.mutate({ orderId: id, newStatus: status })}
        />
      )}
    </div>
  );
}

// ===== Order Table View =====
function OrderTable({
  orders, onUpdateStatus, getNextStatus, getStatusBadge
}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Order</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Vendor</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order: Order) => {
              const next = getNextStatus(order.status);
              const badge = getStatusBadge(order.status);
              const Icon = badge.icon;
              return (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">#{order.order_number}</p>
                      <p className="text-xs text-slate-500">{order.items_count} items</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{order.customer_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.customer_phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{order.vendor_name}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                      `bg-${badge.color}-100 text-${badge.color}-700`
                    )}>
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(order.created_at).toLocaleString('en-IN', { 
                      dateStyle: 'short', timeStyle: 'short' 
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {next && (
                      <button
                        onClick={() => onUpdateStatus(order.id, next)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                      >
                        Move to {getStatusBadge(next).label}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Kanban View =====
function KanbanView({ orders, onUpdateStatus }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order: Order) => (
        <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-slate-900">#{order.order_number}</span>
            <span className="text-xs text-slate-500">
              {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4" /> {order.customer_name}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" /> {order.delivery_address.slice(0, 30)}...
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500">{order.items_count} items</span>
          </div>
        </div>
      ))}
    </div>
  );
}
