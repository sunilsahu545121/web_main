import React, { useState, useEffect } from 'react';
import { Percent, Save, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform_commission: 12,
    base_shipping_rate: 45,
    cod_charge: 50,
    support_email: 'support@krixify.com',
    support_phone: '+91 1800 123 4567',
    enable_cod: true,
    enable_razorpay: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('system_settings').select('*').single();
    if (data) {
      // @ts-ignore
      setFormData(prev => ({ ...prev, ...data }));
    }
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // @ts-ignore
    const { error } = await supabase.from('system_settings').upsert({ id: 1, ...formData });
    setIsSaving(false);
    
    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('System settings saved successfully');
    }
  };

  const handleGoogleSheetsSync = async () => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.functions.invoke('sync-to-google-sheets');
      if (error) throw error;
      toast.success('Successfully synced data to Google Sheets!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to sync to Google Sheets: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <p className="text-sm text-gray-500">Manage global platform configurations and rules</p>
      </div>

      <div className="space-y-6">
        {/* Google Sheets Sync */}
        <div className="rounded-xl border border-green-200 bg-green-50 shadow-sm overflow-hidden">
          <div className="border-b border-green-200 bg-green-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-700" />
              <h3 className="font-bold text-green-900">Data Export & Reporting</h3>
            </div>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-900">Google Sheets Sync</p>
              <p className="text-xs text-green-700 mt-1">Push the latest orders, users, and financials to the connected Google Sheet for external reporting.</p>
            </div>
            <button
              onClick={handleGoogleSheetsSync}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-70 whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync to Google Sheets'}
            </button>
          </div>
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
                  value={formData.base_shipping_rate} onChange={e => setFormData({...formData, base_shipping_rate: parseInt(e.target.value)})}
                  className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2.5 font-bold text-white hover:bg-orange-700 disabled:opacity-70 shadow-md"
            >
              <Save className="h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
