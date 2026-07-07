// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SupportTickets() {
  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, customer:profiles!customer_id(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={4} className="p-6 text-center">Loading…</td></tr>}
              {data?.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{t.subject}</td>
                  <td className="px-4 py-3">{t.customer?.full_name}</td>
                  <td className="px-4 py-3"><Badge variant={t.priority === 'high' ? 'destructive' : 'warning'}>{t.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary">{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
