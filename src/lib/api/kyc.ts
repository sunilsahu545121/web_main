import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';

export function usePendingKYC() {
  return useQuery({
    queryKey: ['kyc', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_kyc')
        .select('*, seller:profiles!seller_id(full_name, email, phone)')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useApproveKYC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sellerId, approved, reason }: { sellerId: string; approved: boolean; reason?: string }) => {
      // SECURITY: privileged action goes through Edge Function, NOT direct DB
      return invokeEdgeFunction<{ success: true }>({
        functionName: 'approve-kyc',
        body: { seller_id: sellerId, approved, reason },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kyc'] }),
  });
}
