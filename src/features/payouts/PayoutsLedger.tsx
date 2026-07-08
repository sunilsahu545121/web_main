import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, CheckCircle2, Clock, ArrowUpRight, Search, Filter,
  RefreshCw, Send, TrendingUp, AlertCircle, Eye, Download,
  CreditCard, Building2, FileText, X, IndianRupee, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ===== Type Definitions =====
type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Payout {
  id: string;
  recipient_id: string;
  recipient_type: 'vendor' | 'rider' | 'franchisee';
  recipient_name: string;
  recipient_email: string;
  bank_account: string;
  ifsc: string;
  gross_amount: number;
  platform_commission: number;
  tds_amount: number;
  net_amount: number;
  status: PayoutStatus;
  reference_id: string | null;
  created_at: string;
  completed_at: string | null;
  orders_count: number;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  balance_after: number;
  created_at: string;
}

const TABS = [
  { key: 'pending', label: 'Pending Payouts', icon: Clock },
  { key: 'completed', label: 'Completed Settlements', icon: CheckCircle2 },
  { key: 'transactions', label: 'Wallet Transactions', icon: FileText },
] as const;

type TabKey = typeof TABS[number]['key'];

export function PayoutsLedger() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending payouts
  const { data: pendingPayouts = [], isLoading: pendingLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payouts-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          id, recipient_id, recipient_type, gross_amount, platform_commission,
          tds_amount, net_amount, status, reference_id, created_at, completed_at,
          orders_count, recipient:recipient_id(full_name, email, bank_account, ifsc)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        recipient_id: p.recipient_id,
        recipient_type: p.recipient_type,
        recipient_name: p.recipient?.full_name || 'N/A',
        recipient_email: p.recipient?.email || 'N/A',
        bank_account: p.recipient?.bank_account || 'N/A',
        ifsc: p.recipient?.ifsc || 'N/A',
        gross_amount: Number(p.gross_amount),
        platform_commission: Number(p.platform_commission),
        tds_amount: Number(p.tds_amount),
        net_amount: Number(p.net_amount),
        status: p.status,
        reference_id: p.reference_id,
        created_at: p.created_at,
        completed_at: p.completed_at,
        orders_count: p.orders_count,
      })) as Payout[];
    },
  });

  // Fetch completed settlements
  const { data: completedPayouts = [], isLoading: completedLoading } = useQuery({
    queryKey: ['payouts-completed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          id, recipient_id, recipient_type, gross_amount, platform_commission,
          tds_amount, net_amount, status, reference_id, created_at, completed_at,
          orders_count, recipient: recipient_id(full_name, email)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        recipient_name: p.recipient?.full_name || 'N/A',
        recipient_email: p.recipient?.email || 'N/A',
        bank_account: '',
        ifsc: '',
      })) as Payout[];
    },
  });

  // Fetch wallet transactions
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          id, user_id, amount, type, description, reference_id, reference_type,
          balance_after, created_at,
          user: user_id(full_name, user_type)
        `)
        .eq('type', 'credit')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        user_name: t.user?.full_name || 'N/A',
        user_type: t.user?.user_type || 'N/A',
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        reference_id: t.reference_id,
        reference_type: t.reference_type,
        balance_after: Number(t.balance_after),
        created_at: t.created_at,
      })) as WalletTransaction[];
    },
  });

  // Settle payout mutation - calls edge function
  const settlePayout = useMutation({
    mutationFn: async (payoutId: string) => {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { payoutId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Payout initiated successfully', {
        description: `Reference: ${data?.reference_id || 'Generated'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['payouts-pending'] });
      queryClient.invalidateQueries({ queryKey: ['payouts-completed'] });
    },
    onError: (error: any) => {
      toast.error('Failed to settle payout', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Calculate totals
  const totals = {
    pending: pendingPayouts.reduce((sum, p) => sum + p.net_amount, 0),
    completed: completedPayouts.reduce((sum, p) => sum + p.net_amount, 0),
    commission: pendingPayouts.reduce((sum, p) => sum + p.platform_commission, 0),
    tds: pendingPayouts.reduce((sum, p) => sum + p.tds_amount, 0),
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Payouts & Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage settlements, commissions, and wallet activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSplitModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Split Logic
          </button>
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={clsx('w-4 h-4 text-slate-600', isRefetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Pending Payouts"
          value={totals.pending}
          count={pendingPayouts.length}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          label="Completed"
          value={totals.completed}
          count={completedPayouts.length}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          label="Platform Commission"
          value={totals.commission}
          count={null}
          icon={TrendingUp}
          color="indigo"
        />
        <StatsCard
          label="TDS Collected"
          value={totals.tds}
          count={null}
          icon={FileText}
          color="purple"
        />
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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'transactions' ? 'transactions' : 'payouts'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <PendingPayouts
          payouts={pendingPayouts}
          isLoading={pendingLoading}
          searchQuery={searchQuery}
          onSettle={(id: string) => settlePayout.mutate(id)}
          isSettling={settlePayout.isPending}
        />
      )}
      {activeTab === 'completed' && (
        <CompletedSettlements
          payouts={completedPayouts}
          isLoading={completedLoading}
          searchQuery={searchQuery}
        />
      )}
      {activeTab === 'transactions' && (
        <WalletTransactions
          transactions={transactions}
          isLoading={txLoading}
          searchQuery={searchQuery}
        />
      )}

      {/* Split Logic Modal */}
      {showSplitModal && <SplitLogicModal onClose={() => setShowSplitModal(false)} />}
    </div>
  );
}

// ===== Stats Card =====
function StatsCard({ label, value, count, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('p-2.5 rounded-xl', `bg-${color}-100`)}>
          <Icon className={clsx('w-5 h-5', `text-${color}-600`)} />
        </div>
        {count !== null && (
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', `bg-${color}-50 text-${color}-700`)}>
            {count} items
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">
        ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

// ===== Pending Payouts =====
function PendingPayouts({ payouts, isLoading, searchQuery, onSettle, isSettling }: any) {
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  const filtered = payouts.filter((p: Payout) =>
    p.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.recipient_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <TableSkeleton />;
  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto" />
        <p className="text-slate-500 mt-4">All payouts are settled! 🎉</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Recipient</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Gross</th>
                <th className="px-6 py-4 text-left">Deductions</th>
                <th className="px-6 py-4 text-left">Net Amount</th>
                <th className="px-6 py-4 text-left">Bank</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p: Payout) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{p.recipient_name}</p>
                      <p className="text-xs text-slate-500">{p.recipient_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                      {p.recipient_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    ₹{p.gross_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="text-slate-600">Comm: ₹{p.platform_commission.toLocaleString('en-IN')}</p>
                    <p className="text-slate-600">TDS: ₹{p.tds_amount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-lg text-slate-900">
                      ₹{p.net_amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">{p.orders_count} orders</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPayout(p)}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      {p.bank_account.slice(-4).padStart(p.bank_account.length, '*')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSettle(p.id)}
                      disabled={isSettling}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                    >
                      {isSettling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Settle Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayout && (
        <BankDetailsModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />
      )}
    </>
  );
}

// ===== Completed Settlements =====
function CompletedSettlements({ payouts, isLoading, searchQuery }: any) {
  const filtered = payouts.filter((p: Payout) =>
    p.recipient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">Recipient</th>
              <th className="px-6 py-4 text-left">Net Paid</th>
              <th className="px-6 py-4 text-left">Reference</th>
              <th className="px-6 py-4 text-left">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p: Payout) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{p.recipient_name}</td>
                <td className="px-6 py-4 font-semibold text-green-700">
                  ₹{p.net_amount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.reference_id || '—'}</td>
                <td className="px-6 py-4 text-slate-600 text-xs">
                  {p.completed_at ? format(new Date(p.completed_at), 'dd MMM yyyy, HH:mm') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Wallet Transactions =====
function WalletTransactions({ transactions, isLoading, searchQuery }: any) {
  const filtered = transactions.filter((t: WalletTransaction) =>
    t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Description</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Balance After</th>
              <th className="px-6 py-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((t: WalletTransaction) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {t.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{t.user_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{t.user_type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{t.description}</td>
                <td className="px-6 py-4 font-bold text-green-700">
                  +₹{t.amount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-slate-600">₹{t.balance_after.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {format(new Date(t.created_at), 'dd MMM, HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Split Logic Modal =====
function SplitLogicModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">4-Way Payment Split</h2>
            <p className="text-sm text-slate-500 mt-1">How each order's revenue is distributed</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <SplitRow label="Vendor Payout" percent={70} amount={700} color="green" description="Goes to seller wallet" />
          <SplitRow label="Platform Commission" percent={15} amount={150} color="indigo" description="Krixify revenue" />
          <SplitRow label="Delivery Partner" percent={10} amount={100} color="blue" description="Rider earnings" />
          <SplitRow label="TDS + GST" percent={5} amount={50} color="orange" description="Tax deductions" />
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-sm text-slate-700">
              <strong>Example:</strong> On a ₹1,000 order, vendor gets ₹700, platform keeps ₹150,
              rider earns ₹100, and ₹50 is withheld for taxes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitRow({ label, percent, amount, color, description }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${color}-100`)}>
        <span className={clsx('text-lg font-bold', `text-${color}-700`)}>{percent}%</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <p className="font-bold text-slate-900">₹{amount}</p>
    </div>
  );
}

function BankDetailsModal({ payout, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Bank Details</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <div><p className="text-slate-500">Account Holder</p><p className="font-semibold">{payout.recipient_name}</p></div>
          <div><p className="text-slate-500">Account Number</p><p className="font-mono font-semibold">{payout.bank_account}</p></div>
          <div><p className="text-slate-500">IFSC Code</p><p className="font-mono font-semibold">{payout.ifsc}</p></div>
          <div><p className="text-slate-500">Net Amount</p><p className="font-bold text-xl text-green-700">₹{payout.net_amount.toLocaleString('en-IN')}</p></div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-32 h-4 bg-slate-200 rounded" />
          <div className="flex-1 h-4 bg-slate-200 rounded" />
          <div className="w-20 h-4 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}
