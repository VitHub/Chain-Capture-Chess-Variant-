import React from 'react';
import { GameSettings, PieceColor } from '../types/chess';
import { PieceIcon } from './PieceIcon';
import { Volume2, VolumeX, HelpCircle, Settings, RotateCcw, Bot, User, WifiOff } from 'lucide-react';

interface GameHeaderProps {
  currentTurn: PieceColor;
  settings: GameSettings;
  capturedWhite: PieceColor extends 'white' ? string[] : string[]; // list of captured piece types
  capturedBlack: PieceColor extends 'white' ? string[] : string[];
  materialDiff: number; // positive = white advantage, negative = black advantage
  onResetGame: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onToggleMode?: (mode: 'ai' | 'pvp') => void;
  isAITinking?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentTurn,
  settings,
  materialDiff,
  onResetGame,
  onOpenTutorial,
  onOpenSettings,
  onToggleSound,
  onToggleMode,
  isAITinking = false,
}) => {
  const isWhiteTurn = currentTurn === 'white';

  return (
    <div className="w-full max-w-xl mx-auto mb-2 bg-[#0C0C0C] backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/5 shadow-2xl flex flex-col gap-3">
      {/* Top Bar: Title & Action Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 font-bold shadow-sm text-sm">
            Ω
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-light tracking-widest text-white uppercase flex items-center gap-1.5">
              <span>Chain <span className="font-bold text-amber-500">Capture</span> Chess</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-amber-500/80 font-mono uppercase tracking-wider">Identity Mimicry Engine</p>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] uppercase tracking-wider">
                <WifiOff className="w-2.5 h-2.5" /> Offline Ready
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleSound}
            className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
          </button>

          <button
            onClick={onOpenTutorial}
            className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-amber-400 transition-all"
            title="Rules & How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onResetGame}
            className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-xs uppercase tracking-widest flex items-center gap-1 border border-white/10 transition-all"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Opponent Mode Selector Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#121212] px-3 py-1.5 rounded border border-white/5 text-xs font-mono">
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Opponent:</span>
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/5">
          <button
            onClick={() => onToggleMode?.('ai')}
            className={`px-2.5 py-1 rounded text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.mode === 'ai'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>VS Computer</span>
          </button>
          <button
            onClick={() => onToggleMode?.('pvp')}
            className={`px-2.5 py-1 rounded text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              settings.mode === 'pvp'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Pass & Play</span>
          </button>
        </div>
        {settings.mode === 'ai' && (
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
            [{settings.aiDifficulty}]
          </span>
        )}
      </div>

      {/* Turn Status Indicator */}
      <div className="flex items-center justify-between gap-3 bg-[#121212] rounded-lg p-2.5 border border-white/5">
        {/* Player 1 (White) Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            isWhiteTurn
              ? 'bg-amber-500/10 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'opacity-40 border border-transparent'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <PieceIcon type="king" color="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1">
              White
              {settings.mode === 'ai' && settings.aiColor === 'black' && (
                <User className="w-3 h-3 text-amber-400" />
              )}
            </span>
            {materialDiff > 0 && (
              <span className="text-[10px] font-mono text-amber-400 font-semibold">+{materialDiff}</span>
            )}
          </div>
        </div>

        {/* Current Turn Badge */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-500">Current Turn</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-2 h-2 rounded-full ${isWhiteTurn ? 'bg-amber-500 animate-pulse' : 'bg-amber-300 animate-pulse'}`} />
            <span className="text-xs font-mono font-medium text-amber-200 capitalize">
              {isAITinking ? 'Bot Thinking...' : `${currentTurn}'s Move`}
            </span>
          </div>
        </div>

        {/* Player 2 (Black) Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all ${
            !isWhiteTurn
              ? 'bg-amber-500/10 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'opacity-40 border border-transparent'
          }`}
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1">
              {settings.mode === 'ai' && settings.aiColor === 'white' && (
                <User className="w-3 h-3 text-amber-400" />
              )}
              Black
              {settings.mode === 'ai' && settings.aiColor === 'black' && (
                <Bot className="w-3 h-3 text-amber-400" />
              )}
            </span>
            {materialDiff < 0 && (
              <span className="text-[10px] font-mono text-amber-400 font-semibold">+{Math.abs(materialDiff)}</span>
            )}
          </div>
          <div className="w-5 h-5 flex items-center justify-center">
            <PieceIcon type="king" color="black" />
          </div>
        </div>
      </div>
    </div>
  );
};
