import { useState } from 'react';
import { LabelDesignConfig, LabelData, generateLabelPDF, LABEL_PRESETS, LabelSize } from '@/lib/barcode/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Printer, Download } from 'lucide-react';
import { printService, PrintMethod } from '@/lib/printer/printService';
import { toast } from 'sonner';

interface LabelDesignerProps {
  initialData: LabelData;
  onSave?: (design: LabelDesignConfig) => void;
}

const DEFAULT_DESIGN: LabelDesignConfig = {
  size: 'thermal_4x2',
  showPrice: true, showMRP: true, showWeight: true, showBatch: true,
  showExpiry: true, showName: true, showBrand: true, showHSN: true,
  barcodeFormat: 'CODE128', barcodeHeight: 25,
  fontSize: { name: 12, price: 22, meta: 8 },
  layout: 'stacked',
};

export function LabelDesigner({ initialData, onSave }: LabelDesignerProps) {
  const [data, setData] = useState<LabelData>(initialData);
  const [design, setDesign] = useState<LabelDesignConfig>(DEFAULT_DESIGN);
  const [copies, setCopies] = useState(1);
  const [printMethod, setPrintMethod] = useState<PrintMethod>('pdf');

  const handlePrint = async () => {
    try {
      await printService.printLabel(data, design, { method: printMethod, copies, cut: true });
      toast.success(`Sent ${copies} label(s) to ${printMethod}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generateLabelPDF([data], design);
    pdf.save(`label-${data.sku}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
      {/* Live preview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Preview ({LABEL_PRESETS[design.size].width}×{LABEL_PRESETS[design.size].height} mm)</CardTitle>
        </CardHeader>
        <CardContent className="bg-muted/30">
          <div
            className="mx-auto border bg-white shadow-sm"
            style={{
              width: `${LABEL_PRESETS[design.size].width * 3}px`,
              height: `${LABEL_PRESETS[design.size].height * 3}px`,
              padding: '12px',
              display: 'flex',
              flexDirection: design.layout === 'horizontal' && LABEL_PRESETS[design.size].width > LABEL_PRESETS[design.size].height ? 'row' : 'column',
              justifyContent: 'space-between',
              fontSize: `${design.fontSize.name * 0.3}px`,
            }}
          >
            <div className="flex flex-1 flex-col">
              {design.showBrand && data.brand && (
                <p className="text-center text-[10px] font-bold uppercase text-muted-foreground">{data.brand}</p>
              )}
              {design.showName && <p className="font-bold leading-tight">{data.productName}</p>}
              {data.variant && <p className="text-[10px] text-muted-foreground">{data.variant}</p>}
              <div className="mt-auto flex items-end justify-between">
                {design.showPrice && <p className="text-2xl font-bold">₹{data.price}</p>}
                {design.showMRP && data.mrp && data.mrp > data.price && (
                  <p className="text-xs text-muted-foreground line-through">MRP ₹{data.mrp}</p>
                )}
                {design.showWeight && data.weight && <p className="text-[10px] text-muted-foreground">{data.weight}</p>}
              </div>
              {(design.showBatch || design.showExpiry) && (
                <p className="text-[8px] text-muted-foreground">
                  {data.batchNumber && `Batch: ${data.batchNumber}`}
                  {data.batchNumber && data.expiryDate && ' • '}
                  {data.expiryDate && `Exp: ${data.expiryDate}`}
                </p>
              )}
              {design.showHSN && data.hsnCode && (
                <p className="text-[7px] text-muted-foreground">HSN: {data.hsnCode}</p>
              )}
            </div>
            <div className={design.layout === 'horizontal' ? 'ml-2 w-1/2' : 'mt-2'}>
              <BarcodeDisplay
                value={data.barcode}
                format={design.barcodeFormat}
                height={design.barcodeHeight * 2}
                fontSize={design.fontSize.meta}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Product Data</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input value={data.productName} onChange={(e) => setData({ ...data, productName: e.target.value })} placeholder="Product name" />
            <Input value={data.brand ?? ''} onChange={(e) => setData({ ...data, brand: e.target.value })} placeholder="Brand" />
            <Input value={data.variant ?? ''} onChange={(e) => setData({ ...data, variant: e.target.value })} placeholder="Variant / Size" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={data.price} onChange={(e) => setData({ ...data, price: Number(e.target.value) })} placeholder="Selling price" />
              <Input type="number" value={data.mrp ?? 0} onChange={(e) => setData({ ...data, mrp: Number(e.target.value) })} placeholder="MRP" />
            </div>
            <Input value={data.sku} onChange={(e) => setData({ ...data, sku: e.target.value })} placeholder="SKU" />
            <Input value={data.barcode} onChange={(e) => setData({ ...data, barcode: e.target.value })} placeholder="Barcode value" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={data.weight ?? ''} onChange={(e) => setData({ ...data, weight: e.target.value })} placeholder="Net weight" />
              <Input value={data.hsnCode ?? ''} onChange={(e) => setData({ ...data, hsnCode: e.target.value })} placeholder="HSN code" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={data.batchNumber ?? ''} onChange={(e) => setData({ ...data, batchNumber: e.target.value })} placeholder="Batch #" />
              <Input type="date" value={data.expiryDate ?? ''} onChange={(e) => setData({ ...data, expiryDate: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Label Design</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Size</label>
              <Select value={design.size} onChange={(e) => setDesign({ ...design, size: e.target.value as LabelSize })} className="mt-1">
                <option value="thermal_2x1">Thermal 2" × 1" (Shipping)</option>
                <option value="thermal_4x2">Thermal 4" × 2" (Product)</option>
                <option value="thermal_4x6">Thermal 4" × 6" (Shipping large)</option>
                <option value="avery_5160">Avery 5160 (30/page)</option>
                <option value="avery_5163">Avery 5163 (10/page)</option>
                <option value="custom">Custom</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Barcode Format</label>
              <Select value={design.barcodeFormat} onChange={(e) => setDesign({ ...design, barcodeFormat: e.target.value as any })} className="mt-1">
                <option value="CODE128">CODE128 (recommended)</option>
                <option value="EAN13">EAN-13 (retail)</option>
                <option value="CODE39">CODE39 (industrial)</option>
                <option value="UPC">UPC-A</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Layout</label>
              <Select value={design.layout} onChange={(e) => setDesign({ ...design, layout: e.target.value as any })} className="mt-1">
                <option value="stacked">Stacked (vertical)</option>
                <option value="horizontal">Side-by-side</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['showPrice', 'showMRP', 'showName', 'showBrand', 'showWeight', 'showBatch', 'showExpiry', 'showHSN'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={design[k]}
                    onChange={(e) => setDesign({ ...design, [k]: e.target.checked })}
                  />
                  {k.replace('show', '')}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Print</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Select value={printMethod} onChange={(e) => setPrintMethod(e.target.value as PrintMethod)}>
              <option value="pdf">Download as PDF</option>
              <option value="system">System print dialog</option>
              <option value="usb">USB thermal printer</option>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="number" min={1} max={1000} value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="w-20" />
              <span className="text-sm text-muted-foreground">copies</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
            {onSave && <Button onClick={() => onSave(design)} variant="ghost" className="w-full">Save design template</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
