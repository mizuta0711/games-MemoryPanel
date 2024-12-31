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
  const [showInstructions, setShowInstructions] = useState(false);

  /**
   * 現在選択されているゲームの難易度。
   * @type {GameDifficulty} 'easy' | 'normal' | 'hard' | 'expert' | 'oni'
   */
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');

  /**
   * 現在のグリッドサイズを管理。
   * 難易度によって2×2, 3×3など異なります。
   * @type {number}
   */
  const [gridSize, setGridSize] = useState(3);

  /**
   * 現在ハイライトされているセルのインデックスを保持。
   * ハイライトされたセルは視覚的に光るように表示されます。
   * @type {number[]}
   */
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]);

  /**
   * コンポーネントを強制的に再描画するためのフック。
   * 値は利用せず、ディスパッチ関数を用いて描画をトリガーします。
   */
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  /**
   * GameManager のインスタンスを初期化する関数。
   * 難易度、ハイライト状態管理関数、再描画関数を渡して生成します。
   * @param {GameDifficulty} difficulty - 選択されたゲーム難易度。
   * @returns {GameManager} 初期化された GameManager のインスタンス。
   */
  const initializeGameManager = (difficulty: GameDifficulty) => {
    return new GameManager(
      difficulty,
      setHighlightedCells,
      forceUpdate
    );
  };

  /**
   * GameManager のインスタンスを管理。
   * 難易度変更時や初期化時に再生成されます。
   * @type {GameManager}
   */
  const [gameManager, setGameManager] = useState(() =>
    initializeGameManager(difficulty)
  );

  /**
   * 難易度変更時の処理。
   * 新しい難易度に基づき GameManager を再生成し、グリッドサイズを更新します。
   * @param {GameDifficulty} newDifficulty - 新しく選択された難易度。
   */
  const handleDifficultyChange = (newDifficulty: GameDifficulty) => {
    setDifficulty(newDifficulty);
    setGameManager(initializeGameManager(newDifficulty));

    // 難易度に応じてグリッドサイズを変更
    setGridSize(gameManager.getDifficultyGridSize(newDifficulty));
  };

  /**
   * プレイヤーがセルをクリックしたときの処理。
   * GameManager を通じて入力を処理します。
   * @param {number} index - クリックされたセルのインデックス。
   */
  const handleCellClick = (index: number) => {
    gameManager.handlePlayerInput(index);
  };

  /**
   * 現在のグリッドサイズに応じた CSS クラス名を取得。
   * @returns {string} グリッド列数を表すクラス名。
   */
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

        <div className="flex items-center mb-4">
          {/* 遊び方ボタン */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            {showInstructions ? '遊び方を隠す' : '遊び方を見る'}
          </button>

          {/* 開始ボタン */}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md ml-2"
            onClick={() => gameManager.startGame()}
          >
            {gameManager.isPlaying ? '再挑戦する' : '開始する'}
          </button>
        </div>

        {/* 遊び方 */}
        <div className="mb-2">
          {showInstructions && (
            <div className="p-4 border rounded bg-gray-100 text-left">
              <h2 className="text-ml font-bold mb-2">遊び方</h2>
              {/* 遊び方説明 */}
            </div>
          )}
        </div>

        {/* メッセージ */}
        <p className="text-xl mb-4">
          {gameManager.isPlaying == false ? (
            '「開始する」を押してください'
          ) : (gameManager.isCorrect ? ("正解です！！") : (
            (gameManager.isHilighting ? '覚えてください' : '順番を押してください')
          ))}
        </p>

        {/* パネル */}
        <div className={`grid gap-2 mb-4 ${getGridColsClassName()}`}>
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
        <p className="text-xl">
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
