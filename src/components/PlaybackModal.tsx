import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BoardTheme, GameSaveFile, PieceColor, Position, TurnHistoryItem } from '../types/chess';
import { reconstructBoardAtTurn, exportGameSaveFile, parseGameSaveFile } from '../utils/replay';
import { Chessboard } from './Chessboard';
import { PieceIcon } from './PieceIcon';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  X,
  RotateCcw,
  Gauge,
  Film,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface PlaybackModalProps {
  isOpen: boolean;
  history: TurnHistoryItem[];
  theme: BoardTheme;
  onClose: () => void;
  onResumePlayFromTurn: (reconstructed: {
    board: any;
    currentTurn: PieceColor;
    historySlice: TurnHistoryItem[];
    capturedWhite: any[];
    capturedBlack: any[];
  }) => void;
}

export const PlaybackModal: React.FC<PlaybackModalProps> = ({
  isOpen,
  history,
  theme,
  onClose,
  onResumePlayFromTurn,
}) => {
  // Chronological history (oldest turn first)
  const [activeHistory, setActiveHistory] = useState<TurnHistoryItem[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 0.5, 1, 2, 4
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize chronological history whenever modal opens or history changes
  useEffect(() => {
    if (isOpen) {
      const chron = [...history].reverse();
      setActiveHistory(chron);
      setTurnIndex(chron.length); // default to final state
      setIsPlaying(false);
    }
  }, [isOpen, history]);

  // Handle Auto-Play timer
  useEffect(() => {
    if (isPlaying) {
      const baseDelay = 700; // ms per move at 1x
      const delay = Math.max(100, Math.round(baseDelay / speedMultiplier));

      timerRef.current = setTimeout(() => {
        setTurnIndex((prev) => {
          if (prev >= activeHistory.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, turnIndex, activeHistory.length, speedMultiplier]);

  if (!isOpen) return null;

  const totalTurns = activeHistory.length;

  // Calculate board state at current turn index
  const { board, currentTurn, capturedWhite, capturedBlack, lastMove } =
    reconstructBoardAtTurn(activeHistory, turnIndex);

  // Play / Pause toggle
  const togglePlay = () => {
    if (turnIndex >= totalTurns && !isPlaying) {
      setTurnIndex(0); // loop back to start if at end
    }
    setIsPlaying(!isPlaying);
  };

  // Step controls
  const handleStepBack = () => {
    setIsPlaying(false);
    setTurnIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setTurnIndex((prev) => Math.min(totalTurns, prev + 1));
  };

  const handleJumpStart = () => {
    setIsPlaying(false);
    setTurnIndex(0);
  };

  const handleJumpEnd = () => {
    setIsPlaying(false);
    setTurnIndex(totalTurns);
  };

  // Resume game from this turn state
  const handleResumeMatch = () => {
    const historySlice = activeHistory.slice(0, turnIndex).reverse(); // back to reverse order (newest first)
    onResumePlayFromTurn({
      board,
      currentTurn,
      historySlice,
      capturedWhite,
      capturedBlack,
    });
    onClose();
  };

  // Export current game record to JSON file download
  const handleExportSave = () => {
    const saveObj: GameSaveFile = {
      version: 1,
      id: `save_${Date.now()}`,
      title: `Chain Chess Match (${totalTurns} turns)`,
      createdAt: Date.now(),
      settings: {
        mode: 'pvp',
        aiDifficulty: 'medium',
        aiColor: 'black',
        theme,
        soundEnabled: true,
        showHighlights: true,
        autoFlipBoard: false,
      },
      history: activeHistory.reverse(), // standard storage
      capturedWhite,
      capturedBlack,
      winner: null,
      winReason: '',
      finalBoard: board,
      finalTurn: currentTurn,
    };
    exportGameSaveFile(saveObj);
  };

  // Upload save file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      const parsed = await parseGameSaveFile(file);
      const chron = [...parsed.history].reverse();
      setActiveHistory(chron);
      setTurnIndex(chron.length);
      setIsPlaying(false);
      setUploadSuccess(`Loaded recording: ${file.name} (${chron.length} turns)`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load recording file');
    }
  };

  const speeds = [0.5, 1, 2, 4];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#0C0C0C] border border-amber-500/25 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 text-gray-200 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Game Recording & Playback
                </h2>
                <p className="text-xs text-gray-400">
                  Step through move history, play at variable speeds, or export match files
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {uploadError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-lg">
              ⚠️ {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* Replay Board Display */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-md mx-auto">
              <Chessboard
                board={board}
                currentTurn={currentTurn}
                selectedPos={null}
                validMoves={[]}
                chainState={null}
                theme={theme}
                isFlipped={false}
                onSelectSquare={() => {}}
                lastMove={lastMove}
                disabled={true}
              />
            </div>

            {/* Turn Counter & Turn Info */}
            <div className="flex items-center justify-between w-full max-w-md bg-[#121212] px-3 py-2 rounded-xl border border-white/5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">
                  Turn {turnIndex} / {totalTurns}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300">
                  Current Move: {currentTurn.toUpperCase()}
                </span>
              </div>
              {turnIndex > 0 && activeHistory[turnIndex - 1] && (
                <div className="text-gray-400 text-[11px] truncate max-w-[150px]">
                  {activeHistory[turnIndex - 1].notation}
                </div>
              )}
            </div>

            {/* Timeline Scrub Slider */}
            <div className="w-full max-w-md flex flex-col gap-1">
              <input
                type="range"
                min={0}
                max={totalTurns}
                value={turnIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setTurnIndex(Number(e.target.value));
                }}
                className="w-full accent-amber-500 bg-white/10 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500 px-1">
                <span>Start (Move 0)</span>
                <span>Final Position (Move {totalTurns})</span>
              </div>
            </div>

            {/* Playback Transport Controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 my-1">
              <button
                onClick={handleJumpStart}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                title="Jump to Start"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleStepBack}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                title="Step Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Replay</span>
                  </>
                )}
              </button>

              <button
                onClick={handleStepForward}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                title="Step Forward"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleJumpEnd}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all"
                title="Jump to End"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Control Selector */}
            <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-xl border border-white/5 font-mono text-xs">
              <div className="flex items-center gap-1 px-2 text-gray-400 text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>Speed:</span>
              </div>
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    speedMultiplier === s
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Row: Export, Import & Branch Match */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSave}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-amber-400 font-mono text-xs flex items-center gap-1.5 transition-all"
                title="Download JSON save file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Save File</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-amber-400 font-mono text-xs flex items-center gap-1.5 transition-all"
                title="Upload game recording JSON file"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Save</span>
              </button>
            </div>

            <button
              onClick={handleResumeMatch}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Match From Turn {turnIndex}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
