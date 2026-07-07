/**
 * WebUSB transport for ESC/POS compatible thermal printers
 * (Brother, Epson, Star, Xprinter, generic 58mm/80mm Chinese clones).
 */

export interface USBDeviceConfig {
  vendorId: number;
  productId?: number;
}

const KNOWN_PRINTERS: Record<string, { name: string; type: 'escpos' | 'zpl' }> = {
  '0x04b8': { name: 'Epson', type: 'escpos' },          // Epson
  '0x04f9': { name: 'Brother', type: 'escpos' },         // Brother
  '0x0519': { name: 'Star Micronics', type: 'escpos' }, // Star
  '0x0fe6': { name: 'ICS Advent', type: 'escpos' },
  '0x1a86': { name: 'QinHeng (CH340)', type: 'escpos' }, // Generic Chinese thermal
  '0x067b': { name: 'Prolific', type: 'escpos' },
  '0x0416': { name: 'Winbond', type: 'escpos' },
  '0x0483': { name: 'STMicroelectronics', type: 'escpos' },
};

export interface USBDeviceInfo {
  vendorId: number;
  productId: number;
  productName: string;
  protocol: 'escpos' | 'zpl';
}

export class USBPrinter {
  private device: any;
  private interface_: any;
  private endpointOut: any;

  async request(): Promise<void> {
    if (!('usb' in navigator)) {
      throw new Error('WebUSB is not supported in this browser. Use Chrome/Edge over HTTPS.');
    }
    const filters = Object.keys(KNOWN_PRINTERS).map((vid) => ({ vendorId: parseInt(vid, 16) }));
    this.device = await (navigator as any).usb.requestDevice({ filters });
    await this.device.open();
    if (this.device.configuration === null) await this.device.selectConfiguration(1);

    const iface = this.device.configuration.interfaces[0];
    this.interface_ = iface;
    await this.device.claimInterface(iface.interfaceNumber);

    const alt = iface.alternates[0];
    this.endpointOut = alt.endpoints.find((e: any) => e.direction === 'out');
    if (!this.endpointOut) throw new Error('No OUT endpoint found on printer.');
  }

  async connect(vendorId: number): Promise<void> {
    const devices = await (navigator as any).usb.getDevices();
    const device = devices.find((d: any) => d.vendorId === vendorId);
    if (!device) throw new Error('Printer not found. Click "Pair Printer" first.');
    this.device = device;
    await this.device.open();
    if (this.device.configuration === null) await this.device.selectConfiguration(1);
    const iface = this.device.configuration.interfaces[0];
    this.interface_ = iface;
    await this.device.claimInterface(iface.interfaceNumber);
    this.endpointOut = iface.alternates[0].endpoints.find((e: any) => e.direction === 'out');
  }

  async getPairedDevices(): Promise<USBDeviceInfo[]> {
    const devices = await (navigator as any).usb.getDevices();
    return devices.map((d: any) => ({
      vendorId: d.vendorId,
      productId: d.productId,
      productName: d.productName ?? KNOWN_PRINTERS[`0x${d.vendorId.toString(16).padStart(4, '0')}`]?.name ?? 'Unknown',
      protocol: this.detectProtocol(d.vendorId),
    }));
  }

  private detectProtocol(vendorId: number): 'escpos' | 'zpl' {
    const hex = `0x${vendorId.toString(16).padStart(4, '0')}`;
    return KNOWN_PRINTERS[hex]?.type ?? 'escpos';
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.endpointOut) throw new Error('Printer not connected.');
    // Chunked transfer to respect endpoint packet size
    const CHUNK = 64;
    for (let i = 0; i < data.length; i += CHUNK) {
      const slice = data.slice(i, i + CHUNK);
      await this.device.transferOut(this.endpointOut.endpointNumber, slice);
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      try { await this.device.releaseInterface(this.interface_.interfaceNumber); } catch { }
      try { await this.device.close(); } catch { }
    }
  }
}
