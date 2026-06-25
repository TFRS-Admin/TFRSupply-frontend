import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { ConfiguratorProvider } from '@/context/ConfiguratorContext';

// Page imports
import StoreLanding from '@/pages/StoreLanding';
import VerticalLandingTemplate from '@/pages/VerticalLandingTemplate';
import CategoryTemplate from '@/pages/CategoryTemplate';
import ProductDetailTemplate from '@/pages/ProductDetailTemplate';
import FamilyPage from '@/pages/FamilyPage';
import ConfiguratorWizard from '@/pages/ConfiguratorWizard';
import BuildReview from '@/pages/BuildReview';
import CheckoutDecision from '@/pages/CheckoutDecision';
import AdminDebugSummary from '@/pages/AdminDebugSummary';
import ComponentShowcase from '@/pages/ComponentShowcase';
import ResourcesPage from '@/pages/ResourcesPage.jsx';

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
    <ConfiguratorProvider>
      <Routes>
        <Route path="/" element={<StoreLanding />} />

        {/* Template-driven routes — JSON-powered, no new pages needed */}
        <Route path="/:verticalId" element={<VerticalLandingTemplate />} />
        <Route path="/:verticalId/:categoryId" element={<CategoryTemplate />} />
        <Route path="/:verticalId/:categoryId/:productId" element={<ProductDetailTemplate />} />

        {/* Legacy configurator routes */}
        <Route path="/configure/:familyId/step/:stepId" element={<ConfiguratorWizard />} />
        <Route path="/configure/:familyId/review" element={<BuildReview />} />
        <Route path="/configure/:familyId/checkout" element={<CheckoutDecision />} />

        {/* Static pages */}
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/admin/debug" element={<AdminDebugSummary />} />
        <Route path="/showcase" element={<ComponentShowcase />} />
        <Route path="/showcase/:categoryId" element={<ComponentShowcase />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ConfiguratorProvider>
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