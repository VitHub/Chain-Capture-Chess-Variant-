import React from 'react';
import { TurnHistoryItem } from '../types/chess';
import { PieceIcon } from './PieceIcon';
import { Zap, ScrollText } from 'lucide-react';

interface MoveHistoryProps {
  history: TurnHistoryItem[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-[#0C0C0C] backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest">
          <ScrollText className="w-4 h-4 text-amber-500" />
          <span>Move & Chain Log</span>
        </div>
        <span className="text-[11px] text-gray-500 font-mono">{history.length} turns</span>
      </div>

      {history.length === 0 ? (
        <div className="py-4 text-center text-xs font-mono text-gray-600 uppercase tracking-wider">
          No moves recorded yet. Select a piece to hop.
        </div>
      ) : (
        <div className="max-h-36 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {history.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between gap-2 p-2 rounded bg-[#121212] border text-xs font-mono ${
                item.totalCaptured.length > 1 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-5 text-right font-mono">{item.turnNumber}.</span>
                <div className="w-4 h-4">
                  <PieceIcon type="king" color={item.color} />
                </div>
                <span className="text-gray-200 font-mono">{item.notation}</span>
              </div>

              {item.totalCaptured.length > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {item.totalCaptured.length > 1 && (
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px] tracking-wider uppercase">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{item.totalCaptured.length}x CHAIN</span>
                    </div>
                  )}
                  <div className="flex items-center gap-0.5">
                    {item.totalCaptured.map((p, pIdx) => (
                      <div key={pIdx} className="w-3.5 h-3.5 opacity-90">
                        <PieceIcon type={p.type} color={p.color} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
