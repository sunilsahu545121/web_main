import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Store, Package, ShoppingBag, TrendingUp, Star, Edit, Save,
  Phone, Mail, Calendar, Award, IndianRupee,
  AlertCircle, CheckCircle2, XCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SellerStore {
  id: string;
  business_name: string;
  business_type: string | null;
  gst_number: string | null;
  pan_number: string | null;
  pickup_address: any | null;
  zone_id: string | null;
  category: string[] | null;
  commission_rate: number;
  subscription_amount: number;
  subscription_expiry: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  rating: number;
  total_orders: number;
  total_products: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

interface SellerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  referral_code: string;
  status: string;
  kyc_status: string;
  created_at: string;
}

interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  selling_price: number;
  mrp: number;
  stock: number;
  min_stock: number;
  images: string[];
  is_active: boolean;
  is_approved: boolean;
  rating: number;
  total_sold: number;
  category_id: string;
}

function formatINR(n: number | null | undefined): string {
  if (n == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n);
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatCard({ icon: Icon, label, value, accent, sub }: { icon: any; label: string; value: string | number; accent: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ business_name: '', description: '', logo_url: '' });
  const [saving, setSaving] = useState(false);

  // Seller store
  const { data: store, isLoading: storeLoading, refetch: refetchStore } = useQuery({
    queryKey: ['seller-store', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as SellerStore | null;
    },
  });

  // Seller profile
  const { data: profile } = useQuery({
    queryKey: ['seller-profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, referral_code, status, kyc_status, created_at')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as SellerProfile | null;
    },
  });

  // Products
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['seller-products', store?.id],
    enabled: !!store?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, selling_price, mrp, stock, min_stock, images, is_active, is_approved, rating, total_sold, category_id')
        .eq('seller_id', store!.id)
        .order('total_sold', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as SellerProduct[];
    },
  });

  // Order stats
  const { data: orderStats } = useQuery({
    queryKey: ['seller-order-stats', store?.id],
    enabled: !!store?.id,
    queryFn: async () => {
      const { data: allOrders, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('seller_id', store!.id);
      if (error) throw error;
      const orders = allOrders || [];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        total: orders.length,
        today: orders.filter(o => new Date(o.created_at) >= today).length,
        thisMonth: orders.filter(o => new Date(o.created_at) >= monthStart).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders
          .filter(o => o.status === 'delivered')
          .reduce((s, o) => s + Number(o.total_amount || 0), 0),
      };
    },
  });

  // Categories for product display
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) return [];
      return data || [];
    },
  });
  const categoryName = (id: string) => categories.find((c: any) => c.id === id)?.name || '—';

  function startEdit() {
    if (!store) return;
    setEditForm({
      business_name: store.business_name || '',
      description: store.description || '',
      logo_url: store.logo_url || '',
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          business_name: editForm.business_name.trim(),
          description: editForm.description.trim() || null,
          logo_url: editForm.logo_url.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);
      if (error) throw error;
      toast.success('Store profile updated');
      setEditing(false);
      await refetchStore();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function toggleProductActive(p: SellerProduct) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !p.is_active, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    if (error) {
      toast.error('Failed to toggle');
      return;
    }
    toast.success(p.is_active ? 'Product deactivated' : 'Product activated');
    refetchProducts();
  }

  async function refreshAll() {
    await Promise.all([refetchStore(), refetchProducts()]);
    queryClient.invalidateQueries({ queryKey: ['seller-order-stats'] });
    toast.success('Refreshed');
  }

  if (storeLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">Loading your seller panel…</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-10 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-800">No store linked</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your seller account is registered but no store profile is linked yet.
            </p>
            <p className="mt-1 text-xs text-gray-400">Email: {profile?.email || user?.email}</p>
            <Button className="mt-6" onClick={() => navigate('/onboard/seller')}>
              Complete Store Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 5));
  const inactiveProducts = products.filter(p => !p.is_active);

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Panel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {profile?.full_name || 'Seller'} — manage your store and products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          {!editing ? (
            <Button onClick={startEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <Button onClick={saveEdit} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* STORE HEADER CARD */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-2xl font-bold text-white shadow">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.business_name} className="h-full w-full rounded-xl object-cover" />
              ) : (
                store.business_name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <Input
                    label="Business name"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                  />
                  <Input
                    label="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <Input
                    label="Logo URL"
                    value={editForm.logo_url}
                    onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
                  />
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{store.business_name}</h2>
                    {store.is_verified && <Badge tone="success" className="text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>}
                    {store.is_featured && <Badge tone="warning" className="text-xs"><Award className="mr-1 h-3 w-3" />Featured</Badge>}
                    {!store.is_active && <Badge tone="danger" className="text-xs">Inactive</Badge>}
                  </div>
                  {store.description && (
                    <p className="mt-1 text-sm text-gray-600">{store.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                    {store.gst_number && (
                      <span className="flex items-center gap-1"><Store className="h-3.5 w-3.5" />GST: {store.gst_number}</span>
                    )}
                    {store.commission_rate != null && (
                      <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />Commission: {store.commission_rate}%</span>
                    )}
                    {profile?.email && (
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile.email}</span>
                    )}
                    {profile?.phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {formatDate(store.created_at)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-bold text-gray-900">{store.rating?.toFixed(1) || '—'}</span>
              </div>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatINR(orderStats?.revenue || 0)} accent="bg-gradient-to-br from-green-400 to-emerald-600" sub="From delivered orders" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={orderStats?.total || 0} accent="bg-gradient-to-br from-blue-400 to-indigo-600" sub={`${orderStats?.today || 0} today`} />
        <StatCard icon={Package} label="Products" value={products.length} accent="bg-gradient-to-br from-purple-400 to-fuchsia-600" sub={`${inactiveProducts.length} inactive`} />
        <StatCard icon={TrendingUp} label="Delivered" value={orderStats?.delivered || 0} accent="bg-gradient-to-br from-orange-400 to-rose-500" sub={`${orderStats?.thisMonth || 0} this month`} />
      </div>

      {/* ALERTS */}
      {(lowStockProducts.length > 0 || !store.is_active) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Action required</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {lowStockProducts.length > 0 && (
                    <li>• <strong>{lowStockProducts.length}</strong> product(s) low on stock — restock to avoid lost sales</li>
                  )}
                  {!store.is_active && (
                    <li>• Store is currently <strong>inactive</strong> — contact admin to reactivate</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* PRODUCTS — left 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Products</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/seller/products')}>
              Manage all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-10 text-center">
                <Package className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No products yet</p>
                <Button className="mt-4" size="sm" onClick={() => navigate('/seller/products')}>
                  Add your first product
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {products.slice(0, 8).map((p) => {
                  const low = p.stock <= (p.min_stock || 5);
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-3">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {categoryName(p.category_id)} · {p.total_sold} sold · ⭐ {p.rating?.toFixed(1) || '—'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">{formatINR(p.selling_price)}</p>
                        <p className={`text-xs ${low ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {low && '⚠️ '}{p.stock} in stock
                        </p>
                      </div>
                      <button
                        onClick={() => toggleProductActive(p)}
                        className="ml-2 flex-shrink-0"
                        title={p.is_active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {p.is_active ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <Badge tone="info">Standard</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="font-semibold">{formatINR(store.subscription_amount)}/year</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Expires</span>
                  <span className="text-sm font-medium">{formatDate(store.subscription_expiry)}</span>
                </div>
                <Button variant="outline" className="w-full mt-2" size="sm">
                  Renew Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Verification</span>
                  {store.is_verified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  {store.is_active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Featured</span>
                  {store.is_featured ? <Badge tone="warning">Yes</Badge> : <Badge>No</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">KYC Status</span>
                  <Badge tone={profile?.kyc_status === 'verified' ? 'success' : 'warning'}>
                    {profile?.kyc_status || 'pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/seller/products')}>
                <Package className="mr-2 h-4 w-4" /> Manage Products
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/seller/coupons')}>
                <Award className="mr-2 h-4 w-4" /> Manage Coupons
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/documents')}>
                <Store className="mr-2 h-4 w-4" /> ID Card / Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SellerPanel;