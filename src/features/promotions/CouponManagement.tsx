import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Plus, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  seller_id: string | null;
  is_active: boolean;
  usage_limit: number | null;
  used_count: number;
}

export function CouponManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    is_active: true,
    usage_limit: null,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
      return data as { role: string } | null;
    }
  });

  const isAdmin = profile?.role === 'super_admin';
  const isSeller = profile?.role === 'seller';

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // @ts-ignore
      let query = supabase.from('coupons').select('*').order('created_at', { ascending: false });
      
      if (isSeller) {
        query = query.eq('seller_id', user!.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Coupon[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (coupon: Partial<Coupon>) => {
      const payload = { ...coupon };
      
      // Force uppercase code
      if (payload.code) payload.code = payload.code.toUpperCase();
      
      // If seller, force seller_id
      if (isSeller) {
        payload.seller_id = user!.id;
      }

      if (coupon.id) {
        // @ts-ignore
        const { error } = await supabase.from('coupons').update(payload).eq('id', coupon.id);
        if (error) throw error;
      } else {
        // @ts-ignore
        const { error } = await supabase.from('coupons').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', user?.id] });
      setIsModalOpen(false);
      toast.success('Coupon saved successfully');
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // @ts-ignore
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons', user?.id] });
      toast.success('Coupon deleted');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: '', discount_type: 'percentage', discount_value: 0, 
        min_order_amount: 0, max_discount_amount: null, 
        is_active: true, usage_limit: null
      });
    }
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons & Offers</h1>
          <p className="text-sm text-gray-500">Manage promotional discount codes</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Code</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Discount</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Conditions</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Usage</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                {isAdmin && <th className="px-6 py-4 font-semibold text-gray-600">Scope</th>}
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons?.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono font-bold text-gray-900">
                      <Ticket className="h-4 w-4 text-orange-500" />
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                    {coupon.max_discount_amount && <span className="block text-xs font-normal text-gray-500">Up to ₹{coupon.max_discount_amount}</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    Min. Order: ₹{coupon.min_order_amount}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {coupon.used_count} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {coupon.seller_id ? 'Store-specific' : 'Global Platform'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openModal(coupon)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => { if (confirm('Delete coupon?')) deleteMutation.mutate(coupon.id); }} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {coupons?.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    No coupons found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{formData.id ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Coupon Code</label>
                  <input 
                    type="text" required 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full rounded-lg border p-2 uppercase focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                    placeholder="e.g. SUMMER50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <label className="flex h-[42px] items-center gap-2 rounded-lg border p-2">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm">Active & Visible</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
                  <select 
                    value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as any})}
                    className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Discount Value</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                    className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Min. Order Amount (₹)</label>
                  <input 
                    type="number" min="0"
                    value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: parseFloat(e.target.value)})}
                    className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount Amount (₹)</label>
                  <input 
                    type="number" min="0"
                    value={formData.max_discount_amount || ''} onChange={e => setFormData({...formData, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                    placeholder="No limit"
                    disabled={formData.discount_type === 'fixed'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Usage Limit</label>
                  <input 
                    type="number" min="1"
                    value={formData.usage_limit || ''} onChange={e => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                    placeholder="Unlimited"
                  />
                </div>
                {isAdmin && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Scope</label>
                    <select 
                      value={formData.seller_id || ''} onChange={e => setFormData({...formData, seller_id: e.target.value || null})}
                      className="w-full rounded-lg border p-2 bg-gray-50 text-gray-500"
                      disabled // For Phase 1, admins just create global coupons, or we can load sellers later.
                    >
                      <option value="">Global (Platform)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  {saveMutation.isPending ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
