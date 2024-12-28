'use client'

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import GameManager from '../models/GameManager'

// 定数の定義
const GRID_SIZE = 3
const MAX_SEQUENCE = 10
const HIGHLIGHT_DURATION = 500
const HIGHLIGHT_INTERVAL = 1000
const NEXT_SEQUENCE_INTERVAL = 2000

export default function Home() {
  const [gameManager] = useState(new GameManager(GRID_SIZE, MAX_SEQUENCE))
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highlightedCells, setHighlightedCells] = useState<number[]>([])

  const highlightSequence = useCallback(() => {
    setIsPlaying(true)
    gameManager.sequence.forEach((cell, index) => {
      setTimeout(() => {
        setHighlightedCells([cell])
        setTimeout(() => setHighlightedCells([]), HIGHLIGHT_DURATION)
      }, index * HIGHLIGHT_INTERVAL)
    })
    setTimeout(() => setIsPlaying(false), gameManager.sequence.length * HIGHLIGHT_INTERVAL)
  }, [gameManager])

  useEffect(() => {
    if (gameManager.sequence.length > 0 && playerSequence.length === 0) {
      highlightSequence()
    }
  }, [gameManager, playerSequence, highlightSequence])

  const startGame = () => {
    gameManager.startGame()
    setPlayerSequence([])
    setGameOver(false)
  }

  const handleCellClick = (index: number) => {
    if (isPlaying || gameOver) return

    setHighlightedCells([index])
    setTimeout(() => setHighlightedCells([]), HIGHLIGHT_DURATION)

    const newPlayerSequence = [...playerSequence, index]
    setPlayerSequence(newPlayerSequence)

    if (!gameManager.validatePlayerInput(newPlayerSequence)) {
      setGameOver(true)
      return
    }

    if (newPlayerSequence.length === gameManager.sequence.length) {
      if (gameManager.isGameClear()) {
        setGameOver(true)
        return
      }

      setTimeout(() => {
        gameManager.addNextCell()
        setPlayerSequence([])
      }, NEXT_SEQUENCE_INTERVAL)
    }
  }

  const getGridColsClassName = () => {
    return GRID_SIZE === 3 ? 'grid-cols-3' : GRID_SIZE === 4 ? 'grid-cols-4' : 'grid-cols-5'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>パネル暗記ゲーム</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">パネル暗記ゲーム</h1>
        <div className={`grid gap-2 mb-8 ${getGridColsClassName()}`}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              className={`w-16 h-16 rounded-md flex items-center justify-center text-4xl ${
                highlightedCells.includes(index) ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onClick={() => handleCellClick(index)}
              disabled={isPlaying || gameOver}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <p className="text-xl mb-4">
          {gameOver ? `ゲームオーバー! スコア：${gameManager.sequence.length - 1}` : `現在のレベル：${gameManager.sequence.length}`}
        </p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={startGame}
        >
          {gameOver ? '再挑戦' : '開始する'}
        </button>
      </main>
    </div>
  )
}
