import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Laptop, Palette, Check, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ThemeMode, AccentColor } from '../../utils/theme';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSettingsModal({ isOpen, onClose }: ThemeSettingsModalProps) {
  const { themeMode, accentColor, setThemeMode, setAccentColor, showToast } = useStore();

  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode || 'light');
  const [selectedAccent, setSelectedAccent] = useState<AccentColor>(accentColor || 'teal');

  useEffect(() => {
    if (themeMode) setSelectedTheme(themeMode);
  }, [themeMode, isOpen]);

  useEffect(() => {
    if (accentColor) setSelectedAccent(accentColor);
  }, [accentColor, isOpen]);

  if (!isOpen) return null;

  const handleApplyTheme = (mode: ThemeMode) => {
    setSelectedTheme(mode);
    setThemeMode(mode);
    showToast(`Theme switched to ${mode.toUpperCase()} mode`);
  };

  const handleApplyAccent = (accent: AccentColor) => {
    setSelectedAccent(accent);
    setAccentColor(accent);
    showToast(`Accent color updated to ${accent.toUpperCase()}`);
  };

  const themeOptions: { id: ThemeMode; name: string; desc: string; icon: any; colorClass: string }[] = [
    {
      id: 'light',
      name: 'Light Theme',
      desc: 'Clean & bright interface with crisp readability',
      icon: Sun,
      colorClass: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'dark',
      name: 'Dark Theme',
      desc: 'Sleek dark background for low-light comfort',
      icon: Moon,
      colorClass: 'bg-slate-800 text-indigo-400 border-slate-700',
    },
    {
      id: 'system',
      name: 'System Default',
      desc: 'Automatically adapts to device dark/light settings',
      icon: Laptop,
      colorClass: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  ];

  const accentOptions: { id: AccentColor; name: string; hex: string; gradient: string }[] = [
    { id: 'teal', name: 'Unidwell Teal', hex: '#0EA5A4', gradient: 'from-[#0EA5A4] to-[#2563EB]' },
    { id: 'blue', name: 'Royal Blue', hex: '#2563EB', gradient: 'from-[#2563EB] to-[#4F46E5]' },
    { id: 'emerald', name: 'Emerald Green', hex: '#22C55E', gradient: 'from-[#22C55E] to-[#0EA5A4]' },
    { id: 'amber', name: 'Amber Gold', hex: '#F59E0B', gradient: 'from-[#F59E0B] to-[#D97706]' },
    { id: 'purple', name: 'Royal Purple', hex: '#8B5CF6', gradient: 'from-[#8B5CF6] to-[#6366F1]' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 dark:bg-primary-950/60 rounded-2xl text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Theme &amp; Appearance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Customize your Unidwell visual experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide">

            {/* Theme Mode Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Choose Theme Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleApplyTheme(opt.id)}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/40 shadow-sm'
                          : 'border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl border ${opt.colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white mb-0.5">{opt.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Primary Accent Color
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {accentOptions.map((accent) => {
                  const isSelected = selectedAccent === accent.id;
                  return (
                    <button
                      key={accent.id}
                      onClick={() => handleApplyAccent(accent.id)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                        isSelected
                          ? 'border-primary-500 bg-gray-50 dark:bg-slate-800 shadow-sm'
                          : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${accent.gradient} flex items-center justify-center text-white shadow-md`}>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{accent.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              Done &amp; Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
