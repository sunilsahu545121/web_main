import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings, CreditCard, Key, Smartphone, Save, Loader2, Eye, EyeOff,
  AlertCircle, CheckCircle2, RefreshCw, Copy, Shield, DollarSign,
  Globe, Bell, Lock, Mail, MessageSquare, Zap, X, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
interface AppVersion {
  id: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
  build_number: number;
  is_force_update: boolean;
  update_message: string | null;
  release_notes: string;
  released_at: string;
  is_active: boolean;
}

const TABS = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'payment', label: 'Payment Gateway', icon: CreditCard },
  { key: 'api', label: 'API Keys', icon: Key },
  { key: 'app', label: 'App Versions', icon: Smartphone },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure platform-wide parameters and integrations</p>
      </div>

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
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'payment' && <PaymentGateway />}
      {activeTab === 'api' && <ApiKeys />}
      {activeTab === 'app' && <AppVersions />}
    </div>
  );
}

// ===== General Settings =====
function GeneralSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings-general'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'general')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        platform_commission: 15,
        min_order_value: 50,
        max_order_value: 5000,
        delivery_base_fee: 30,
        tax_rate: 5,
        support_email: 'support@krixify.com',
        support_phone: '+91-1800-123-4567',
        maintenance_mode: false,
        customer_care_whatsapp: '+91-98765-43210',
      };
    },
  });

  const [form, setForm] = useState<any>(null);
  useState(() => settings && setForm(settings));

  const save = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('system_settings').upsert({
        category: 'general',
        ...data,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings-general'] });
    },
    onError: (e: any) => toast.error('Save failed', { description: e.message }),
  });

  if (isLoading || !form) {
    return <div className="bg-white rounded-2xl border p-8 animate-pulse h-96" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-600" /> General Configuration
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Platform Commission (%) *" hint="Charged on every order">
            <input type="number" step="0.1" value={form.platform_commission} onChange={(e) => setForm({ ...form, platform_commission: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Tax Rate (GST %)" hint="Applied on orders">
            <input type="number" step="0.1" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Min Order Value (₹)">
            <input type="number" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Max Order Value (₹)">
            <input type="number" value={form.max_order_value} onChange={(e) => setForm({ ...form, max_order_value: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Base Delivery Fee (₹)">
            <input type="number" value={form.delivery_base_fee} onChange={(e) => setForm({ ...form, delivery_base_fee: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="WhatsApp Support">
            <input value={form.customer_care_whatsapp} onChange={(e) => setForm({ ...form, customer_care_whatsapp: e.target.value })} className="input" />
          </Field>
          <Field label="Support Email">
            <input type="email" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} className="input" />
          </Field>
          <Field label="Support Phone">
            <input value={form.support_phone} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} className="input" />
          </Field>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50">
            <input
              type="checkbox"
              checked={form.maintenance_mode}
              onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div>
              <p className="font-medium text-sm text-slate-900">Maintenance Mode</p>
              <p className="text-xs text-slate-500">Take the platform offline for maintenance</p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}

// ===== Payment Gateway =====
function PaymentGateway() {
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState({ key: false, secret: false });

  const { data: settings } = useQuery({
    queryKey: ['settings-payment'],
    queryFn: async () => {
      const { data, error } = await supabase.from('system_settings').select('*').eq('category', 'payment').single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        razorpay_key_id: '',
        razorpay_key_secret: '',
        stripe_publishable_key: '',
        stripe_secret_key: '',
        enable_cod: true,
        enable_online: true,
        enable_wallet: true,
        cod_max_amount: 1000,
      };
    },
  });

  const [form, setForm] = useState<any>(null);
  useState(() => settings && setForm(settings));

  const save = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('system_settings').upsert({
        category: 'payment', ...data, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payment settings saved');
      queryClient.invalidateQueries({ queryKey: ['settings-payment'] });
    },
    onError: (e: any) => toast.error('Save failed', { description: e.message }),
  });

  if (!form) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-96" />;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" /> Razorpay Configuration
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <Field label="Razorpay Key ID">
            <div className="relative">
              <input
                type={showKeys.key ? 'text' : 'password'}
                value={form.razorpay_key_id}
                onChange={(e) => setForm({ ...form, razorpay_key_id: e.target.value })}
                placeholder="rzp_live_..."
                className="input pr-20 font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" onClick={() => setShowKeys({ ...showKeys, key: !showKeys.key })} className="p-1.5 hover:bg-slate-100 rounded">
                  {showKeys.key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => { navigator.clipboard.writeText(form.razorpay_key_id); toast.success('Copied!'); }} className="p-1.5 hover:bg-slate-100 rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Field>

          <Field label="Razorpay Key Secret">
            <div className="relative">
              <input
                type={showKeys.secret ? 'text' : 'password'}
                value={form.razorpay_key_secret}
                onChange={(e) => setForm({ ...form, razorpay_key_secret: e.target.value })}
                className="input pr-10 font-mono"
              />
              <button type="button" onClick={() => setShowKeys({ ...showKeys, secret: !showKeys.secret })} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded">
                {showKeys.secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <div className="pt-3 border-t border-slate-200">
            <p className="text-sm font-medium mb-3">Payment Methods</p>
            <div className="space-y-2">
              <Toggle
                label="Cash on Delivery (COD)"
                hint="Allow customers to pay on delivery"
                checked={form.enable_cod}
                onChange={(v: boolean) => setForm({ ...form, enable_cod: v })}
              />
              {form.enable_cod && (
                <Field label="Max COD Amount (₹)">
                  <input type="number" value={form.cod_max_amount} onChange={(e) => setForm({ ...form, cod_max_amount: Number(e.target.value) })} className="input" />
                </Field>
              )}
              <Toggle label="Online Payment" hint="Cards, UPI, Netbanking via Razorpay" checked={form.enable_online} onChange={(v: boolean) => setForm({ ...form, enable_online: v })} />
              <Toggle label="Wallet Payment" hint="Pay using in-app wallet balance" checked={form.enable_wallet} onChange={(v: boolean) => setForm({ ...form, enable_wallet: v })} />
            </div>
          </div>

          <button
            type="submit"
            disabled={save.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Payment Settings
          </button>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900">Security Notice</p>
          <p className="text-amber-700 mt-0.5">API keys are encrypted at rest. Never share them publicly or commit to version control.</p>
        </div>
      </div>
    </div>
  );
}

// ===== API Keys =====
function ApiKeys() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState({ name: '' });

  const { data: keys = [] } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, created_at, last_used_at, is_active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createKey = useMutation({
    mutationFn: async () => {
      const fullKey = `krx_${crypto.randomUUID().replace(/-/g, '')}`;
      const { error } = await supabase.from('api_keys').insert({
        name: newKey.name,
        key_hash: await hashKey(fullKey),
        key_prefix: fullKey.slice(0, 12),
        is_active: true,
      });
      if (error) throw error;
      return fullKey;
    },
    onSuccess: (key) => {
      toast.success('API key created', {
        description: 'Copy this key now - you won\'t see it again!',
        duration: 10000,
      });
      navigator.clipboard.writeText(key);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKey({ name: '' });
    },
    onError: (e: any) => toast.error('Failed', { description: e.message }),
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('api_keys').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Key revoked');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-600" /> Generate API Key</h2>
        <form onSubmit={(e) => { e.preventDefault(); createKey.mutate(); }} className="flex gap-3">
          <input
            value={newKey.name}
            onChange={(e) => setNewKey({ name: e.target.value })}
            placeholder="e.g. Mobile App - Production"
            className="input flex-1"
            required
          />
          <button
            type="submit"
            disabled={createKey.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {createKey.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">Active API Keys</h3>
        </div>
        {keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="text-slate-500 mt-3">No API keys yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {keys.map((k: any) => (
              <div key={k.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{k.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <code className="font-mono">{k.key_prefix}...</code>
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                    {k.last_used_at && <span>• Last used {new Date(k.last_used_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs', k.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')}>
                    {k.is_active ? 'Active' : 'Revoked'}
                  </span>
                  {k.is_active && (
                    <button onClick={() => { if (confirm('Revoke this key?')) revokeKey.mutate(k.id); }} className="p-1.5 hover:bg-red-50 text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function hashKey(key: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== App Versions =====
function AppVersions() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['app-versions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_versions').select('*').order('released_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AppVersion[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Release
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse h-24" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['ios', 'android', 'web'] as const).map((platform) => {
            const v = versions.find((x) => x.platform === platform && x.is_active);
            return (
              <div key={platform} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{platform}</h3>
                  {v && <span className="text-xs text-slate-500">Build {v.build_number}</span>}
                </div>
                {v ? (
                  <>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">v{v.version}</p>
                    <p className="text-xs text-slate-500 mt-1">Released {new Date(v.released_at).toLocaleDateString()}</p>
                    {v.is_force_update && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Force Update</span>
                    )}
                    <p className="text-sm text-slate-600 mt-3 line-clamp-3">{v.release_notes}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No active version</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">All Releases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Platform</th>
                <th className="px-6 py-3 text-left">Version</th>
                <th className="px-6 py-3 text-left">Build</th>
                <th className="px-6 py-3 text-left">Released</th>
                <th className="px-6 py-3 text-left">Force Update</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 capitalize font-medium">{v.platform}</td>
                  <td className="px-6 py-3 font-mono">v{v.version}</td>
                  <td className="px-6 py-3 text-slate-600">#{v.build_number}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{new Date(v.released_at).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{v.is_force_update ? '🔴 Yes' : '⚪ No'}</td>
                  <td className="px-6 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs', v.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <NewReleaseModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function NewReleaseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ platform: 'android', version: '', build_number: 1, is_force_update: false, release_notes: '' });

  const create = useMutation({
    mutationFn: async () => {
      // Deactivate previous
      await supabase.from('app_versions').update({ is_active: false }).eq('platform', form.platform);
      const { error } = await supabase.from('app_versions').insert({
        ...form, is_active: true, released_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Version released');
      queryClient.invalidateQueries({ queryKey: ['app-versions'] });
      onClose();
    },
    onError: (e: any) => toast.error('Failed', { description: e.message }),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">New Release</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
          <Field label="Platform *">
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as any })} className="input">
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Version *">
              <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.2.0" required className="input" />
            </Field>
            <Field label="Build # *">
              <input type="number" value={form.build_number} onChange={(e) => setForm({ ...form, build_number: Number(e.target.value) })} required className="input" />
            </Field>
          </div>
          <Field label="Release Notes *">
            <textarea value={form.release_notes} onChange={(e) => setForm({ ...form, release_notes: e.target.value })} rows={4} required className="input" />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_force_update} onChange={(e) => setForm({ ...form, is_force_update: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
            <span className="text-sm">Force update required</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={create.isPending} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50">
              {create.isPending ? 'Publishing...' : 'Publish Release'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Shared Components =====
function Field({ label, hint, children }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
      <div>
        <p className="font-medium text-sm text-slate-900">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx('relative w-11 h-6 rounded-full transition-colors', checked ? 'bg-indigo-600' : 'bg-slate-300')}
      >
        <span className={clsx('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform', checked && 'translate-x-5')} />
      </button>
    </div>
  );
}
