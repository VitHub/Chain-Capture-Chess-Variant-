export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number; // 0 to 7
  col: number; // 0 to 7
}

export interface MoveStep {
  from: Position;
  to: Position;
  capturedPiece: Piece | null;
  activeType: PieceType; // The piece type ability used for this step
  isChainStep: boolean;
}

export interface TurnHistoryItem {
  turnNumber: number;
  color: PieceColor;
  steps: MoveStep[];
  startingPieceType: PieceType;
  finalPieceType: PieceType;
  totalCaptured: Piece[];
  notation: string;
}

export interface ChainState {
  pieceId: string;
  startPos: Position;
  currentPos: Position;
  activeIdentity: PieceType; // The piece type movement abilities currently being used
  originalType: PieceType;
  color: PieceColor;
  stepsTaken: MoveStep[];
  capturedThisTurn: Piece[];
}

export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type BoardTheme =
  | 'artistic'
  | 'elegant'
  | 'sophisticated'
  | 'geometric'
  | 'immersive'
  | 'emerald'
  | 'walnut'
  | 'slate'
  | 'cyber';

export interface GameSettings {
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  aiColor: PieceColor;
  theme: BoardTheme;
  soundEnabled: boolean;
  showHighlights: boolean;
  autoFlipBoard: boolean;
}
