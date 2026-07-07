// @ts-nocheck
import { useState } from 'react';
import { usePendingKYC, useApproveKYC } from '@/lib/api/kyc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

export function KYCApprovalList() {
  const { data, isLoading } = usePendingKYC();
  const { mutate: approve, isPending } = useApproveKYC();
  const [selected, setSelected] = useState<any | null>(null);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Seller KYC Approvals</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-6 text-center">Loading…</td></tr>}
              {data?.map((k) => (
                <tr key={k.seller_id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{k.seller?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{k.seller?.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{k.business_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.gst_number}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{k.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setSelected(k)}>Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onClose={() => { setSelected(null); setReason(''); }} title="KYC Review" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">PAN:</span> {selected.pan_number}</div>
              <div><span className="text-muted-foreground">GST:</span> {selected.gst_number}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Pickup Address:</span> {selected.pickup_address}</div>
              <div><span className="text-muted-foreground">Bank:</span> {selected.bank_name} / {selected.account_number_masked}</div>
              <div><span className="text-muted-foreground">IFSC:</span> {selected.ifsc}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-xs font-medium">PAN Document</p>
                <a href={selected.pan_document_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium">GST Certificate</p>
                <a href={selected.gst_document_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Rejection reason (optional for approval)</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide a reason if rejecting" className="mt-1" />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="destructive"
                loading={isPending}
                onClick={() => {
                  approve({ sellerId: selected.seller_id, approved: false, reason }, {
                    onSuccess: () => { setSelected(null); setReason(''); },
                  });
                }}
              >
                Reject
              </Button>
              <Button
                loading={isPending}
                onClick={() => {
                  approve({ sellerId: selected.seller_id, approved: true, reason }, {
                    onSuccess: () => { setSelected(null); setReason(''); },
                  });
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
