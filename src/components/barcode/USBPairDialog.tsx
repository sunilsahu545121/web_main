import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Usb, Bluetooth } from 'lucide-react';
import { printService } from '@/lib/printer/printService';
import { toast } from 'sonner';
import type { USBDeviceInfo } from '@/lib/printer/usb';

interface USBPairDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected: (info: USBDeviceInfo) => void;
}

export function USBPairDialog({ open, onClose, onConnected }: USBPairDialogProps) {
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open]);

  const refresh = async () => {
    try {
      const list = await (navigator as any).usb?.getDevices() ?? [];
      setDevices(list.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        productName: d.productName ?? 'Unknown',
        protocol: 'escpos' as const,
      })));
    } catch (err) {
      console.warn('USB enumeration failed', err);
    }
  };

  const pair = async () => {
    setBusy(true);
    try {
      await printService.pairUSB();
      await refresh();
      toast.success('Printer paired successfully');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Connect Printer">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pair a USB thermal label printer (Epson, Brother, Star, Xprinter, generic 58/80mm).
          Requires Chrome/Edge on HTTPS or localhost.
        </p>
        <div className="space-y-2">
          {devices.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No paired printers yet
            </p>
          )}
          {devices.map((d) => (
            <div key={d.vendorId} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{d.productName}</p>
                <p className="text-xs text-muted-foreground">VID: 0x{d.vendorId.toString(16).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">{d.protocol}</Badge>
                <Button size="sm" onClick={() => { onConnected(d); onClose(); }}>Use</Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={pair} loading={busy} className="w-full">
          <Usb className="mr-2 h-4 w-4" /> Pair new USB printer
        </Button>
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1"><Bluetooth className="h-3 w-3" /> Bluetooth printing is available in the Krixify mobile app.</p>
        </div>
      </div>
    </Dialog>
  );
}
