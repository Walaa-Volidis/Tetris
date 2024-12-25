'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'bg-cyan-500',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'bg-blue-500',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'bg-orange-500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-500',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'bg-green-500',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'bg-purple-500',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'bg-red-500',
  },
};

type Piece = {
  shape: number[][];
  color: string;
};

type Position = {
  x: number;
  y: number;
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const generateRandomPiece = useCallback(() => {
    const piece = Object.keys(TETROMINOES);
    const randomPiece = piece[Math.floor(Math.random() * piece.length)];
    return {
      shape: TETROMINOES[randomPiece].shape,
      color: TETROMINOES[randomPiece].color,
    };
  }, []);

  const checkCollision = useCallback(
    (piece: Piece, position: Position) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const newX = position.x + x;
            const newY = position.y + y;

            if (
              newX < 0 ||
              newX >= BOARD_WIDTH ||
              newY >= BOARD_HEIGHT ||
              (newY >= 0 && board[newY][newX])
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  const mergePieceWithBoard = useCallback(() => {
    const newBoard = board.map((row) => [...row]);
    for (let y = 0; y < currentPiece!.shape.length; y++) {
      for (let x = 0; x < currentPiece!.shape[0].length; x++) {
        if (currentPiece!.shape[y][x]) {
          const boardY = currentPosition.y + y;
          if (boardY >= 0) {
            newBoard[boardY][currentPosition.x + x] = currentPiece!.color;
          }
        }
      }
    }
    return newBoard;
  }, [board, currentPiece, currentPosition]);

  const clearRows = useCallback((board: number[][]) => {
    let clearedRows = 0;
    const newBoard = board.filter((row: number[]) => {
      if (row.every((cell: number) => cell !== null)) {
        clearedRows++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    if (clearedRows > 0) {
      setScore((prevScore) => prevScore + clearedRows * 100);
    }
    return newBoard;
  }, []);

  const moveDown = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const newPosition = { ...currentPosition, y: currentPosition.y + 1 };

    if (checkCollision(currentPiece!, newPosition)) {
      const newBoard = mergePieceWithBoard();
      const clearedBoard = clearRows(newBoard);
      setBoard(clearedBoard);

      const newPiece = generateRandomPiece();
      const newPiecePosition = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: -2 };

      if (checkCollision(newPiece, newPiecePosition)) {
        setGameOver(true);
      } else {
        setCurrentPiece(newPiece);
        setCurrentPosition(newPiecePosition);
      }
    } else {
      setCurrentPosition(newPosition);
    }
  }, [
    currentPiece,
    currentPosition,
    board,
    gameOver,
    isPaused,
    gameStarted,
    checkCollision,
    mergePieceWithBoard,
    clearRows,
    generateRandomPiece,
  ]);

  const moveHorizontally = useCallback(
    (direction: number) => {
      if (gameOver || isPaused || !gameStarted) return;

      const newPosition = {
        ...currentPosition,
        x: currentPosition.x + direction,
      };
      if (!checkCollision(currentPiece!, newPosition)) {
        setCurrentPosition(newPosition);
      }
    },
    [
      currentPiece,
      currentPosition,
      gameOver,
      isPaused,
      gameStarted,
      checkCollision,
    ]
  );

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          moveHorizontally(-1);
          break;
        case 'ArrowRight':
          moveHorizontally(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case ' ':
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHorizontally, moveDown]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const gameLoop = setInterval(moveDown, 1000);
    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, isPaused, moveDown]);

  const startNewGame = () => {
    setBoard(createEmptyBoard());
    const newPiece = generateRandomPiece();
    setCurrentPiece(newPiece);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: -2 });
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setIsPaused(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Tetris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-bold">Score: {score}</div>

          <div className="border-2 border-gray-200 p-1">
            <div className="grid grid-cols-10 gap-px bg-gray-200">
              {renderBoard().map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-6 h-6 ${cell || 'bg-white'}`}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!gameStarted || gameOver ? (
              <Button onClick={startNewGame}>
                <Play className="w-4 h-4 mr-2" />
                {gameOver ? 'Play Again' : 'Start Game'}
              </Button>
            ) : (
              <>
                <Button onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={() => moveHorizontally(-1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button onClick={moveDown}>
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button onClick={() => moveHorizontally(1)}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {gameOver && (
            <div className="text-xl font-bold text-red-500">Game Over!</div>
          )}

          <div className="text-sm text-gray-500">
            Use arrow keys to move and rotate. Space to pause.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
