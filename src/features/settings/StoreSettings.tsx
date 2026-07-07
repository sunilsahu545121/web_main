import React, { useState } from 'react';
import { FileText, Landmark, Save } from 'lucide-react';
import { toast } from 'sonner';

export function StoreSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: 'Super Electronics',
    gstin: '22AAAAA0000A1Z5',
    fssai: '',
    pan: 'ABCDE1234F',
    bank_name: 'HDFC Bank',
    account_no: '50100234567890',
    ifsc: 'HDFC0000123',
    beneficiary: 'Super Electronics Pvt Ltd'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Store configuration saved');
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Store Configuration</h1>
        <p className="text-sm text-gray-500">Manage your business profile, tax details, and bank payouts</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Business & Tax Details */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">Tax & Compliance</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Registered Business Name</label>
              <input 
                type="text" required
                value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">GSTIN</label>
              <input 
                type="text" required
                value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 uppercase font-mono" 
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">PAN Number</label>
              <input 
                type="text" required
                value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 uppercase font-mono" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">FSSAI Number (Optional)</label>
              <input 
                type="text" 
                value={formData.fssai} onChange={e => setFormData({...formData, fssai: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                placeholder="For food businesses"
              />
            </div>
          </div>
        </div>

        {/* Bank Account */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">Payout Details (Bank Account)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bank Name</label>
              <input 
                type="text" required
                value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Beneficiary Name</label>
              <input 
                type="text" required
                value={formData.beneficiary} onChange={e => setFormData({...formData, beneficiary: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Account Number</label>
              <input 
                type="password" required
                value={formData.account_no} onChange={e => setFormData({...formData, account_no: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono" 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">IFSC Code</label>
              <input 
                type="text" required
                value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value.toUpperCase()})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 uppercase font-mono" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-70"
          >
            <Save className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
