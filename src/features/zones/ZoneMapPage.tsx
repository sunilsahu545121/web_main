// @ts-nocheck
import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreateZone, useZones } from '@/lib/api/zones';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function readPolygon(zone: any): GeoJSON.Polygon | null {
  const raw = zone?.polygon ?? zone?.geo_polygon;
  if (!raw) return null;

  let value = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const geometry = value?.type === 'Feature' ? value.geometry : value;
  if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates?.[0])) {
    return null;
  }

  return geometry as GeoJSON.Polygon;
}

function toLeafletPositions(polygon: GeoJSON.Polygon): L.LatLngExpression[] | null {
  const ring = polygon.coordinates?.[0];
  if (!Array.isArray(ring) || ring.length < 4) return null;

  const positions = ring
    .map((point) => {
      const lng = Number(point?.[0]);
      const lat = Number(point?.[1]);
      return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
    })
    .filter(Boolean) as L.LatLngExpression[];

  return positions.length >= 4 ? positions : null;
}

export function ZoneMapPage() {
  const { data: zones } = useZones();
  const { mutate: createZone, isPending } = useCreateZone();
  const [draftPolygon, setDraftPolygon] = useState<GeoJSON.Polygon | null>(null);
  const [name, setName] = useState('');

  const handleCreated = (e: any) => {
    const geometry = e.layer?.toGeoJSON?.().geometry;
    if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates?.[0])) {
      toast.error('Could not read polygon boundary. Please draw the zone again.');
      return;
    }

    const latlngs = geometry.coordinates[0]
      .map(([lng, lat]: [number, number]) => [Number(lng), Number(lat)])
      .filter(([lng, lat]: [number, number]) => Number.isFinite(lng) && Number.isFinite(lat));

    if (latlngs.length < 4) {
      toast.error('A zone boundary needs at least 3 points.');
      return;
    }

    setDraftPolygon({
      type: 'Polygon',
      coordinates: [latlngs],
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden p-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '70vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones?.map((zone: any) => {
            const polygon = readPolygon(zone);
            const positions = polygon ? toLeafletPositions(polygon) : null;
            if (!positions) return null;

            return (
              <Polygon
                key={zone.id}
                positions={positions}
                pathOptions={{ color: 'hsl(250, 84%, 64%)', fillOpacity: 0.2 }}
              >
                <Popup>
                  <strong>{zone.name}</strong><br />
                  {(zone.pincodes ?? []).length} pincodes | Rs {zone.delivery_charge ?? zone.delivery_fee ?? 0} delivery
                </Popup>
              </Polygon>
            );
          })}
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              draw={{ polygon: true, rectangle: false, circle: false, marker: false, polyline: false, circlemarker: false }}
            />
          </FeatureGroup>
        </MapContainer>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold">New Zone</h2>
        <p className="mt-1 text-xs text-muted-foreground">Draw a polygon on the map to begin.</p>
        {draftPolygon && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Zone Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button
              className="w-full"
              loading={isPending}
              onClick={() => {
                if (!name.trim()) {
                  toast.error('Zone name is required');
                  return;
                }

                createZone(
                  {
                    name: name.trim(),
                    polygon: draftPolygon,
                    pincodes: [],
                    delivery_charge: 40,
                    min_order_value: 199,
                    eta_minutes: 45,
                    free_delivery_threshold: 499,
                    manager_id: null,
                  },
                  {
                    onSuccess: () => {
                      toast.success('Zone created');
                      setDraftPolygon(null);
                      setName('');
                    },
                    onError: (error: Error) => {
                      toast.error('Zone creation failed', { description: error.message });
                    },
                  }
                );
              }}
            >
              Save Zone
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
