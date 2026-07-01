import React from 'react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';
import ProductHero from '@/components/product/ProductHero';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import { useCatalogProduct } from '@/hooks/useCatalog';

export default function NavigatorPage() {
  const { data: productData } = useCatalogProduct('navigator');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PrototypeBanner />
      <SiteHeader activeVertical="police" activeCategory="Light Bars" />
      <ProductBreadcrumb crumbs={productData?.breadcrumbs ?? []} />
      {productData && (
        <ProductHero
          title={productData.title}
          bullets={productData.summary_bullets ?? productData.marketing?.features ?? []}
          images={productData.images ?? []}
          actions={productData.actions ?? {}}
          tabs={productData.hero_tabs ?? []}
        />
      )}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <NavigatorTabs productData={productData} />
        </div>
      </div>
      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}