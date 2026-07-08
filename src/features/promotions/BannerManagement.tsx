import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Plus, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string | null;
  placement: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export function BannerManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    image_url: '',
    target_url: '',
    placement: 'home_top',
    is_active: true
  });

  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      // @ts-ignore
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any as Banner[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (banner: Partial<Banner>) => {
      if (banner.id) {
        // @ts-ignore
        const { error } = await supabase.from('banners').update(banner).eq('id', banner.id);
        if (error) throw error;
      } else {
        // @ts-ignore
        const { error } = await supabase.from('banners').insert([banner]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsModalOpen(false);
      toast.success('Banner saved successfully');
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // @ts-ignore
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setFormData(banner);
    } else {
      setFormData({ title: '', image_url: '', target_url: '', placement: 'home_top', is_active: true });
    }
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center">Loading banners...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
          <p className="text-sm text-gray-500">Manage promotional banners across the app</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {banners?.map((banner) => (
          <div key={banner.id} className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
            <div className="relative h-40 bg-gray-100">
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-800 shadow">
                {banner.placement.toUpperCase()}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{banner.title}</h3>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mb-4 text-xs text-gray-500 line-clamp-1">{banner.target_url || 'No target URL'}</p>
              
              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button 
                  onClick={() => openModal(banner)}
                  className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => { if (confirm('Delete this banner?')) deleteMutation.mutate(banner.id); }}
                  className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners?.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-gray-500">
            No banners found. Create one to get started!
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">{formData.id ? 'Edit Banner' : 'New Banner'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Banner Title</label>
                <input 
                  type="text" required 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
                <input 
                  type="url" required 
                  value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Target URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.target_url || ''} onChange={e => setFormData({...formData, target_url: e.target.value})}
                  className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  placeholder="Link when clicked"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Placement</label>
                  <select 
                    value={formData.placement} onChange={e => setFormData({...formData, placement: e.target.value})}
                    className="w-full rounded-lg border p-2"
                  >
                    <option value="home_top">Home Top Slider</option>
                    <option value="home_middle">Home Middle Strip</option>
                    <option value="category">Category Page</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <label className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  {saveMutation.isPending ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
