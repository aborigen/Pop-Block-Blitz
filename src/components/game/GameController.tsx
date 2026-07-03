"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { 
  generateGrid, 
  getConnectedBlocks, 
  processClear, 
  calculateMoveScore, 
  checkGameOver,
  findBestMove,
  rotateGrid,
  getBlockCounts,
  type Grid,
  type GameState,
  type DifficultyLevel 
} from "@/lib/game-logic"
import { Block } from "./Block"
import { GameStats } from "./GameStats"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlayCircle, Volume2, VolumeX, RotateCcw, RotateCw } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { soundManager } from "@/lib/sound-effects"
import { initYandexSDK, showInterstitialAd, reportScore, reportReady, getLanguage } from "@/lib/yandex-games"
import { LeaderboardModal } from "./LeaderboardModal"
import { GameOverParticles } from "./GameOverParticles"
import { cn } from "@/lib/utils"

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  points: number;
}

const DIFFICULTY_ORDER: DifficultyLevel[] = ['very_easy', 'easy', 'medium', 'hard', 'expert', 'insane'];

export function GameController() {
  const { t, locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [state, setState] = useState<GameState>({
    grid: [],
    score: 0,
    highScore: 0,
    gameOver: false,
    moves: 0,
    difficulty: 'easy',
    config: { width: 8, height: 8, numColors: 4 }
  })
  
  const [performanceHistory, setPerformanceHistory] = useState({
    totalGames: 0,
    cumulativeScore: 0,
    lastMaxCombo: 0,
    lastAvgClear: 0
  })

  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [targetedGroup, setTargetedGroup] = useState<[number, number][]>([])
  const [hintGroup, setHintGroup] = useState<[number, number][]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [lastIncrement, setLastIncrement] = useState<number | null>(null)
  const [visualRotation, setVisualRotation] = useState(0)
  const [isAnimatingRotation, setIsAnimatingRotation] = useState(false)
  
  const scoreCounter = useRef(0)
  const incrementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isReadyReported = useRef(false)

  // Derived state: Block counts
  const blockCounts = useMemo(() => getBlockCounts(state.grid), [state.grid]);

  // Initialization
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('pop-block-high-score')
    if (saved) {
      setState(prev => ({ ...prev, highScore: parseInt(saved, 10) }))
    }

    initYandexSDK().then((sdk) => {
      if (sdk) {
        setSdkReady(true);
        const detectedLang = getLanguage();
        const savedLocale = localStorage.getItem('app-locale');
        if (!savedLocale && detectedLang) {
          setLocale(detectedLang);
        }
      }
    });
  }, [setLocale])

  useEffect(() => {
    if (mounted) {
      soundManager.setEnabled(soundEnabled);
    }
  }, [soundEnabled, mounted]);

  const getHeuristicDifficulty = useCallback((performance: any, currentConfig: any, currentDifficulty: DifficultyLevel) => {
    const avgScore = performance.cumulativeScore / (performance.totalGames || 1);
    const scoreDiff = (performance.lastGameScore || 0) / (avgScore || 1);
    
    let nextWidth = currentConfig.width;
    let nextHeight = currentConfig.height;
    let nextColors = currentConfig.numColors;
    let currentIdx = DIFFICULTY_ORDER.indexOf(currentDifficulty);
    let nextIdx = currentIdx;

    if (scoreDiff > 1.3 || performance.lastMaxCombo > 10) {
      nextIdx = Math.min(DIFFICULTY_ORDER.length - 1, currentIdx + 1);
      nextWidth = Math.min(15, nextWidth + 1);
      nextHeight = Math.min(18, nextHeight + 1);
      nextColors = Math.min(7, nextColors + (nextIdx > currentIdx ? 1 : 0));
    } else if (scoreDiff < 0.7 && performance.totalGames > 2) {
      nextIdx = Math.max(0, currentIdx - 1);
      nextWidth = Math.max(8, nextWidth - 1);
      nextHeight = Math.max(8, nextHeight - 1);
      nextColors = Math.max(3, nextColors - (nextIdx < currentIdx ? 1 : 0));
    }

    const nextLevel = DIFFICULTY_ORDER[nextIdx];

    return {
      recommendedBoardWidth: nextWidth,
      recommendedBoardHeight: nextHeight,
      recommendedNumColors: nextColors,
      recommendedDifficultyLevel: nextLevel,
      difficultyAdjustmentFeedback: locale === 'ru' 
        ? "ИИ адаптировал уровень сложности." 
        : "AI adapted the difficulty level."
    };
  }, [locale]);

  const startNewGame = useCallback((isAiAdjustment = false) => {
    let nextConfig = { ...state.config };
    let nextDifficulty = state.difficulty;

    if (isAiAdjustment && performanceHistory.totalGames > 0) {
      const result = getHeuristicDifficulty(performanceHistory, state.config, state.difficulty);
      nextConfig = {
        width: result.recommendedBoardWidth,
        height: result.recommendedBoardHeight,
        numColors: result.recommendedNumColors
      };
      nextDifficulty = result.recommendedDifficultyLevel;
      setAiFeedback(result.difficultyAdjustmentFeedback);
    }

    const finalGrid = generateGrid(nextConfig.width, nextConfig.height, nextConfig.numColors);
    const bestMove = findBestMove(finalGrid);
    
    setState(prev => ({
      ...prev,
      grid: finalGrid,
      score: 0,
      gameOver: false,
      moves: 0,
      difficulty: nextDifficulty,
      config: nextConfig
    }));

    setTargetedGroup([]);
    setHintGroup(performanceHistory.totalGames < 2 ? bestMove : []);
    setFloatingScores([]);
    setLastIncrement(null);
    setVisualRotation(0);
    setIsAnimatingRotation(false);
  }, [performanceHistory, getHeuristicDifficulty, state.config, state.difficulty]);

  useEffect(() => {
    if (mounted && state.grid.length === 0) {
      startNewGame();
    }
  }, [mounted, state.grid.length, startNewGame]);

  useEffect(() => {
    if (mounted && state.grid.length > 0 && sdkReady && !isReadyReported.current) {
      reportReady();
      isReadyReported.current = true;
    }
  }, [mounted, state.grid.length, sdkReady]);

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver || isAnimatingRotation) return
    if (hintGroup.length > 0) setHintGroup([]);
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
        reportScore('leaders', newScore);
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

  const handleRotate = (direction: 'cw' | 'ccw') => {
    if (state.gameOver || isAnimatingRotation) return;
    soundManager.playClick();
    
    setIsAnimatingRotation(true);
    setVisualRotation(direction === 'cw' ? 90 : -90);
    
    // Finalize rotation after animation duration (match CSS duration)
    setTimeout(() => {
      const newGrid = rotateGrid(state.grid, direction);
      const isGameOver = checkGameOver(newGrid);
      
      if (isGameOver) {
        soundManager.playGameOver();
        showInterstitialAd();
        reportScore('leaders', state.score);
      }

      setState(prev => ({
        ...prev,
        grid: newGrid,
        gameOver: isGameOver,
        config: {
          ...prev.config,
          width: prev.config.height,
          height: prev.config.width
        }
      }));
      
      setTargetedGroup([]);
      setHintGroup([]);
      setVisualRotation(0);
      setIsAnimatingRotation(false);
    }, 400);
  }

  const finalizeGame = () => {
    soundManager.playClick();
    setPerformanceHistory(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      cumulativeScore: prev.cumulativeScore + state.score,
      lastGameScore: state.score
    }))
    startNewGame(true)
  }

  if (!mounted || state.grid.length === 0) return null

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-stretch w-full h-full max-w-[95vw] lg:max-w-[1400px] mx-auto p-1 lg:p-4 gap-2 lg:gap-8 overflow-hidden">
      {/* Side Stats Section - On the left for landscape, top for portrait */}
      <div className="w-full lg:w-[280px] xl:w-[350px] flex flex-col shrink-0 lg:justify-center">
        <div className="w-full flex justify-between items-center px-1 mb-1 lg:mb-4">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                soundManager.playClick();
                startNewGame();
              }} 
              className="rounded-full h-7 lg:h-9 px-2 text-[10px] lg:text-xs text-muted-foreground"
            >
              <RefreshCw className="mr-1.5 w-3 h-3 lg:w-4 lg:h-4" />
              {t.resetSession}
            </Button>
            <LeaderboardModal />
          </div>
          <div className="flex items-center gap-1">
             <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('ccw')}
              disabled={isAnimatingRotation}
              title={t.rotateLeft}
              className="rounded-full w-7 h-7 lg:w-9 lg:h-9 text-muted-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('cw')}
              disabled={isAnimatingRotation}
              title={t.rotateRight}
              className="rounded-full w-7 h-7 lg:w-9 lg:h-9 text-muted-foreground"
            >
              <RotateCw className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full w-7 h-7 lg:w-9 lg:h-9 text-muted-foreground ml-1"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 lg:w-5 lg:h-5" /> : <VolumeX className="w-3.5 h-3.5 lg:w-5 lg:h-5" />}
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
          blockCounts={blockCounts}
        />
      </div>

      {/* Main Game Board Area - Fills remaining space */}
      <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden h-full">
        <div 
          className={cn(
            "grid gap-0.5 p-1 lg:p-2 rounded-xl bg-white/40 shadow-xl border border-white/60 backdrop-blur-md mx-auto relative w-full h-full max-h-[70vh] lg:max-h-none",
            isAnimatingRotation && "board-transition"
          )}
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            gridTemplateRows: `repeat(${state.config.height}, 1fr)`,
            aspectRatio: `${state.config.width} / ${state.config.height}`,
            transform: `rotate(${visualRotation}deg)`
          }}
        >
          {state.grid.map((row, y) => 
            row.map((colorIndex, x) => {
              const hintIndex = hintGroup.findIndex(p => p[0] === x && p[1] === y);
              return (
                <Block 
                  key={`${x}-${y}`} 
                  colorIndex={colorIndex} 
                  isTargeted={targetedGroup.some(p => p[0] === x && p[1] === y)}
                  isHinted={hintIndex !== -1}
                  showFinger={hintIndex === 0}
                  onClick={() => handleBlockClick(x, y)} 
                />
              );
            })
          )}

          {floatingScores.map(fs => (
            <div 
              key={fs.id}
              className="absolute z-30 pointer-events-none text-white font-black text-2xl md:text-5xl animate-float-up-fade"
              style={{
                left: `${(fs.x / state.config.width) * 100}%`,
                top: `${(fs.y / state.config.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              +{fs.points}
            </div>
          ))}

          {state.gameOver && (
            <>
              <GameOverParticles />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl animate-in fade-in zoom-in duration-300 px-4 text-center">
                <h2 className="text-xl md:text-5xl font-bold text-foreground mb-2 font-headline">{t.gameOver}</h2>
                <p className="text-sm md:text-2xl text-muted-foreground mb-6 font-medium">{t.finalScore}: {state.score}</p>
                <Button size="lg" onClick={finalizeGame} className="rounded-full px-8 bg-primary hover:bg-primary/90 h-10 md:h-14 md:text-xl">
                  <PlayCircle className="mr-2 w-5 h-5 md:w-8 md:h-8" />
                  {t.playAgain}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
