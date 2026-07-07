// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { toast } from 'sonner';

export function StaffManagement() {
  const qc = useQueryClient();
  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, staff_permissions(*)')
        .in('role', ['zone_manager', 'staff']);
      if (error) throw error;
      return data;
    },
  });
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button onClick={() => setOpen(true)}>Add Sub-Admin</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {staff?.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.role}</td>
                  <td className="px-4 py-3 text-xs">{s.staff_permissions?.map((p: any) => p.permission).join(', ') ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add Sub-Admin">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          supabase.functions.invoke('create-staff', { body: Object.fromEntries(fd) })
            .then(() => { toast.success('Staff created'); setOpen(false); qc.invalidateQueries({ queryKey: ['staff'] }); });
        }} className="space-y-2">
          <Input name="fullName" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Temp password" required />
          <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="zone_manager">Zone Manager</option>
            <option value="staff">Staff</option>
          </select>
          <Input name="permissions" placeholder="Comma-separated: orders,kyc,refunds" />
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Dialog>
    </div>
  );
}
