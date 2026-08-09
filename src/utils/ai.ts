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
 * Recursively explores chain capture sequences from a starting position and active piece type.
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
  visitedPositions: Position[]
): ChainMovePlan[] {
  const plans: ChainMovePlan[] = [];

  // Get raw moves for the active piece type at currentPos
  const moves = getRawMoves(board, currentPos, activeType, color);

  let foundFurtherCapture = false;

  if (depth < maxDepth) {
    for (const targetPos of moves) {
      // Avoid looping onto exact same square in immediate sequence
      if (visitedPositions.some((p) => isSamePos(p, targetPos))) continue;

      const targetPiece = board[targetPos.row][targetPos.col];

      // We are looking for capture moves in chain expansion
      if (targetPiece && targetPiece.color !== color) {
        foundFurtherCapture = true;

        // Perform capture on clone
        const tempBoard = cloneBoard(board);
        const movingPiece = tempBoard[currentPos.row][currentPos.col];
        tempBoard[targetPos.row][targetPos.col] = movingPiece;
        tempBoard[currentPos.row][currentPos.col] = null;

        const capturedValue = PIECE_VALUES[targetPiece.type] || 10;
        // Bonus for capturing high-value pieces or King
        const stepScore = capturedValue + (targetPiece.type === 'king' ? 10000 : 0);

        const newSteps = [...accumulatedSteps, targetPos];
        const newScore = accumulatedScore + stepScore;

        // Add this captured state as a valid plan (we could stop here)
        plans.push({
          startPos: accumulatedSteps[0] || currentPos,
          steps: newSteps,
          score: newScore,
        });

        // Continue searching from targetPos as the newly captured piece type!
        const subPlans = searchChainCapture(
          tempBoard,
          targetPos,
          targetPiece.type, // Temporary identity change!
          color,
          newSteps,
          newScore,
          depth + 1,
          maxDepth,
          [...visitedPositions, targetPos]
        );

        plans.push(...subPlans);
      }
    }
  }

  // If no further captures found, return current plan if we have taken steps
  if (!foundFurtherCapture && accumulatedSteps.length > 0) {
    plans.push({
      startPos: accumulatedSteps[0],
      steps: accumulatedSteps,
      score: accumulatedScore,
    });
  }

  return plans;
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

        // 1. Get standard raw moves (non-captures and initial captures)
        const moves = getRawMoves(board, startPos, piece.type, color);

        for (const targetPos of moves) {
          const targetPiece = board[targetPos.row][targetPos.col];

          if (!targetPiece) {
            // Non-capture move
            // Positional score encouraging advancement & center control
            const centerDist = 3.5 - Math.abs(targetPos.col - 3.5) + (3.5 - Math.abs(targetPos.row - 3.5));
            const moveScore = centerDist * 0.5 + (piece.type === 'pawn' ? 1 : 0);

            plans.push({
              startPos,
              steps: [targetPos],
              score: moveScore,
            });
          } else if (targetPiece.color !== color) {
            // Initial capture -> search chain depth from here
            const initialCapturedVal = PIECE_VALUES[targetPiece.type] || 10;
            const initialScore = initialCapturedVal + (targetPiece.type === 'king' ? 10000 : 0);

            plans.push({
              startPos,
              steps: [targetPos],
              score: initialScore,
            });

            if (maxChainDepth > 1) {
              const tempBoard = cloneBoard(board);
              tempBoard[targetPos.row][targetPos.col] = piece;
              tempBoard[startPos.row][startPos.col] = null;

              const chains = searchChainCapture(
                tempBoard,
                targetPos,
                targetPiece.type, // Move as captured piece
                color,
                [targetPos],
                initialScore,
                1,
                maxChainDepth,
                [startPos, targetPos]
              );

              plans.push(...chains);
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
