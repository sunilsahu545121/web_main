// @ts-nocheck
import { MapContainer, TileLayer, Polygon, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useZones } from '@/lib/api/zones';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCreateZone } from '@/lib/api/zones';
import { useState } from 'react';
import { toast } from 'sonner';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function ZoneMapPage() {
  const { data: zones } = useZones();
  const { mutate: createZone, isPending } = useCreateZone();
  const [draftPolygon, setDraftPolygon] = useState<GeoJSON.Polygon | null>(null);
  const [name, setName] = useState('');

  const handleCreated = (e: any) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0].map((p: L.LatLng) => [p.lng, p.lat]);
    setDraftPolygon({
      type: 'Polygon',
      coordinates: [[...latlngs, latlngs[0]]],
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
          {zones?.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.polygon.coordinates[0].map(([lng, lat]) => [lat, lng]) as L.LatLngExpression[]}
              pathOptions={{ color: 'hsl(250, 84%, 64%)', fillOpacity: 0.2 }}
            >
              <Popup>
                <strong>{zone.name}</strong><br />
                {zone.pincodes.length} pincodes • ₹{zone.delivery_charge} delivery
              </Popup>
            </Polygon>
          ))}
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
                createZone(
                  {
                    name,
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
