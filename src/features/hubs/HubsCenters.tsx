import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, MapPin, Plus, Search, Edit, Trash2, RefreshCw,
  Users, Package, TrendingUp, ChevronRight, Store, UserPlus,
  Phone, Mail, Award, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
interface Hub {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  manager_name: string;
  manager_phone: string;
  capacity_orders_per_day: number;
  total_riders: number;
  active_riders: number;
  serviceable_zones: string[];
  is_active: boolean;
  created_at: string;
  performance: {
    orders_today: number;
    avg_delivery_time: number;
    success_rate: number;
    revenue_today: number;
  };
}

interface Franchisee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  hub_id: string | null;
  hub_name: string | null;
  investment_amount: number;
  commission_rate: number;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  total_earnings: number;
}

const TABS = [
  { key: 'list', label: 'Hub List', icon: Building2 },
  { key: 'add', label: 'Add New Hub', icon: Plus },
  { key: 'franchisees', label: 'Franchisees', icon: Store },
] as const;

type TabKey = typeof TABS[number]['key'];

export function HubsCenters() {
  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch hubs
  const { data: hubs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_hubs')
        .select(`
          id, name, code, address, city, state, pincode, lat, lng,
          manager_name, manager_phone, capacity_orders_per_day,
          total_riders, active_riders, serviceable_zones, is_active, created_at,
          hub_performance(orders_today, avg_delivery_time, success_rate, revenue_today)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((h: any) => ({
        ...h,
        performance: h.hub_performance?.[0] || { orders_today: 0, avg_delivery_time: 0, success_rate: 0, revenue_today: 0 },
      })) as Hub[];
    },
  });

  // Fetch franchisees
  const { data: franchisees = [], isLoading: franchiseesLoading } = useQuery({
    queryKey: ['franchisees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franchisees')
        .select(`
          id, full_name, email, phone, investment_amount, commission_rate,
          status, joined_at, total_earnings, hub_id,
          hub:hub_id(name)
        `)
        .order('joined_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((f: any) => ({ ...f, hub_name: f.hub?.name || null })) as Franchisee[];
    },
  });

  // Add hub mutation
  const addHub = useMutation({
    mutationFn: async (hubData: any) => {
      const { data, error } = await supabase
        .from('delivery_hubs')
        .insert(hubData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hubs'] });
      setActiveTab('list');
    },
  });

  // Delete hub
  const deleteHub = useMutation({
    mutationFn: async (hubId: string) => {
      const { error } = await supabase.from('delivery_hubs').delete().eq('id', hubId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hubs'] }),
  });

  const filteredHubs = hubs.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hubs & Centers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage delivery hubs and franchise partners</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <RefreshCw className={clsx('w-4 h-4 text-slate-600', isRefetching && 'animate-spin')} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Hubs" value={hubs.length} icon={Building2} color="indigo" />
        <StatCard
          label="Active Hubs"
          value={hubs.filter((h) => h.is_active).length}
          icon={Building2}
          color="green"
        />
        <StatCard label="Total Riders" value={hubs.reduce((sum, h) => sum + h.total_riders, 0)} icon={Users} color="blue" />
        <StatCard label="Franchisees" value={franchisees.length} icon={Store} color="purple" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.key
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

      {/* Search for list & franchisees */}
      {activeTab !== 'add' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'list' ? 'hubs' : 'franchisees'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'list' && (
        <HubList hubs={filteredHubs} isLoading={isLoading} onDelete={(id) => deleteHub.mutate(id)} />
      )}
      {activeTab === 'add' && <AddHubForm onSubmit={(data) => addHub.mutate(data)} isPending={addHub.isPending} />}
      {activeTab === 'franchisees' && (
        <FranchiseesList franchisees={franchisees} isLoading={franchiseesLoading} />
      )}
    </div>
  );
}

// ===== Stat Card =====
function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={clsx('p-3 rounded-lg', `bg-${color}-100`)}>
          <Icon className={clsx('w-5 h-5', `text-${color}-600`)} />
        </div>
      </div>
    </div>
  );
}

// ===== Hub List =====
function HubList({ hubs, isLoading, onDelete }: any) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-3">No hubs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hubs.map((hub: Hub) => (
        <div key={hub.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{hub.name}</h3>
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  hub.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                )}>
                  {hub.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Code: {hub.code}</p>
            </div>
            <button className="p-1.5 hover:bg-slate-100 rounded-md">
              <Edit className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{hub.address}, {hub.city}, {hub.state} - {hub.pincode}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" /> {hub.manager_name} • {hub.manager_phone}
            </div>
          </div>

          {/* Serviceable Zones */}
          <div className="mb-4">
            <p className="text-xs text-slate-500 font-medium mb-1.5">Serviceable Zones</p>
            <div className="flex flex-wrap gap-1">
              {hub.serviceable_zones?.slice(0, 4).map((zone, i) => (
                <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                  {zone}
                </span>
              ))}
              {hub.serviceable_zones?.length > 4 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                  +{hub.serviceable_zones.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Orders Today</p>
              <p className="font-semibold text-slate-900">{hub.performance.orders_today}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Avg Time</p>
              <p className="font-semibold text-slate-900">{hub.performance.avg_delivery_time}m</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Success Rate</p>
              <p className="font-semibold text-green-600">{hub.performance.success_rate}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="font-semibold text-slate-900">₹{hub.performance.revenue_today?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Add Hub Form =====
function AddHubForm({ onSubmit, isPending }: any) {
  const [formData, setFormData] = useState({
    name: '', code: '', address: '', city: '', state: '', pincode: '',
    manager_name: '', manager_phone: '', capacity_orders_per_day: 500,
    serviceable_zones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      serviceable_zones: formData.serviceable_zones.split(',').map((z) => z.trim()).filter(Boolean),
      is_active: true,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Hub</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Hub Name" required>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="Hub Code" required>
            <input
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. MUM-01"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <FormField label="Address" required>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="City" required>
            <input
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="State" required>
            <input
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="Pincode" required>
            <input
              required
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Manager Name" required>
            <input
              required
              value={formData.manager_name}
              onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="Manager Phone" required>
            <input
              required
              value={formData.manager_phone}
              onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Daily Capacity (orders)">
            <input
              type="number"
              value={formData.capacity_orders_per_day}
              onChange={(e) => setFormData({ ...formData, capacity_orders_per_day: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
          <FormField label="Serviceable Zones (comma-separated)">
            <input
              value={formData.serviceable_zones}
              onChange={(e) => setFormData({ ...formData, serviceable_zones: e.target.value })}
              placeholder="e.g. Andheri, Bandra, Juhu"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Hub'}
          </button>
          <button
            type="button"
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== Franchisees List =====
function FranchiseesList({ franchisees, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
      </div>
    );
  }

  if (franchisees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Store className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-3">No franchisees yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Franchisee</th>
              <th className="px-6 py-3 text-left">Hub</th>
              <th className="px-6 py-3 text-left">Investment</th>
              <th className="px-6 py-3 text-left">Commission</th>
              <th className="px-6 py-3 text-left">Earnings</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {franchisees.map((f: Franchisee) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {f.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{f.full_name}</p>
                      <p className="text-xs text-slate-500">{f.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{f.hub_name || '—'}</td>
                <td className="px-6 py-4 font-medium">₹{f.investment_amount?.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">{f.commission_rate}%</td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  ₹{f.total_earnings?.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    f.status === 'active' && 'bg-green-100 text-green-700',
                    f.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                    f.status === 'inactive' && 'bg-slate-100 text-slate-700',
                  )}>
                    {f.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(f.joined_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
