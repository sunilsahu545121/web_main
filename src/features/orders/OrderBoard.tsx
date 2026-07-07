// @ts-nocheck
import { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '@/lib/api/orders';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'] as const;

export function OrderBoard() {
  useRealtimeOrders();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { data: orders, isLoading } = useOrders({ status: statusFilter || undefined });
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const mockOrders: any[] = orders?.filter((o) =>
    !search || o.id.toLowerCase().includes(search.toLowerCase())
  ) as any;

  const filtered = mockOrders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Real-time Order Board</h1>
        <div className="flex gap-2">
          <Input placeholder="Search order ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {filtered?.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{order.customer?.full_name}</td>
                  <td className="px-4 py-3">{order.seller?.shop_name}</td>
                  <td className="px-4 py-3">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{order.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order.id)}>View</Button>
                      {order.status === 'placed' && (
                        <Button size="sm" disabled={isPending} onClick={() => updateStatus({ orderId: order.id, status: 'confirmed' })}>
                          Confirm
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button size="sm" disabled={isPending} onClick={() => updateStatus({ orderId: order.id, status: 'packed' })}>
                          Pack
                        </Button>
                      )}
                      {order.status === 'packed' && (
                        <Button size="sm" disabled={isPending} onClick={() => updateStatus({ orderId: order.id, status: 'shipped' })}>
                          Ship
                        </Button>
                      )}
                      {['placed', 'confirmed'].includes(order.status) && (
                        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => updateStatus({ orderId: order.id, status: 'cancelled' })}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details" size="xl">
        {selectedOrder && <OrderDetail orderId={selectedOrder} onAction={(s) => {
          updateStatus({ orderId: selectedOrder, status: s });
          setSelectedOrder(null);
        }} />}
      </Dialog>
    </div>
  );
}

function OrderDetail({ orderId, onAction }: { orderId: string; onAction: (status: string) => void }) {
  const { data: order } = useOrders({});
  const found = order?.find((o) => o.id === orderId);
  if (!found) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-muted-foreground">Order:</span> {found.id}</div>
        <div><span className="text-muted-foreground">Total:</span> ₹{found.total_amount}</div>
        <div><span className="text-muted-foreground">Status:</span> {found.status}</div>
        <div><span className="text-muted-foreground">Payment:</span> {found.payment_method}</div>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Items</h3>
        <ul className="space-y-1 text-sm">
          {found.items?.map((i: any) => (
            <li key={i.id} className="flex justify-between border-b pb-1">
              <span>{i.product_name} × {i.quantity}</span>
              <span>₹{i.subtotal}</span>
            </li>
          ))}
        </ul>
      </div>
      {found.status === 'delivered' && (
        <Button variant="destructive" onClick={() => onAction('refunded')}>Issue Refund</Button>
      )}
    </div>
  );
}
