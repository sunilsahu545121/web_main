/**
 * Hardware barcode scanners (Honeywell, Zebra, Datalogic) in HID mode act as keyboards.
 * This service captures rapid keystrokes and assembles them into barcodes.
 */

export interface HIDScannerConfig {
  terminatorChar?: string;   // Default: Enter
  minLength?: number;        // Min barcode length (filters accidental typing)
  maxIntervalMs?: number;    // Max ms between chars (filters human typing)
  onScan: (barcode: string) => void;
  onError?: (err: Error) => void;
}

export class HIDScannerService {
  private buffer = '';
  private lastKeyTime = 0;
  private config: Required<HIDScannerConfig>;
  private listener: ((e: KeyboardEvent) => void) | null = null;

  constructor(config: HIDScannerConfig) {
    this.config = {
      terminatorChar: 'Enter',
      minLength: 4,
      maxIntervalMs: 50,
      onError: () => { },
      ...config,
    };
  }

  start(): void {
    if (this.listener) return;
    this.listener = (e: KeyboardEvent) => this.handleKey(e);
    document.addEventListener('keydown', this.listener);
  }

  stop(): void {
    if (this.listener) {
      document.removeEventListener('keydown', this.listener);
      this.listener = null;
    }
    this.buffer = '';
  }

  private handleKey(e: KeyboardEvent): void {
    const now = performance.now();
    const interval = now - this.lastKeyTime;
    this.lastKeyTime = now;

    // Reset buffer if too much time has passed (means it was human typing)
    if (interval > this.config.maxIntervalMs && this.buffer.length > 0) {
      this.buffer = '';
    }

    if (e.key === this.config.terminatorChar) {
      if (this.buffer.length >= this.config.minLength) {
        try {
          this.config.onScan(this.buffer);
        } catch (err) {
          this.config.onError?.(err as Error);
        }
      }
      this.buffer = '';
      e.preventDefault();
      return;
    }

    if (e.key.length === 1) {
      this.buffer += e.key;
    }
  }
}
