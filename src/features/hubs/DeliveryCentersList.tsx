// @ts-nocheck
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Truck, MapPin, Users, Activity, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export function DeliveryCentersList() {
  const { data: centers, isLoading } = useQuery({
    queryKey: ['delivery_centers'],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase.from('delivery_centers').select('*, hub:hubs(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading delivery centers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Centers</h1>
          <p className="text-sm text-gray-500">Manage sub-hubs and local distribution points</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Add Center
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {centers?.map((center: any) => (
          <div key={center.id} className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{center.name}</h3>
                  <p className="font-mono text-xs text-gray-500">{center.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <span className={clsx(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                center.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              )}>
                {center.status || 'Active'}
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{center.address || 'Address not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <span>Parent Hub: <strong>{center.hub?.name || 'Unassigned'}</strong></span>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Capacity Usage</span>
                <span className="font-bold text-gray-700">{(center.capacity_usage || 0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    (center.capacity_usage || 0) > 80 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                  )}
                  style={{ width: `${Math.min(center.capacity_usage || 45, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 rounded-lg border bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                View Details
              </button>
              <button className="flex-1 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100">
                Manage Staff
              </button>
            </div>
          </div>
        ))}

        {centers?.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-gray-500">
            No delivery centers found. Create one to expand your network.
          </div>
        )}
      </div>
    </div>
  );
}
