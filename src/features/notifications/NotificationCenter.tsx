import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Send, Users, BellRing } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function NotificationCenter() {
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    target: 'all' // all, customers, sellers, delivery
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: formData
      });
      
      if (error) throw error;
      toast.success('Push notifications sent successfully!');
      setFormData({ ...formData, title: '', body: '' });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to send notification: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Notification Center</h1>
        <p className="text-sm text-gray-500">Send push notifications to mobile apps (FCM)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-full bg-blue-200 p-3 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-orange-500" /> New Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select 
                value={formData.target}
                onChange={e => setFormData({...formData, target: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">Everyone</option>
                <option value="customers">Customers Only</option>
                <option value="sellers">Sellers Only</option>
                <option value="delivery">Delivery Partners Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
              <input 
                type="text" required
                placeholder="e.g. Mega Sale is Live!"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea 
                required rows={4}
                placeholder="Type your message here..."
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
                className="w-full rounded-lg border p-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" disabled={isSending}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 font-bold text-white hover:bg-orange-700 disabled:opacity-70"
              >
                <Send className="h-4 w-4" /> {isSending ? 'Sending Broadcast...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
