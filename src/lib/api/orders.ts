// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export function useOrders(filters: { status?: string; zoneId?: string }) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let q = supabase
        .from('orders')
        .select('*, customer:profiles!customer_id(full_name, phone), seller:profiles!seller_id(shop_name), items:order_items(*)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (filters.status) q = q.eq('status', filters.status);
      if (filters.zoneId) q = q.eq('zone_id', filters.zoneId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
