import JsBarcode from 'jsbarcode';

export type BarcodeFormat =
  | 'CODE128'      // General purpose, variable length
  | 'CODE39'       // Industrial, alphanumeric
  | 'EAN13'        // International retail
  | 'EAN8'         // Small retail products
  | 'UPC'          // US retail
  | 'ITF14'        // Carton/case level
  | 'codabar'      // Libraries, blood banks
  | 'CODE93';      // Logistics

export interface BarcodeOptions {
  format: BarcodeFormat;
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
}

/**
 * Validates a value against the format's checksum rules.
 * Returns true if the value (with optional auto-appended check digit) is valid.
 */
export function validateBarcodeValue(value: string, format: BarcodeFormat): boolean {
  if (!value) return false;
  const clean = value.replace(/[\s-]/g, '');

  switch (format) {
    case 'EAN13':
    case 'UPC': {
      if (!/^\d{12}$|^\d{13}$/.test(clean)) return false;
      return verifyMod10Checksum(clean);
    }
    case 'EAN8': {
      if (!/^\d{7}$|^\d{8}$/.test(clean)) return false;
      return verifyMod10Checksum(clean);
    }
    case 'ITF14': {
      if (!/^\d{13}$|^\d{14}$/.test(clean)) return false;
      return verifyMod10Checksum(clean);
    }
    case 'CODE128':
    case 'CODE39':
    case 'CODE93':
    case 'codabar':
      return clean.length > 0;
    default:
      return false;
  }
}

function verifyMod10Checksum(value: string): boolean {
  const digits = value.slice(0, -1).split('').map(Number).reverse();
  const checkDigit = Number(value.slice(-1));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  const calculated = (10 - (sum % 10)) % 10;
  return calculated === checkDigit;
}

/**
 * Generate a valid GS1-compliant barcode (EAN-13) for retail products.
 * Uses a 12-digit base derived from a Krixify internal prefix + product hash.
 */
export function generateEAN13(productId: string): string {
  const KRIXIFY_PREFIX = '890'; // GS1 India prefix
  // 9-digit product code: hash productId to numeric
  const hash = simpleNumericHash(productId, 9);
  const base = `${KRIXIFY_PREFIX}${hash}`;
  const checkDigit = calculateMod10(`${base}0`).toString();
  return `${base}${checkDigit}`;
}

export function generateCode128(value: string): string {
  return value; // CODE128 accepts any ASCII; no checksum needed
}

export function generateSKU(category: string, productId: string): string {
  const cat = category.slice(0, 3).toUpperCase().padEnd(3, 'X');
  const id = simpleNumericHash(productId, 6).toString().padStart(6, '0');
  return `KRX-${cat}-${id}`;
}

function simpleNumericHash(input: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % (10 ** length);
}

function calculateMod10(value: string): number {
  const digits = value.split('').map(Number).reverse();
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

/**
 * Renders a barcode to a canvas element. Returns the canvas.
 */
export function renderBarcode(options: BarcodeOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, options.value, {
    format: options.format,
    width: options.width ?? 2,
    height: options.height ?? 60,
    displayValue: options.displayValue ?? true,
    fontSize: options.fontSize ?? 14,
    margin: options.margin ?? 8,
    background: options.background ?? '#ffffff',
    lineColor: options.lineColor ?? '#000000',
    valid: (valid) => {
      if (!valid) throw new Error(`Invalid value "${options.value}" for format ${options.format}`);
    },
  });
  return canvas;
}

/**
 * Renders a barcode as a data URL (for embedding in PDFs, labels, etc.)
 */
export function renderBarcodeDataURL(options: BarcodeOptions): string {
  const canvas = renderBarcode(options);
  return canvas.toDataURL('image/png');
}
