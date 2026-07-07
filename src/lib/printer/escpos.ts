import { renderBarcode, BarcodeFormat } from '@/lib/barcode/encoder';

const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

export class ESCPOSBuilder {
  private bytes: number[] = [];

  static init(): ESCPOSBuilder {
    const b = new ESCPOSBuilder();
    b.bytes.push(ESC, 0x40); // ESC @ — initialize
    return b;
  }

  setAlign(alignment: 'left' | 'center' | 'right'): this {
    const map = { left: 0, center: 1, right: 2 };
    this.bytes.push(ESC, 0x61, map[alignment]);
    return this;
  }

  setBold(on: boolean): this {
    this.bytes.push(ESC, 0x45, on ? 0x01 : 0x00);
    return this;
  }

  setTextSize(width: number, height: number): this {
    const w = Math.max(0, Math.min(7, width - 1));
    const h = Math.max(0, Math.min(7, height - 1));
    this.bytes.push(GS, 0x21, (h << 4) | w);
    return this;
  }

  setInverse(on: boolean): this {
    this.bytes.push(GS, 0x42, on ? 0x01 : 0x00);
    return this;
  }

  text(value: string): this {
    for (const ch of value) this.bytes.push(ch.charCodeAt(0) & 0xFF);
    return this;
  }

  newline(): this {
    this.bytes.push(LF);
    return this;
  }

  feed(lines: number): this {
    for (let i = 0; i < lines; i++) this.bytes.push(LF);
    return this;
  }

  cut(partial = false): this {
    this.bytes.push(GS, 0x56, partial ? 0x01 : 0x00);
    return this;
  }

  setLineSpacing(n: number): this {
    this.bytes.push(ESC, 0x33, n);
    return this;
  }

  /**
   * Print a GS1-128 (CODE128) barcode via printer hardware rasterization.
   */
  printBarcode(value: string, format: BarcodeFormat = 'CODE128', height: number = 80): this {
    const formatMap: Record<BarcodeFormat, number> = {
      UPC: 65, EAN13: 67, EAN8: 68, CODE39: 69, ITF14: 70,
      codabar: 71, CODE93: 72, CODE128: 73,
    };
    this.bytes.push(GS, 0x68, height);             // Height
    this.bytes.push(GS, 0x77, 2);                  // Width multiplier
    this.bytes.push(GS, 0x6B, formatMap[format]);  // Format
    for (const ch of value) this.bytes.push(ch.charCodeAt(0) & 0xFF);
    this.bytes.push(0x00);                          // Terminator
    return this;
  }

  /**
   * Render a barcode as raster graphics (works on any printer, not just those
   * with native barcode firmware).
   */
  printBarcodeRaster(value: string, format: BarcodeFormat, maxWidthMM: number = 60): this {
    const canvas = renderBarcode({
      format, value, displayValue: true, height: 100, width: 1.5, margin: 4, fontSize: 14,
    });
    const data = rasterizeCanvasToESCPOS(canvas, maxWidthMM);
    this.bytes.push(...data);
    return this;
  }

  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

/**
 * Converts a canvas to ESC/POS GS v 0 raster bit image format.
 * Uses the legacy GS v 0 (raster bit image) which is universally supported.
 */
function rasterizeCanvasToESCPOS(canvas: HTMLCanvasElement, maxWidthMM: number): number[] {
  // ESC/POS standard 8-dot density at 203 DPI = 8 dots/mm
  const dotsPerMM = 8;
  const maxWidthDots = Math.floor(maxWidthMM * dotsPerMM);
  const scale = maxWidthDots / canvas.width;
  const heightDots = Math.floor(canvas.height * scale);

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = maxWidthDots;
  tmpCanvas.height = heightDots;
  const ctx = tmpCanvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
  ctx.drawImage(canvas, 0, 0, tmpCanvas.width, tmpCanvas.height);
  const imageData = ctx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);

  const bytesPerLine = Math.ceil(maxWidthDots / 8);
  const result: number[] = [];
  result.push(GS, 0x76, 0x30, 0x00);
  result.push(bytesPerLine & 0xFF, (bytesPerLine >> 8) & 0xFF);
  result.push(heightDots & 0xFF, (heightDots >> 8) & 0xFF);

  for (let y = 0; y < heightDots; y++) {
    for (let xByte = 0; xByte < bytesPerLine; xByte++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = xByte * 8 + bit;
        const idx = (y * tmpCanvas.width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
        if (luminance < 128) byte |= (1 << (7 - bit));
      }
      result.push(byte);
    }
  }
  return result;
}
