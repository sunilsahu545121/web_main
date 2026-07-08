import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RotateCcw, CheckCircle2, XCircle, DollarSign, Package,
  AlertCircle, User, Calendar, Search, RefreshCw, MessageSquare,
  CheckCheck, Ban, Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  vendor_id: string;
  vendor_name: string;
  product_name: string;
  quantity: number;
  amount: number;
  reason: string;
  description: string;
  status: ReturnStatus;
  created_at: string;
  images: string[];
  refund_amount: number | null;
  refund_id: string | null;
}

const STATUS_TABS: { key: ReturnStatus; label: string; color: string; bg: string }[] = [
  { key: 'pending', label: 'Pending Returns', color: 'orange', bg: 'bg-orange-50' },
  { key: 'approved', label: 'Approved', color: 'blue', bg: 'bg-blue-50' },
  { key: 'rejected', label: 'Rejected', color: 'red', bg: 'bg-red-50' },
  { key: 'refunded', label: 'Refunded', color: 'green', bg: 'bg-green-50' },
];

export function ReturnRefundModule() {
  const [activeTab, setActiveTab] = useState<ReturnStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const queryClient = useQueryClient();

  // Fetch returns
  const { data: returns = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['returns', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_requests')
        .select(`
          id, order_id, reason, description, status, created_at, images,
          refund_amount, refund_id, product_name, quantity, amount,
          order:order_id(order_number),
          customer:customer_id(full_name, phone),
          vendor:vendor_id(business_name)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: r.id,
        order_id: r.order_id,
        order_number: r.order?.order_number || 'N/A',
        customer_id: r.customer_id,
        customer_name: r.customer?.full_name || 'N/A',
        customer_phone: r.customer?.phone || 'N/A',
        vendor_id: r.vendor_id,
        vendor_name: r.vendor?.business_name || 'N/A',
        product_name: r.product_name,
        quantity: r.quantity,
        amount: Number(r.amount),
        reason: r.reason,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        images: r.images || [],
        refund_amount: r.refund_amount,
        refund_id: r.refund_id,
      })) as ReturnRequest[];
    },
  });

  // Approve return
  const approveReturn = useMutation({
    mutationFn: async (returnId: string) => {
      const { error } = await supabase
        .from('return_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', returnId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['returns'] }),
  });

  // Reject return
  const rejectReturn = useMutation({
    mutationFn: async (returnId: string) => {
      const { error } = await supabase
        .from('return_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', returnId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['returns'] }),
  });

  // Initiate refund
  const initiateRefund = useMutation({
    mutationFn: async (returnReq: ReturnRequest) => {
      // 1. Update return status to refunded
      const { error: updateError } = await (supabase as any)
        .from('return_requests')
        .update({
          status: 'refunded',
          refund_amount: returnReq.amount,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', returnReq.id);
      if (updateError) throw updateError;

      // 2. Create wallet transaction (credit to customer)
      const { data: walletData, error: walletError } = await (supabase as any)
        .from('wallets')
        .select('id, balance')
        .eq('user_id', returnReq.customer_id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;

      let walletId = walletData?.id;
      let currentBalance = walletData?.balance || 0;

      if (!walletId) {
        const { data: newWallet, error: createError } = await (supabase as any)
          .from('wallets')
          .insert({ user_id: returnReq.customer_id, balance: 0 })
          .select()
          .single();
        if (createError) throw createError;
        walletId = newWallet.id;
      }

      // Create transaction
      const { error: txError } = await (supabase as any)
        .from('wallet_transactions')
        .insert({
          wallet_id: walletId,
          user_id: returnReq.customer_id,
          amount: returnReq.amount,
          type: 'credit',
          description: `Refund for order #${returnReq.order_number}`,
          reference_id: returnReq.id,
          reference_type: 'return_refund',
        });
      if (txError) throw txError;

      // Update wallet balance
      const { error: balanceError } = await (supabase as any)
        .from('wallets')
        .update({ balance: currentBalance + returnReq.amount })
        .eq('id', walletId);
      if (balanceError) throw balanceError;

      // Update order payment status
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('id', returnReq.order_id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['returns'] }),
  });

  const filteredReturns = returns.filter(
    (r) =>
      r.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Returns & Refunds</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage return requests and refund processing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order, customer, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={clsx('w-4 h-4 text-slate-600', isRefetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-3">No {STATUS_TABS.find((s) => s.key === activeTab)?.label.toLowerCase()}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReturns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              onApprove={() => approveReturn.mutate(returnReq.id)}
              onReject={() => rejectReturn.mutate(returnReq.id)}
              onRefund={() => initiateRefund.mutate(returnReq)}
              onViewDetails={() => setSelectedReturn(returnReq)}
              isApproving={approveReturn.isPending}
              isRejecting={rejectReturn.isPending}
              isRefunding={initiateRefund.isPending}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReturn && (
        <ReturnDetailModal returnReq={selectedReturn} onClose={() => setSelectedReturn(null)} />
      )}
    </div>
  );
}

// ===== Return Card =====
function ReturnCard({
  returnReq, onApprove, onReject, onRefund, onViewDetails, isApproving, isRejecting, isRefunding,
}: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">#{returnReq.order_number}</span>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              returnReq.status === 'pending' && 'bg-orange-100 text-orange-700',
              returnReq.status === 'approved' && 'bg-blue-100 text-blue-700',
              returnReq.status === 'rejected' && 'bg-red-100 text-red-700',
              returnReq.status === 'refunded' && 'bg-green-100 text-green-700',
            )}>
              {returnReq.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(returnReq.created_at).toLocaleString('en-IN')}
          </p>
        </div>
        <button onClick={onViewDetails} className="p-1.5 hover:bg-slate-100 rounded-md">
          <Eye className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{returnReq.product_name}</span>
          <span className="text-slate-400">×{returnReq.quantity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700">{returnReq.customer_name}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 mt-2">
          <p className="text-xs text-slate-500 font-medium">Reason</p>
          <p className="text-sm text-slate-800 mt-0.5">{returnReq.reason}</p>
          {returnReq.description && (
            <p className="text-xs text-slate-600 mt-1">{returnReq.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Refund Amount</p>
          <p className="text-lg font-bold text-slate-900">
            ₹{returnReq.amount.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex gap-2">
          {returnReq.status === 'pending' && (
            <>
              <button
                onClick={onReject}
                disabled={isRejecting}
                className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-1"
              >
                <Ban className="w-3 h-3" /> Reject
              </button>
              <button
                onClick={onApprove}
                disabled={isApproving}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Approve
              </button>
            </>
          )}
          {returnReq.status === 'approved' && (
            <button
              onClick={onRefund}
              disabled={isRefunding}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" /> Initiate Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Detail Modal =====
function ReturnDetailModal({ returnReq, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Return Request Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Order Number</p>
              <p className="font-semibold text-slate-900">#{returnReq.order_number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold text-slate-900">{returnReq.status}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="font-semibold text-slate-900">{returnReq.customer_name}</p>
              <p className="text-xs text-slate-500">{returnReq.customer_phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Vendor</p>
              <p className="font-semibold text-slate-900">{returnReq.vendor_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Product</p>
              <p className="font-semibold text-slate-900">{returnReq.product_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p className="font-semibold text-slate-900">₹{returnReq.amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Reason</p>
            <p className="text-slate-800 mt-1">{returnReq.reason}</p>
          </div>
          {returnReq.description && (
            <div>
              <p className="text-xs text-slate-500">Description</p>
              <p className="text-slate-800 mt-1">{returnReq.description}</p>
            </div>
          )}
          {returnReq.images.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Images</p>
              <div className="grid grid-cols-3 gap-2">
                {returnReq.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
