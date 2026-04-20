"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  generateGrid, 
  getConnectedBlocks, 
  processClear, 
  calculateMoveScore, 
  checkGameOver,
  type Grid,
  type GameState 
} from "@/lib/game-logic"
import { Block } from "./Block"
import { GameStats } from "./GameStats"
import { Button } from "@/components/ui/button"
import { curateDynamicDifficulty } from "@/ai/flows/curate-dynamic-difficulty"
import { RefreshCw, PlayCircle } from "lucide-react"

export function GameController() {
  const [state, setState] = useState<GameState>({
    grid: [],
    score: 0,
    highScore: 0,
    gameOver: false,
    moves: 0,
    difficulty: 'easy',
    config: { width: 10, height: 10, numColors: 4 }
  })
  
  const [performanceHistory, setPerformanceHistory] = useState({
    totalGames: 0,
    cumulativeScore: 0,
    lastMaxCombo: 0,
    lastAvgClear: 0
  })

  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [targetedGroup, setTargetedGroup] = useState<[number, number][]>([])

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('pop-block-high-score')
    if (saved) {
      setState(prev => ({ ...prev, highScore: parseInt(saved, 10) }))
    }
  }, [])

  // Start new game
  const startNewGame = useCallback(async (isAiAdjustment = false) => {
    let newConfig = { ...state.config }
    let newDifficulty = state.difficulty

    if (isAiAdjustment && performanceHistory.totalGames > 0) {
      try {
        const result = await curateDynamicDifficulty({
          playerPerformance: {
            lastGameScore: state.score,
            averageScore: performanceHistory.cumulativeScore / performanceHistory.totalGames,
            gamesPlayed: performanceHistory.totalGames,
            difficultyLevelLastGame: state.difficulty,
            averageBlocksClearedPerMove: performanceHistory.lastAvgClear,
            maxComboCleared: performanceHistory.lastMaxCombo,
          },
          gameConfiguration: {
            currentBoardWidth: state.config.width,
            currentBoardHeight: state.config.height,
            currentNumColors: state.config.numColors,
          }
        })

        newConfig = {
          width: result.recommendedBoardWidth,
          height: result.recommendedBoardHeight,
          numColors: result.recommendedNumColors
        }
        newDifficulty = result.recommendedDifficultyLevel
        setAiFeedback(result.difficultyAdjustmentFeedback)
      } catch (error) {
        console.error("AI Difficulty adjustment failed", error)
      }
    }

    const newGrid = generateGrid(newConfig.width, newConfig.height, newConfig.numColors)
    
    setState(prev => ({
      ...prev,
      grid: newGrid,
      score: 0,
      gameOver: false,
      moves: 0,
      difficulty: newDifficulty,
      config: newConfig
    }))
    setTargetedGroup([])
  }, [state.config, state.difficulty, state.score, performanceHistory])

  // Initialize first game
  useEffect(() => {
    startNewGame()
  }, [])

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver) return

    const group = getConnectedBlocks(state.grid, x, y)
    
    // If not already targeting this group, target it first (optional UX)
    // For hypercasual, many people prefer 1-tap clear. 
    // We'll implement 2-tap clear or visual highlight.
    
    const groupKey = group.map(p => `${p[0]},${p[1]}`).sort().join('|')
    const targetKey = targetedGroup.map(p => `${p[0]},${p[1]}`).sort().join('|')

    if (group.length < 2) return

    if (groupKey === targetKey) {
      // Clear it!
      const points = calculateMoveScore(group.length)
      const newGrid = processClear(state.grid, group)
      const isGameOver = checkGameOver(newGrid)
      const newScore = state.score + points
      
      setState(prev => {
        const newHighScore = Math.max(prev.highScore, newScore)
        if (newHighScore > prev.highScore) {
          localStorage.setItem('pop-block-high-score', newHighScore.toString())
        }
        
        return {
          ...prev,
          grid: newGrid,
          score: newScore,
          highScore: newHighScore,
          moves: prev.moves + 1,
          gameOver: isGameOver
        }
      })

      // Update session stats for next AI adjustment
      setPerformanceHistory(prev => ({
        ...prev,
        lastMaxCombo: Math.max(prev.lastMaxCombo, group.length),
        lastAvgClear: ((prev.lastAvgClear * state.moves) + group.length) / (state.moves + 1)
      }))

      setTargetedGroup([])
    } else {
      setTargetedGroup(group)
    }
  }

  const finalizeGame = () => {
    setPerformanceHistory(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      cumulativeScore: prev.cumulativeScore + state.score
    }))
    startNewGame(true)
  }

  if (state.grid.length === 0) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
      <GameStats 
        score={state.score} 
        highScore={state.highScore} 
        moves={state.moves} 
        difficulty={state.difficulty}
        aiFeedback={aiFeedback}
      />

      <div className="relative group">
        <div 
          className="grid gap-1.5 p-3 rounded-2xl bg-white/40 shadow-xl border border-white/60 backdrop-blur-md"
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, minmax(25px, 45px))`,
            gridTemplateRows: `repeat(${state.config.height}, minmax(25px, 45px))`
          }}
        >
          {state.grid.map((row, y) => 
            row.map((colorIndex, x) => (
              <Block 
                key={`${x}-${y}`} 
                colorIndex={colorIndex} 
                isTargeted={targetedGroup.some(p => p[0] === x && p[1] === y)}
                onClick={() => handleBlockClick(x, y)} 
              />
            ))
          )}
        </div>

        {state.gameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-bold text-foreground mb-2 font-headline">Game Over!</h2>
            <p className="text-xl text-muted-foreground mb-6 font-medium">Final Score: {state.score}</p>
            <div className="flex gap-4">
              <Button size="lg" onClick={finalizeGame} className="rounded-full px-8 bg-primary hover:bg-primary/90">
                <PlayCircle className="mr-2" size={20} />
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {!state.gameOver && (
        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => startNewGame()} 
            className="rounded-full border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            <RefreshCw className="mr-2" size={16} />
            Reset Session
          </Button>
        </div>
      )}
    </div>
  )
}
