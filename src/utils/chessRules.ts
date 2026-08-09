import { Board, Piece, PieceColor, PieceType, Position } from '../types/chess';

export const BOARD_SIZE = 8;

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  // Black pieces (Rows 0 and 1)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { id: `b-${backRow[c]}-${c}`, type: backRow[c], color: 'black' };
    board[1][c] = { id: `b-pawn-${c}`, type: 'pawn', color: 'black' };
  }

  // White pieces (Rows 6 and 7)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { id: `w-pawn-${c}`, type: 'pawn', color: 'white' };
    board[7][c] = { id: `w-${backRow[c]}-${c}`, type: backRow[c], color: 'white' };
  }

  return board;
}

export function isWithinBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function isSamePos(p1: Position, p2: Position): boolean {
  return p1.row === p2.row && p1.col === p2.col;
}

export function posToAlgebraic(pos: Position): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  return `${files[pos.col]}${ranks[pos.row]}`;
}

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 10,
  knight: 30,
  bishop: 32,
  rook: 50,
  queen: 90,
  king: 1000,
};

/**
 * Returns all valid move positions for a piece of type `pieceType` and color `color` located at `pos`.
 */
export function getRawMoves(
  board: Board,
  pos: Position,
  pieceType: PieceType,
  color: PieceColor
): Position[] {
  const moves: Position[] = [];
  const { row, col } = pos;

  if (!isWithinBoard(row, col)) return moves;

  switch (pieceType) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1; // White moves up (-1), Black moves down (+1)
      const startRow = color === 'white' ? 6 : 1;

      // Single forward step
      const f1Row = row + dir;
      if (isWithinBoard(f1Row, col) && board[f1Row][col] === null) {
        moves.push({ row: f1Row, col });

        // Double forward step from starting rank
        const f2Row = row + 2 * dir;
        if (row === startRow && isWithinBoard(f2Row, col) && board[f2Row][col] === null) {
          moves.push({ row: f2Row, col });
        }
      }

      // Diagonal captures
      for (const dCol of [-1, 1]) {
        const cRow = row + dir;
        const cCol = col + dCol;
        if (isWithinBoard(cRow, cCol)) {
          const target = board[cRow][cCol];
          if (target !== null && target.color !== color) {
            moves.push({ row: cRow, col: cCol });
          }
        }
      }
      break;
    }

    case 'knight': {
      const knightOffsets = [
        { r: -2, c: -1 }, { r: -2, c: 1 },
        { r: -1, c: -2 }, { r: -1, c: 2 },
        { r: 1, c: -2 },  { r: 1, c: 2 },
        { r: 2, c: -1 },  { r: 2, c: 1 },
      ];
      for (const off of knightOffsets) {
        const tr = row + off.r;
        const tc = col + off.c;
        if (isWithinBoard(tr, tc)) {
          const target = board[tr][tc];
          if (target === null || target.color !== color) {
            moves.push({ row: tr, col: tc });
          }
        }
      }
      break;
    }

    case 'bishop': {
      const bishopDirs = [
        { r: -1, c: -1 }, { r: -1, c: 1 },
        { r: 1, c: -1 },  { r: 1, c: 1 },
      ];
      for (const d of bishopDirs) {
        let tr = row + d.r;
        let tc = col + d.c;
        while (isWithinBoard(tr, tc)) {
          const target = board[tr][tc];
          if (target === null) {
            moves.push({ row: tr, col: tc });
          } else {
            if (target.color !== color) {
              moves.push({ row: tr, col: tc });
            }
            break; // Blocked by any piece
          }
          tr += d.r;
          tc += d.c;
        }
      }
      break;
    }

    case 'rook': {
      const rookDirs = [
        { r: -1, c: 0 }, { r: 1, c: 0 },
        { r: 0, c: -1 }, { r: 0, c: 1 },
      ];
      for (const d of rookDirs) {
        let tr = row + d.r;
        let tc = col + d.c;
        while (isWithinBoard(tr, tc)) {
          const target = board[tr][tc];
          if (target === null) {
            moves.push({ row: tr, col: tc });
          } else {
            if (target.color !== color) {
              moves.push({ row: tr, col: tc });
            }
            break; // Blocked
          }
          tr += d.r;
          tc += d.c;
        }
      }
      break;
    }

    case 'queen': {
      const queenDirs = [
        { r: -1, c: -1 }, { r: -1, c: 1 },
        { r: 1, c: -1 },  { r: 1, c: 1 },
        { r: -1, c: 0 },  { r: 1, c: 0 },
        { r: 0, c: -1 },  { r: 0, c: 1 },
      ];
      for (const d of queenDirs) {
        let tr = row + d.r;
        let tc = col + d.c;
        while (isWithinBoard(tr, tc)) {
          const target = board[tr][tc];
          if (target === null) {
            moves.push({ row: tr, col: tc });
          } else {
            if (target.color !== color) {
              moves.push({ row: tr, col: tc });
            }
            break; // Blocked
          }
          tr += d.r;
          tc += d.c;
        }
      }
      break;
    }

    case 'king': {
      const kingDirs = [
        { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
        { r: 0, c: -1 },                   { r: 0, c: 1 },
        { r: 1, c: -1 },  { r: 1, c: 0 },  { r: 1, c: 1 },
      ];
      for (const d of kingDirs) {
        const tr = row + d.r;
        const tc = col + d.c;
        if (isWithinBoard(tr, tc)) {
          const target = board[tr][tc];
          if (target === null || target.color !== color) {
            moves.push({ row: tr, col: tc });
          }
        }
      }
      break;
    }
  }

  return moves;
}

/**
 * Checks if a King of given color is currently present on the board.
 */
export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Evaluates whether `color`'s King is under attack by any opponent piece.
 */
export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false; // King captured

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === opponentColor) {
        const moves = getRawMoves(board, { row: r, col: c }, p.type, opponentColor);
        if (moves.some(m => isSamePos(m, kingPos))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Deep clone board state.
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

/**
 * Calculate material count for both players.
 */
export function getMaterialDifference(board: Board): { white: number; black: number; diff: number } {
  let white = 0;
  let black = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const val = PIECE_VALUES[p.type] || 0;
        if (p.color === 'white') white += val;
        else black += val;
      }
    }
  }

  return { white, black, diff: white - black };
}
