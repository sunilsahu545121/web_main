import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle, Ticket, Send, Search, User, Clock,
  CheckCircle2, AlertCircle, X, Paperclip, RefreshCw,
  Mail, Phone, Hash
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'customer' | 'support' | 'vendor';
  message: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: 'open' | 'closed';
}

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
}

const TABS = [
  { key: 'chat', label: 'Live Chat', icon: MessageCircle },
  { key: 'tickets', label: 'Tickets', icon: Ticket },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SupportModule() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time chat and ticket management
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
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

      {activeTab === 'chat' ? <LiveChat /> : <TicketsView />}
    </div>
  );
}

// ===== Live Chat Component =====
function LiveChat() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, customer_id, status, last_message_at,
          customer:customer_id(full_name, avatar_url)
        `)
        .eq('status', 'open')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each
      const enriched = await Promise.all(
        (data || []).map(async (conv: any) => {
          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('message, created_at, sender_type, read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_type', 'support');

          return {
            id: conv.id,
            customer_id: conv.customer_id,
            customer_name: conv.customer?.full_name || 'Unknown',
            customer_avatar: conv.customer?.avatar_url,
            last_message: lastMsg?.message || '',
            last_message_at: conv.last_message_at,
            unread_count: count || 0,
            status: conv.status,
          } as Conversation;
        })
      );
      return enriched;
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id, sender_id, sender_type, message, created_at, read,
          sender:sender_id(full_name)
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        conversation_id: selectedConversation,
        sender_id: m.sender_id,
        sender_name: m.sender?.full_name || 'Unknown',
        sender_type: m.sender_type,
        message: m.message,
        created_at: m.created_at,
        read: m.read,
      })) as ChatMessage[];
    },
    enabled: !!selectedConversation,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedConversation) {
      supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('conversation_id', selectedConversation)
        .neq('sender_type', 'support')
        .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }));
    }
  }, [selectedConversation, queryClient]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!selectedConversation) throw new Error('No conversation selected');

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        sender_type: 'support',
        message,
        read: true,
      });
      if (error) throw error;

      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      setMessageInput('');
    },
  });

  const filteredConversations = conversations.filter((c) =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Conversations List */}
        <div className="border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active conversations
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={clsx(
                    'w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                    selectedConversation === conv.id && 'bg-indigo-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conv.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 truncate">{conv.customer_name}</p>
                        <span className="text-xs text-slate-400">
                          {new Date(conv.last_message_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-200 mx-auto" />
                <p className="text-slate-400 mt-3">Select a conversation to start</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {selectedConv?.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedConv?.customer_name}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full" /> Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] })}
                  className="p-2 hover:bg-slate-200 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((msg) => {
                  const isSupport = msg.sender_type === 'support';
                  return (
                    <div key={msg.id} className={clsx('flex', isSupport ? 'justify-end' : 'justify-start')}>
                      <div className={clsx(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isSupport ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-900'
                      )}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={clsx(
                          'text-xs mt-1',
                          isSupport ? 'text-indigo-100' : 'text-slate-400'
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (messageInput.trim()) sendMessage.mutate(messageInput.trim());
                  }}
                  className="flex items-center gap-2"
                >
                  <button type="button" className="p-2 hover:bg-slate-100 rounded-lg">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendMessage.isPending}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Tickets View =====
function TicketsView() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          id, ticket_number, subject, description, category, priority, status,
          created_at, updated_at, assigned_to,
          customer:customer_id(full_name, email, phone),
          assignee:assigned_to(full_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        ticket_number: t.ticket_number,
        customer_id: t.customer_id,
        customer_name: t.customer?.full_name || 'N/A',
        customer_email: t.customer?.email || 'N/A',
        customer_phone: t.customer?.phone || 'N/A',
        subject: t.subject,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assigned_to: t.assigned_to,
        assigned_to_name: t.assignee?.full_name || null,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })) as SupportTicket[];
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const filteredTickets = tickets.filter(
    (t) =>
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = {
      low: 'bg-slate-100 text-slate-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return config[priority];
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    return config[status];
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button onClick={() => refetch()} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Ticket</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Subject</th>
                  <th className="px-6 py-3 text-left">Priority</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{ticket.ticket_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{ticket.customer_name}</p>
                      <p className="text-xs text-slate-500">{ticket.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">{ticket.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getPriorityBadge(ticket.priority))}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStatusBadge(ticket.status))}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(ticket.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          updateTicketStatus.mutate({ ticketId: ticket.id, status: e.target.value as TicketStatus })
                        }
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
