import jsPDF from 'jspdf';
import { renderBarcode } from './encoder';

export type LabelSize = 'thermal_2x1' | 'thermal_4x2' | 'thermal_4x6' | 'avery_5160' | 'avery_5163' | 'custom';

export interface LabelDimensions {
  width: number;   // mm
  height: number;  // mm
}

export const LABEL_PRESETS: Record<LabelSize, LabelDimensions> = {
  thermal_2x1: { width: 50.8, height: 25.4 },   // 2" x 1" shipping
  thermal_4x2: { width: 101.6, height: 50.8 },  // 4" x 2" product
  thermal_4x6: { width: 101.6, height: 152.4 }, // 4" x 6" shipping
  avery_5160: { width: 66.7, height: 25.4 },   // 30 per page
  avery_5163: { width: 101.6, height: 50.8 },  // 10 per page
  custom: { width: 100, height: 50 },
};

export interface LabelData {
  productName: string;
  sku: string;
  barcode: string;
  price: number;
  mrp?: number;
  weight?: string;
  batchNumber?: string;
  expiryDate?: string;
  manufacturedDate?: string;
  brand?: string;
  category?: string;
  variant?: string;
  hsnCode?: string;
  countryOfOrigin?: string;
}

export interface LabelDesignConfig {
  size: LabelSize;
  dimensions?: LabelDimensions;
  showPrice: boolean;
  showMRP: boolean;
  showWeight: boolean;
  showBatch: boolean;
  showExpiry: boolean;
  showName: boolean;
  showBrand: boolean;
  showHSN: boolean;
  barcodeFormat: 'CODE128' | 'EAN13' | 'CODE39';
  barcodeHeight: number;     // mm
  fontSize: {
    name: number;
    price: number;
    meta: number;
  };
  layout: 'horizontal' | 'stacked';
}

/**
 * Generates a professional PDF with one or more labels arranged for the chosen sheet/roll.
 */
export function generateLabelPDF(labels: LabelData[], config: LabelDesignConfig): jsPDF {
  const dims = config.dimensions ?? LABEL_PRESETS[config.size];
  const pdf = new jsPDF({
    orientation: dims.width > dims.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [dims.width, dims.height],
  });

  labels.forEach((label, index) => {
    if (index > 0) pdf.addPage([dims.width, dims.height], dims.width > dims.height ? 'landscape' : 'portrait');
    drawLabel(pdf, label, config, dims);
  });

  return pdf;
}

function drawLabel(
  pdf: jsPDF,
  data: LabelData,
  config: LabelDesignConfig,
  dims: LabelDimensions
): void {
  const padding = 2;
  const w = dims.width;
  const h = dims.height;
  let y = padding;

  // Border (optional, for preview)
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.1);
  pdf.rect(padding, padding, w - 2 * padding, h - 2 * padding);

  // Brand header
  if (config.showBrand && data.brand) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(80);
    pdf.text(data.brand.toUpperCase(), w / 2, y + 2, { align: 'center' });
    y += 4;
  }

  if (config.layout === 'horizontal' && w > h) {
    // Left: text block, Right: barcode
    const textW = w * 0.55;
    if (config.showName) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(config.fontSize.name);
      pdf.setTextColor(0);
      const lines = pdf.splitTextToSize(data.productName, textW - 4);
      pdf.text(lines.slice(0, 2), padding + 1, y + 4);
      y += Math.min(lines.length, 2) * 4;
    }
    if (data.variant) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100);
      pdf.text(data.variant, padding + 1, y + 3);
      y += 4;
    }
    if (config.showPrice) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(config.fontSize.price);
      pdf.setTextColor(0);
      pdf.text(`₹${data.price}`, padding + 1, y + 5);
    }
    if (config.showMRP && data.mrp && data.mrp > data.price) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(150);
      pdf.text(`MRP ₹${data.mrp}`, padding + 1, y + 10);
    }
    // Barcode on the right
    const bcX = textW;
    const bcW = w - textW - padding;
    const bcH = h - 2 * padding - 4;
    drawBarcodeOnPDF(pdf, data.barcode, config.barcodeFormat, bcX, padding + 2, bcW, bcH);
  } else {
    // Stacked layout
    if (config.showName) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(config.fontSize.name);
      pdf.setTextColor(0);
      const lines = pdf.splitTextToSize(data.productName, w - 2 * padding);
      pdf.text(lines.slice(0, 2), w / 2, y + 4, { align: 'center' });
      y += Math.min(lines.length, 2) * 4 + 1;
    }
    // Barcode center
    const bcH = config.barcodeHeight;
    const bcW = w - 2 * padding - 4;
    drawBarcodeOnPDF(pdf, data.barcode, config.barcodeFormat, padding + 2, y, bcW, bcH);
    y += bcH;
    // Meta row
    if (config.showPrice) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(config.fontSize.price);
      pdf.setTextColor(0);
      pdf.text(`₹${data.price}`, padding + 1, y + 4);
    }
    if (config.showMRP && data.mrp && data.mrp > data.price) {
      pdf.setFont('helvetica', 'strikethrough');
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`MRP ₹${data.mrp}`, w / 2, y + 4, { align: 'center' });
    }
    if (config.showWeight && data.weight) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(80);
      pdf.text(data.weight, w - padding - 1, y + 4, { align: 'right' });
    }
    y += 6;
    if (config.showBatch || config.showExpiry) {
      pdf.setFontSize(config.fontSize.meta);
      pdf.setTextColor(100);
      const meta: string[] = [];
      if (config.showBatch && data.batchNumber) meta.push(`Batch: ${data.batchNumber}`);
      if (config.showExpiry && data.expiryDate) meta.push(`Exp: ${data.expiryDate}`);
      if (meta.length) pdf.text(meta.join('  •  '), w / 2, y, { align: 'center' });
      y += 4;
    }
    if (config.showHSN && data.hsnCode) {
      pdf.setFontSize(6);
      pdf.setTextColor(120);
      pdf.text(`HSN: ${data.hsnCode} | Made in ${data.countryOfOrigin ?? 'India'}`, w / 2, y, { align: 'center' });
    }
  }
}

function drawBarcodeOnPDF(
  pdf: jsPDF,
  value: string,
  format: 'CODE128' | 'EAN13' | 'CODE39',
  x: number, y: number, w: number, h: number
): void {
  const canvas = renderBarcode({ format, value, height: Math.round(h * 8), displayValue: true, margin: 0, width: 1.5 });
  const dataUrl = canvas.toDataURL('image/png');
  const aspect = canvas.width / canvas.height;
  let drawW = w;
  let drawH = drawW / aspect;
  if (drawH > h) { drawH = h; drawW = drawH * aspect; }
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;
  pdf.addImage(dataUrl, 'PNG', drawX, drawY, drawW, drawH);
}
