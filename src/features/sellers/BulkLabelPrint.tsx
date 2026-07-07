import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Printer, Download } from 'lucide-react';
import { generateLabelPDF, LabelData } from '@/lib/barcode/label';
import { generateEAN13, generateSKU } from '@/lib/barcode/encoder';
import { printService } from '@/lib/printer/printService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function BulkLabelPrint() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);

  const { data: products } = useQuery<any[]>({
    queryKey: ['products-unlabelled', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, barcode_value, price, mrp, weight, batch_number, expiry_date, brand, hsn_code, category')
        .eq('seller_id', user!.id);
      if (error) throw error;
      return data;
    },
  });

  const generateBarcodes = useMutation({
    mutationFn: async (productIds: string[]) => {
      const updates = productIds.map((id) => {
        const product = products?.find((p) => p.id === id);
        if (!product) return null;
        return {
          id,
          barcode_value: product.barcode_value ?? generateEAN13(id),
          sku: product.sku || generateSKU(product.category ?? 'GEN', id),
        };
      }).filter(Boolean);
      const { error } = await supabase.from('products').upsert(updates as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products-unlabelled'] }),
  });

  const buildLabels = (): LabelData[] =>
    (products ?? [])
      .filter((p) => selected.has(p.id))
      .map((p) => ({
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode_value ?? generateEAN13(p.id),
        price: p.price,
        mrp: p.mrp,
        weight: p.weight,
        batchNumber: p.batch_number,
        expiryDate: p.expiry_date,
        brand: p.brand,
        hsnCode: p.hsn_code,
        countryOfOrigin: 'India',
      }));

  const downloadBulk = () => {
    const labels = buildLabels();
    if (labels.length === 0) return;
    const pdf = generateLabelPDF(labels, {
      size: 'thermal_4x2', showPrice: true, showMRP: true, showName: true,
      showBrand: true, showWeight: true, showBatch: true, showExpiry: true,
      showHSN: true, barcodeFormat: 'CODE128', barcodeHeight: 22,
      fontSize: { name: 11, price: 20, meta: 7 }, layout: 'stacked',
    });
    pdf.save(`labels-batch-${Date.now()}.pdf`);
  };

  const printBulk = async () => {
    setPrinting(true);
    try {
      const labels = buildLabels();
      await printService.printBulk(labels, {
        size: 'thermal_4x2', showPrice: true, showMRP: true, showName: true,
        showBrand: true, showWeight: true, showBatch: true, showExpiry: true,
        showHSN: true, barcodeFormat: 'CODE128', barcodeHeight: 22,
        fontSize: { name: 11, price: 20, meta: 7 }, layout: 'stacked',
      }, { method: 'usb', cut: true });
      toast.success(`Printed ${labels.length} labels`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bulk Label Printing</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => generateBarcodes.mutate(Array.from(selected))}
            loading={generateBarcodes.isPending}
            disabled={selected.size === 0}
            variant="outline"
          >
            Generate Missing Barcodes
          </Button>
          <Button onClick={downloadBulk} variant="outline" disabled={selected.size === 0}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={printBulk} disabled={selected.size === 0} loading={printing}>
            <Printer className="mr-2 h-4 w-4" /> Print {selected.size} label(s)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Products ({selected.size} selected)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">
                    <input type="checkbox" onChange={(e) => {
                      setSelected(e.target.checked ? new Set(products?.map((p) => p.id) ?? []) : new Set());
                    }} />
                  </th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Barcode</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          e.target.checked ? next.add(p.id) : next.delete(p.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.barcode_value ?? '—'}</td>
                    <td className="px-3 py-2">
                      {p.barcode_value
                        ? <Badge variant="success">Ready</Badge>
                        : <Badge variant="warning">Needs barcode</Badge>}
                    </td>
                    <td className="px-3 py-2">
                      <Link to={`/seller/labels/design/${p.id}`} className="text-primary hover:underline">
                        Design Label
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
