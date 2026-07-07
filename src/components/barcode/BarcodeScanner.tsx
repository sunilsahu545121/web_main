import { useEffect, useRef, useState } from 'react';
import { BarcodeScanner as Scanner, ScanResult } from '@/lib/scanner/zxing';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Camera, CameraOff, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  onError?: (err: Error) => void;
  continuous?: boolean;
  scanCooldownMs?: number;
  className?: string;
}

export function BarcodeScanner({
  onScan, onError, continuous = true, scanCooldownMs = 1500, className,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<Scanner | null>(null);
  const lastScanRef = useRef<{ value: string; time: number } | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [active, setActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    scannerRef.current = new Scanner();
    scannerRef.current.listCameras()
      .then((devs) => {
        setCameras(devs);
        const rear = devs.find((d) => /back|rear|environment/i.test(d.label)) ?? devs[0];
        if (rear) setSelectedCamera(rear.deviceId);
      })
      .catch((err) => onError?.(err));
    return () => scannerRef.current?.stopScanning();
  }, [onError]);

  const start = async () => {
    if (!videoRef.current) return;
    try {
      await scannerRef.current!.startScanning(
        videoRef.current, selectedCamera || null,
        (result) => {
          const now = Date.now();
          if (lastScanRef.current && lastScanRef.current.value === result.text &&
            now - lastScanRef.current.time < scanCooldownMs) {
            return;
          }
          lastScanRef.current = { value: result.text, time: now };
          onScan(result);
          if (!continuous) stop();
        },
        (err) => onError?.(err)
      );
      setActive(true);
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const stop = () => {
    scannerRef.current?.stopScanning();
    setActive(false);
  };

  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    const track = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0] as any;
    if (track.getCapabilities?.().torch) {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((t) => !t);
    }
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="relative aspect-video overflow-hidden rounded-lg border bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
        {/* Scan reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-2/3 w-3/4 max-w-md">
            <div className="absolute inset-0 border-2 border-primary/70" />
            <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-primary" />
          </div>
        </div>
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
            <Camera className="mr-2 h-5 w-5" /> Camera off
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedCamera} onChange={(e) => setSelectedCamera(e.target.value)} disabled={active} className="flex-1">
          {cameras.length === 0 && <option value="">No cameras detected</option>}
          {cameras.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label || `Camera ${c.deviceId.slice(0, 6)}`}</option>)}
        </Select>
        <Button onClick={active ? stop : start} variant={active ? 'destructive' : 'primary'}>
          {active ? <><CameraOff className="mr-2 h-4 w-4" /> Stop</> : <><Camera className="mr-2 h-4 w-4" /> Start</>}
        </Button>
        {active && (
          <Button onClick={toggleTorch} variant="outline">
            <Zap className="mr-2 h-4 w-4" /> {torchOn ? 'Torch off' : 'Torch on'}
          </Button>
        )}
      </div>
    </div>
  );
}
