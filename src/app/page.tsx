'use client'

import React, { useState, useReducer } from 'react';
import { GameManager } from './GameManager';
import { GameDifficulty } from './types';

export default function Home() {
  /**
   * 操作方法（遊び方）の表示状態を管理するフラグ。
   * trueの場合、遊び方が表示されます。
   * @type {boolean}
   */
  const [showInstructions, setShowInstructions] = useState(false)
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [gridSize, setGridSize] = useState(3);
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0); // 強制再描画

  // GameManager のインスタンスを作成
  const initializeGameManager = (difficulty: GameDifficulty) => {
    return new GameManager(
      difficulty,
      setHighlightedCells,
      forceUpdate
    );
  };

  // GameManagerのステート管理
  const [gameManager, setGameManager] = useState(() =>
    initializeGameManager(difficulty)
  );

  // 難易度変更時の処理
  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    setGameManager(initializeGameManager(newDifficulty));
    
    // 難易度に応じグリッドサイズに表示を変更
    setGridSize(gameManager.getDifficultyGridSize(newDifficulty));
  };

  // ボタンクリック時の処理
  const handleCellClick = (index: number) => {
    gameManager.handlePlayerInput(index);
  };

  // グリッドのクラス名を取得
  const getGridColsClassName = () => {
    if (gridSize === 2) return 'grid-cols-2';
    if (gridSize === 3) return 'grid-cols-3';
    if (gridSize === 4) return 'grid-cols-4';
    if (gridSize === 5) return 'grid-cols-5';
    return 'grid-cols-5';
  };

  return (
    <div className="flex min-h-screen flex-col items-center py-2">
      <main className="flex w-full flex-1 flex-col items-center text-center">
        <h1 className="text-2xl font-bold mb-4">パネル暗記ゲーム</h1>

        <div className="mb-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mb-2 p-2 bg-green-500 text-white rounded"
          >
            {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
          </button>

          {showInstructions && (
            <div className="p-4 border rounded bg-gray-100 text-left">
              <h2 className="text-ml font-bold mb-2">遊び方</h2>
              <p>パネルの光った順番を暗記するゲームです。</p>
              <p>「開始する」を押すと、パネルが順番に光ります。</p>
              <p>光ったパネルの順番通りに、パネルを押してください。</p>
              <p>押したパネルの順番が正しければ正解で、間違えるとゲームオーバーになります。</p>
              <p>最初はレベル１からスタートして、正解すればレベルが１上がります。</p>
              <p>難易度に応じた規定レベルに到達するとゲームクリアです。</p>
              <br />
              <p>【難易度】</p>
              <p>かんたん：2×2のパネル、最大4レベル、速度は遅い</p>
              <p>ふつう：3×3のパネル、最大9レベル、速度は普通</p>
              <p>むずかしい：4×4のパネル、最大16レベル、速度は速い</p>
              <p>とてもむずかしい：5×5のパネル、最大25レベル、速度はめっちゃ速い</p>
              <p>おに：5×5のパネル、最大50レベル、速度は鬼</p>
            </div>
          )}
        </div>

        {/* 難易度選択 */}
        <div className="mb-4 space-x-2">
          <label className="mr-2">難易度:</label>
          <select
            value={difficulty}
            onChange={(e) => handleDifficultyChange(e.target.value as GameDifficulty)}
            className="px-2 py-1 border rounded"
            disabled={gameManager.isPlaying}
          >
            <option value="easy">かんたん</option>
            <option value="normal">ふつう</option>
            <option value="hard">むずかしい</option>
            <option value="expert">とてもむずかしい</option>
            <option value="oni">おに</option>
          </select>
        </div>

        {/* 開始ボタン */}
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md mb-8"
          onClick={() => gameManager.startGame()}
        >
          {gameManager.isPlaying ? '再挑戦する' : '開始する'}
        </button>

        {/* メッセージ */}
        <p className="text-xl mb-4">
          {gameManager.isPlaying == false ? (
            '「開始する」を押してください'
          ) : (gameManager.isCorrect ? ("正解です！！") : (
            (gameManager.isHilighting ? '覚えてください' : '順番を押してください')
          ))}
        </p>

        {/* パネル */}
        <div className={`grid gap-2 mb-8 ${getGridColsClassName()}`}>
          {Array.from({ length: gridSize * gridSize }).map((_, index) => (
            <button
              key={index}
              className={`w-16 h-16 rounded-md text-3xl ${highlightedCells.includes(index) ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              onClick={() => handleCellClick(index)}
              disabled={gameManager.isHilighting || gameManager.isGameOver}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* レベル表示 */}
        <p className="text-2xl mb-4">
          {gameManager.sequence.length > 0 ? (
            gameManager.isGameOver
              ? `ゲームオーバー! スコア: ${gameManager.sequence.length - 1}`
              : `現在のレベル: ${gameManager.sequence.length}`
          ) : (`現在のレベル: `)}
        </p>

      </main>
    </div>
  );
}
