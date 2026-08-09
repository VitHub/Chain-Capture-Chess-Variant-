import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieceColor } from '../types/chess';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Zap } from 'lucide-react';

interface GameOverModalProps {
  winner: PieceColor | 'draw' | null;
  reason: string;
  totalTurns: number;
  maxCombo: number;
  onRematch: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  reason,
  totalTurns,
  maxCombo,
  onRematch,
}) => {
  useEffect(() => {
    if (winner && winner !== 'draw') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-[#0C0C0C] border border-amber-500/40 rounded-xl p-6 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 mx-auto mb-3 bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 flex items-center justify-center shadow-lg text-amber-500">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-mono uppercase tracking-widest text-white capitalize mb-1">
            {winner === 'draw' ? 'Stalemate Draw' : `${winner} Victory`}
          </h2>

          <p className="text-xs text-amber-400 font-mono uppercase tracking-wider mb-4 bg-amber-500/10 py-1 px-3 rounded inline-block border border-amber-500/30">
            {reason}
          </p>

          <div className="grid grid-cols-2 gap-3 my-4 bg-[#121212] p-3 rounded border border-white/5 text-xs font-mono">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 uppercase tracking-widest text-[10px]">Total Turns</span>
              <span className="text-base font-bold text-white mt-1">{totalTurns}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 uppercase tracking-widest text-[10px]">Longest Chain</span>
              <span className="text-base font-bold text-amber-400 mt-1 flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                {maxCombo}x Multi
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onRematch}
              className="px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Rematch</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
