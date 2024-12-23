'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  RotateCw,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

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

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = () => Array.from({length: BOARD_HEIGHT}, ()=>Array(BOARD_WIDTH).fill(null));

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const generateRandomPiece = useCallback(()=>{
     const piece = Object.keys(TETROMINOES);
     const randomPiece = piece[Math.floor(Math.random() *piece.length)];
     return{
      shape: TETROMINOES[randomPiece].shape,
      color: TETROMINOES[randomPiece].color
     }
  },[]);

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
                <Button onClick={rotatePiece}>
                  <RotateCw className="w-4 h-4" />
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
