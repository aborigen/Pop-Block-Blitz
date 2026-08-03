
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { 
  generateGrid, 
  getConnectedBlocks, 
  processClear, 
  calculateMoveScore, 
  checkGameOver,
  isGridEmpty,
  findBestMove,
  rotateGridRaw,
  applyGravityAndConsolidate,
  getBlockCounts,
  setColors,
  type Grid,
  type GameState,
  type DifficultyLevel 
} from "@/lib/game-logic"
import { Block } from "./Block"
import { GameStats } from "./GameStats"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlayCircle, Volume2, VolumeX, RotateCcw, RotateCw, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { soundManager } from "@/lib/sound-effects"
import { initYandexSDK, reportScore, reportReady, getLanguage, getRemoteConfig } from "@/lib/yandex-games"
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
  const { t, setLocale, locale: currentLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPerfectClear, setIsPerfectClear] = useState(false);
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
  const [suppressTransitions, setSuppressTransitions] = useState(false)
  const [paletteVersion, setPaletteVersion] = useState(0)
  
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

    initYandexSDK().then(async (sdk) => {
      if (sdk) {
        setSdkReady(true);
        const sdkLang = getLanguage();
        
        if (sdkLang && sdkLang !== currentLocale) {
          setLocale(sdkLang); 
        }

        try {
          const config = await getRemoteConfig();
          if (config && config.color_palette) {
            const palette = config.color_palette.split(',').map((c: string) => c.trim()).filter((c: string) => c.startsWith('#'));
            if (palette.length >= 3) {
              setColors(palette);
              setPaletteVersion(v => v + 1);
            }
          }
        } catch (e) {
          console.error("Failed to load remote config", e);
        }
      }
    });
  }, [setLocale, currentLocale])

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
      difficultyAdjustmentFeedback: t.aiPowered
    };
  }, [t.aiPowered]);

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
    setSuppressTransitions(false);
    setIsLeaderboardOpen(false);
    setIsPerfectClear(false);
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
      const isPerfect = isGameOver && isGridEmpty(newGrid)
      
      let newScore = state.score + points
      if (isPerfect) {
        newScore *= 5;
        setIsPerfectClear(true);
      }
      
      if (isGameOver) {
        soundManager.playGameOver();
        if (newScore > state.highScore) {
          reportScore('leaders', newScore).finally(() => {
            setIsLeaderboardOpen(true);
          });
        } else {
          setIsLeaderboardOpen(true);
        }
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
    
    setTimeout(() => {
      setSuppressTransitions(true);
      const rawRotated = rotateGridRaw(state.grid, direction);
      setState(prev => ({
        ...prev,
        grid: rawRotated,
        config: {
          ...prev.config,
          width: prev.config.height,
          height: prev.config.width
        }
      }));
      setVisualRotation(0);
      setTargetedGroup([]);
      setHintGroup([]);

      setTimeout(() => {
        setSuppressTransitions(false);
        const finalGrid = applyGravityAndConsolidate(rawRotated);
        const isGameOver = checkGameOver(finalGrid);
        const isPerfect = isGameOver && isGridEmpty(finalGrid);
        
        let newScore = state.score;
        if (isPerfect) {
          newScore *= 5;
          setIsPerfectClear(true);
        }

        if (isGameOver) {
          soundManager.playGameOver();
          if (newScore > state.highScore) {
            reportScore('leaders', newScore).finally(() => {
              setIsLeaderboardOpen(true);
            });
          } else {
            setIsLeaderboardOpen(true);
          }
        }

        setState(prev => ({
          ...prev,
          grid: finalGrid,
          score: newScore,
          gameOver: isGameOver,
          highScore: Math.max(prev.highScore, newScore)
        }));
        
        setIsAnimatingRotation(false);
      }, 50);
    }, 450);
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
    <div className="flex flex-col lg:flex-row items-stretch w-full h-full max-w-full p-0 lg:p-4 gap-1 lg:gap-8 overflow-hidden min-h-0">
      <div className="w-full lg:w-[260px] xl:w-[320px] flex flex-col shrink-0 min-h-0 overflow-y-auto lg:overflow-visible">
        <div className="w-full flex justify-between items-center px-3 py-1.5 lg:py-0 lg:mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <LeaderboardModal open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen} />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('ccw')}
              disabled={isAnimatingRotation}
              title={t.rotateLeft}
              className="rounded-full w-9 h-9 lg:w-11 lg:h-11 hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('cw')}
              disabled={isAnimatingRotation}
              title={t.rotateRight}
              className="rounded-full w-9 h-9 lg:w-11 lg:h-11 hover:bg-white/20"
            >
              <RotateCw className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                soundManager.playClick();
                startNewGame();
              }} 
              title={t.resetSession}
              className="rounded-full w-9 h-9 lg:w-11 lg:h-11 hover:bg-white/20"
            >
              <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full w-9 h-9 lg:w-11 lg:h-11 hover:bg-white/20"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 lg:w-6 lg:h-6" /> : <VolumeX className="w-5 h-5 lg:w-6 lg:h-6" />}
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

      <div className="relative flex-grow w-full h-full flex items-center justify-center min-h-0 overflow-hidden px-1 lg:px-4 pb-1 lg:pb-4">
        <div 
          className={cn(
            "grid gap-0.5 p-1 lg:p-2.5 rounded-xl lg:rounded-2xl bg-white/20 shadow-2xl border border-white/40 backdrop-blur-xl relative overflow-hidden",
            isAnimatingRotation && !suppressTransitions && "board-transition"
          )}
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            gridTemplateRows: `repeat(${state.config.height}, 1fr)`,
            aspectRatio: `${state.config.width} / ${state.config.height}`,
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `rotate(${visualRotation}deg) scale(${isAnimatingRotation ? 0.95 : 1})`,
            margin: 'auto'
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
              className="absolute z-30 pointer-events-none text-white font-black text-3xl md:text-6xl animate-float-up-fade"
              style={{
                left: `${(fs.x / state.config.width) * 100}%`,
                top: `${(fs.y / state.config.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              +{fs.points}
            </div>
          ))}

          {state.gameOver && (
            <>
              <GameOverParticles />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-2xl animate-in fade-in zoom-in duration-300 px-6 text-center">
                {isPerfectClear && (
                  <div className="mb-4 animate-bounce bg-accent text-accent-foreground px-4 py-2 rounded-full font-black text-lg md:text-3xl flex items-center gap-2 shadow-xl">
                    <Sparkles className="w-5 h-5 md:w-8 md:h-8" />
                    {t.perfectClear}
                    <Sparkles className="w-5 h-5 md:w-8 md:h-8" />
                  </div>
                )}
                <h2 className="text-2xl md:text-5xl font-black text-foreground mb-3 font-headline uppercase tracking-tighter">{t.gameOver}</h2>
                <p className="text-base md:text-2xl text-muted-foreground mb-8 font-semibold">{t.finalScore}: <span className="text-primary">{state.score}</span></p>
                <Button size="lg" onClick={finalizeGame} className="rounded-full px-10 bg-primary hover:bg-primary/90 h-12 md:h-16 md:text-2xl font-black shadow-lg shadow-primary/20">
                  <PlayCircle className="mr-3 w-6 h-6 md:w-8 md:h-8" />
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
