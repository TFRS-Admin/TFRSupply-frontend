import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Menu, X, Home, Eye, Volume2,
  Layers, Navigation, MousePointerClick, 
  MessageCircle, Bot, Heart, Wand2, BookOpen, ChevronDown
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { label: "Home", page: "Home", icon: Home },
  { label: "Explore", page: "Explore", icon: Sparkles },
  { label: "Visual", page: "VisualEffects", icon: Eye },
  { label: "Buttons", page: "ButtonEffects", icon: MousePointerClick },
  { label: "Text", page: "TextEffects", icon: Sparkles },
  { label: "Transitions", page: "Transitions", icon: Layers },
  { label: "Navigation", page: "NavigationEffects", icon: Navigation },
  { label: "Audio", page: "AudioEffects", icon: Volume2 },
  { label: "Chat", page: "ChatEffects", icon: MessageCircle },
  { label: "AI Agent", page: "AIAgentEffects", icon: Bot },
  { label: "Gaming", page: "GamingEffects", icon: Wand2 },
  { label: "Tutorials", page: "Tutorials", icon: BookOpen },
  { label: "Favorites", page: "Favorites", icon: Heart },
  { label: "Builder", page: "EffectBuilder", icon: Wand2 },
];

const moreItems = [
  { label: "Admin Layouts", page: "AdminLayouts" },
  { label: "Marketing", page: "MarketingEffects" },
  { label: "E-commerce", page: "EcommerceEffects" },
  { label: "Loading Spinners", page: "LoadingSpinners" },
  { label: "Menu Effects", page: "MenuEffects" },
  { label: "Characters", page: "CharacterEffects" },
  { label: "Icon Effects", page: "IconEffects" },
  { label: "Discover", page: "Discover" },
  { label: "My Effects", page: "MyEffects" },
  { label: "Suggestions", page: "Suggestions" },
  { label: "Color Schemes", page: "ColorSchemes" },
  { label: "Video Effects", page: "VideoEffects" },
  { label: "Abstract", page: "AbstractAnimations" },
  { label: "Page Layouts", page: "PageLayouts" },
  { label: "Sci-Fi", page: "SciFiInterfaces" },
  { label: "Creative", page: "CreativeEffects" },
  { label: "Dividers", page: "DividerEffects" },
  { label: "Social", page: "SocialEffects" },
  { label: "Content", page: "ContentEffects" },
  { label: "Productivity", page: "ProductivityEffects" },
  { label: "Communication", page: "CommunicationEffects" },
  { label: "Design Terms", page: "DesignTerminology" },
  { label: "Pixel Assets", page: "PixelAssets" },
  { label: "Donate", page: "DonationComponents" },
  { label: "Cart/Checkout", page: "CartCheckout" },
  { label: "Admin Dashboard", page: "AdminDashboard" },
  { label: "Teachable Mode", page: "TeachableMode" },
];

export default function Team44Layout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: appSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const list = await base44.entities.AppSettings.list();
      return list[0] || {};
    },
    initialData: {}
  });

  const logoUrl = appSettings?.logo_url || null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Team44" className="h-8 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                  <span className="font-bold text-white text-lg">Team44</span>
                </div>
              )}
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-2xl">
              {navItems.slice(0, 7).map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    location.pathname === createPageUrl(item.page)
                      ? "bg-violet-500/20 text-violet-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* More dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(o => !o)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  More <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto"
                      onMouseLeave={() => setMoreOpen(false)}
                    >
                      {[...navItems.slice(7), ...moreItems].map(item => (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          onClick={() => setMoreOpen(false)}
                          className="block px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 hover:border-slate-500"
              >
                ← TFR Store
              </Link>
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-slate-800 overflow-hidden"
            >
              <div className="px-4 py-4 grid grid-cols-2 gap-1 max-h-80 overflow-y-auto">
                {[...navItems, ...moreItems].map(item => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === createPageUrl(item.page)
                        ? "bg-violet-500/20 text-violet-400"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.label || item.page}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 px-4 text-center">
        <p className="text-slate-500 text-sm">
          Team44 Prompt Showcase — 850+ Effects •{" "}
          <Link to="/" className="text-violet-400 hover:text-violet-300">← Back to TFR Supply</Link>
        </p>
      </footer>
    </div>
  );
}