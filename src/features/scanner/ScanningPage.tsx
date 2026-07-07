// @ts-nocheck
import { useState, useEffect } from 'react';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';
import { HIDScannerService } from '@/lib/scanner/hid';
import { Package, Plus, Minus, Trash2, CheckCircle2, AlertCircle, Keyboard, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthProvider';

interface ScannedItem {
  barcode: string;
  product: { id: string; name: string; sku: string; stock_quantity: number; price: number; hsn_code?: string } | null;
  quantity: number;
  status: 'pending' | 'resolved' | 'unknown' | 'error';
  error?: string;
  timestamp: number;
}

type ScanMode = 'receive' | 'pick' | 'stock_count' | 'transfer';
type ScanSource = 'camera' | 'usb_hid';

const MOVEMENT_TYPE_MAP: Record<ScanMode, string> = {
  receive: 'receive',
  pick: 'pick',
  stock_count: 'adjust',
  transfer: 'transfer',
};

export function ScanningPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ScanMode>('receive');
  const [source, setSource] = useState<ScanSource>('camera');
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (source !== 'usb_hid') return;
    const svc = new HIDScannerService({
      onScan: (barcode) => handleScan(barcode),
      onError: (err) => toast.error(err.message),
    });
    svc.start();
    return () => svc.stop();
  }, [source]);

  const handleScan = async (barcode: string) => {
    const existing = items.find((i) => i.barcode === barcode);
    if (existing) {
      setItems((prev) => prev.map((i) =>
        i.barcode === barcode ? { ...i, quantity: i.quantity + 1, timestamp: Date.now() } : i
      ));
      return;
    }
    // Look up product by barcode
    const newItem: ScannedItem = {
      barcode, product: null, quantity: 1, status: 'pending', timestamp: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?barcode_value=eq.${encodeURIComponent(barcode)}&select=id,name,sku,stock_quantity,price,hsn_code`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${(await (await import('@/lib/supabase/client')).supabase.auth.getSession()).data.session!.access_token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      if (data.length === 0) {
        setItems((prev) => prev.map((i) =>
          i.barcode === barcode ? { ...i, status: 'unknown', error: 'Product not found' } : i
        ));
        return;
      }
      setItems((prev) => prev.map((i) =>
        i.barcode === barcode ? { ...i, product: data[0], status: 'resolved' } : i
      ));
    } catch (err) {
      setItems((prev) => prev.map((i) =>
        i.barcode === barcode ? { ...i, status: 'error', error: (err as Error).message } : i
      ));
    }
  };

  const handleSubmit = async () => {
    const valid = items.filter((i) => i.product && i.status === 'resolved');
    if (valid.length === 0) return toast.error('No valid items to commit');
    setSubmitting(true);
    try {
      for (const item of valid) {
        await invokeEdgeFunction({
          functionName: 'scan-logger',
          body: {
            product_id: item.product!.id,
            movement_type: MOVEMENT_TYPE_MAP[mode],
            from_location_id: fromLocation || undefined,
            to_location_id: toLocation || undefined,
            quantity: item.quantity,
            reference_type: mode === 'receive' ? 'purchase_order' : 'stock_count',
            reference_id: reference || undefined,
            barcode_scanned: item.barcode,
            scan_method: source,
          },
        });
      }
      toast.success(`Logged ${valid.length} item(s)`);
      setItems([]);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Scanning</h1>
        <Select value={mode} onChange={(e) => setMode(e.target.value as ScanMode)} className="w-48">
          <option value="receive">Receive (PO/GRN)</option>
          <option value="pick">Pick (Order fulfillment)</option>
          <option value="stock_count">Stock count (Audit)</option>
          <option value="transfer">Transfer (Inter-location)</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Scan Source
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant={source === 'camera' ? 'primary' : 'outline'} onClick={() => setSource('camera')}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant={source === 'usb_hid' ? 'primary' : 'outline'} onClick={() => setSource('usb_hid')}>
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {source === 'camera' ? (
                <BarcodeScanner onScan={(r) => handleScan(r.text)} />
              ) : (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <Keyboard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Hardware scanner ready</p>
                  <p className="text-xs text-muted-foreground">Trigger the scanner — readings will appear instantly.</p>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Or type barcode manually…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScan((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Reference</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(mode === 'receive' || mode === 'transfer') && (
                <Input placeholder="PO / Transfer ID" value={reference} onChange={(e) => setReference(e.target.value)} />
              )}
              {mode === 'transfer' && (
                <>
                  <Input placeholder="From location" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
                  <Input placeholder="To location" value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scanned Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No items scanned yet</p>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.barcode}-${item.timestamp}`}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    {item.status === 'resolved' && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {item.status === 'unknown' && <AlertCircle className="h-5 w-5 text-destructive" />}
                    {item.status === 'pending' && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                    <div className="flex-1 min-w-0">
                      {item.product ? (
                        <>
                          <p className="truncate font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {item.product.sku} • Stock: {item.product.stock_quantity}
                          </p>
                        </>
                      ) : (
                        <p className="font-mono text-xs">{item.barcode}</p>
                      )}
                      {item.error && <p className="text-xs text-destructive">{item.error}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() =>
                        setItems((prev) => prev.map((i) => i === item ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
                      }><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                      <Button size="icon" variant="ghost" onClick={() =>
                        setItems((prev) => prev.map((i) => i === item ? { ...i, quantity: i.quantity + 1 } : i))
                      }><Plus className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" onClick={() =>
                        setItems((prev) => prev.filter((i) => i !== item))
                      }><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={handleSubmit} loading={submitting} disabled={items.length === 0} className="mt-4 w-full">
              <Package className="mr-2 h-4 w-4" /> Commit {items.filter((i) => i.status === 'resolved').length} item(s)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
