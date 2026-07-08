// @ts-nocheck
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { RoleGuard } from '@/lib/auth/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { SuperAdminDashboard } from '@/features/dashboard/SuperAdminDashboard';
import { SellerDashboard } from '@/features/dashboard/SellerDashboard';
import { HubDashboard } from '@/features/dashboard/HubDashboard';
import { OrderBoard } from '@/features/orders/OrderBoard';
import { KYCApprovalList } from '@/features/kyc/KYCApprovalList';
import { ZoneList } from '@/features/zones/ZoneList';
import { ZoneMapPage } from '@/features/zones/ZoneMapPage';
import { BulkGeocoderPage } from '@/features/geocoder/BulkGeocoderPage';
import { SellerPanel } from '@/features/sellers/SellerPanel';
import { ProductCatalog } from '@/features/sellers/ProductCatalog';
import { ReturnRefundModule } from '@/features/returns/ReturnRefundModule';
import { LiveChatModule } from '@/features/support/LiveChatModule';
import { StaffPermissions } from '@/features/staff/StaffPermissions';
import { HubManagement } from '@/features/hubs/HubManagement';
import { DocumentGenerator } from '@/features/hubs/DocumentGenerator';
import { SellerRegistration } from '@/features/onboarding/SellerRegistration';
import { ScanningPage } from '@/features/scanner/ScanningPage';
import { BulkLabelPrint } from '@/features/sellers/BulkLabelPrint';
import { LabelDesignerWrapper } from '@/features/sellers/LabelDesignerWrapper';
import { BannerManagement } from '@/features/promotions/BannerManagement';
import { CouponManagement } from '@/features/promotions/CouponManagement';
import { DistanceCalculator } from '@/features/geocoder/DistanceCalculator';
import { DeliveryCentersList } from '@/features/hubs/DeliveryCentersList';
import { FleetManagement } from '@/features/staff/FleetManagement';
import { ProfitLossReport } from '@/features/analytics/ProfitLossReport';
import { SystemSettings } from '@/features/settings/SystemSettings';
import { StoreSettings } from '@/features/settings/StoreSettings';
import { AdminPayouts } from '@/features/accounting/AdminPayouts';
import { SellerLedger } from '@/features/accounting/SellerLedger';
import { NotificationCenter } from '@/features/notifications/NotificationCenter';

const PRIVILEGED = ['super_admin', 'zone_manager'] as const;

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/admin/zones/map" element={<RoleGuard allowedRoles={[...PRIVILEGED]}><ZoneMapPage /></RoleGuard>} />
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
      </AuthProvider>
    </BrowserRouter>
  );
}
