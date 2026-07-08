import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, CheckCircle2, XCircle, Clock, Search, Eye, Download,
  User, Phone, FileText, X, Loader2, RefreshCw, AlertCircle,
  Building2, CreditCard, Hash, MapPin, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';
import { format } from 'date-fns';

// ===== Type Definitions =====
type KYCStatus = 'pending' | 'approved' | 'rejected';

interface KYCDocument {
  id: string;
  seller_id: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  pan_card_url: string;
  gst_certificate_url: string | null;
  bank_statement_url: string | null;
  uploaded_at: string;
}

interface KYCApplication {
  id: string;
  seller_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  pan_number: string;
  aadhaar_number: string;
  gst_number: string | null;
  business_address: string;
  city: string;
  state: string;
  pincode: string;
  status: KYCStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  documents: KYCDocument | null;
}

const TABS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'orange' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'green' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
] as const;

type TabKey = typeof TABS[number]['key'];

export function KYCApprovals() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['kyc', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_kyc')
        .select(`
          *,
          documents:kyc_documents(*)
        `)
        .eq('status', activeTab)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((k: any) => ({
        ...k,
        documents: k.documents?.[0] || null,
      })) as KYCApplication[];
    },
  });

  const approveKYC = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('seller_kyc')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('KYC approved successfully');
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
    },
    onError: (e: any) => toast.error('Approval failed', { description: e.message }),
  });

  const rejectKYC = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      if (!notes) throw new Error('Rejection reason is required');
      const { error } = await supabase
        .from('seller_kyc')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('KYC rejected');
      queryClient.invalidateQueries({ queryKey: ['kyc'] });
    },
    onError: (e: any) => toast.error('Rejection failed', { description: e.message }),
  });

  const filtered = applications.filter((a) =>
    a.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            KYC Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">Verify seller identities and documents</p>
        </div>
        <button onClick={() => refetch()} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all',
              activeTab === tab.key ? `border-${tab.color}-500 shadow-md` : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{tab.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {tab.key === activeTab ? applications.length : '—'}
                </p>
              </div>
              <div className={clsx('p-3 rounded-xl', `bg-${tab.color}-100`)}>
                <tab.icon className={clsx('w-5 h-5', `text-${tab.color}-600`)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by business, owner, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Shield className="w-16 h-16 text-slate-200 mx-auto" />
          <p className="text-slate-500 mt-4">No {activeTab} applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <KYCCard
              key={app.id}
              application={app}
              onApprove={(notes) => approveKYC.mutate({ id: app.id, notes })}
              onReject={(notes) => rejectKYC.mutate({ id: app.id, notes })}
              isApproving={approveKYC.isPending}
              isRejecting={rejectKYC.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KYCCard({ application, onApprove, onReject, isApproving, isRejecting }: any) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{application.business_name}</h3>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                application.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                application.status === 'approved' && 'bg-green-100 text-green-700',
                application.status === 'rejected' && 'bg-red-100 text-red-700',
              )}>
                {application.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{application.owner_name}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {application.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {application.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {application.city}, {application.state}</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="px-2 py-1 bg-slate-50 rounded font-mono">PAN: {application.pan_number}</span>
              <span className="px-2 py-1 bg-slate-50 rounded font-mono">Aadhaar: **** **** {application.aadhaar_number?.slice(-4)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Submitted {format(new Date(application.submitted_at), 'dd MMM yyyy, HH:mm')}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View Docs
            </button>
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove('')}
                  disabled={isApproving}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        </div>
        {application.reviewer_notes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Reviewer Notes:</p>
            <p className="text-sm text-slate-700 mt-1">{application.reviewer_notes}</p>
          </div>
        )}
      </div>

      {showDetails && (
        <KYCDetailsModal application={application} onClose={() => setShowDetails(false)} />
      )}

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onConfirm={() => {
            onReject(rejectionReason);
            setShowRejectModal(false);
          }}
          reason={rejectionReason}
          setReason={setRejectionReason}
        />
      )}
    </>
  );
}

function KYCDetailsModal({ application, onClose }: any) {
  const downloadDoc = async (url: string, name: string) => {
    try {
      const { data, error } = await supabase.storage.from('kyc-documents').download(url);
      if (error) throw error;
      const blobUrl = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = name;
      a.click();
      toast.success('Download started');
    } catch (e: any) {
      toast.error('Download failed', { description: e.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold">{application.business_name}</h2>
            <p className="text-sm text-slate-500">KYC Documents Review</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Owner Name" value={application.owner_name} />
            <InfoField label="Email" value={application.email} />
            <InfoField label="Phone" value={application.phone} />
            <InfoField label="PAN Number" value={application.pan_number} mono />
            <InfoField label="Aadhaar" value={`**** **** ${application.aadhaar_number?.slice(-4)}`} mono />
            {application.gst_number && <InfoField label="GST" value={application.gst_number} mono />}
          </div>

          <InfoField label="Business Address" value={`${application.business_address}, ${application.city}, ${application.state} - ${application.pincode}`} fullWidth />

          {/* Documents */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.documents && (
                <>
                  <DocumentPreview
                    label="Aadhaar Front"
                    url={application.documents.aadhaar_front_url}
                    onDownload={() => downloadDoc(application.documents.aadhaar_front_url, 'aadhaar-front')}
                  />
                  <DocumentPreview
                    label="Aadhaar Back"
                    url={application.documents.aadhaar_back_url}
                    onDownload={() => downloadDoc(application.documents.aadhaar_back_url, 'aadhaar-back')}
                  />
                  <DocumentPreview
                    label="PAN Card"
                    url={application.documents.pan_card_url}
                    onDownload={() => downloadDoc(application.documents.pan_card_url, 'pan-card')}
                  />
                  {application.documents.gst_certificate_url && (
                    <DocumentPreview
                      label="GST Certificate"
                      url={application.documents.gst_certificate_url}
                      onDownload={() => downloadDoc(application.documents.gst_certificate_url, 'gst-cert')}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({ label, url, onDownload }: any) {
  const [publicUrl, setPublicUrl] = useState<string>('');

  useState(() => {
    if (url) {
      const { data } = supabase.storage.from('kyc-documents').getPublicUrl(url);
      setPublicUrl(data.publicUrl);
    }
  });

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-slate-50">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <button onClick={onDownload} className="p-1.5 hover:bg-slate-200 rounded">
          <Download className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
      <div className="aspect-video bg-slate-100 flex items-center justify-center">
        {publicUrl ? (
          <img src={publicUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <FileText className="w-12 h-12 text-slate-300" />
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, mono, fullWidth }: any) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={clsx('font-medium text-slate-900 mt-0.5', mono && 'font-mono')}>{value}</p>
    </div>
  );
}

function RejectModal({ onClose, onConfirm, reason, setReason }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold">Reject KYC Application</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">Please provide a reason. The seller will be notified.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. Aadhaar image is blurry, please re-upload..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onConfirm}
            disabled={!reason}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Reject
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
