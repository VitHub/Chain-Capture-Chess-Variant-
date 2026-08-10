import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ChevronRight, ChevronLeft, Play, RefreshCw, Crown, ShieldAlert, BookOpen } from 'lucide-react';
import { PieceIcon } from './PieceIcon';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'What is Chain Capture Chess?',
      description:
        'In Chain Capture Chess, capturing an opponent piece instantly grants you that piece\'s movement abilities for the rest of your turn!',
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="flex flex-col gap-3 my-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-around gap-2 text-sm font-semibold">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-slate-800 p-2 rounded-lg border border-slate-700">
                <PieceIcon type="knight" color="white" />
              </div>
              <span className="text-amber-300 font-bold">Your Knight</span>
            </div>
            <span className="text-xl font-bold text-slate-500">➜ Captures ➜</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-slate-800 p-2 rounded-lg border border-slate-700">
                <PieceIcon type="rook" color="black" />
              </div>
              <span className="text-rose-400 font-bold">Opponent Rook</span>
            </div>
          </div>
          <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/50">
            ⚡ RESULT: Your Knight stays on the board, but NOW MOVES AS A ROOK in the same turn!
          </div>
        </div>
      ),
    },
    {
      title: 'Unlimited Chain Multipliers',
      description:
        'You can repeat this process as long as new capture opportunities exist! Move as the captured piece to capture another piece, then inherit THAT piece\'s abilities next!',
      icon: <Play className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="flex flex-col gap-2 my-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
            <span className="font-bold text-amber-400">Step 1:</span>
            <span>Knight captures Rook ➜ Move as Rook</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
            <span className="font-bold text-amber-400">Step 2:</span>
            <span>Move as Rook to capture Bishop ➜ Move as Bishop</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
            <span className="font-bold text-amber-400">Step 3:</span>
            <span>Move as Bishop to capture Queen ➜ 3x COMBO!</span>
          </div>
        </div>
      ),
    },
    {
      title: '👑 King Capture Restriction',
      description:
        'CRITICAL RULE: You CANNOT capture the opponent\'s King in the same turn that you took any other opponent pieces!',
      icon: <Crown className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="flex flex-col gap-2.5 my-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 font-medium flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong className="block text-rose-200 uppercase tracking-wider text-[11px] mb-1">No Multi-Capture King Takeover</strong>
              If you have already captured a piece on your current turn, the King square is disabled for subsequent chain moves.
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-medium">
            ✅ <strong>Allowed:</strong> Capturing the King as the <em>first and only move</em> of your turn wins the game!
          </div>
        </div>
      ),
    },
    {
      title: 'Decision & Controls',
      description:
        'After capturing a piece, you can choose to keep chaining OR click "End Turn Here" whenever you want to finalize your move!',
      icon: <RefreshCw className="w-8 h-8 text-indigo-400" />,
      content: (
        <div className="flex flex-col gap-2 my-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 font-medium">
            💡 <strong>Pro-Tip:</strong> If you move to an empty square during a chain, your turn automatically ends because no new piece was captured to inherit next!
          </div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 font-medium">
            👑 <strong>Direct King Checkmate:</strong> Taking the King on a single initial move wins the game instantly!
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-[#0C0C0C] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
            <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30">{slides[step].icon}</div>
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-white">{slides[step].title}</h2>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Step {step + 1} / {slides.length}</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">{slides[step].description}</p>

          {slides[step].content}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 font-mono text-xs">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-mono uppercase tracking-wider flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'bg-amber-500 w-5' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {step < slides.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(slides.length - 1, s + 1))}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono uppercase tracking-widest font-bold"
              >
                Start Game
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
