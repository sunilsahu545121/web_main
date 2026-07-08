import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Polygon, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import {
  Map as MapIcon, Calculator, MapPin, Plus, Trash2, Search,
  RefreshCw, Save, X, ChevronRight, Layers, Ruler, Globe,
  Upload, Download, Navigation
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { supabase } from '@/lib/supabase/client';
import { clsx } from 'clsx';

// ===== Type Definitions =====
interface Zone {
  id: string;
  name: string;
  code: string;
  city: string;
  polygon: GeoJSON.Polygon;
  delivery_fee: number;
  min_order_amount: number;
  estimated_time_min: number;
  is_active: boolean;
  hub_id: string | null;
  hub_name: string | null;
  created_at: string;
}

const TABS = [
  { key: 'map', label: 'Zone Map', icon: MapIcon },
  { key: 'distance', label: 'Distance Calculator', icon: Calculator },
  { key: 'geocoder', label: 'Bulk Geocoder', icon: Globe },
] as const;

type TabKey = typeof TABS[number]['key'];

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export function ZoneManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('map');

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Zone Management</h1>
        <p className="text-sm text-slate-500 mt-1">Define serviceable zones and delivery areas</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 w-fit">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'map' && <ZoneMap />}
      {activeTab === 'distance' && <DistanceCalculator />}
      {activeTab === 'geocoder' && <BulkGeocoder />}
    </div>
  );
}

// ===== Zone Map =====
function ZoneMap() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  const { data: zones = [], isLoading, refetch } = useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zones')
        .select(`
          id, name, code, city, polygon, delivery_fee, min_order_amount,
          estimated_time_min, is_active, hub_id, created_at,
          hub:hub_id(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((z: any) => ({ ...z, hub_name: z.hub?.name || null })) as Zone[];
    },
  });

  const createZone = useMutation({
    mutationFn: async (zoneData: any) => {
      const { data, error } = await supabase.from('zones').insert(zoneData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const deleteZone = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', zoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
      setSelectedZone(null);
    },
  });

  // Handle polygon draw complete
  const handleDrawComplete = async (e: any) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    
    // Prompt user for zone details
    const name = prompt('Enter zone name:');
    if (!name) return;
    const code = prompt('Enter zone code (e.g. Z-MUM-01):');
    if (!code) return;
    const city = prompt('Enter city:') || '';

    try {
      await createZone.mutateAsync({
        name,
        code: code.toUpperCase(),
        city,
        polygon: geoJson.geometry,
        delivery_fee: 30,
        min_order_amount: 0,
        estimated_time_min: 30,
        is_active: true,
      });
    } catch (err: any) {
      alert('Error creating zone: ' + err.message);
    }
  };

  const filteredZones = zones.filter(
    (z) => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Sidebar - Zone List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Zones ({zones.length})</h3>
            <button onClick={() => refetch()} className="p-1.5 hover:bg-slate-100 rounded">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Use polygon tool on map to draw a new zone
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">No zones found</div>
          ) : (
            filteredZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={clsx(
                  'w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors',
                  selectedZone?.id === zone.id && 'bg-indigo-50 border-l-4 border-l-indigo-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{zone.name}</p>
                    <p className="text-xs text-slate-500">{zone.code} • {zone.city}</p>
                  </div>
                  <span className={clsx(
                    'w-2 h-2 rounded-full',
                    zone.is_active ? 'bg-green-500' : 'bg-slate-300'
                  )} />
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>₹{zone.delivery_fee}</span>
                  <span>•</span>
                  <span>{zone.estimated_time_min}m</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] relative">
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          <FeatureGroup
            ref={(ref) => {
              if (ref) drawnItemsRef.current = ref;
            }}
          >
            <EditControl
              position="topright"
              onCreated={handleDrawComplete}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  showArea: true,
                  shapeOptions: { color: '#4f46e5' },
                },
              }}
            />
          </FeatureGroup>

          {/* Render existing zones */}
          {zones.map((zone) => {
            if (!zone.polygon?.coordinates?.[0]) return null;
            const positions = zone.polygon.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
            return (
              <Polygon
                key={zone.id}
                positions={positions}
                pathOptions={{
                  color: selectedZone?.id === zone.id ? '#dc2626' : '#4f46e5',
                  fillColor: selectedZone?.id === zone.id ? '#dc2626' : '#6366f1',
                  fillOpacity: selectedZone?.id === zone.id ? 0.3 : 0.15,
                  weight: selectedZone?.id === zone.id ? 3 : 2,
                }}
                eventHandlers={{ click: () => setSelectedZone(zone) }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold">{zone.name}</p>
                    <p className="text-xs text-slate-600">{zone.code} • {zone.city}</p>
                    <p className="text-xs mt-1">Fee: ₹{zone.delivery_fee} | {zone.estimated_time_min}m</p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}
        </MapContainer>

        {/* Selected zone actions overlay */}
        {selectedZone && (
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-72">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900">{selectedZone.name}</h4>
                <p className="text-xs text-slate-500">{selectedZone.code}</p>
              </div>
              <button onClick={() => setSelectedZone(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between"><span className="text-slate-500">City:</span><span className="font-medium">{selectedZone.city}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Delivery Fee:</span><span className="font-medium">₹{selectedZone.delivery_fee}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Min Order:</span><span className="font-medium">₹{selectedZone.min_order_amount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ETA:</span><span className="font-medium">{selectedZone.estimated_time_min}m</span></div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete zone "${selectedZone.name}"?`)) deleteZone.mutate(selectedZone.id);
              }}
              className="w-full px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete Zone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Distance Calculator =====
function DistanceCalculator() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock distance calculation - replace with actual Google Maps / OSRM API
  const calculateDistance = async () => {
    if (!from || !to) return;
    setIsCalculating(true);
    
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    
    // Mock result
    const distance = Math.random() * 20 + 1; // km
    const duration = distance * 3 + Math.random() * 10; // minutes
    const fee = distance < 5 ? 30 : distance < 10 ? 50 : 80;
    
    setResult({
      distance: distance.toFixed(2),
      duration: Math.round(duration),
      fee,
      polyline: 'mock_polyline_data',
    });
    setIsCalculating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Distance & Fee Calculator</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">From (Pickup)</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter pickup address or lat,lng"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">To (Drop)</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter drop address or lat,lng"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={calculateDistance}
            disabled={!from || !to || isCalculating}
            className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Ruler className="w-4 h-4" />
                Calculate
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 space-y-3">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
              <p className="text-xs text-slate-500">Distance</p>
              <p className="text-2xl font-bold text-slate-900">{result.distance} km</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-lg font-bold text-slate-900">{result.duration} min</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Delivery Fee</p>
                <p className="text-lg font-bold text-green-700">₹{result.fee}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Pricing Tiers</h3>
        <div className="space-y-3">
          {[
            { range: '0 - 5 km', fee: 30, time: '20-30 min' },
            { range: '5 - 10 km', fee: 50, time: '30-45 min' },
            { range: '10 - 20 km', fee: 80, time: '45-60 min' },
            { range: '20+ km', fee: 120, time: '60+ min' },
          ].map((tier, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">{tier.range}</p>
                <p className="text-xs text-slate-500">{tier.time}</p>
              </div>
              <p className="text-lg font-bold text-indigo-600">₹{tier.fee}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Note: Replace with real Google Distance Matrix API or OSRM for production.
        </p>
      </div>
    </div>
  );
}

// ===== Bulk Geocoder =====
function BulkGeocoder() {
  const [addresses, setAddresses] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleGeocode = async () => {
    const list = addresses.split('\n').filter(Boolean);
    if (list.length === 0) return;
    setIsProcessing(true);
    setResults([]);

    const processed: any[] = [];
    for (let i = 0; i < list.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      // Mock geocoding result
      processed.push({
        address: list[i],
        lat: (19.0 + Math.random() * 1).toFixed(6),
        lng: (72.8 + Math.random() * 1).toFixed(6),
        status: Math.random() > 0.1 ? 'success' : 'failed',
      });
      setResults([...processed]);
    }
    setIsProcessing(false);
  };

  const exportCSV = () => {
    const csv = 'address,lat,lng,status\n' + results.map((r) => `${r.address},${r.lat},${r.lng},${r.status}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geocoded_addresses.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Bulk Geocoder</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Paste one address per line to convert addresses to lat/lng coordinates.
        </p>

        <textarea
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          rows={6}
          placeholder="Andheri West, Mumbai&#10;Bandra East, Mumbai&#10;Juhu, Mumbai"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGeocode}
            disabled={!addresses || isProcessing}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing {results.length}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Geocode
              </>
            )}
          </button>
          {results.length > 0 && (
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Results ({results.length})</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-600">✓ {results.filter((r) => r.status === 'success').length} success</span>
              <span className="text-red-600">✗ {results.filter((r) => r.status === 'failed').length} failed</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">Address</th>
                  <th className="px-6 py-3 text-left">Latitude</th>
                  <th className="px-6 py-3 text-left">Longitude</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-slate-700">{r.address}</td>
                    <td className="px-6 py-3 font-mono text-xs">{r.lat}</td>
                    <td className="px-6 py-3 font-mono text-xs">{r.lng}</td>
                    <td className="px-6 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
