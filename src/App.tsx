import React, { useState, useEffect, useCallback } from 'react';
import {
  Board,
  BoardTheme,
  ChainState,
  GameSettings,
  MoveStep,
  Piece,
  PieceColor,
  PieceType,
  Position,
  TurnHistoryItem,
} from './types/chess';
import {
  BOARD_SIZE,
  cloneBoard,
  createInitialBoard,
  getMaterialDifference,
  getRawMoves,
  isSamePos,
  posToAlgebraic,
} from './utils/chessRules';
import { soundManager } from './utils/sound';
import { getAIMovePlan } from './utils/ai';

import { Chessboard } from './components/Chessboard';
import { GameHeader } from './components/GameHeader';
import { MoveHistory } from './components/MoveHistory';
import { TutorialModal } from './components/TutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  // Game State
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('white');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [chainState, setChainState] = useState<ChainState | null>(null);

  const [history, setHistory] = useState<TurnHistoryItem[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]); // White pieces captured by Black
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]); // Black pieces captured by White

  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);
  const [winReason, setWinReason] = useState<string>('');
  const [maxComboThisGame, setMaxComboThisGame] = useState<number>(0);

  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // Settings initialized with local storage or defaults (defaulting to VS Computer mode)
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('chain_capture_chess_settings_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      mode: 'ai',
      aiDifficulty: 'medium',
      aiColor: 'black',
      theme: 'emerald',
      soundEnabled: true,
      showHighlights: true,
      autoFlipBoard: false,
    };
  });

  // Save settings on update
  useEffect(() => {
    localStorage.setItem('chain_capture_chess_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Load saved game state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('chain_capture_chess_match_v2');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.board && parsed.currentTurn) {
          setBoard(parsed.board);
          setCurrentTurn(parsed.currentTurn);
          setHistory(parsed.history || []);
          setCapturedWhite(parsed.capturedWhite || []);
          setCapturedBlack(parsed.capturedBlack || []);
          setWinner(parsed.winner || null);
          setWinReason(parsed.winReason || '');
        }
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  // Save match state on update
  useEffect(() => {
    const matchState = {
      board,
      currentTurn,
      history,
      capturedWhite,
      capturedBlack,
      winner,
      winReason,
    };
    localStorage.setItem('chain_capture_chess_match_v2', JSON.stringify(matchState));
  }, [board, currentTurn, history, capturedWhite, capturedBlack, winner, winReason]);

  // Modals & UI
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

  // Update sound settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Recalculate legal moves when selection or chain state changes
  useEffect(() => {
    if (chainState) {
      // In active chain state -> moves are based on activeIdentity at chainState.currentPos
      const moves = getRawMoves(
        board,
        chainState.currentPos,
        chainState.activeIdentity,
        currentTurn
      );
      setValidMoves(settings.showHighlights ? moves : []);
    } else if (selectedPos) {
      const piece = board[selectedPos.row][selectedPos.col];
      if (piece && piece.color === currentTurn) {
        const moves = getRawMoves(board, selectedPos, piece.type, currentTurn);
        setValidMoves(settings.showHighlights ? moves : []);
      } else {
        setValidMoves([]);
      }
    } else {
      setValidMoves([]);
    }
  }, [selectedPos, chainState, board, currentTurn, settings.showHighlights]);

  // Complete/End the current player's turn
  const finalizeTurn = useCallback(
    (
      finalBoard: Board,
      steps: MoveStep[],
      capturedList: Piece[],
      pieceTypeAtStart: PieceType,
      pieceTypeAtEnd: PieceType
    ) => {
      setBoard(finalBoard);

      const nextTurn: PieceColor = currentTurn === 'white' ? 'black' : 'white';

      // Update captured pieces lists
      if (capturedList.length > 0) {
        if (currentTurn === 'white') {
          setCapturedBlack((prev) => [...prev, ...capturedList]);
        } else {
          setCapturedWhite((prev) => [...prev, ...capturedList]);
        }
      }

      // Record History
      const fromAlg = posToAlgebraic(steps[0].from);
      const toAlg = posToAlgebraic(steps[steps.length - 1].to);
      const comboText =
        capturedList.length > 1 ? ` [${capturedList.length}x Multi Takeover]` : '';
      const notation = `${fromAlg} ➜ ${toAlg}${comboText}`;

      const newHistoryItem: TurnHistoryItem = {
        turnNumber: history.length + 1,
        color: currentTurn,
        steps,
        startingPieceType: pieceTypeAtStart,
        finalPieceType: pieceTypeAtEnd,
        totalCaptured: capturedList,
        notation,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      if (capturedList.length > maxComboThisGame) {
        setMaxComboThisGame(capturedList.length);
      }

      // Reset selection and chain
      setSelectedPos(null);
      setChainState(null);
      setValidMoves([]);

      // Set last move highlight
      if (steps.length > 0) {
        setLastMove({
          from: steps[0].from,
          to: steps[steps.length - 1].to,
        });
      }

      // Switch turn
      setCurrentTurn(nextTurn);
    },
    [currentTurn, history.length, maxComboThisGame]
  );

  // Handle Square Selection / Move Click
  const handleSelectSquare = (pos: Position) => {
    if (winner || isAIThinking) return;

    // 1. IF IN ACTIVE CHAIN STATE
    if (chainState) {
      const isTargetValid = validMoves.some((m) => isSamePos(m, pos));
      if (!isTargetValid) return; // Ignore invalid clicks during chain

      const currentPiece = board[chainState.currentPos.row][chainState.currentPos.col];
      if (!currentPiece) return;

      const targetPiece = board[pos.row][pos.col];
      const newBoard = cloneBoard(board);

      // Execute step
      newBoard[pos.row][pos.col] = currentPiece;
      newBoard[chainState.currentPos.row][chainState.currentPos.col] = null;

      const newStep: MoveStep = {
        from: chainState.currentPos,
        to: pos,
        capturedPiece: targetPiece,
        activeType: chainState.activeIdentity,
        isChainStep: true,
      };

      if (targetPiece) {
        // CAPTURE IN CHAIN!
        const updatedCaptured = [...chainState.capturedThisTurn, targetPiece];
        const updatedSteps = [...chainState.stepsTaken, newStep];

        // Check if captured King -> INSTANT WIN!
        if (targetPiece.type === 'king') {
          setBoard(newBoard);
          setWinner(currentTurn);
          setWinReason(`Captured the opponent King in a ${updatedCaptured.length}x Multi Combo!`);
          soundManager.playWin();
          return;
        }

        soundManager.playCombo(updatedSteps.length);

        // Update chain state to inherit target piece type!
        setBoard(newBoard);
        setChainState({
          ...chainState,
          currentPos: pos,
          activeIdentity: targetPiece.type, // TAKEOVER IDENTITY!
          stepsTaken: updatedSteps,
          capturedThisTurn: updatedCaptured,
        });
      } else {
        // NON-CAPTURE MOVE IN CHAIN -> Turn Ends automatically!
        soundManager.playMove();
        const updatedSteps = [...chainState.stepsTaken, newStep];
        finalizeTurn(
          newBoard,
          updatedSteps,
          chainState.capturedThisTurn,
          chainState.originalType,
          chainState.activeIdentity
        );
      }
      return;
    }

    // 2. IF NOT IN CHAIN STATE
    const clickedPiece = board[pos.row][pos.col];

    if (selectedPos && validMoves.some((m) => isSamePos(m, pos))) {
      // Execute initial move from selectedPos to pos
      const movingPiece = board[selectedPos.row][selectedPos.col];
      if (!movingPiece) return;

      const targetPiece = board[pos.row][pos.col];
      const newBoard = cloneBoard(board);

      newBoard[pos.row][pos.col] = movingPiece;
      newBoard[selectedPos.row][selectedPos.col] = null;

      const initialStep: MoveStep = {
        from: selectedPos,
        to: pos,
        capturedPiece: targetPiece,
        activeType: movingPiece.type,
        isChainStep: false,
      };

      if (targetPiece) {
        // INITIAL CAPTURE -> ACTIVATES CHAIN MODE!
        if (targetPiece.type === 'king') {
          setBoard(newBoard);
          setWinner(currentTurn);
          setWinReason('King captured!');
          soundManager.playWin();
          return;
        }

        soundManager.playCombo(1);

        setBoard(newBoard);
        setChainState({
          pieceId: movingPiece.id,
          startPos: selectedPos,
          currentPos: pos,
          activeIdentity: targetPiece.type, // TAKEOVER IDENTITY!
          originalType: movingPiece.type,
          color: currentTurn,
          stepsTaken: [initialStep],
          capturedThisTurn: [targetPiece],
        });
        setSelectedPos(null);
      } else {
        // NORMAL NON-CAPTURE MOVE -> Ends Turn
        soundManager.playMove();
        finalizeTurn(newBoard, [initialStep], [], movingPiece.type, movingPiece.type);
      }
    } else if (clickedPiece && clickedPiece.color === currentTurn) {
      // Select piece of current player's color
      soundManager.playMove();
      setSelectedPos(pos);
    } else {
      setSelectedPos(null);
    }
  };

  // End active chain turn manually
  const handleEndChain = () => {
    if (!chainState) return;
    finalizeTurn(
      board,
      chainState.stepsTaken,
      chainState.capturedThisTurn,
      chainState.originalType,
      chainState.activeIdentity
    );
  };

  // Undo last step in active chain
  const handleUndoChainStep = () => {
    if (!chainState || chainState.stepsTaken.length === 0) return;

    if (chainState.stepsTaken.length === 1) {
      // Revert completely to pre-turn state
      const firstStep = chainState.stepsTaken[0];
      const newBoard = cloneBoard(board);

      const movingPiece = newBoard[chainState.currentPos.row][chainState.currentPos.col];
      newBoard[firstStep.from.row][firstStep.from.col] = movingPiece;
      newBoard[chainState.currentPos.row][chainState.currentPos.col] = firstStep.capturedPiece;

      setBoard(newBoard);
      setChainState(null);
      setSelectedPos(firstStep.from);
    } else {
      // Revert 1 hop back
      const lastStep = chainState.stepsTaken[chainState.stepsTaken.length - 1];
      const prevStep = chainState.stepsTaken[chainState.stepsTaken.length - 2];

      const newBoard = cloneBoard(board);
      const movingPiece = newBoard[chainState.currentPos.row][chainState.currentPos.col];

      newBoard[lastStep.from.row][lastStep.from.col] = movingPiece;
      newBoard[chainState.currentPos.row][chainState.currentPos.col] = lastStep.capturedPiece;

      const updatedSteps = chainState.stepsTaken.slice(0, -1);
      const updatedCaptured = chainState.capturedThisTurn.slice(0, -1);

      setBoard(newBoard);
      setChainState({
        ...chainState,
        currentPos: lastStep.from,
        activeIdentity: prevStep.capturedPiece ? prevStep.capturedPiece.type : chainState.originalType,
        stepsTaken: updatedSteps,
        capturedThisTurn: updatedCaptured,
      });
    }
  };

  // Reset Game
  const handleResetGame = () => {
    setBoard(createInitialBoard());
    setCurrentTurn('white');
    setSelectedPos(null);
    setValidMoves([]);
    setChainState(null);
    setHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWinner(null);
    setWinReason('');
    setMaxComboThisGame(0);
    setLastMove(null);
  };

  // AI Opponent Trigger Effect
  useEffect(() => {
    if (
      settings.mode === 'ai' &&
      currentTurn === settings.aiColor &&
      !winner &&
      !isAIThinking
    ) {
      setIsAIThinking(true);

      const timer = setTimeout(() => {
        const plan = getAIMovePlan(board, settings.aiColor, settings.aiDifficulty);

        if (!plan || plan.steps.length === 0) {
          // No legal moves
          setWinner(settings.aiColor === 'white' ? 'black' : 'white');
          setWinReason('Opponent has no legal moves (Stalemate)');
          setIsAIThinking(false);
          return;
        }

        // Execute AI plan sequentially
        let tempBoard = cloneBoard(board);
        let currPos = plan.startPos;
        const capturedList: Piece[] = [];
        const stepsTaken: MoveStep[] = [];
        const movingPiece = tempBoard[currPos.row][currPos.col];

        if (!movingPiece) {
          setIsAIThinking(false);
          return;
        }

        let activeType = movingPiece.type;

        for (let i = 0; i < plan.steps.length; i++) {
          const targetPos = plan.steps[i];
          const targetPiece = tempBoard[targetPos.row][targetPos.col];

          tempBoard[targetPos.row][targetPos.col] = movingPiece;
          tempBoard[currPos.row][currPos.col] = null;

          const step: MoveStep = {
            from: currPos,
            to: targetPos,
            capturedPiece: targetPiece,
            activeType,
            isChainStep: i > 0,
          };
          stepsTaken.push(step);

          if (targetPiece) {
            capturedList.push(targetPiece);
            activeType = targetPiece.type; // Identity takeover
            if (targetPiece.type === 'king') {
              setBoard(tempBoard);
              setWinner(settings.aiColor);
              setWinReason('Bot captured your King in a multi-hop combo!');
              soundManager.playLoss();
              setIsAIThinking(false);
              return;
            }
          }

          currPos = targetPos;
        }

        if (capturedList.length > 0) {
          soundManager.playCombo(capturedList.length);
        } else {
          soundManager.playMove();
        }

        finalizeTurn(
          tempBoard,
          stepsTaken,
          capturedList,
          movingPiece.type,
          activeType
        );
        setIsAIThinking(false);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [
    currentTurn,
    settings.mode,
    settings.aiColor,
    settings.aiDifficulty,
    board,
    winner,
    isAIThinking,
    finalizeTurn,
  ]);

  const { diff: materialDiff } = getMaterialDifference(board);
  const isFlipped = settings.autoFlipBoard ? currentTurn === 'black' : settings.aiColor === 'white';

  return (
    <div className="min-h-screen bg-[#080808] text-gray-300 flex flex-col items-center justify-between p-3 sm:p-6 font-sans">
      <div className="w-full flex flex-col items-center max-w-2xl mx-auto my-auto space-y-4">
        {/* Game Header */}
        <GameHeader
          currentTurn={currentTurn}
          settings={settings}
          capturedWhite={capturedWhite.map((p) => p.type)}
          capturedBlack={capturedBlack.map((p) => p.type)}
          materialDiff={materialDiff}
          onResetGame={handleResetGame}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSound={() =>
            setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onToggleMode={(newMode) =>
            setSettings((s) => ({ ...s, mode: newMode }))
          }
          isAITinking={isAIThinking}
        />

        {/* Interactive Chessboard */}
        <Chessboard
          board={board}
          currentTurn={currentTurn}
          selectedPos={selectedPos}
          validMoves={validMoves}
          chainState={chainState}
          theme={settings.theme}
          isFlipped={isFlipped}
          onSelectSquare={handleSelectSquare}
          onEndChain={handleEndChain}
          onUndoChainStep={handleUndoChainStep}
          lastMove={lastMove}
          disabled={isAIThinking || !!winner}
        />

        {/* Move & Combo History */}
        <div className="w-full mt-4">
          <MoveHistory history={history} />
        </div>
      </div>

      {/* Modals */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
        onClose={() => setIsSettingsOpen(false)}
      />

      <GameOverModal
        winner={winner}
        reason={winReason}
        totalTurns={history.length}
        maxCombo={maxComboThisGame}
        onRematch={handleResetGame}
      />
    </div>
  );
}
