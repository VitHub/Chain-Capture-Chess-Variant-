import { Board, GameSaveFile, MoveStep, Piece, PieceColor, Position, TurnHistoryItem } from '../types/chess';
import { cloneBoard, createInitialBoard } from './chessRules';

/**
 * Reconstructs the board state after applying chronological turns up to `targetTurnIndex`.
 * targetTurnIndex = 0 -> Initial board before any turn.
 * targetTurnIndex = 1 -> Board after 1st turn is executed, etc.
 */
export function reconstructBoardAtTurn(
  chronologicalHistory: TurnHistoryItem[],
  targetTurnIndex: number
): {
  board: Board;
  currentTurn: PieceColor;
  capturedWhite: Piece[];
  capturedBlack: Piece[];
  lastMove: { from: Position; to: Position } | null;
} {
  let board = createInitialBoard();
  let currentTurn: PieceColor = 'white';
  const capturedWhite: Piece[] = [];
  const capturedBlack: Piece[] = [];
  let lastMove: { from: Position; to: Position } | null = null;

  const turnsToApply = Math.min(Math.max(0, targetTurnIndex), chronologicalHistory.length);

  for (let i = 0; i < turnsToApply; i++) {
    const item = chronologicalHistory[i];
    currentTurn = item.color;

    for (let s = 0; s < item.steps.length; s++) {
      const step = item.steps[s];
      const movingPiece = board[step.from.row][step.from.col];

      if (movingPiece) {
        board[step.to.row][step.to.col] = movingPiece;
        board[step.from.row][step.from.col] = null;
      }

      if (step.capturedPiece) {
        if (step.capturedPiece.color === 'white') {
          capturedWhite.push(step.capturedPiece);
        } else {
          capturedBlack.push(step.capturedPiece);
        }
      }
    }

    if (item.steps.length > 0) {
      lastMove = {
        from: item.steps[0].from,
        to: item.steps[item.steps.length - 1].to,
      };
    }

    // Switch turn
    currentTurn = item.color === 'white' ? 'black' : 'white';
  }

  return {
    board,
    currentTurn,
    capturedWhite,
    capturedBlack,
    lastMove,
  };
}

/**
 * Trigger browser file download of GameSaveFile
 */
export function exportGameSaveFile(gameSave: GameSaveFile) {
  const jsonStr = JSON.stringify(gameSave, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date(gameSave.createdAt).toISOString().slice(0, 10);
  a.download = `chain_chess_game_${dateStr}_${gameSave.id.slice(0, 6)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses uploaded file as GameSaveFile
 */
export async function parseGameSaveFile(file: File): Promise<GameSaveFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.history)) {
          resolve(parsed as GameSaveFile);
        } else {
          reject(new Error('Invalid save file format: missing history array'));
        }
      } catch (err) {
        reject(new Error('Failed to parse JSON save file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}
