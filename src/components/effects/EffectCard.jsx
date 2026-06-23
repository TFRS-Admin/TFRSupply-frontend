import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code, Copy, Check, Wand2, Heart, Maximize2, Minimize2, MousePointerClick } from "lucide-react";
import ResponsivePreview from "./ResponsivePreview";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

const glitchStyles = `
  .glitch-hover-btn:hover {
    animation: btn-glitch 0.3s ease-in-out;
  }
  @keyframes btn-glitch {
    0%, 100% { transform: translate(0); }
    10% { transform: translate(-1px, 1px); }
    20% { transform: translate(1px, -1px); }
    30% { transform: translate(-1px, 0); }
    40% { transform: translate(1px, 1px); }
    50% { transform: translate(0, -1px); }
  }
`;

export default function EffectCard({
  title,
  description,
  children,
  className,
  controls,
  code = "",
  prompt = "",
  whenToUse = "",
  previewType = null,
  previewProps = {},
  interactive = false
}) {
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || 'Home';
  const previewRef = useRef(null);
  const { data: appSettings } = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const list = await base44.entities.AppSettings.list();
      return list[0] || {};
    },
    initialData: {}
  });

  const isResponsiveEnabled = appSettings?.enabled_features?.includes("responsivePreview");
  const [showResponsive, setShowResponsive] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [codeProgress, setCodeProgress] = useState(0);
  const [promptProgress, setPromptProgress] = useState(0);

  const defaultCode = code || `// ${title} Effect\nimport { motion } from "framer-motion";\n\nexport default function ${title.replace(/\s+/g, '')}() {\n  return (\n    <motion.div\n      initial={{ opacity: 0 }}\n      animate={{ opacity: 1 }}\n      className="your-styles-here"\n    >\n      {/* Effect content */}\n    </motion.div>\n  );\n}`;

  const defaultPrompt = prompt || `Create a ${title} effect using React, Tailwind CSS, and Framer Motion. ${description}`;

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (user) {
          const dbEffects = await base44.entities.SavedEffect.list();
          setSaved(dbEffects.some(e => e.name === title));
        } else {
          const savedEffects = JSON.parse(localStorage.getItem('savedEffects') || '[]');
          setSaved(savedEffects.some(e => e.name === title));
        }
      } catch (e) {
        console.error("Error checking saved status", e.message || "Unknown error");
      }
    };
    checkSaved();
    window.addEventListener('favoritesUpdated', checkSaved);
    return () => window.removeEventListener('favoritesUpdated', checkSaved);
  }, [title]);

  const incrementCopyStat = () => {
    const stored = localStorage.getItem('appStats');
    const stats = stored ? JSON.parse(stored) : { viewed: 0, copied: 0 };
    stats.copied += 1;
    localStorage.setItem('appStats', JSON.stringify(stats));
    window.dispatchEvent(new Event('statCopied'));
  };

  const handleCopyCode = async () => {
    setCodeProgress(0);
    incrementCopyStat();
    const interval = setInterval(() => {
      setCodeProgress(p => { if (p >= 100) { clearInterval(interval); return 100; } return p + 10; });
    }, 30);
    await navigator.clipboard.writeText(defaultCode);
    setTimeout(() => { setCopiedCode(true); setTimeout(() => { setCopiedCode(false); setCodeProgress(0); }, 2000); }, 300);
  };

  const handleCopyPrompt = async () => {
    setPromptProgress(0);
    incrementCopyStat();
    const interval = setInterval(() => {
      setPromptProgress(p => { if (p >= 100) { clearInterval(interval); return 100; } return p + 10; });
    }, 30);
    await navigator.clipboard.writeText(defaultPrompt);
    setTimeout(() => { setCopiedPrompt(true); setTimeout(() => { setCopiedPrompt(false); setPromptProgress(0); }, 2000); }, 300);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const dbEffects = await base44.entities.SavedEffect.list();
        const existingEffect = dbEffects.find(e => e.name === title);
        if (existingEffect) {
          await base44.entities.SavedEffect.delete(existingEffect.id);
          setSaved(false);
        } else {
          await base44.entities.SavedEffect.create({
            name: title,
            description,
            code: defaultCode,
            prompt: defaultPrompt,
            page: currentPage,
          });
          setSaved(true);
        }
      } else {
        const savedEffects = JSON.parse(localStorage.getItem('savedEffects') || '[]');
        const existingIndex = savedEffects.findIndex(e => e.name === title);
        if (existingIndex >= 0) {
          savedEffects.splice(existingIndex, 1);
          setSaved(false);
        } else {
          savedEffects.push({ id: Date.now(), name: title, description, code: defaultCode, prompt: defaultPrompt, savedAt: new Date().toISOString(), sourcePage: currentPage });
          setSaved(true);
        }
        localStorage.setItem('savedEffects', JSON.stringify(savedEffects));
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error("Error saving effect:", error.message || "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
    >
      <style>{glitchStyles}</style>
      <Card className={cn("bg-slate-900/75 border-slate-800 overflow-hidden group hover:border-slate-700 transition-colors", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg text-white truncate">{title}</CardTitle>
              <CardDescription className="text-slate-400">{description}</CardDescription>
              {whenToUse && (
                <div className="mt-2 flex items-start gap-2">
                  <span className="px-2 py-0.5 text-xs rounded bg-teal-500/20 text-teal-400 whitespace-nowrap">When to use</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{whenToUse}</span>
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-2 rounded-lg transition-all duration-300 ${saved ? "text-red-400 bg-red-500/10 hover:bg-red-500/20" : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"}`}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
              </button>
              {isResponsiveEnabled && (
                <button
                  onClick={() => setShowResponsive(s => !s)}
                  className="p-2 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                >
                  {showResponsive ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {showResponsive ? (
            <div className="p-4">
              <ResponsivePreview>
                <div ref={previewRef} className="p-6 bg-slate-950 flex items-center justify-center min-h-[200px]">
                  {children}
                </div>
              </ResponsivePreview>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div ref={previewRef} className="p-6 bg-slate-950/50 flex items-center justify-center min-h-[200px]">
                {children}
              </div>
              {controls && (
                <div className="p-6 space-y-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Controls</p>
                  {controls}
                </div>
              )}
            </div>
          )}

          <div className="p-4 border-t border-slate-800 flex flex-wrap gap-2">
            <button
              onClick={handleCopyCode}
              className="glitch-hover-btn relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 h-full bg-violet-500/20 transition-all duration-300"
                style={{ width: `${codeProgress}%` }}
              />
              <span className="relative flex items-center gap-1.5">
                {copiedCode ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? "Copied!" : "Copy Code"}
              </span>
            </button>

            <button
              onClick={handleCopyPrompt}
              className="glitch-hover-btn relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 h-full bg-cyan-500/20 transition-all duration-300"
                style={{ width: `${promptProgress}%` }}
              />
              <span className="relative flex items-center gap-1.5">
                {copiedPrompt ? <Check className="w-3 h-3 text-green-400" /> : <Wand2 className="w-3 h-3" />}
                {copiedPrompt ? "Copied!" : "Copy Prompt"}
              </span>
            </button>

            <button
              onClick={() => setShowCode(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Code className="w-3 h-3" />
              {showCode ? "Hide Code" : "View Code"}
            </button>
          </div>

          <AnimatePresence>
            {showCode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <pre className="p-4 bg-slate-950 text-green-400 text-xs font-mono overflow-x-auto max-h-48 leading-relaxed border-t border-slate-800">
                  {defaultCode}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}