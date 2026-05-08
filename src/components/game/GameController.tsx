
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
import { RefreshCw, PlayCircle } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

// AI flow is imported but we'll handle it dynamically to support static export
let curateDynamicDifficulty: any = null;
try {
  const aiModule = require("@/ai/flows/curate-dynamic-difficulty");
  curateDynamicDifficulty = aiModule.curateDynamicDifficulty;
} catch (e) {
  // Silent fail
}

export function GameController() {
  const { t, locale } = useTranslation();
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

  useEffect(() => {
    const saved = localStorage.getItem('pop-block-high-score')
    if (saved) {
      setState(prev => ({ ...prev, highScore: parseInt(saved, 10) }))
    }
  }, [])

  const getHeuristicDifficulty = (performance: any, current: any) => {
    const avgScore = performance.cumulativeScore / (performance.totalGames || 1);
    const scoreDiff = performance.lastGameScore / (avgScore || 1);
    
    let nextWidth = current.width;
    let nextHeight = current.height;
    let nextColors = current.numColors;
    let nextLevel: 'easy' | 'medium' | 'hard' = state.difficulty;

    if (scoreDiff > 1.2 || performance.lastMaxCombo > 8) {
      nextWidth = Math.min(12, nextWidth + 1);
      nextHeight = Math.min(15, nextHeight + 1);
      nextColors = Math.min(6, nextColors + 1);
      nextLevel = nextLevel === 'easy' ? 'medium' : 'hard';
    } else if (scoreDiff < 0.8 && performance.totalGames > 2) {
      nextWidth = Math.max(8, nextWidth - 1);
      nextHeight = Math.max(8, nextHeight - 1);
      nextColors = Math.max(4, nextColors - 1);
      nextLevel = nextLevel === 'hard' ? 'medium' : 'easy';
    }

    return {
      recommendedBoardWidth: nextWidth,
      recommendedBoardHeight: nextHeight,
      recommendedNumColors: nextColors,
      recommendedDifficultyLevel: nextLevel,
      difficultyAdjustmentFeedback: locale === 'ru' 
        ? "Система адаптировала сложность на основе вашей игры." 
        : "Adaptive system adjusted difficulty based on your performance."
    };
  };

  const startNewGame = useCallback(async (isAiAdjustment = false) => {
    let newConfig = { ...state.config }
    let newDifficulty = state.difficulty

    if (isAiAdjustment && performanceHistory.totalGames > 0) {
      try {
        if (curateDynamicDifficulty && typeof curateDynamicDifficulty === 'function') {
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
            },
            locale: locale
          })

          newConfig = {
            width: Math.min(result.recommendedBoardWidth, 12),
            height: Math.min(result.recommendedBoardHeight, 15),
            numColors: result.recommendedNumColors
          }
          newDifficulty = result.recommendedDifficultyLevel
          setAiFeedback(result.difficultyAdjustmentFeedback)
        } else {
          throw new Error("AI not available");
        }
      } catch (error) {
        const result = getHeuristicDifficulty(performanceHistory, state.config);
        newConfig = {
          width: result.recommendedBoardWidth,
          height: result.recommendedBoardHeight,
          numColors: result.recommendedNumColors
        }
        newDifficulty = result.recommendedDifficultyLevel
        setAiFeedback(result.difficultyAdjustmentFeedback)
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
  }, [state.config, state.difficulty, state.score, performanceHistory, locale])

  useEffect(() => {
    startNewGame()
  }, [])

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver) return

    const group = getConnectedBlocks(state.grid, x, y)
    if (group.length < 2) return

    const groupKey = group.map(p => `${p[0]},${p[1]}`).sort().join('|')
    const targetKey = targetedGroup.map(p => `${p[0]},${p[1]}`).sort().join('|')

    if (groupKey === targetKey) {
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-4 md:py-8">
      <GameStats 
        score={state.score} 
        highScore={state.highScore} 
        moves={state.moves} 
        difficulty={state.difficulty}
        aiFeedback={aiFeedback}
      />

      <div className="relative group w-full max-w-sm md:max-w-xl">
        <div 
          className="grid gap-1 p-2 rounded-2xl bg-white/40 shadow-xl border border-white/60 backdrop-blur-md mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            width: '100%',
            maxWidth: '100%',
            aspectRatio: `${state.config.width} / ${state.config.height}`
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
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl animate-in fade-in zoom-in duration-300 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-headline text-center">{t.gameOver}</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 font-medium text-center">{t.finalScore}: {state.score}</p>
            <div className="flex gap-4">
              <Button size="lg" onClick={finalizeGame} className="rounded-full px-8 bg-primary hover:bg-primary/90">
                <PlayCircle className="mr-2" size={20} />
                {t.playAgain}
              </Button>
            </div>
          </div>
        )}
      </div>

      {!state.gameOver && (
        <div className="mt-6 md:mt-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => startNewGame()} 
            className="rounded-full border-primary text-primary hover:bg-primary/10 transition-colors h-9 px-4"
          >
            <RefreshCw className="mr-2" size={14} />
            {t.resetSession}
          </Button>
        </div>
      )}
    </div>
  )
}
