import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';

export default function Register() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader activeVertical={null} />
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h1 className="font-heading text-3xl font-bold uppercase text-[#0F0F0F] mb-4">Create Agency Account</h1>
        <p className="font-body text-gray-500 mb-8 max-w-md">Shopify customer accounts are coming soon. For immediate assistance, call <strong>800-621-9959</strong> or email us.</p>
        <Link to="/" className="font-heading font-bold uppercase text-[#e21938] hover:underline">← Back to Store</Link>
      </div>
    </div>
  );
}
