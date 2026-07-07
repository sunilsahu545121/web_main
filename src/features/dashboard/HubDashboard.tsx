import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { KPICard } from '@/components/tables/KPICard';
import { Package, Truck, IndianRupee, Wallet } from 'lucide-react';

export function HubDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hub / Operations Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard title="Pending Dispatch" value={12} icon={Package} />
        <KPICard title="In Transit" value={8} icon={Truck} />
        <KPICard title="COD Balance" value="₹24,500" icon={IndianRupee} />
        <KPICard title="Wallet" value="₹5,200" icon={Wallet} />
      </div>
      <Card>
        <CardHeader><CardTitle>Dispatch Queue</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Live order dispatch queue, COD reconciliation, and field agent assignment tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
