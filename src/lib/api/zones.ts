import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zones')
        .select('*, manager:profiles!manager_id(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: {
      name: string;
      polygon: any;
      pincodes: string[];
      delivery_charge: number;
      min_order_value: number;
      eta_minutes: number;
      free_delivery_threshold: number | null;
      manager_id: string | null;
    }) => invokeEdgeFunction({ functionName: 'create-zone', body: zone }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}
