import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { RoleGuard } from '@/lib/auth/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SuperAdminDashboard = lazy(() => import('@/features/dashboard/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const SellerDashboard = lazy(() => import('@/features/dashboard/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const HubDashboard = lazy(() => import('@/features/dashboard/HubDashboard').then(m => ({ default: m.HubDashboard })));
const OrderBoard = lazy(() => import('@/features/orders/OrderBoard').then(m => ({ default: m.OrderBoard })));
const KYCApprovalList = lazy(() => import('@/features/kyc/KYCApprovalList').then(m => ({ default: m.KYCApprovalList })));
const ZoneList = lazy(() => import('@/features/zones/ZoneList').then(m => ({ default: m.ZoneList })));
const ZoneMapPage = lazy(() => import('@/features/zones/ZoneMapPage').then(m => ({ default: m.ZoneMapPage })));
const BulkGeocoderPage = lazy(() => import('@/features/geocoder/BulkGeocoderPage').then(m => ({ default: m.BulkGeocoderPage })));
const SellerPanel = lazy(() => import('@/features/sellers/SellerPanel').then(m => ({ default: m.SellerPanel })));
const ProductCatalog = lazy(() => import('@/features/sellers/ProductCatalog').then(m => ({ default: m.ProductCatalog })));
const ReturnRefundModule = lazy(() => import('@/features/returns/ReturnRefundModule').then(m => ({ default: m.ReturnRefundModule })));
const LiveChatModule = lazy(() => import('@/features/support/LiveChatModule').then(m => ({ default: m.LiveChatModule })));
const StaffPermissions = lazy(() => import('@/features/staff/StaffPermissions').then(m => ({ default: m.StaffPermissions })));
const HubManagement = lazy(() => import('@/features/hubs/HubManagement').then(m => ({ default: m.HubManagement })));
const DocumentGenerator = lazy(() => import('@/features/hubs/DocumentGenerator').then(m => ({ default: m.DocumentGenerator })));
const SellerRegistration = lazy(() => import('@/features/onboarding/SellerRegistration').then(m => ({ default: m.SellerRegistration })));
const ScanningPage = lazy(() => import('@/features/scanner/ScanningPage').then(m => ({ default: m.ScanningPage })));
const BulkLabelPrint = lazy(() => import('@/features/sellers/BulkLabelPrint').then(m => ({ default: m.BulkLabelPrint })));
const LabelDesignerWrapper = lazy(() => import('@/features/sellers/LabelDesignerWrapper').then(m => ({ default: m.LabelDesignerWrapper })));
const BannerManagement = lazy(() => import('@/features/promotions/BannerManagement').then(m => ({ default: m.BannerManagement })));
const CouponManagement = lazy(() => import('@/features/promotions/CouponManagement').then(m => ({ default: m.CouponManagement })));
const DistanceCalculator = lazy(() => import('@/features/geocoder/DistanceCalculator').then(m => ({ default: m.DistanceCalculator })));
const DeliveryCentersList = lazy(() => import('@/features/hubs/DeliveryCentersList').then(m => ({ default: m.DeliveryCentersList })));
const FleetManagement = lazy(() => import('@/features/staff/FleetManagement').then(m => ({ default: m.FleetManagement })));
const ProfitLossReport = lazy(() => import('@/features/analytics/ProfitLossReport').then(m => ({ default: m.ProfitLossReport })));
const SystemSettings = lazy(() => import('@/features/settings/SystemSettings').then(m => ({ default: m.SystemSettings })));
const StoreSettings = lazy(() => import('@/features/settings/StoreSettings').then(m => ({ default: m.StoreSettings })));
const AdminPayouts = lazy(() => import('@/features/accounting/AdminPayouts').then(m => ({ default: m.AdminPayouts })));
const SellerLedger = lazy(() => import('@/features/accounting/SellerLedger').then(m => ({ default: m.SellerLedger })));
const NotificationCenter = lazy(() => import('@/features/notifications/NotificationCenter').then(m => ({ default: m.NotificationCenter })));

const PRIVILEGED = ['super_admin', 'zone_manager'];

function RouteLoading() {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboard/seller" element={<SellerRegistration />} />

          <Route element={<AppShell />}>
            {/* Privileged dashboards */}
            <Route path="/admin" element={
              <RoleGuard allowedRoles={[...PRIVILEGED]}>
                <SuperAdminDashboard />
              </RoleGuard>
            } />
            <Route path="/admin/orders" element={
              <RoleGuard allowedRoles={[...PRIVILEGED, 'hub', 'delivery_center', 'franchise', 'field_agent']}>
                <OrderBoard />
              </RoleGuard>
            } />
            <Route path="/admin/kyc" element={
              <RoleGuard allowedRoles={[...PRIVILEGED]}>
                <KYCApprovalList />
              </RoleGuard>
            } />
            <Route path="/admin/zones" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><ZoneList /></RoleGuard>} />
            <Route path="/admin/zones/map" element={
              <RoleGuard allowedRoles={[...PRIVILEGED]}>
                <ZoneMapPage />
              </RoleGuard>
            } />
            <Route path="/admin/geocoder" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><BulkGeocoderPage /></RoleGuard>} />
            <Route path="/admin/returns" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><ReturnRefundModule /></RoleGuard>} />
            <Route path="/admin/support" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><LiveChatModule /></RoleGuard>} />
            <Route path="/admin/staff" element={<RoleGuard allowedRoles={['super_admin']}><StaffPermissions /></RoleGuard>} />
            <Route path="/admin/hubs" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><HubManagement /></RoleGuard>} />
            <Route path="/admin/documents" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><DocumentGenerator /></RoleGuard>} />
            <Route path="/admin/banners" element={<RoleGuard allowedRoles={['super_admin']}><BannerManagement /></RoleGuard>} />
            <Route path="/admin/coupons" element={<RoleGuard allowedRoles={['super_admin']}><CouponManagement /></RoleGuard>} />
            <Route path="/admin/distance" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><DistanceCalculator /></RoleGuard>} />
            <Route path="/admin/delivery-centers" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><DeliveryCentersList /></RoleGuard>} />
            <Route path="/admin/fleet" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><FleetManagement /></RoleGuard>} />
            <Route path="/admin/reports" element={<RoleGuard allowedRoles={['super_admin']}><ProfitLossReport /></RoleGuard>} />
            <Route path="/admin/payouts" element={<RoleGuard allowedRoles={['super_admin']}><AdminPayouts /></RoleGuard>} />
            <Route path="/admin/notifications" element={<RoleGuard allowedRoles={['super_admin']}><NotificationCenter /></RoleGuard>} />
            <Route path="/admin/settings" element={<RoleGuard allowedRoles={['super_admin']}><SystemSettings /></RoleGuard>} />

            {/* Scanner */}
            <Route path="/scanner" element={
              <RoleGuard allowedRoles={['super_admin', 'zone_manager', 'seller', 'hub', 'delivery_center', 'franchise', 'field_agent']}>
                <ScanningPage />
              </RoleGuard>
            } />

            {/* Seller */}
            <Route path="/seller" element={<RoleGuard allowedRoles={['seller']}><SellerDashboard /></RoleGuard>} />
            <Route path="/seller/panel" element={<RoleGuard allowedRoles={['seller']}><SellerPanel /></RoleGuard>} />
            <Route path="/seller/products" element={<RoleGuard allowedRoles={['seller']}><ProductCatalog /></RoleGuard>} />
            <Route path="/seller/coupons" element={<RoleGuard allowedRoles={['seller']}><CouponManagement /></RoleGuard>} />
            <Route path="/seller/labels" element={<RoleGuard allowedRoles={['seller']}><BulkLabelPrint /></RoleGuard>} />
            <Route path="/seller/labels/design/:productId" element={<RoleGuard allowedRoles={['seller']}><LabelDesignerWrapper /></RoleGuard>} />
            <Route path="/seller/payouts" element={<RoleGuard allowedRoles={['seller']}><SellerLedger /></RoleGuard>} />
            <Route path="/seller/support" element={<RoleGuard allowedRoles={['seller']}><LiveChatModule /></RoleGuard>} />
            <Route path="/seller/settings" element={<RoleGuard allowedRoles={['seller']}><StoreSettings /></RoleGuard>} />

            {/* Operations */}
            <Route path="/hub" element={<RoleGuard allowedRoles={['hub', 'delivery_center', 'franchise', 'field_agent']}><HubDashboard /></RoleGuard>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
