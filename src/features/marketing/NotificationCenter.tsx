import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Send, Mail, History, Users, Filter, Search, X,
  CheckCircle2, AlertCircle, Loader2, Megaphone, Eye,
  Smartphone, Calendar, Target, RefreshCw, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ===== Type Definitions =====
type AudienceType = 'all_users' | 'all_vendors' | 'all_riders' | 'active_customers' | 'inactive_users' | 'custom_segment';
type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

interface Notification {
  id: string;
  type: 'push' | 'email';
  title: string;
  body: string;
  audience: AudienceType;
  audience_count: number;
  status: NotificationStatus;
  sent_count: number;
  open_count: number;
  click_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  image_url: string | null;
}

const TABS = [
  { key: 'push', label: 'Send Push', icon: Bell },
  { key: 'email', label: 'Email Campaigns', icon: Mail },
  { key: 'history', label: 'History', icon: History },
] as const;

type TabKey = typeof TABS[number]['key'];

const AUDIENCES = [
  { key: 'all_users', label: 'All Users', icon: Users, desc: 'Everyone in the system' },
  { key: 'active_customers', label: 'Active Customers', icon: Users, desc: 'Users with orders in last 30 days' },
  { key: 'inactive_users', label: 'Inactive Users', icon: Users, desc: 'No orders in 30+ days' },
  { key: 'all_vendors', label: 'All Vendors', icon: Users, desc: 'All registered sellers' },
  { key: 'all_riders', label: 'All Riders', icon: Users, desc: 'All delivery partners' },
  { key: 'custom_segment', label: 'Custom Segment', icon: Target, desc: 'Upload CSV or filter' },
] as const;

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<TabKey>('push');
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Notification Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">Send push notifications and email campaigns</p>
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

      {activeTab === 'push' && <SendPush />}
      {activeTab === 'email' && <EmailCampaigns />}
      {activeTab === 'history' && <HistoryView />}
    </div>
  );
}

// ===== Send Push =====
function SendPush() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'all_users' as AudienceType,
    scheduled_at: '',
    image_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sendPush = useMutation({
    mutationFn: async () => {
      // Validation
      const errs: Record<string, string> = {};
      if (!form.title) errs.title = 'Title is required';
      if (!form.body) errs.body = 'Body is required';
      if (Object.keys(errs).length) {
        setErrors(errs);
        throw new Error('Validation failed');
      }

      // Call FCM edge function
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: form.title,
          body: form.body,
          audience: form.audience,
          imageUrl: form.image_url || null,
          scheduledAt: form.scheduled_at || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(form.scheduled_at ? 'Push scheduled' : 'Push sent!', {
        description: `Reached ${data?.sent_count || 0} devices`,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setForm({ title: '', body: '', audience: 'all_users', scheduled_at: '', image_url: '' });
      setErrors({});
    },
    onError: (e: any) => {
      if (e.message !== 'Validation failed') {
        toast.error('Failed to send', { description: e.message });
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">Compose Push Notification</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendPush.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }); }}
              maxLength={65}
              placeholder="e.g. 🎉 Mega Sale Live Now!"
              className={clsx('w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                errors.title ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500')}
            />
            <div className="flex justify-between mt-1">
              {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
              <p className="text-xs text-slate-400 ml-auto">{form.title.length}/65</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Body *</label>
            <textarea
              value={form.body}
              onChange={(e) => { setForm({ ...form, body: e.target.value }); setErrors({ ...errors, body: '' }); }}
              maxLength={240}
              rows={3}
              placeholder="Get up to 50% off on your favorite items. Shop now!"
              className={clsx('w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                errors.body ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500')}
            />
            <div className="flex justify-between mt-1">
              {errors.body && <p className="text-xs text-red-600">{errors.body}</p>}
              <p className="text-xs text-slate-400 ml-auto">{form.body.length}/240</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL (optional)</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience *</label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map((aud) => {
                const Icon = aud.icon;
                return (
                  <button
                    key={aud.key}
                    type="button"
                    onClick={() => setForm({ ...form, audience: aud.key as AudienceType })}
                    className={clsx(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      form.audience === aud.key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-sm">{aud.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{aud.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={sendPush.isPending}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sendPush.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {form.scheduled_at ? 'Schedule Push' : 'Send Now'}
          </button>
        </form>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Live Preview
          </h3>
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-4 max-w-sm mx-auto">
            <div className="bg-white rounded-xl p-3 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">Krixify</p>
                    <p className="text-xs text-slate-400">now</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                    {form.title || 'Notification title'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {form.body || 'Your notification body will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-900">
              <p className="font-medium">Best Practices</p>
              <ul className="mt-1 space-y-0.5 text-indigo-700">
                <li>• Keep title under 50 characters</li>
                <li>• Use emojis for higher engagement</li>
                <li>• Avoid sending at night (10pm - 8am)</li>
                <li>• Test with small segment first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Email Campaigns =====
function EmailCampaigns() {
  const [form, setForm] = useState({
    subject: '',
    preview_text: '',
    body: '',
    audience: 'all_users' as AudienceType,
  });
  const queryClient = useQueryClient();

  const sendEmail = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: form,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success('Email campaign sent!', { description: `Sent to ${data?.sent_count || 0} recipients` });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setForm({ subject: '', preview_text: '', body: '', audience: 'all_users' });
    },
    onError: (e: any) => toast.error('Failed to send', { description: e.message }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600" /> Email Campaign
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); sendEmail.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Subject *</label>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Preview Text</label>
            <input
              value={form.preview_text}
              onChange={(e) => setForm({ ...form, preview_text: e.target.value })}
              placeholder="Shown in inbox preview"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Body (HTML supported) *</label>
            <textarea
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              placeholder="<h1>Hi {{name}}</h1><p>...</p>"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Audience *</label>
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as AudienceType })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {AUDIENCES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={sendEmail.isPending}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sendEmail.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Send className="w-4 h-4" /> Send Campaign
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Email Preview</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 p-3 border-b border-slate-200">
            <p className="text-xs text-slate-500">Subject:</p>
            <p className="font-semibold text-sm text-slate-900">{form.subject || 'Subject preview'}</p>
            {form.preview_text && <p className="text-xs text-slate-500 mt-1">{form.preview_text}</p>}
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: form.body || '<p class="text-slate-400">Email body preview...</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== History =====
function HistoryView() {
  const [filter, setFilter] = useState<'all' | 'push' | 'email'>('all');
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
      if (filter !== 'all') query = query.eq('type', filter);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Notification[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'push', 'email'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 text-sm font-medium rounded-lg',
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200')}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => refetch()} className="p-2 hover:bg-slate-100 rounded-lg">
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-4 animate-pulse h-20" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <History className="w-16 h-16 text-slate-200 mx-auto" />
          <p className="text-slate-500 mt-4">No notifications sent yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={clsx('p-2.5 rounded-xl',
                  n.type === 'push' ? 'bg-blue-100' : 'bg-purple-100'
                )}>
                  {n.type === 'push' ? <Bell className="w-5 h-5 text-blue-600" /> : <Mail className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 truncate">{n.title}</h3>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                      n.status === 'sent' && 'bg-green-100 text-green-700',
                      n.status === 'scheduled' && 'bg-blue-100 text-blue-700',
                      n.status === 'draft' && 'bg-slate-100 text-slate-700',
                      n.status === 'failed' && 'bg-red-100 text-red-700',
                    )}>{n.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{n.body}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>👥 {n.audience_count.toLocaleString()}</span>
                    {n.sent_count > 0 && <span>✓ {n.sent_count.toLocaleString()} sent</span>}
                    {n.open_count > 0 && <span>👁 {n.open_count.toLocaleString()} opens</span>}
                    <span>🕐 {format(new Date(n.sent_at || n.created_at), 'dd MMM, HH:mm')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
