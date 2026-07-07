// @ts-nocheck
import { Link } from 'react-router-dom';
import { useZones } from '@/lib/api/zones';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Map } from 'lucide-react';

export function ZoneList() {
  const { data: zones, isLoading } = useZones();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Serviceable Zones</h1>
        <Link to="/admin/zones/map">
          <Button variant="outline"><Map className="h-4 w-4" /> Open Map Editor</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {zones?.map((zone) => (
          <Card key={zone.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{zone.name}</h3>
                <p className="text-xs text-muted-foreground">Manager: {zone.manager?.full_name ?? '—'}</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div><dt className="text-muted-foreground">Pincodes</dt><dd className="font-medium">{zone.pincodes.length}</dd></div>
              <div><dt className="text-muted-foreground">Delivery</dt><dd className="font-medium">₹{zone.delivery_charge}</dd></div>
              <div><dt className="text-muted-foreground">Min Order</dt><dd className="font-medium">₹{zone.min_order_value}</dd></div>
              <div><dt className="text-muted-foreground">ETA</dt><dd className="font-medium">{zone.eta_minutes} min</dd></div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
