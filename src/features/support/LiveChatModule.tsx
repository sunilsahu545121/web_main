import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MessageCircle, Send, User, Bot } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_role?: string;
}

export function LiveChatModule() {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket);
      
      const channel = supabase
        .channel(`chat_${activeTicket}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${activeTicket}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTicket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchTickets = async () => {
    let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
    
    if (role === 'seller') {
      if (user) {
        query = query.eq('raised_by', user.id);
      }
    }
    
    const { data, error } = await query.limit(10);
    if (!error && data) {
      setTickets(data as any[]);
      if (data.length > 0) setActiveTicket((data as any[])[0].id);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    // @ts-ignore
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data as ChatMessage[]);
      scrollToBottom();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || !user) return;

    // @ts-ignore
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: activeTicket,
      sender_id: user.id,
      message: newMessage,
    } as any);

    if (error) {
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Live Chat Support</h1>
        <p className="text-sm text-gray-500">Real-time dispute resolution and support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
        {/* Sidebar */}
        <Card className="col-span-1 overflow-y-auto">
          <CardHeader className="border-b sticky top-0 bg-white z-10">
            <CardTitle className="text-sm">Active Tickets</CardTitle>
          </CardHeader>
          <div className="divide-y">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => setActiveTicket(ticket.id)}
                className={`p-4 cursor-pointer transition-colors ${activeTicket === ticket.id ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-gray-50'}`}
              >
                <h3 className="font-bold text-sm text-gray-800 truncate">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">Ticket #{ticket.id.split('-')[0]}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-1 md:col-span-3 flex flex-col h-[600px]">
          {activeTicket ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-sm">
                    {tickets.find(t => t.id === activeTicket)?.subject || 'Chat'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white border rounded-tl-none text-gray-800 shadow-sm'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-full border px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-orange-600 p-2 text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Bot className="h-16 w-16 mb-4 text-gray-200" />
              <p>Select a ticket to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
