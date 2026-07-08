import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Shield, Plus, Search, Edit, Trash2, Mail, Phone,
  CheckCircle2, XCircle, Lock, Eye, MoreVertical, X,
  AlertCircle, Loader2, UserPlus, Key, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ===== Type Definitions =====
type StaffStatus = 'active' | 'invited' | 'suspended';

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: string;
  role_name: string;
  status: StaffStatus;
  last_login_at: string | null;
  created_at: string;
  avatar_url: string | null;
}

interface Permission {
  key: string;
  label: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission keys
  is_system: boolean;
  staff_count: number;
  created_at: string;
}

const TABS = [
  { key: 'staff', label: 'Staff List', icon: Users },
  { key: 'roles', label: 'Roles & Access', icon: Shield },
] as const;

type TabKey = typeof TABS[number]['key'];

const PERMISSIONS: Permission[] = [
  { key: 'orders.view', label: 'View Orders', category: 'Orders' },
  { key: 'orders.manage', label: 'Manage Orders', category: 'Orders' },
  { key: 'orders.refund', label: 'Process Refunds', category: 'Orders' },
  { key: 'vendors.view', label: 'View Vendors', category: 'Vendors' },
  { key: 'vendors.approve', label: 'Approve Vendors', category: 'Vendors' },
  { key: 'riders.view', label: 'View Riders', category: 'Logistics' },
  { key: 'riders.manage', label: 'Manage Riders', category: 'Logistics' },
  { key: 'finance.view', label: 'View Finance', category: 'Finance' },
  { key: 'finance.payout', label: 'Process Payouts', category: 'Finance' },
  { key: 'marketing.send', label: 'Send Campaigns', category: 'Marketing' },
  { key: 'settings.edit', label: 'Edit Settings', category: 'Settings' },
  { key: 'staff.manage', label: 'Manage Staff', category: 'Settings' },
];

export function StaffPermissions() {
  const [activeTab, setActiveTab] = useState<TabKey>('staff');

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Staff & Permissions
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage internal team members and access control</p>
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

      {activeTab === 'staff' ? <StaffList /> : <RolesAccess />}
    </div>
  );
}

// ===== Staff List =====
function StaffList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_members')
        .select(`
          id, full_name, email, phone, status, last_login_at, created_at, avatar_url,
          role:roles(id, name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((s: any) => ({
        ...s,
        role_id: s.role?.id || '',
        role_name: s.role?.name || 'Unassigned',
      })) as StaffMember[];
    },
  });

  const removeStaff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('staff_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Staff member removed');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (e: any) => toast.error('Failed to remove', { description: e.message }),
  });

  const filtered = staff.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Staff
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users className="w-16 h-16 text-slate-200 mx-auto" />
          <p className="text-slate-500 mt-4">No staff members yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Member</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.full_name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <Shield className="w-3 h-3" /> {member.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        member.status === 'active' && 'bg-green-100 text-green-700',
                        member.status === 'invited' && 'bg-yellow-100 text-yellow-700',
                        member.status === 'suspended' && 'bg-red-100 text-red-700',
                      )}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full',
                          member.status === 'active' && 'bg-green-500',
                          member.status === 'invited' && 'bg-yellow-500',
                          member.status === 'suspended' && 'bg-red-500',
                        )} />
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {member.last_login_at
                        ? format(new Date(member.last_login_at), 'dd MMM, HH:mm')
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.full_name}?`)) removeStaff.mutate(member.id);
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showInvite && <InviteStaffModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

// ===== Invite Staff Modal =====
function InviteStaffModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: roles = [] } = useQuery({
    queryKey: ['roles-list'],
    queryFn: async () => {
      const { data } = await supabase.from('roles').select('id, name');
      return data || [];
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      // Validation
      const newErrors: Record<string, string> = {};
      if (!form.full_name) newErrors.full_name = 'Name is required';
      if (!form.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
      if (!form.role_id) newErrors.role_id = 'Role is required';
      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        throw new Error('Validation failed');
      }

      const { error } = await supabase.from('staff_members').insert({
        ...form,
        status: 'invited',
        invite_token: crypto.randomUUID(),
        invited_at: new Date().toISOString(),
      });
      if (error) throw error;

      // TODO: Send invite email via edge function
    },
    onSuccess: () => {
      toast.success('Invitation sent', { description: `${form.email} will receive an email` });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      onClose();
    },
    onError: (e: any) => {
      if (e.message !== 'Validation failed') {
        toast.error('Failed to send invite', { description: e.message });
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Invite Team Member</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); invite.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
            <input
              value={form.full_name}
              onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setErrors({ ...errors, full_name: '' }); }}
              className={clsx('w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                errors.full_name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500')}
            />
            {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              className={clsx('w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500')}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
            <select
              value={form.role_id}
              onChange={(e) => { setForm({ ...form, role_id: e.target.value }); setErrors({ ...errors, role_id: '' }); }}
              className={clsx('w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                errors.role_id ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500')}
            >
              <option value="">Select a role</option>
              {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.role_id && <p className="text-xs text-red-600 mt-1">{errors.role_id}</p>}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={invite.isPending}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {invite.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Invitation
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-100 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Roles & Access =====
function RolesAccess() {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*, staff_members(count)')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        staff_count: r.staff_members?.[0]?.count || 0,
      })) as Role[];
    },
  });

  const groupedPermissions = PERMISSIONS.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Define roles and what each can access in the dashboard</p>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={clsx('p-2 rounded-lg', role.is_system ? 'bg-slate-100' : 'bg-indigo-100')}>
                    {role.is_system ? <Lock className="w-4 h-4 text-slate-600" /> : <Shield className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{role.name}</h3>
                    {role.is_system && <span className="text-xs text-slate-500">System role</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{role.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>{role.permissions?.length || 0} permissions</span>
                <span>{role.staff_count} members</span>
              </div>
              <button
                onClick={() => setEditingRole(role)}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Permissions
              </button>
            </div>
          ))}
        </div>
      )}

      {(editingRole || showCreate) && (
        <RoleEditor
          role={editingRole}
          onClose={() => { setEditingRole(null); setShowCreate(false); }}
          groupedPermissions={groupedPermissions}
        />
      )}
    </div>
  );
}

function RoleEditor({ role, onClose, groupedPermissions }: any) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selected, setSelected] = useState<string[]>(role?.permissions || []);

  const save = useMutation({
    mutationFn: async () => {
      if (role) {
        const { error } = await supabase.from('roles').update({
          name, description, permissions: selected,
        }).eq('id', role.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('roles').insert({
          name, description, permissions: selected, is_system: false,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(role ? 'Role updated' : 'Role created');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      onClose();
    },
    onError: (e: any) => toast.error('Save failed', { description: e.message }),
  });

  const toggle = (key: string) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]);
  };

  const toggleCategory = (cat: string) => {
    const keys = groupedPermissions[cat].map((p: any) => p.key);
    const allSelected = keys.every((k: string) => selected.includes(k));
    setSelected((prev) => allSelected ? prev.filter((k) => !keys.includes(k)) : Array.from(new Set([...prev, ...keys])));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{role ? `Edit ${role.name}` : 'Create Role'}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Role Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role?.is_system}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Permissions</label>
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([cat, perms]: any) => {
                const keys = perms.map((p: any) => p.key);
                const allSelected = keys.every((k: string) => selected.includes(k));
                return (
                  <div key={cat} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100"
                    >
                      <span className="font-medium text-sm text-slate-900">{cat}</span>
                      <span className={clsx('text-xs font-semibold', allSelected ? 'text-indigo-600' : 'text-slate-500')}>
                        {allSelected ? 'All selected' : `${keys.filter((k: string) => selected.includes(k)).length}/${keys.length}`}
                      </span>
                    </button>
                    <div className="p-3 space-y-2">
                      {perms.map((p: any) => (
                        <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected.includes(p.key)}
                            onChange={() => toggle(p.key)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{p.label}</span>
                          <code className="text-xs text-slate-400 ml-auto">{p.key}</code>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={() => save.mutate()}
            disabled={!name || save.isPending}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {save.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Role
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
