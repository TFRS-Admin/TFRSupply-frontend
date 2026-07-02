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

// Page imports
import StoreLanding from '@/pages/StoreLanding';
import VerticalLandingTemplate from '@/pages/VerticalLandingTemplate';
import CategoryTemplate from '@/pages/CategoryTemplate';
import ProductDetailTemplate from '@/pages/ProductDetailTemplate';

import AdminDebugSummary from '@/pages/AdminDebugSummary';
import AdminQuotesPage from '@/pages/AdminQuotesPage';
import AdminPricingImportDashboard from '@/pages/AdminPricingImportDashboard';
import AdminQuoteBuilderPage from '@/pages/AdminQuoteBuilderPage';
import AdminShopifySyncDashboard from '@/pages/AdminShopifySyncDashboard';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ComponentShowcase from '@/pages/ComponentShowcase';
import ResourcesPage from '@/pages/ResourcesPage.jsx';
import AdminAuthGuard from '@/components/AdminAuthGuard';

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
    <ConfiguratorProvider>
      <Routes>
        <Route path="/" element={<StoreLanding />} />

        {/* Template-driven routes — JSON-powered, no new pages needed */}
        <Route path="/:verticalId" element={<VerticalLandingTemplate />} />
        <Route path="/:verticalId/:categoryId" element={<CategoryTemplate />} />
        <Route path="/:verticalId/:categoryId/:productId" element={<ProductDetailTemplate />} />



        {/* Static pages */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/admin/debug" element={<AdminDebugSummary />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/quotes" element={<AdminQuotesPage />} />
        <Route path="/admin/quote-builder" element={
          <AdminAuthGuard requiredPermission="admin.quote-builder.view">
            <AdminQuoteBuilderPage />
          </AdminAuthGuard>
        } />
        <Route path="/admin/pricing-imports" element={<AdminPricingImportDashboard />} />
        <Route path="/admin/shopify-sync" element={
          <AdminAuthGuard requiredPermission="admin.shopify-sync.view">
            <AdminShopifySyncDashboard />
          </AdminAuthGuard>
        } />
        <Route path="/showcase" element={<ComponentShowcase />} />
        <Route path="/showcase/:categoryId" element={<ComponentShowcase />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ConfiguratorProvider>
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