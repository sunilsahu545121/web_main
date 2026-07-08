import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bike, Car, Truck, User, Phone, MapPin, CheckCircle2, XCircle,
  Clock, Search, Filter, RefreshCw, MoreVertical, Star,
  Package, Activity, Eye, AlertCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
type VehicleType = 'bike' | 'scooter' | 'bicycle' | 'car' | 'truck';
type RiderStatus = 'online' | 'offline' | 'busy' | 'on_delivery';

interface DeliveryPartner {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  vehicle_type: VehicleType;
  vehicle_number: string;
  license_number: string;
  status: RiderStatus;
  is_approved: boolean;
  is_verified: boolean;
  rating: number;
  total_deliveries: number;
  current_lat: number | null;
  current_lng: number | null;
  hub_id: string | null;
  hub_name: string | null;
  last_active_at: string;
  created_at: string;
  earnings: number;
}

const TABS = [
  { key: 'active', label: 'Active Riders', icon: Activity },
  { key: 'pending', label: 'Pending Approvals', icon: Clock },
  { key: 'tracking', label: 'Vehicle Tracking', icon: MapPin },
] as const;

type TabKey = typeof TABS[number]['key'];

export function FleetManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch delivery partners
  const { data: riders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['riders', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('delivery_partners')
        .select(`
          id, full_name, phone, email, avatar_url, vehicle_type,
          vehicle_number, license_number, status, is_approved, is_verified,
          current_lat, current_lng, last_active_at, created_at, rating,
          total_deliveries, earnings,
          hub:hub_id(name)
        `)
        .order('created_at', { ascending: false });

      if (activeTab === 'active') {
        query = query.eq('is_approved', true);
      } else if (activeTab === 'pending') {
        query = query.eq('is_approved', false);
      }
      // For 'tracking' tab - we still get approved riders, but UI shows different view

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((r: any) => ({
        ...r,
        hub_name: r.hub?.name || null,
      })) as DeliveryPartner[];
    },
    refetchInterval: 60000, // 1 min for live tracking
  });

  // Approve rider mutation
  const approveRider = useMutation({
    mutationFn: async (riderId: string) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .eq('id', riderId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riders'] }),
  });

  // Reject rider
  const rejectRider = useMutation({
    mutationFn: async (riderId: string) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({ is_approved: false, is_rejected: true, rejected_at: new Date().toISOString() })
        .eq('id', riderId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riders'] }),
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RiderStatus }) => {
      const { error } = await supabase
        .from('delivery_partners')
        .update({ status, last_active_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['riders'] }),
  });

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: riders.length,
    online: riders.filter((r) => r.status === 'online').length,
    on_delivery: riders.filter((r) => r.status === 'on_delivery').length,
    busy: riders.filter((r) => r.status === 'busy').length,
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fleet Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage riders, vehicles, and live tracking</p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 self-start lg:self-auto"
        >
          <RefreshCw className={clsx('w-4 h-4 text-slate-600', isRefetching && 'animate-spin')} />
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Active" value={stats.total} color="indigo" icon={User} />
          <StatCard label="Online" value={stats.online} color="green" icon={Activity} />
          <StatCard label="On Delivery" value={stats.on_delivery} color="blue" icon={Package} />
          <StatCard label="Busy" value={stats.busy} color="orange" icon={Clock} />
        </div>
      )}

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

      {/* Filters */}
      {activeTab !== 'tracking' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, vehicle number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {activeTab === 'active' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
              <option value="on_delivery">On Delivery</option>
            </select>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <TableSkeleton />
      ) : filteredRiders.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : activeTab === 'tracking' ? (
        <TrackingView riders={filteredRiders} />
      ) : (
        <RidersTable
          riders={filteredRiders}
          activeTab={activeTab}
          onApprove={(id: string) => approveRider.mutate(id)}
          onReject={(id: string) => rejectRider.mutate(id)}
          onStatusChange={(id: string, status: RiderStatus) => updateStatus.mutate({ id, status })}
          isApproving={approveRider.isPending}
          isRejecting={rejectRider.isPending}
        />
      )}
    </div>
  );
}

// ===== Stat Card =====
function StatCard({ label, value, color, icon: Icon }: any) {
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

// ===== Riders Table =====
function RidersTable({ riders, activeTab, onApprove, onReject, onStatusChange, isApproving, isRejecting }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Rider</th>
              <th className="px-6 py-3 text-left">Vehicle</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Hub</th>
              <th className="px-6 py-3 text-left">Performance</th>
              <th className="px-6 py-3 text-left">Last Active</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {riders.map((rider: DeliveryPartner) => (
              <tr key={rider.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {rider.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{rider.full_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {rider.phone}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <VehicleIcon type={rider.vehicle_type} />
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{rider.vehicle_type}</p>
                      <p className="text-xs text-slate-500">{rider.vehicle_number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {activeTab === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  ) : (
                    <StatusBadge status={rider.status} />
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700">{rider.hub_name || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{rider.rating?.toFixed(1) || '—'}</span>
                    </div>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-sm text-slate-600">{rider.total_deliveries} trips</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(rider.last_active_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {activeTab === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onReject(rider.id)}
                        disabled={isRejecting}
                        className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApprove(rider.id)}
                        disabled={isApproving}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <select
                      value={rider.status}
                      onChange={(e) => onStatusChange(rider.id, e.target.value as RiderStatus)}
                      className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="busy">Busy</option>
                      <option value="on_delivery">On Delivery</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Tracking View (Map placeholder) =====
function TrackingView({ riders }: { riders: DeliveryPartner[] }) {
  const onlineRiders = riders.filter((r) => r.current_lat && r.current_lng);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Live Tracking</h3>
          <span className="text-xs text-slate-500">{onlineRiders.length} riders online</span>
        </div>
        <div className="h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div className="relative text-center z-10">
            <MapPin className="w-16 h-16 text-indigo-300 mx-auto" />
            <p className="text-slate-600 mt-3 font-medium">Live Map View</p>
            <p className="text-sm text-slate-500 mt-1">
              Replace with react-leaflet MapContainer
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {onlineRiders.length} active riders being tracked
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Active Riders</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {onlineRiders.map((rider) => (
            <div key={rider.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {rider.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{rider.full_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{rider.vehicle_type} • {rider.vehicle_number}</p>
                  </div>
                </div>
                <StatusBadge status={rider.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Helpers =====
function VehicleIcon({ type }: { type: VehicleType }) {
  const map: any = { bike: Bike, scooter: Bike, bicycle: Bike, car: Car, truck: Truck };
  const Icon = map[type] || Bike;
  return <Icon className="w-4 h-4 text-slate-600" />;
}

function StatusBadge({ status }: { status: RiderStatus }) {
  const config: any = {
    online: { color: 'green', label: 'Online', dot: 'bg-green-500' },
    offline: { color: 'slate', label: 'Offline', dot: 'bg-slate-400' },
    busy: { color: 'orange', label: 'Busy', dot: 'bg-orange-500' },
    on_delivery: { color: 'blue', label: 'On Delivery', dot: 'bg-blue-500' },
  };
  const c = config[status];
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', `bg-${c.color}-100 text-${c.color}-700`)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-slate-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-2 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
      <p className="text-slate-500 mt-3">
        {tab === 'pending' ? 'No pending approvals' : 'No riders found'}
      </p>
    </div>
  );
}
