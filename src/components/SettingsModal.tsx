import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AIDifficulty, BoardTheme, GameMode, GameSettings, PieceColor } from '../types/chess';
import { X, Bot, User, Palette, Volume2, Sparkles, BookOpen } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onOpenRules?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  onOpenRules,
}) => {
  if (!isOpen) return null;

  const themes: { id: BoardTheme; name: string; bg: string; desc: string }[] = [
    { id: 'artistic', name: 'Artistic Flair', bg: 'from-amber-600 via-orange-600 to-red-800', desc: 'Warm expressionist canvas' },
    { id: 'elegant', name: 'Elegant Dark', bg: 'from-amber-900 via-yellow-950 to-stone-900', desc: 'Obsidian & champagne gold' },
    { id: 'sophisticated', name: 'Sophisticated Dark', bg: 'from-slate-700 via-cyan-950 to-slate-900', desc: 'Refined slate & emerald' },
    { id: 'geometric', name: 'Geometric Balance', bg: 'from-zinc-600 via-neutral-800 to-black', desc: 'Architectural monochrome' },
    { id: 'immersive', name: 'Immersive UI', bg: 'from-purple-800 via-fuchsia-900 to-indigo-950', desc: 'Cosmic glowing neon' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-[#0C0C0C] border border-white/10 rounded-xl p-6 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-sm font-mono uppercase tracking-widest text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Engine Configuration</span>
          </h2>

          <div className="flex flex-col gap-5 text-sm text-gray-300">
            {/* Game Mode */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ mode: 'pvp' })}
                  className={`p-3 rounded border flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    settings.mode === 'pvp'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#121212] border-white/5 hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Pass & Play</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'ai' })}
                  className={`p-3 rounded border flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${
                    settings.mode === 'ai'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                      : 'bg-[#121212] border-white/5 hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>VS AI Bot</span>
                </button>
              </div>
            </div>

            {/* AI Settings (If AI Mode selected) */}
            {settings.mode === 'ai' && (
              <div className="bg-[#121212] p-3.5 rounded border border-white/5 flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                    Bot Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => onUpdateSettings({ aiDifficulty: diff })}
                        className={`py-1.5 rounded uppercase font-bold tracking-wider transition-all ${
                          settings.aiDifficulty === diff
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1.5">
                    Your Side
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      onClick={() => onUpdateSettings({ aiColor: 'black' })}
                      className={`py-1.5 rounded font-bold uppercase tracking-wider transition-all ${
                        settings.aiColor === 'black'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      White ♔
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ aiColor: 'white' })}
                      className={`py-1.5 rounded font-bold uppercase tracking-wider transition-all ${
                        settings.aiColor === 'white'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      Black ♚
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Board Theme */}
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span>Visual Theme</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id })}
                    className={`p-2.5 rounded border flex items-center gap-2.5 text-left transition-all font-mono ${
                      settings.theme === t.id
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold shadow-md'
                        : 'border-white/5 bg-[#121212] text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md shrink-0 bg-gradient-to-br ${t.bg} border border-white/20`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate">{t.name}</span>
                      <span className="text-[10px] text-gray-500 font-normal truncate">{t.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5 font-mono text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Sound Effects</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Highlight Legal Moves</span>
                <input
                  type="checkbox"
                  checked={settings.showHighlights}
                  onChange={(e) => onUpdateSettings({ showHighlights: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Auto-Flip Board on Turn</span>
                <input
                  type="checkbox"
                  checked={settings.autoFlipBoard}
                  onChange={(e) => onUpdateSettings({ autoFlipBoard: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            {onOpenRules ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenRules();
                }}
                className="px-3.5 py-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/30 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Rules</span>
              </button>
            ) : <div />}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-widest shadow-lg"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
