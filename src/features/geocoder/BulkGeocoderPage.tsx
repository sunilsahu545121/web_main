// @ts-nocheck
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '@/lib/supabase/edge-functions';
import { Download, Upload, Play } from 'lucide-react';

interface GeocodeRow { pincode: string; address?: string; lat?: number; lon?: number; status: 'pending' | 'ok' | 'error'; error?: string; }

export function BulkGeocoderPage() {
  const [rows, setRows] = useState<GeocodeRow[]>([]);
  const [batchSize, setBatchSize] = useState(50);
  const [autoSave, setAutoSave] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  const handleFile = (file: File) => {
    Papa.parse<{ pincode: string; address?: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: GeocodeRow[] = res.data
          .filter((r) => r.pincode)
          .map((r) => ({ pincode: r.pincode.trim(), address: r.address?.trim(), status: 'pending' }));
        setRows(parsed);
        toast.success(`Loaded ${parsed.length} rows`);
      },
      error: (err) => toast.error(`Parse error: ${err.message}`),
    });
  };

  const runGeocoder = async () => {
    abortRef.current = false;
    setIsProcessing(true);
    setProgress(0);

    const pending = rows.filter((r) => r.status === 'pending');
    for (let i = 0; i < pending.length; i += batchSize) {
      if (abortRef.current) break;
      const batch = pending.slice(i, i + batchSize);
      try {
        const res = await invokeEdgeFunction<{ results: Array<{ pincode: string; lat: number | null; lon: number | null; error?: string }> }>({
          functionName: 'batch-geocode',
          body: { items: batch.map((b) => ({ pincode: b.pincode, address: b.address })), save_to_db: autoSave },
        });
        setRows((prev) => prev.map((row) => {
          const result = res.results.find((r) => r.pincode === row.pincode);
          if (!result) return row;
          return {
            ...row,
            lat: result.lat ?? undefined,
            lon: result.lon ?? undefined,
            status: result.lat ? 'ok' : 'error',
            error: result.error,
          };
        }));
      } catch (err) {
        setRows((prev) => prev.map((row) =>
          batch.find((b) => b.pincode === row.pincode)
            ? { ...row, status: 'error', error: (err as Error).message }
            : row
        ));
      }
      setProgress(Math.min(100, ((i + batchSize) / pending.length) * 100));
    }
    setIsProcessing(false);
    toast.success('Geocoding complete');
  };

  const exportCsv = () => {
    const csv = Papa.unparse(rows.map((r) => ({
      pincode: r.pincode,
      address: r.address ?? '',
      latitude: r.lat ?? '',
      longitude: r.lon ?? '',
      status: r.status,
      error: r.error ?? '',
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geocoded-${Date.now()}.csv`;
    a.click();
  };

  const okCount = rows.filter((r) => r.status === 'ok').length;
  const errCount = rows.filter((r) => r.status === 'error').length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bulk Geocoder</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Batch Size</label>
              <Input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} min={1} max={500} className="mt-1" />
              <p className="mt-1 text-xs text-muted-foreground">Rows per Edge Function invocation (1 req/sec via Nominatim).</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
              Auto-save to database
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked />
              Skip already-geocoded pincodes (local cache)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked />
              Retry on error
            </label>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload & Run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex">
                <Button variant="outline" asChild={false}><Upload className="h-4 w-4" /> Upload CSV</Button>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
              <Button onClick={runGeocoder} loading={isProcessing} disabled={rows.length === 0}>
                <Play className="h-4 w-4" /> Start
              </Button>
              {isProcessing && <Button variant="destructive" onClick={() => { abortRef.current = true; }}>Stop</Button>}
              <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>

            {rows.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-muted p-2"><p className="text-xs text-muted-foreground">Total</p><p className="font-bold">{rows.length}</p></div>
                  <div className="rounded-md bg-success/10 p-2"><p className="text-xs text-muted-foreground">OK</p><p className="font-bold text-success">{okCount}</p></div>
                  <div className="rounded-md bg-destructive/10 p-2"><p className="text-xs text-muted-foreground">Errors</p><p className="font-bold text-destructive">{errCount}</p></div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {rows.length > 0 && (
        <Card>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b bg-muted/80 text-left text-xs uppercase text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-4 py-2">Pincode</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Lat</th>
                  <th className="px-4 py-2">Lon</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2 font-mono">{r.pincode}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{r.address}</td>
                    <td className="px-4 py-2 text-xs">{r.lat?.toFixed(5) ?? '—'}</td>
                    <td className="px-4 py-2 text-xs">{r.lon?.toFixed(5) ?? '—'}</td>
                    <td className="px-4 py-2 text-xs">
                      {r.status === 'ok' && <span className="text-success">✓ ok</span>}
                      {r.status === 'error' && <span className="text-destructive">✗ {r.error}</span>}
                      {r.status === 'pending' && <span className="text-muted-foreground">… pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
