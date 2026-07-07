// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Route, Calculator, ArrowRight } from 'lucide-react';

const icon1 = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  className: 'hue-rotate-180' // Make it red-ish
});

const icon2 = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41]
});

function MapBounds({ p1, p2 }: { p1: [number, number], p2: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(p1, p2);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [p1, p2, map]);
  return null;
}

export function DistanceCalculator() {
  const [point1, setPoint1] = useState<[number, number]>([28.6139, 77.2090]); // Delhi
  const [point2, setPoint2] = useState<[number, number]>([28.4595, 77.0266]); // Gurgaon
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);

  useEffect(() => {
    // Calculate aerial distance using Leaflet
    const d = L.latLng(point1[0], point1[1]).distanceTo(L.latLng(point2[0], point2[1]));
    const distKm = d / 1000;
    setDistance(distKm);
    // Rough ETA: assuming 25 km/h average city speed + 10 mins buffer
    setEta(Math.round((distKm / 25) * 60) + 10);
  }, [point1, point2]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Distance & Route Calculator</h1>
        <p className="text-sm text-gray-500">Calculate delivery distances and estimated times</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-800">
              <MapPin className="h-5 w-5 text-orange-500" /> Origin Point
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Latitude</label>
                <input 
                  type="number" step="any"
                  value={point1[0]} onChange={e => setPoint1([parseFloat(e.target.value) || 0, point1[1]])}
                  className="w-full rounded-lg border p-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Longitude</label>
                <input 
                  type="number" step="any"
                  value={point1[1]} onChange={e => setPoint1([point1[0], parseFloat(e.target.value) || 0])}
                  className="w-full rounded-lg border p-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-800">
              <MapPin className="h-5 w-5 text-blue-500" /> Destination Point
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Latitude</label>
                <input 
                  type="number" step="any"
                  value={point2[0]} onChange={e => setPoint2([parseFloat(e.target.value) || 0, point2[1]])}
                  className="w-full rounded-lg border p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Longitude</label>
                <input 
                  type="number" step="any"
                  value={point2[1]} onChange={e => setPoint2([point2[0], parseFloat(e.target.value) || 0])}
                  className="w-full rounded-lg border p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-md">
            <h3 className="mb-4 flex items-center gap-2 font-bold opacity-90">
              <Calculator className="h-5 w-5" /> Results
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-orange-400 pb-2">
                <span className="text-orange-100">Aerial Distance</span>
                <span className="text-xl font-bold">{distance.toFixed(2)} km</span>
              </div>
              <div className="flex items-center justify-between border-b border-orange-400 pb-2">
                <span className="text-orange-100">Estimated Route</span>
                <span className="text-xl font-bold">{(distance * 1.3).toFixed(2)} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-100">Est. Time (ETA)</span>
                <span className="text-xl font-bold">{eta} mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="h-[600px] w-full overflow-hidden rounded-xl border bg-white shadow-sm">
            <MapContainer 
              center={[(point1[0] + point2[0])/2, (point1[1] + point2[1])/2]} 
              zoom={11} 
              className="h-full w-full z-0"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker 
                position={point1} 
                icon={icon1}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setPoint1([position.lat, position.lng]);
                  }
                }}
              />
              <Marker 
                position={point2} 
                icon={icon2}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setPoint2([position.lat, position.lng]);
                  }
                }}
              />
              <Polyline 
                positions={[point1, point2]} 
                pathOptions={{ color: '#f97316', weight: 4, dashArray: '10, 10' }} 
              />
              <MapBounds p1={point1} p2={point2} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
