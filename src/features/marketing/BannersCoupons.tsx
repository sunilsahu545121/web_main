import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image, Plus, Search, Trash2, Edit, Eye, Upload, Tag,
  Percent, IndianRupee, Calendar, Users, Copy, Check,
  RefreshCw, X, Loader2, Download, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ===== Type Definitions =====
type BannerStatus = 'active' | 'scheduled' | 'expired' | 'draft';
type DiscountType = 'percentage' | 'flat';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: 'home_top' | 'home_middle' | 'category' | 'checkout';
  status: BannerStatus;
  start_date: string;
  end_date: string;
  clicks: number;
  impressions: number;
  created_at: string;
}

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

const TABS = [
  { key: 'banners', label: 'Active Banners', icon: Image },
  { key: 'upload', label: 'Upload Banner', icon: Upload },
  { key: 'promos', label: 'Promo Codes', icon: Tag },
] as const;

type TabKey = typeof TABS[number]['key'];

const bannerSlots: Banner['position'][] = ['home_top', 'home_middle', 'category', 'checkout'];

function bannerPositionToSlot(position: number | null | undefined): Banner['position'] {
  return bannerSlots[position ?? 0] ?? 'home_top';
}

function bannerSlotToPosition(slot: Banner['position']): number {
  return Math.max(0, bannerSlots.indexOf(slot));
}

function bannerStatus(row: { is_active: boolean | null; start_date: string | null; end_date: string | null }): BannerStatus {
  if (!row.is_active) return 'draft';
  const now = Date.now();
  const starts = row.start_date ? new Date(row.start_date).getTime() : now;
  const ends = row.end_date ? new Date(row.end_date).getTime() : now;
  if (starts > now) return 'scheduled';
  if (ends < now) return 'expired';
  return 'active';
}

function normalizeBanner(row: {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  position: number | null;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  click_count: number | null;
  view_count: number | null;
  created_at: string | null;
}): Banner {
  return {
    id: row.id,
    title: row.title || 'Untitled banner',
    image_url: row.image_url,
    link_url: row.link_url,
    position: bannerPositionToSlot(row.position),
    status: bannerStatus(row),
    start_date: row.start_date || row.created_at || new Date().toISOString(),
    end_date: row.end_date || row.created_at || new Date().toISOString(),
    clicks: row.click_count || 0,
    impressions: row.view_count || 0,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export function BannersCoupons() {
  const [activeTab, setActiveTab] = useState<TabKey>('banners');

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Banners & Promotions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage marketing assets and discount campaigns</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'banners' && <ActiveBanners />}
      {activeTab === 'upload' && <UploadBanner />}
      {activeTab === 'promos' && <PromoCodes />}
    </div>
  );
}

// ===== Active Banners =====
function ActiveBanners() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading, refetch } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(normalizeBanner);
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.storage.from('banners').remove([`${id}`]);
      if (error) console.warn('Storage delete:', error);
      const { error: dbError } = await supabase.from('banners').delete().eq('id', id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success('Banner deleted');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (e: any) => toast.error('Delete failed', { description: e.message }),
  });

  const filtered = banners.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) return <GridSkeleton />;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button onClick={() => refetch()} className="p-2 hover:bg-slate-100 rounded-lg">
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Image className="w-16 h-16 text-slate-200 mx-auto" />
          <p className="text-slate-500 mt-4">No banners yet. Upload your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onDelete={() => {
                if (confirm('Delete this banner?')) deleteBanner.mutate(banner.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerCard({ banner, onDelete }: any) {
  const ctr = banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={clsx(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            banner.status === 'active' && 'bg-green-100 text-green-700',
            banner.status === 'scheduled' && 'bg-blue-100 text-blue-700',
            banner.status === 'expired' && 'bg-slate-100 text-slate-700',
            banner.status === 'draft' && 'bg-yellow-100 text-yellow-700',
          )}>
            {banner.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 truncate">{banner.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span className="capitalize">{banner.position.replace('_', ' ')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Views</p>
            <p className="font-semibold text-sm">{banner.impressions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Clicks</p>
            <p className="font-semibold text-sm">{banner.clicks.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">CTR</p>
            <p className="font-semibold text-sm text-indigo-600">{ctr}%</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="w-full mt-3 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}

// ===== Upload Banner =====
function UploadBanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    link_url: '',
    position: 'home_top' as Banner['position'],
    start_date: '',
    end_date: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadBanner = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');
      const fileName = `banner-${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Insert DB record
      const { error: dbError } = await supabase.from('banners').insert({
        title: form.title,
        image_url: publicUrl,
        link_url: form.link_url || null,
        position: bannerSlotToPosition(form.position),
        is_active: true,
        start_date: form.start_date || new Date().toISOString(),
        end_date: form.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
        click_count: 0,
        view_count: 0,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success('Banner uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setFile(null);
      setPreview(null);
      setForm({ title: '', link_url: '', position: 'home_top', start_date: '', end_date: '' });
    },
    onError: (e: any) => toast.error('Upload failed', { description: e.message }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Banner Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Diwali Mega Sale"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Link URL</label>
            <input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://krixify.com/sale"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Position *</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="home_top">Home Top</option>
              <option value="home_middle">Home Middle</option>
              <option value="category">Category Page</option>
              <option value="checkout">Checkout</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Upload Image</h2>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors"
        >
          {preview ? (
            <img src={preview} className="max-h-48 mx-auto rounded-lg" alt="preview" />
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-700 font-medium mt-3">Drop image or click to upload</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB (1200x400 recommended)</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
            </div>
            <button onClick={() => { setFile(null); setPreview(null); }} className="p-1 hover:bg-slate-200 rounded">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}

        <button
          onClick={() => uploadBanner.mutate()}
          disabled={!file || !form.title || uploadBanner.isPending}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploadBanner.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Banner
        </button>
      </div>
    </div>
  );
}

// ===== Promo Codes =====
function PromoCodes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading, refetch } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Promotion[];
    },
  });

  const filtered = promotions.filter((p) =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Promo
        </button>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Tag className="w-16 h-16 text-slate-200 mx-auto" />
          <p className="text-slate-500 mt-4">No promo codes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}

      {showForm && <PromoForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function PromoCard({ promo }: { promo: Promotion }) {
  const [copied, setCopied] = useState(false);
  const usagePercent = promo.usage_limit > 0 ? (promo.usage_count / promo.usage_limit) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {promo.discount_type === 'percentage' ? <Percent className="w-5 h-5" /> : <IndianRupee className="w-5 h-5" />}
            <span className="text-2xl font-bold">
              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`}
            </span>
            <span className="text-sm opacity-80">OFF</span>
          </div>
          {promo.is_active ? (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">Active</span>
          ) : (
            <span className="px-2 py-0.5 bg-red-500/30 rounded-full text-xs">Inactive</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-700 mb-3">{promo.description}</p>
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <code className="flex-1 font-mono font-bold text-indigo-600">{promo.code}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(promo.code);
              setCopied(true);
              toast.success('Code copied!');
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 hover:bg-white rounded"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Min Order:</span>
            <span className="font-medium">₹{promo.min_order_amount}</span>
          </div>
          {promo.max_discount_amount && (
            <div className="flex justify-between">
              <span>Max Discount:</span>
              <span className="font-medium">₹{promo.max_discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Valid Until:</span>
            <span className="font-medium">{promo.valid_until ? format(new Date(promo.valid_until), 'dd MMM yyyy') : 'No expiry'}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Usage</span>
            <span className="font-medium">{promo.usage_count} / {promo.usage_limit}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 100,
    valid_until: '',
  });

  const createPromo = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('promotions').insert({
        ...form,
        code: form.code.toUpperCase(),
        valid_from: new Date().toISOString(),
        valid_until: form.valid_until || new Date(Date.now() + 30 * 86400000).toISOString(),
        usage_count: 0,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Promo code created');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      onClose();
    },
    onError: (e: any) => toast.error('Failed to create promo', { description: e.message }),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create Promo Code</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); createPromo.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Code *</label>
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="DIWALI50"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <input
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Diwali Mega Sale - 50% off"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Discount Value *</label>
              <input
                required
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Min Order Amount</label>
              <input
                type="number"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Discount Amount</label>
              <input
                type="number"
                value={form.max_discount_amount}
                onChange={(e) => setForm({ ...form, max_discount_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Usage Limit</label>
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Valid Until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createPromo.isPending || !form.code || !form.description}
            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createPromo.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create Promo Code
          </button>
        </form>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="aspect-video bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
