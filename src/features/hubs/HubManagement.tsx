// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { KPICard } from '@/components/tables/KPICard';
import { IndianRupee, Package, Users } from 'lucide-react';

export function HubManagement() {
  const { data: hubs } = useQuery({
    queryKey: ['hubs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('hubs').select('*, delivery_centers(*), field_agents(*)');
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hubs & Centers</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hubs?.map((h) => (
          <Card key={h.id} className="p-5">
            <h3 className="font-semibold">{h.name}</h3>
            <p className="text-xs text-muted-foreground">{h.address}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <KPICard title="Revenue" value={`₹${(h.revenue ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} />
              <KPICard title="Capacity" value={h.capacity} icon={Package} />
              <KPICard title="Agents" value={h.field_agents?.length ?? 0} icon={Users} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
