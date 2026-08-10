import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark } from '../types/chess';
import { Bookmark as BookmarkIcon, BookmarkPlus, RotateCcw, Trash2, X, Clock, Sparkles, Check, ChevronRight } from 'lucide-react';
import { PieceIcon } from './PieceIcon';

interface BookmarksModalProps {
  isOpen: boolean;
  bookmarks: Bookmark[];
  currentMoveCount: number;
  currentTurn: string;
  onClose: () => void;
  onCreateBookmark: (name: string) => void;
  onRestoreBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  bookmarks,
  currentMoveCount,
  currentTurn,
  onClose,
  onCreateBookmark,
  onRestoreBookmark,
  onDeleteBookmark,
}) => {
  const [newBookmarkName, setNewBookmarkName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = newBookmarkName.trim() || `Bookmark (Move ${currentMoveCount} - ${currentTurn.toUpperCase()})`;
    onCreateBookmark(nameToUse);
    setNewBookmarkName('');
    setIsCreating(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#0E0E0E] border border-amber-500/20 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-gray-200"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BookmarkIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Game Snapshots & Bookmarks
                </h2>
                <p className="text-xs text-gray-400">Save position snapshots and restore to any turn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create Bookmark Bar */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Snapshot Current Position (Move #{currentMoveCount})</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
              <label className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                Snapshot Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBookmarkName}
                  onChange={(e) => setNewBookmarkName(e.target.value)}
                  placeholder={`Move #${currentMoveCount} - ${currentTurn.toUpperCase()}`}
                  className="flex-1 bg-[#161616] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg font-mono flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 text-xs rounded-lg font-mono"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Bookmarks List */}
          <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/10">
            {bookmarks.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-gray-500 flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-gray-600" />
                <span>No snapshots saved yet. Click above to save a position!</span>
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-xl bg-[#141414] border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-amber-300 truncate">
                        {bm.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-gray-300">
                        {bm.currentTurn.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {new Date(bm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>• {bm.moveCount} turns</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onRestoreBookmark(bm)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                      title="Reset board to this snapshot"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider font-bold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
