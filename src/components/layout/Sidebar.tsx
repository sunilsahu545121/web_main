import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShieldCheck, Map, Globe2,
  RotateCcw, MessageCircle, Users, Building2, FileText,
  Store, Package, ScanBarcode, Image, Tag, Calculator, Truck,
  PieChart, Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/orders', label: 'Order Board', icon: ShoppingCart, roles: ['super_admin', 'zone_manager', 'hub', 'delivery_center', 'franchise', 'field_agent'] },
  { to: '/admin/kyc', label: 'KYC Approvals', icon: ShieldCheck, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/zones', label: 'Zones', icon: Map, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/zones/map', label: 'Zone Map', icon: Map, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/geocoder', label: 'Bulk Geocoder', icon: Globe2, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/distance', label: 'Distance Calculator', icon: Calculator, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/support', label: 'Support', icon: MessageCircle, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/staff', label: 'Staff', icon: Users, roles: ['super_admin'] },
  { to: '/admin/fleet', label: 'Fleet Management', icon: Truck, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/hubs', label: 'Hubs & Centers', icon: Building2, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/delivery-centers', label: 'Delivery Centers', icon: Building2, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/documents', label: 'Documents', icon: FileText, roles: ['super_admin', 'zone_manager'] },
  { to: '/admin/banners', label: 'Banners', icon: Image, roles: ['super_admin'] },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag, roles: ['super_admin'] },
  { to: '/admin/reports', label: 'Reports', icon: PieChart, roles: ['super_admin'] },
  { to: '/admin/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
  { to: '/seller', label: 'Seller Dashboard', icon: Store, roles: ['seller'] },
  { to: '/seller/products', label: 'Products', icon: Package, roles: ['seller'] },
  { to: '/seller/coupons', label: 'Coupons', icon: Tag, roles: ['seller'] },
  { to: '/seller/labels', label: 'Labels', icon: FileText, roles: ['seller'] },
  { to: '/seller/settings', label: 'Settings', icon: Settings, roles: ['seller'] },
  { to: '/scanner', label: 'Scanner', icon: ScanBarcode, roles: ['super_admin', 'zone_manager', 'seller', 'hub', 'delivery_center'] },
];

export function Sidebar() {
  const { role } = useAuth();
  const items = NAV.filter((n) => role && n.roles.includes(role));

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold text-primary">Krixify</span>
        <span className="ml-2 text-xs text-muted-foreground">Web Panel</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
