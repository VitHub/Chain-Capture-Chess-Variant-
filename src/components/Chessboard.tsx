import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Board, BoardTheme, ChainState, PieceColor, PieceType, Position } from '../types/chess';
import { getRawMoves, isSamePos, posToAlgebraic } from '../utils/chessRules';
import { PieceIcon } from './PieceIcon';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

interface ChessboardProps {
  board: Board;
  currentTurn: PieceColor;
  selectedPos: Position | null;
  validMoves: Position[];
  chainState: ChainState | null;
  theme: BoardTheme;
  isFlipped: boolean;
  onSelectSquare: (pos: Position) => void;
  onEndChain?: () => void;
  onUndoChainStep?: () => void;
  lastMove: { from: Position; to: Position } | null;
  explosionPos?: Position | null;
  disabled?: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  board,
  currentTurn,
  selectedPos,
  validMoves,
  chainState,
  theme,
  isFlipped,
  onSelectSquare,
  onEndChain,
  onUndoChainStep,
  lastMove,
  explosionPos,
  disabled = false,
}) => {
  // Theme color definitions for all requested visual styles
  const allThemeStyles: Record<string, {
    light: string;
    dark: string;
    border: string;
    selected: string;
    moveDot: string;
    captureRing: string;
    lastMove: string;
    chainGlow: string;
  }> = {
    artistic: {
      light: 'bg-[#e6d5c3] text-[#7c3a21]',
      dark: 'bg-[#964b32] text-[#f4eae1]',
      border: 'border-amber-900/50',
      selected: 'ring-2 ring-orange-500 bg-orange-500/25',
      moveDot: 'bg-orange-500/90 hover:bg-orange-400',
      captureRing: 'ring-2 ring-orange-500 bg-orange-500/30',
      lastMove: 'bg-amber-600/20 border-amber-600/40',
      chainGlow: 'shadow-[0_0_22px_rgba(234,88,12,0.8)] border-2 border-orange-500',
    },
    elegant: {
      light: 'bg-[#2a2621] text-[#d4af37]',
      dark: 'bg-[#151310] text-[#8a7322]',
      border: 'border-amber-500/20',
      selected: 'ring-2 ring-amber-400 bg-amber-400/20',
      moveDot: 'bg-amber-400/90 hover:bg-amber-300',
      captureRing: 'ring-2 ring-amber-400 bg-amber-400/25',
      lastMove: 'bg-amber-500/15 border-amber-400/30',
      chainGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.7)] border-2 border-amber-400',
    },
    sophisticated: {
      light: 'bg-[#242e38] text-[#83a5c5]',
      dark: 'bg-[#151c24] text-[#4d6a85]',
      border: 'border-cyan-500/20',
      selected: 'ring-2 ring-cyan-400 bg-cyan-400/20',
      moveDot: 'bg-cyan-400/90 hover:bg-cyan-300',
      captureRing: 'ring-2 ring-emerald-400 bg-emerald-400/25',
      lastMove: 'bg-cyan-500/15 border-cyan-400/30',
      chainGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.7)] border-2 border-cyan-400',
    },
    geometric: {
      light: 'bg-[#333333] text-[#e0e0e0]',
      dark: 'bg-[#1a1a1a] text-[#888888]',
      border: 'border-white/20',
      selected: 'ring-2 ring-white bg-white/20',
      moveDot: 'bg-white/90 hover:bg-gray-200',
      captureRing: 'ring-2 ring-white bg-white/25',
      lastMove: 'bg-white/10 border-white/30',
      chainGlow: 'shadow-[0_0_20px_rgba(255,255,255,0.8)] border-2 border-white',
    },
    immersive: {
      light: 'bg-[#2a133d] text-[#e879f9]',
      dark: 'bg-[#160824] text-[#a21caf]',
      border: 'border-fuchsia-500/30',
      selected: 'ring-2 ring-fuchsia-400 bg-fuchsia-500/25',
      moveDot: 'bg-fuchsia-400/90 hover:bg-fuchsia-300',
      captureRing: 'ring-2 ring-pink-500 bg-pink-500/30',
      lastMove: 'bg-fuchsia-900/30 border-fuchsia-500/40',
      chainGlow: 'shadow-[0_0_25px_rgba(232,121,249,0.9)] border-2 border-fuchsia-400',
    },
    // Fallbacks for legacy theme names
    emerald: {
      light: 'bg-[#242e38] text-[#83a5c5]',
      dark: 'bg-[#151c24] text-[#4d6a85]',
      border: 'border-cyan-500/20',
      selected: 'ring-2 ring-cyan-400 bg-cyan-400/20',
      moveDot: 'bg-cyan-400/90 hover:bg-cyan-300',
      captureRing: 'ring-2 ring-emerald-400 bg-emerald-400/25',
      lastMove: 'bg-cyan-500/15 border-cyan-400/30',
      chainGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.7)] border-2 border-cyan-400',
    },
    walnut: {
      light: 'bg-[#2a2621] text-[#d4af37]',
      dark: 'bg-[#151310] text-[#8a7322]',
      border: 'border-amber-500/20',
      selected: 'ring-2 ring-amber-400 bg-amber-400/20',
      moveDot: 'bg-amber-400/90 hover:bg-amber-300',
      captureRing: 'ring-2 ring-amber-400 bg-amber-400/25',
      lastMove: 'bg-amber-500/15 border-amber-400/30',
      chainGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.7)] border-2 border-amber-400',
    },
    slate: {
      light: 'bg-[#333333] text-[#e0e0e0]',
      dark: 'bg-[#1a1a1a] text-[#888888]',
      border: 'border-white/20',
      selected: 'ring-2 ring-white bg-white/20',
      moveDot: 'bg-white/90 hover:bg-gray-200',
      captureRing: 'ring-2 ring-white bg-white/25',
      lastMove: 'bg-white/10 border-white/30',
      chainGlow: 'shadow-[0_0_20px_rgba(255,255,255,0.8)] border-2 border-white',
    },
    cyber: {
      light: 'bg-[#2a133d] text-[#e879f9]',
      dark: 'bg-[#160824] text-[#a21caf]',
      border: 'border-fuchsia-500/30',
      selected: 'ring-2 ring-fuchsia-400 bg-fuchsia-500/25',
      moveDot: 'bg-fuchsia-400/90 hover:bg-fuchsia-300',
      captureRing: 'ring-2 ring-pink-500 bg-pink-500/30',
      lastMove: 'bg-fuchsia-900/30 border-fuchsia-500/40',
      chainGlow: 'shadow-[0_0_25px_rgba(232,121,249,0.9)] border-2 border-fuchsia-400',
    },
  };

  const themeStyles = allThemeStyles[theme] || allThemeStyles.elegant;

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Map row/col according to isFlipped
  const displayRows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const displayCols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto select-none">
      {/* Active Chain Controls Banner */}
      <AnimatePresence>
        {chainState && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="w-full mb-3 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded uppercase tracking-wider">
                KINETIC MIMIC
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase text-amber-500">
                  <span>Combo Chain</span>
                  <span className="text-amber-200">({chainState.stepsTaken.length}x Active)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white mt-0.5">
                  <span className="text-gray-400">Mimicking:</span>
                  <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                    <div className="w-3.5 h-3.5">
                      <PieceIcon type={chainState.activeIdentity} color={currentTurn} />
                    </div>
                    <span className="capitalize text-amber-400 font-bold">
                      {chainState.activeIdentity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {chainState.stepsTaken.length > 0 && (
                <button
                  onClick={onUndoChainStep}
                  className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-mono text-xs uppercase tracking-wider flex items-center gap-1 border border-white/10 transition-all"
                  title="Undo last hop"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Undo</span>
                </button>
              )}
              <button
                onClick={onEndChain}
                className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>End Turn</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Board Container */}
      <div
        className={`relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl border ${themeStyles.border} bg-[#121212]`}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full border border-white/5 relative">
          {displayRows.map((r) =>
            displayCols.map((c) => {
              const piece = board[r][c];
              const isDarkSquare = (r + c) % 2 === 1;
              const squarePos = { row: r, col: c };

              const isSelected = selectedPos && isSamePos(selectedPos, squarePos);
              const isValidTarget = validMoves.some((m) => isSamePos(m, squarePos));
              const isLastMoveSquare =
                lastMove && (isSamePos(lastMove.from, squarePos) || isSamePos(lastMove.to, squarePos));
              const isChainActivePiece = chainState && isSamePos(chainState.currentPos, squarePos);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => !disabled && onSelectSquare(squarePos)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isDarkSquare ? themeStyles.dark : themeStyles.light
                  } ${isLastMoveSquare ? themeStyles.lastMove : ''} ${
                    isSelected ? themeStyles.selected : ''
                  }`}
                >
                  {/* Square Coordinates Notation */}
                  {c === (isFlipped ? 7 : 0) && (
                    <span
                      className="absolute top-0.5 left-1 text-[9px] font-mono opacity-30 text-white pointer-events-none"
                    >
                      {ranks[r]}
                    </span>
                  )}
                  {r === (isFlipped ? 0 : 7) && (
                    <span
                      className="absolute bottom-0.5 right-1 text-[9px] font-mono opacity-30 text-white pointer-events-none"
                    >
                      {files[c]}
                    </span>
                  )}

                  {/* Move Target Highlight */}
                  {isValidTarget && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      {piece ? (
                        <div className={`w-full h-full ${themeStyles.captureRing}`} />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full ${themeStyles.moveDot} shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />
                      )}
                    </div>
                  )}

                  {/* Mild Explosion Particle Effect when piece is captured */}
                  {explosionPos && isSamePos(explosionPos, squarePos) && (
                    <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden">
                      <motion.div
                        initial={{ scale: 0.2, opacity: 1, borderWidth: '4px' }}
                        animate={{ scale: 2.2, opacity: 0, borderWidth: '0px' }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute w-12 h-12 rounded-full border border-amber-400 bg-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,1)]"
                      />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                        const rad = (angle * Math.PI) / 180;
                        const distance = 26;
                        const x = Math.cos(rad) * distance;
                        const y = Math.sin(rad) * distance;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                            animate={{ x, y, scale: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]"
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Render Piece */}
                  {piece && (
                    <motion.div
                      layout
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className={`relative w-[82%] h-[82%] flex items-center justify-center z-10 ${
                        isChainActivePiece ? themeStyles.chainGlow + ' rounded-full' : ''
                      }`}
                    >
                      <PieceIcon type={piece.type} color={piece.color} />

                      {/* Active Identity Takeover Badge during Chain */}
                      {isChainActivePiece && chainState && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] border border-black flex items-center justify-center w-5 h-5 z-30"
                          title={`Mimicking: ${chainState.activeIdentity}`}
                        >
                          <div className="w-3.5 h-3.5">
                            <PieceIcon type={chainState.activeIdentity} color={piece.color} />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
