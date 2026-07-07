import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

export type ScanFormat =
  | 'qr_code' | 'code_128' | 'code_39' | 'ean_13' | 'ean_8'
  | 'upc_a' | 'upc_e' | 'itf' | 'codabar' | 'data_matrix' | 'pdf_417';

export interface ScanResult {
  text: string;
  format: BarcodeFormat | string;
  timestamp: number;
}

export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;

  constructor() {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.reader = new BrowserMultiFormatReader(hints);
  }

  async listCameras(): Promise<MediaDeviceInfo[]> {
    // Request permission first to get labelled device names
    await this.requestCameraPermission();
    return await BrowserMultiFormatReader.listVideoInputDevices();
  }

  private async requestCameraPermission(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }

  async startScanning(
    videoElement: HTMLVideoElement,
    deviceId: string | null,
    onResult: (result: ScanResult) => void,
    onError?: (err: Error) => void
  ): Promise<void> {
    this.stopScanning();
    this.controls = await this.reader.decodeFromVideoDevice(
      deviceId || undefined,
      videoElement,
      (result, error) => {
        if (result) {
          onResult({
            text: result.getText(),
            format: result.getBarcodeFormat(),
            timestamp: Date.now(),
          });
        } else if (error && error.name !== 'NotFoundException' && onError) {
          onError(error);
        }
      }
    );
  }

  stopScanning(): void {
    if (this.controls) {
      this.controls.stop();
      this.controls = null;
    }
  }

  /**
   * Scans a single barcode from an image file (for bulk scanning of receipts, etc.)
   */
  async scanImage(image: HTMLImageElement | string): Promise<ScanResult | null> {
    let src: string;
    if (typeof image === 'string') {
      src = image;
    } else {
      src = image.src;
    }
    try {
      const result = await this.reader.decodeFromImageUrl(src);
      return { text: result.getText(), format: result.getBarcodeFormat(), timestamp: Date.now() };
    } catch {
      return null;
    }
  }
}
