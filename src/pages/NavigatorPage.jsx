import React from 'react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';
import ProductHero from '@/components/product/ProductHero';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import productData from '@/data/products/navigator.json';

export default function NavigatorPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner />
      <SiteHeader activeVertical="police" activeCategory="Light Bars" />
      <ProductBreadcrumb crumbs={productData.breadcrumbs} />
      <ProductHero
        title={productData.title}
        bullets={productData.summary_bullets}
        images={productData.images}
        actions={productData.actions}
        tabs={productData.tabs}
      />
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <NavigatorTabs />
        </div>
      </div>
      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}