import React, { useState } from 'react';
import { Percent, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

export function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    platform_commission: 12,
    base_shipping_rate: 45,
    cod_charge: 50,
    support_email: 'support@krixify.com',
    support_phone: '+91 1800 123 4567',
    enable_cod: true,
    enable_razorpay: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System settings saved successfully');
    }, 800);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <p className="text-sm text-gray-500">Manage global platform configurations and rules</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Rules */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4 flex items-center gap-2">
            <Percent className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">Financial Rules</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Platform Commission (%)</label>
              <input 
                type="number" step="0.1" required
                value={formData.platform_commission} onChange={e => setFormData({...formData, platform_commission: parseFloat(e.target.value)})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
              <p className="mt-1 text-xs text-gray-500">Deducted automatically from seller payouts.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Base Shipping Rate (₹)</label>
              <input 
                type="number" required
                value={formData.base_shipping_rate} onChange={e => setFormData({...formData, base_shipping_rate: parseFloat(e.target.value)})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
              <p className="mt-1 text-xs text-gray-500">Minimum delivery charge for zones without specific rules.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cash on Delivery Charge (₹)</label>
              <input 
                type="number" required
                value={formData.cod_charge} onChange={e => setFormData({...formData, cod_charge: parseFloat(e.target.value)})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">Payment Methods</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={formData.enable_razorpay} onChange={e => setFormData({...formData, enable_razorpay: e.target.checked})}
                className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
              />
              <div>
                <p className="font-bold text-gray-800">Razorpay (Cards/UPI)</p>
                <p className="text-xs text-gray-500">Accept digital payments instantly.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={formData.enable_cod} onChange={e => setFormData({...formData, enable_cod: e.target.checked})}
                className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
              />
              <div>
                <p className="font-bold text-gray-800">Cash on Delivery (COD)</p>
                <p className="text-xs text-gray-500">Allow customers to pay upon delivery.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-70"
          >
            <Save className="h-5 w-5" /> {isSaving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
