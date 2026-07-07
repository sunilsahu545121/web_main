import { USBPrinter } from './usb';
import { ESCPOSBuilder } from './escpos';
import { LabelData, LabelDesignConfig } from '@/lib/barcode/label';
import { toast } from 'sonner';

export type PrintMethod = 'usb' | 'bluetooth' | 'system' | 'pdf';

export interface PrintOptions {
  method: PrintMethod;
  copies?: number;
  cut?: boolean;
}

export class PrintService {
  private usbPrinter: USBPrinter | null = null;

  async pairUSB(): Promise<void> {
    this.usbPrinter = new USBPrinter();
    await this.usbPrinter.request();
    toast.success('USB printer paired');
  }

  async printLabel(label: LabelData, design: LabelDesignConfig, options: PrintOptions = { method: 'usb' }): Promise<void> {
    const copies = options.copies ?? 1;
    for (let i = 0; i < copies; i++) {
      switch (options.method) {
        case 'usb':
          await this.printViaUSB(label, design, options.cut);
          break;
        case 'pdf':
          await this.printAsPDF(label, design);
          break;
        case 'system':
          await this.printViaSystemDialog(label, design);
          break;
        case 'bluetooth':
          throw new Error('Bluetooth printing requires native mobile app; use USB or system dialog on web.');
      }
    }
  }

  private async printViaUSB(label: LabelData, design: LabelDesignConfig, cut = true): Promise<void> {
    if (!this.usbPrinter) throw new Error('No USB printer paired.');
    const builder = ESCPOSBuilder.init().setLineSpacing(24);

    if (design.showBrand && label.brand) {
      builder.setAlign('center').setBold(true).setTextSize(1, 1).text(label.brand.toUpperCase()).newline();
    }
    if (design.showName) {
      builder.setAlign('center').setBold(true).setTextSize(2, 2).text(label.productName).newline();
    }
    if (label.variant) {
      builder.setAlign('center').setTextSize(1, 1).text(label.variant).newline();
    }
    builder.setAlign('center').printBarcodeRaster(label.barcode, design.barcodeFormat).newline();
    if (design.showPrice) {
      builder.setAlign('center').setBold(true).setTextSize(3, 3).text(`Rs.${label.price}`).newline();
    }
    if (design.showMRP && label.mrp && label.mrp > label.price) {
      builder.setAlign('center').setTextSize(1, 1).text(`MRP Rs.${label.mrp}`).newline();
    }
    if (design.showWeight && label.weight) {
      builder.setAlign('center').text(`Net Wt: ${label.weight}`).newline();
    }
    if (design.showBatch || design.showExpiry) {
      builder.setAlign('center').setTextSize(1, 1);
      if (label.batchNumber) builder.text(`Batch: ${label.batchNumber}  `);
      if (label.expiryDate) builder.text(`Exp: ${label.expiryDate}`);
      builder.newline();
    }
    if (cut) builder.cut(true);
    await this.usbPrinter.write(builder.build());
  }

  private async printAsPDF(label: LabelData, design: LabelDesignConfig): Promise<void> {
    const { generateLabelPDF } = await import('@/lib/barcode/label');
    const pdf = generateLabelPDF([label], design);
    pdf.save(`label-${label.sku}.pdf`);
  }

  private async printViaSystemDialog(label: LabelData, design: LabelDesignConfig): Promise<void> {
    const { generateLabelPDF } = await import('@/lib/barcode/label');
    const pdf = generateLabelPDF([label], design);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) throw new Error('Pop-up blocked — allow pop-ups to use system print dialog.');
    win.onload = () => win.print();
  }

  async printBulk(labels: LabelData[], design: LabelDesignConfig, options: PrintOptions): Promise<void> {
    for (const label of labels) {
      await this.printLabel(label, design, options);
    }
  }

  async disconnect(): Promise<void> {
    if (this.usbPrinter) {
      await this.usbPrinter.disconnect();
      this.usbPrinter = null;
    }
  }
}

export const printService = new PrintService();
