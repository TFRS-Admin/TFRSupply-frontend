import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { ConfiguratorProvider } from '@/context/ConfiguratorContext';
import { VehicleProvider } from '@/context/VehicleContext';
import { CompareProvider } from '@/context/CompareContext';
import CompareTray from '@/components/product/CompareTray';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import { SavedProductsProvider } from '@/context/SavedProductsContext';
import { FleetProjectProvider } from '@/context/FleetProjectContext';
import { FleetBuildsProvider } from '@/context/FleetBuildsContext';
import { FleetTemplatesProvider } from '@/context/FleetTemplatesContext';
import { DepartmentStandardsProvider } from '@/context/DepartmentStandardsContext';
import { UpfitBuilderProvider } from '@/context/UpfitBuilderContext';

// Page imports
import StoreLanding from '@/pages/StoreLanding';
import VerticalLandingTemplate from '@/pages/VerticalLandingTemplate';
import CategoryTemplate from '@/pages/CategoryTemplate';
import ProductDetailTemplate from '@/pages/ProductDetailTemplate';
import ProductSearchPage from '@/pages/ProductSearchPage';
import ComparePage from '@/pages/ComparePage';
import SavedProductsPage from '@/pages/SavedProductsPage';
import CartWorkspace from '@/pages/CartWorkspace';
import WorkspaceDashboard from '@/pages/WorkspaceDashboard';
import GuidedUpfitBuilderPage from '@/pages/GuidedUpfitBuilderPage';
import ProjectQuotePage from '@/pages/ProjectQuotePage';
import ProcurementPage from '@/pages/ProcurementPage';

import AdminDebugSummary from '@/pages/AdminDebugSummary';
import AdminQuotesPage from '@/pages/AdminQuotesPage';
import AdminPricingImportDashboard from '@/pages/AdminPricingImportDashboard';
import AdminQuoteBuilderPage from '@/pages/AdminQuoteBuilderPage';
import AdminShopifySyncDashboard from '@/pages/AdminShopifySyncDashboard';
import AdminSalesDashboard from '@/pages/AdminSalesDashboard';
import AdminCustomerWorkspace from '@/pages/AdminCustomerWorkspace';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ComponentShowcase from '@/pages/ComponentShowcase';
import ResourcesPage from '@/pages/ResourcesPage.jsx';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevStorefrontDashboard from '@/pages/DevStorefrontDashboard';

// Production builds ship with the admin surface (and internal dev/showcase
// tooling) stripped out entirely unless explicitly enabled — see
// docs/MASTER_EXECUTION_PROGRAM.md PR-06. All admin auth remains mock/
// client-side (issue #297); this flag is a deployment-level compensating
// control, not a substitute for real server-side enforcement.
const ADMIN_SURFACE_ENABLED = import.meta.env.VITE_ADMIN_ENABLED === 'true';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0D1B2A]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <VehicleProvider>
    <CompareProvider>
    <RecentlyViewedProvider>
    <SavedProductsProvider>
    <FleetProjectProvider>
    <FleetBuildsProvider>
    <FleetTemplatesProvider>
    <DepartmentStandardsProvider>
    <UpfitBuilderProvider>
    <ConfiguratorProvider>
      <Routes>
        <Route path="/" element={<StoreLanding />} />
        <Route path="/search" element={<ProductSearchPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/saved-products" element={<SavedProductsPage />} />
        <Route path="/cart" element={<CartWorkspace />} />
        <Route path="/workspace" element={<WorkspaceDashboard />} />
        <Route path="/upfit-builder" element={<GuidedUpfitBuilderPage />} />
        <Route path="/project-quote" element={<ProjectQuotePage />} />
        <Route path="/procurement" element={<ProcurementPage />} />

        {/* Template-driven routes — JSON-powered, no new pages needed */}
        <Route path="/:verticalId" element={<VerticalLandingTemplate />} />
        <Route path="/:verticalId/:categoryId" element={<CategoryTemplate />} />
        <Route path="/:verticalId/:categoryId/:productId" element={<ProductDetailTemplate />} />



        {/* Static pages */}
        <Route path="/resources" element={<ResourcesPage />} />

        {/* Admin surface + internal dev/showcase tooling. Every path below is
            always statically registered — even when disabled — so it keeps
            outranking the dynamic /:verticalId(/:categoryId) template routes
            above in React Router's path-specificity ranking; if these paths
            were simply omitted instead, unregistered "/admin/debug" etc.
            would fall through to CategoryTemplate's own "not found" state
            (verticalId="admin", categoryId="debug") rather than the real
            404 page. Unless VITE_ADMIN_ENABLED is set to "true", every route
            here renders PageNotFound instead, and — because the flag is
            statically inlined by Vite at build time — the unreachable admin
            page components are dead-code-eliminated out of the production
            bundle entirely, not merely hidden at runtime. Every admin route
            still requires an authenticated demo session via AdminAuthGuard
            even when the flag is on. */}
        <Route path="/admin/debug" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard><AdminDebugSummary /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/login" element={ADMIN_SURFACE_ENABLED ? <AdminLoginPage /> : <PageNotFound />} />
        <Route path="/admin" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard><AdminSalesDashboard /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/quotes" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard requiredPermission="admin.quotes.view"><AdminQuotesPage /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/customers" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard><AdminCustomerWorkspace /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/quote-builder" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard requiredPermission="admin.quote-builder.view"><AdminQuoteBuilderPage /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/pricing-imports" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard requiredPermission="admin.pricing-imports.view"><AdminPricingImportDashboard /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/admin/shopify-sync" element={
          ADMIN_SURFACE_ENABLED
            ? <AdminAuthGuard requiredPermission="admin.shopify-sync.view"><AdminShopifySyncDashboard /></AdminAuthGuard>
            : <PageNotFound />
        } />
        <Route path="/showcase" element={ADMIN_SURFACE_ENABLED ? <ComponentShowcase /> : <PageNotFound />} />
        <Route path="/showcase/:categoryId" element={ADMIN_SURFACE_ENABLED ? <ComponentShowcase /> : <PageNotFound />} />
        <Route path="/dev/storefront" element={ADMIN_SURFACE_ENABLED ? <DevStorefrontDashboard /> : <PageNotFound />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <CompareTray />
    </ConfiguratorProvider>
    </UpfitBuilderProvider>
    </DepartmentStandardsProvider>
    </FleetTemplatesProvider>
    </FleetBuildsProvider>
    </FleetProjectProvider>
    </SavedProductsProvider>
    </RecentlyViewedProvider>
    </CompareProvider>
    </VehicleProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App