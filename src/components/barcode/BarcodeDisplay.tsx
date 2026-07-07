import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { BarcodeFormat } from '@/lib/barcode/encoder';

interface BarcodeDisplayProps {
  value: string;
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  onError?: (err: Error) => void;
}

export function BarcodeDisplay({
  value, format = 'CODE128', width = 2, height = 60,
  displayValue = true, fontSize = 14, className, onError,
}: BarcodeDisplayProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      // JsBarcode supports SVG natively
      import('jsbarcode').then((JsBarcode) => {
        JsBarcode.default(ref.current!, value, {
          format, width, height, displayValue, fontSize, margin: 8,
        });
      });
    } catch (err) {
      onError?.(err as Error);
    }
  }, [value, format, width, height, displayValue, fontSize, onError]);

  return <svg ref={ref} className={clsx('h-auto max-w-full', className)} />;
}
