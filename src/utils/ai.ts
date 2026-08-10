import {
  AIDifficulty,
  Board,
  Piece,
  PieceColor,
  PieceType,
  Position,
} from '../types/chess';
import {
  cloneBoard,
  getRawMoves,
  isSamePos,
  PIECE_VALUES,
} from './chessRules';

export interface ChainMovePlan {
  startPos: Position;
  steps: Position[]; // Sequence of target squares in the turn
  score: number;
}

/**
 * Recursively explores chain capture sequences using in-place backtracking (zero board cloning).
 */
function searchChainCapture(
  board: Board,
  currentPos: Position,
  activeType: PieceType,
  color: PieceColor,
  accumulatedSteps: Position[],
  accumulatedScore: number,
  depth: number,
  maxDepth: number,
  visitedPositions: Position[],
  outPlans: ChainMovePlan[]
) {
  if (depth >= maxDepth) return;

  // Get raw moves for the active piece type at currentPos
  const moves = getRawMoves(board, currentPos, activeType, color);

  for (const targetPos of moves) {
    // Avoid looping onto exact same square in current chain
    if (visitedPositions.some((p) => isSamePos(p, targetPos))) continue;

    const targetPiece = board[targetPos.row][targetPos.col];

    // Search capture moves in chain expansion
    if (targetPiece && targetPiece.color !== color) {
      // RULE RESTRICTION: Cannot capture opponent King in the same turn after capturing another piece
      if (targetPiece.type === 'king') continue;

      const movingPiece = board[currentPos.row][currentPos.col];

      // Mutate board in-place
      board[targetPos.row][targetPos.col] = movingPiece;
      board[currentPos.row][currentPos.col] = null;

      const capturedValue = PIECE_VALUES[targetPiece.type] || 10;
      const stepScore = capturedValue;

      const newSteps = [...accumulatedSteps, targetPos];
      const newScore = accumulatedScore + stepScore;

      outPlans.push({
        startPos: accumulatedSteps[0] || currentPos,
        steps: newSteps,
        score: newScore,
      });

      // Continue searching from targetPos with targetPiece's identity
      if (depth + 1 < maxDepth) {
        searchChainCapture(
          board,
          targetPos,
          targetPiece.type, // Temporary identity change!
          color,
          newSteps,
          newScore,
          depth + 1,
          maxDepth,
          [...visitedPositions, targetPos],
          outPlans
        );
      }

      // Restore board state (backtrack)
      board[currentPos.row][currentPos.col] = movingPiece;
      board[targetPos.row][targetPos.col] = targetPiece;
    }
  }
}

/**
 * Gets all legal single or chain moves for `color` on the board.
 */
export function getAllPossibleMovePlans(
  board: Board,
  color: PieceColor,
  difficulty: AIDifficulty
): ChainMovePlan[] {
  const plans: ChainMovePlan[] = [];
  const maxChainDepth = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 2 : 1;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const startPos = { row: r, col: c };

        // 1. Get standard raw moves
        const moves = getRawMoves(board, startPos, piece.type, color);

        for (const targetPos of moves) {
          const targetPiece = board[targetPos.row][targetPos.col];

          if (!targetPiece) {
            // Non-capture move
            const centerDist = 3.5 - Math.abs(targetPos.col - 3.5) + (3.5 - Math.abs(targetPos.row - 3.5));
            const moveScore = centerDist * 0.5 + (piece.type === 'pawn' ? 1 : 0);

            plans.push({
              startPos,
              steps: [targetPos],
              score: moveScore,
            });
          } else if (targetPiece.color !== color) {
            // Initial capture
            const initialCapturedVal = PIECE_VALUES[targetPiece.type] || 10;
            const isKing = targetPiece.type === 'king';
            const initialScore = initialCapturedVal + (isKing ? 10000 : 0);

            plans.push({
              startPos,
              steps: [targetPos],
              score: initialScore,
            });

            if (isKing) {
              // King capture found! Instant win path
              return [{ startPos, steps: [targetPos], score: initialScore }];
            }

            if (maxChainDepth > 1) {
              // Mutate board in-place for chain evaluation
              board[targetPos.row][targetPos.col] = piece;
              board[startPos.row][startPos.col] = null;

              searchChainCapture(
                board,
                targetPos,
                targetPiece.type, // Move as captured piece
                color,
                [targetPos],
                initialScore,
                1,
                maxChainDepth,
                [startPos, targetPos],
                plans
              );

              // Backtrack
              board[startPos.row][startPos.col] = piece;
              board[targetPos.row][targetPos.col] = targetPiece;
            }
          }
        }
      }
    }
  }

  return plans;
}

/**
 * Selects the best move plan for the AI given difficulty.
 */
export function getAIMovePlan(
  board: Board,
  aiColor: PieceColor,
  difficulty: AIDifficulty
): ChainMovePlan | null {
  const plans = getAllPossibleMovePlans(board, aiColor, difficulty);

  if (plans.length === 0) return null;

  if (difficulty === 'easy') {
    // 60% random choice, 40% best capture
    if (Math.random() < 0.6) {
      return plans[Math.floor(Math.random() * plans.length)];
    }
  }

  // Sort by score descending
  plans.sort((a, b) => b.score - a.score);

  // Highest score plan
  const topScore = plans[0].score;

  // Find all plans with top or near-top score to add slight variance
  const topPlans = plans.filter((p) => p.score >= topScore - 2);

  return topPlans[Math.floor(Math.random() * topPlans.length)];
}
