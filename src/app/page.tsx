'use client'

// 必要なフックやコンポーネントをインポート
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

// グリッドサイズ、最大シーケンス長、ハイライトの継続時間や間隔を定義
const GRID_SIZE = 5 // グリッドの行と列の数
const MAX_SEQUENCE = 10 // ゲームの最大レベル
const HIGHLIGHT_DURATION = 500 // セルのハイライト継続時間（ミリ秒）
const HIGHLIGHT_INTERVAL = 1000 // シーケンス間の間隔（ミリ秒）

export default function Home() {
  // ゲームの状態を管理するためのuseStateフック
  const [sequence, setSequence] = useState<number[]>([]) // システムが生成したシーケンス
  const [playerSequence, setPlayerSequence] = useState<number[]>([]) // プレイヤーの入力シーケンス
  const [isPlaying, setIsPlaying] = useState(false) // システムがシーケンスを表示中かどうか
  const [gameOver, setGameOver] = useState(false) // ゲーム終了状態
  const [highlightedCells, setHighlightedCells] = useState<number[]>([]) // 現在ハイライトされているセル

  // シーケンスをハイライト表示する関数
  const highlightSequence = useCallback(() => {
    setIsPlaying(true) // プレイヤーの操作を無効化
    sequence.forEach((cell, index) => {
      setTimeout(() => {
        setHighlightedCells([cell]) // 対応するセルをハイライト
        setTimeout(() => setHighlightedCells([]), HIGHLIGHT_DURATION) // ハイライトを元に戻す
      }, index * HIGHLIGHT_INTERVAL) // シーケンスの順番に応じて遅延させる
    })
    setTimeout(() => setIsPlaying(false), sequence.length * HIGHLIGHT_INTERVAL) // 全シーケンス終了後に操作可能にする
  }, [sequence])

  // シーケンスが更新された場合にハイライトを開始
  useEffect(() => {
    if (sequence.length > 0 && playerSequence.length === 0) {
      highlightSequence() // プレイヤー入力がまだの場合にハイライトを実行
    }
  }, [sequence, playerSequence, highlightSequence])

  // ゲームを開始する関数
  const startGame = () => {
    const newSequence = [Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))] // ランダムなセルを選択
    setSequence(newSequence) // 新しいシーケンスを設定
    setPlayerSequence([]) // プレイヤーシーケンスをリセット
    setGameOver(false) // ゲーム終了状態をリセット
  }

  // プレイヤーがセルをクリックしたときの処理
  const handleCellClick = (index: number) => {
    if (isPlaying || gameOver) return // ゲーム中や終了時は何もしない

    setHighlightedCells([index]) // クリックしたセルを一時的にハイライト
    setTimeout(() => setHighlightedCells([]), HIGHLIGHT_DURATION) // ハイライトを元に戻す

    const newPlayerSequence = [...playerSequence, index] // プレイヤーシーケンスに追加
    setPlayerSequence(newPlayerSequence)

    // プレイヤーシーケンスが正しいかチェック
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true) // 間違えた場合はゲームオーバー
      return
    }

    // シーケンスが完了した場合の処理
    if (newPlayerSequence.length === sequence.length) {
      if (sequence.length === MAX_SEQUENCE) {
        setGameOver(true) // 最大レベルに到達したらゲーム終了
        return
      }

      setTimeout(() => {
        const newSequence = [...sequence, Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))] // 新しいセルを追加
        setSequence(newSequence) // シーケンスを更新
        setPlayerSequence([]) // プレイヤーシーケンスをリセット
      }, 2000)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Memory Game</title> {/* ページタイトル */}
        <link rel="icon" href="/favicon.ico" /> {/* ファビコン */}
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">Memory Game</h1> {/* ゲームタイトル */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {/* グリッドをレンダリング */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              className={`w-16 h-16 rounded-md ${
                highlightedCells.includes(index)
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
              onClick={() => handleCellClick(index)} 
              disabled={isPlaying || gameOver}
            />
          ))}
        </div>
        <p className="text-xl mb-4">
          {gameOver
            ? `Game Over! Score: ${sequence.length - 1}`
            : `Current Level: ${sequence.length}`}
        </p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={startGame}
        >
          {gameOver ? 'Play Again' : 'Start Game'} {/* ボタンラベル */}
        </button>
      </main>
    </div>
  )
}
