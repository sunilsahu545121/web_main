import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Bike, Phone, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

export function FleetManagement() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['field_agents'],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase.from('field_agents').select('*, user:profiles(full_name, phone), hub:hubs(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading fleet data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fleet & Delivery Partners</h1>
          <p className="text-sm text-gray-500">Monitor field agents and active deliveries</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-2 shadow-sm border">
            <span className="text-xs font-medium text-gray-500">Active Now</span>
            <span className="text-lg font-bold text-green-600">{agents?.filter((a: any) => a.status === 'active')?.length || 0}</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-2 shadow-sm border">
            <span className="text-xs font-medium text-gray-500">Total Fleet</span>
            <span className="text-lg font-bold text-gray-800">{agents?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {agents?.map((agent: any) => (
          <div key={agent.id} className="relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
            
            <div className="p-5 pl-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{agent.user?.full_name || agent.name || 'Unnamed Agent'}</h3>
                    <p className="text-xs font-medium text-gray-500">{agent.hub?.name || 'Unassigned Hub'}</p>
                  </div>
                </div>
                {agent.status === 'active' ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                    Offline
                  </span>
                )}
              </div>

              <div className="mb-4 space-y-2 border-y py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{agent.user?.phone || agent.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bike className="h-4 w-4 text-gray-400" />
                  <span>{agent.vehicle_no || 'Vehicle not registered'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-600">
                    <Navigation className="h-3 w-3" /> Active Orders
                  </div>
                  <div className="text-xl font-bold text-blue-900">{agent.active_deliveries || 0}</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium text-orange-600">
                    <AlertCircle className="h-3 w-3" /> Failed Today
                  </div>
                  <div className="text-xl font-bold text-orange-900">{agent.failed_deliveries || 0}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {agents?.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-gray-500">
            No field agents found. Onboard delivery partners to manage fleet.
          </div>
        )}
      </div>
    </div>
  );
}
