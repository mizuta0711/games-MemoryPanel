'use client'

import React, { useState, useReducer } from 'react';
import { GameManager } from './GameManager';

const GRID_SIZE: number = 3; // グリッドサイズ
const MAX_SEQUENCE: number = 10; // 最大シーケンス数

export default function Home() {
  /**
   * 操作方法（遊び方）の表示状態を管理するフラグ。
   * trueの場合、遊び方が表示されます。
   * @type {boolean}
   */
  const [showInstructions, setShowInstructions] = useState(false)
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // 強制再描画

  // GameManager のインスタンスを作成
  const [gameManager] = useState(
    new GameManager(GRID_SIZE, MAX_SEQUENCE, setHighlightedCells, forceUpdate)
  );

  // ボタンクリック時の処理
  const handleCellClick = (index: number) => {
    gameManager.handlePlayerInput(index);
  };

  // グリッドのクラス名を取得
  const getGridColsClassName = () => {
    if (GRID_SIZE === 2) return 'grid-cols-2';
    if (GRID_SIZE === 3) return 'grid-cols-3';
    if (GRID_SIZE === 4) return 'grid-cols-4';
    if (GRID_SIZE === 5) return 'grid-cols-5';
    return 'grid-cols-5';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">パネル暗記ゲーム</h1>

        <div className="mb-4">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="mb-2 p-2 bg-green-500 text-white rounded"
        >
          {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
        </button>

        {showInstructions && (
          <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-xl font-bold mb-2">遊び方</h2>
            <p>パネルの光った順番を暗記するゲームです。</p>
            <p>「開始する」を押すと、パネルが順番に光ります。</p>
            <p>光ったパネルの順番通りに、パネルを押してください。</p>
            <p>押したパネルの順番が正しければ正解で、間違えるとゲームオーバーになります。</p>
            <p>最初はレベル１からスタートして、正解すればレベルが１上がります。</p>
            <p>レベル１０を正解するとゲームクリアです。</p>
          </div>
        )}
      </div>

        <div className={`grid gap-2 mb-8 ${getGridColsClassName()}`}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              className={`w-16 h-16 rounded-md text-3xl ${
                highlightedCells.includes(index) ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onClick={() => handleCellClick(index)}
              disabled={gameManager.isPlaying || gameManager.gameOver}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <p className="text-xl mb-4">
            {gameManager.sequence.length > 0 && (
            gameManager.gameOver
              ? `ゲームオーバー! スコア: ${gameManager.sequence.length - 1}`
              : `現在のレベル: ${gameManager.sequence.length}`
            )}
        </p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={() => gameManager.startGame()}
        >
          {gameManager.gameOver ? '再挑戦' : '開始する'}
        </button>
      </main>
    </div>
  );
}
