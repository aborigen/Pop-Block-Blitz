"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { RefreshCw, PlayCircle, Volume2, VolumeX } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { soundManager } from "@/lib/sound-effects"
import { initYandexSDK, showInterstitialAd, reportScore, reportReady, getEnvironment } from "@/lib/yandex-games"

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  points: number;
}

export function GameController() {
  const { t, locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
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
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [lastIncrement, setLastIncrement] = useState<number | null>(null)
  
  const scoreCounter = useRef(0)
  const incrementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isReadyReported = useRef(false)

  // Initialization
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('pop-block-high-score')
    if (saved) {
      setState(prev => ({ ...prev, highScore: parseInt(saved, 10) }))
    }

    // Initialize Yandex Games SDK and report ready when done
    initYandexSDK().then((sdk) => {
      if (sdk) {
        const env = sdk.environment;
        console.log('Yandex Games Environment:', env);
        
        // Use environment language if no locale is saved in localStorage
        const savedLocale = localStorage.getItem('app-locale');
        if (!savedLocale && env.i18n?.lang) {
          const yandexLang = env.i18n.lang.split('-')[0]; // Handle 'en-US' etc.
          if (yandexLang === 'ru') setLocale('ru');
          else if (yandexLang === 'en') setLocale('en');
        }
      }

      // If the grid is already generated, report ready immediately
      if (state.grid.length > 0 && !isReadyReported.current) {
        reportReady();
        isReadyReported.current = true;
      }
    });
  }, [state.grid.length, setLocale])

  useEffect(() => {
    if (mounted) {
      soundManager.setEnabled(soundEnabled);
    }
  }, [soundEnabled, mounted]);

  const getHeuristicDifficulty = useCallback((performance: any, currentConfig: any, currentDifficulty: string) => {
    const avgScore = performance.cumulativeScore / (performance.totalGames || 1);
    const scoreDiff = performance.lastGameScore / (avgScore || 1);
    
    let nextWidth = currentConfig.width;
    let nextHeight = currentConfig.height;
    let nextColors = currentConfig.numColors;
    let nextLevel: 'easy' | 'medium' | 'hard' = currentDifficulty as any;

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
        ? "Система адаптировала сложность." 
        : "System adapted difficulty."
    };
  }, [locale]);

  const startNewGame = useCallback((isAiAdjustment = false) => {
    setState(prev => {
      let newConfig = { ...prev.config };
      let newDifficulty = prev.difficulty;

      if (isAiAdjustment && performanceHistory.totalGames > 0) {
        const result = getHeuristicDifficulty(performanceHistory, prev.config, prev.difficulty);
        newConfig = {
          width: result.recommendedBoardWidth,
          height: result.recommendedBoardHeight,
          numColors: result.recommendedNumColors
        };
        newDifficulty = result.recommendedDifficultyLevel;
        setAiFeedback(result.difficultyAdjustmentFeedback);
      }

      const newGrid = generateGrid(newConfig.width, newConfig.height, newConfig.numColors);
      
      return {
        ...prev,
        grid: newGrid,
        score: 0,
        gameOver: false,
        moves: 0,
        difficulty: newDifficulty,
        config: newConfig
      };
    });

    setTargetedGroup([]);
    setFloatingScores([]);
    setLastIncrement(null);
  }, [performanceHistory, getHeuristicDifficulty]);

  useEffect(() => {
    if (mounted && state.grid.length === 0) {
      startNewGame();
    }
    
    // Once the first grid is ready and SDK is initialized, report ready
    if (mounted && state.grid.length > 0 && !isReadyReported.current) {
      reportReady();
      isReadyReported.current = true;
    }
  }, [mounted, state.grid.length, startNewGame]);

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver) return

    const group = getConnectedBlocks(state.grid, x, y)
    if (group.length < 2) {
      soundManager.playClick();
      return;
    }

    const groupKey = group.map(p => `${p[0]},${p[1]}`).sort().join('|')
    const targetKey = targetedGroup.map(p => `${p[0]},${p[1]}`).sort().join('|')

    if (groupKey === targetKey) {
      soundManager.playPop(group.length);
      const points = calculateMoveScore(group.length)
      const newGrid = processClear(state.grid, group)
      const isGameOver = checkGameOver(newGrid)
      const newScore = state.score + points
      
      if (isGameOver) {
        soundManager.playGameOver();
        showInterstitialAd();
        reportScore('top', newScore);
      }

      const newFloatingScore = {
        id: ++scoreCounter.current,
        x,
        y,
        points
      };
      setFloatingScores(prev => [...prev, newFloatingScore]);
      
      setLastIncrement(points);
      if (incrementTimerRef.current) clearTimeout(incrementTimerRef.current);
      incrementTimerRef.current = setTimeout(() => {
        setLastIncrement(null);
      }, 2000);

      setTimeout(() => {
        setFloatingScores(prev => prev.filter(s => s.id !== newFloatingScore.id));
      }, 800);

      setState(prev => {
        const newHighScore = Math.max(prev.highScore, newScore)
        if (newHighScore > prev.highScore && typeof window !== 'undefined') {
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
      soundManager.playClick();
      setTargetedGroup(group)
    }
  }

  const finalizeGame = () => {
    soundManager.playClick();
    setPerformanceHistory(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      cumulativeScore: prev.cumulativeScore + state.score
    }))
    startNewGame(true)
  }

  if (!mounted || state.grid.length === 0) return null

  return (
    <div className="flex flex-col items-center w-full h-full max-w-2xl mx-auto px-1">
      <div className="w-full flex justify-between items-center px-1 mb-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            soundManager.playClick();
            startNewGame();
          }} 
          className="rounded-full h-7 px-2 text-[10px] text-muted-foreground"
        >
          <RefreshCw className="mr-1.5 w-3 h-3" />
          {t.resetSession}
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-full w-7 h-7 text-muted-foreground"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </Button>
        </div>
      </div>

      <GameStats 
        score={state.score} 
        highScore={state.highScore} 
        moves={state.moves} 
        difficulty={state.difficulty}
        aiFeedback={aiFeedback}
        lastIncrement={lastIncrement}
      />

      <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden">
        <div 
          className="grid gap-0.5 p-1 rounded-xl bg-white/40 shadow-xl border border-white/60 backdrop-blur-md mx-auto relative h-full max-h-[75vh]"
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            gridTemplateRows: `repeat(${state.config.height}, 1fr)`,
            width: '100%',
            aspectRatio: `${state.config.width} / ${state.config.height}`,
            maxHeight: '100%'
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

          {floatingScores.map(fs => (
            <div 
              key={fs.id}
              className="absolute z-30 pointer-events-none text-primary font-black text-sm md:text-2xl animate-float-up-fade"
              style={{
                left: `${(fs.x / state.config.width) * 100}%`,
                top: `${(fs.y / state.config.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              +{fs.points}
            </div>
          ))}

          {state.gameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl animate-in fade-in zoom-in duration-300 px-4 text-center">
              <h2 className="text-xl md:text-4xl font-bold text-foreground mb-1 font-headline">{t.gameOver}</h2>
              <p className="text-sm md:text-xl text-muted-foreground mb-4 font-medium">{t.finalScore}: {state.score}</p>
              <Button size="lg" onClick={finalizeGame} className="rounded-full px-6 bg-primary hover:bg-primary/90 h-9 md:h-11">
                <PlayCircle className="mr-2 w-4 h-4 md:w-6 md:h-6" />
                {t.playAgain}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
