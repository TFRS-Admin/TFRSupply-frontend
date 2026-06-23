import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";

const uiDefinitions = {
  "card": { name: "Card", description: "A container that groups related content with a border and background.", useCase: "Product displays, user profiles, dashboard widgets" },
  "badge": { name: "Badge", description: "A small label that highlights status, count, or category information.", useCase: "Notification counts, status indicators, tags" },
  "button": { name: "Button", description: "An interactive element that triggers an action when clicked.", useCase: "Form submissions, navigation, toggling states" },
  "input": { name: "Input Field", description: "A text entry area where users can type information.", useCase: "Forms, search bars, settings" },
  "toggle": { name: "Toggle Switch", description: "A binary control for switching between two states (on/off).", useCase: "Settings, preferences, feature flags" },
  "modal": { name: "Modal", description: "An overlay dialog that focuses user attention on specific content.", useCase: "Confirmations, forms, detailed views" },
  "tooltip": { name: "Tooltip", description: "A small popup that provides extra information on hover.", useCase: "Help text, abbreviation explanations, previews" },
  "avatar": { name: "Avatar", description: "A visual representation of a user, typically a profile picture or initials.", useCase: "User profiles, comments, team displays" },
  "tabs": { name: "Tabs", description: "Navigation elements that switch between different views within the same context.", useCase: "Content organization, settings pages, dashboards" },
  "slider": { name: "Slider", description: "A control for selecting a value from a range by dragging a handle.", useCase: "Volume controls, price filters, settings" },
};

export default function TeachableMoment({ type, children, enabled = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const definition = uiDefinitions[type];

  if (!enabled || !definition) return children;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none"
          >
            <div className="bg-slate-900 border border-violet-500/50 rounded-xl p-4 shadow-xl shadow-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Hover & Learn</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-1">This is a <span className="text-cyan-400">{definition.name}</span></h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-2">{definition.description}</p>
              <p className="text-slate-500 text-xs"><span className="text-violet-400">Use for:</span> {definition.useCase}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}