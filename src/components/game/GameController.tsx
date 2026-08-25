
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { 
  generateGrid, 
  getConnectedBlocks, 
  processClear, 
  calculateMoveScore, 
  checkGameOver,
  isGridEmpty,
  findTopMoves,
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
import { RefreshCw, PlayCircle, Volume2, VolumeX, RotateCcw, RotateCw, Sparkles, Save } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { soundManager } from "@/lib/sound-effects"
import { initYandexSDK, reportScore, reportReady, getLanguage, getRemoteConfig } from "@/lib/yandex-games"
import { LeaderboardModal } from "./LeaderboardModal"
import { GameOverParticles } from "./GameOverParticles"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  points: number;
}

const DIFFICULTY_ORDER: DifficultyLevel[] = ['very_easy', 'easy', 'medium', 'hard', 'expert', 'insane'];

export function GameController() {
  const { t, setLocale } = useTranslation();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isPerfectClear, setIsPerfectClear] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [state, setState] = useState<GameState>({
    grid: [],
    score: 0,
    highScore: 0,
    gameOver: false,
    moves: 0,
    difficulty: 'very_easy',
    config: { width: 6, height: 6, numColors: 3 }
  })
  
  const [performanceHistory, setPerformanceHistory] = useState({
    totalGames: 0,
    cumulativeScore: 0,
    lastMaxCombo: 0,
    lastAvgClear: 0
  })

  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [targetedGroup, setTargetedGroup] = useState<[number, number][]>([])
  const [hintGroups, setHintGroups] = useState<[number, number][][]>([])
  const [activeHintIndex, setActiveHintIndex] = useState(0)
  const [hintCycleCount, setHintCycleCount] = useState(0)
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [lastIncrement, setLastIncrement] = useState<number | null>(null)
  const [visualRotation, setVisualRotation] = useState(0)
  const [isAnimatingRotation, setIsAnimatingRotation] = useState(false)
  const [suppressTransitions, setSuppressTransitions] = useState(false)
  const [paletteVersion, setPaletteVersion] = useState(0)
  
  const scoreCounter = useRef(0)
  const incrementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isReadyReported = useRef(false)
  const isInitialized = useRef(false)

  // Derived state: Block counts
  const blockCounts = useMemo(() => getBlockCounts(state.grid), [state.grid]);

  // Initialization: Restore session and High Score
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    setMounted(true);
    
    // Restore High Score
    const savedHighScore = localStorage.getItem('pop-block-high-score');
    if (savedHighScore) {
      setState(prev => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
    }

    // Restore Game Session
    const savedSession = localStorage.getItem('pop-block-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setState(prev => ({
          ...prev,
          grid: session.grid,
          score: session.score,
          moves: session.moves,
          difficulty: session.difficulty,
          config: session.config
        }));
      } catch (e) {
        console.warn("Failed to restore session", e);
      }
    }

    initYandexSDK().then(async (sdk) => {
      if (sdk) {
        setSdkReady(true);
        const sdkLang = getLanguage();
        if (sdkLang) setLocale(sdkLang); 

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
  }, [setLocale])

  // Persistence: Auto-save session to localStorage
  useEffect(() => {
    if (mounted && state.grid.length > 0 && !state.gameOver) {
      const session = {
        grid: state.grid,
        score: state.score,
        moves: state.moves,
        difficulty: state.difficulty,
        config: state.config
      };
      localStorage.setItem('pop-block-session', JSON.stringify(session));
      localStorage.setItem('pop-block-high-score', state.highScore.toString());
    }
  }, [state.grid, state.score, state.moves, state.highScore, state.difficulty, state.config, state.gameOver, mounted]);

  // Persistence: Sync High Score with Yandex Leaderboard
  useEffect(() => {
    if (sdkReady && state.highScore > 0) {
      reportScore('leaders', state.highScore);
    }
  }, [state.highScore, sdkReady]);

  const handleManualSave = () => {
    if (state.gameOver) return;
    soundManager.playClick();
    const session = {
      grid: state.grid,
      score: state.score,
      moves: state.moves,
      difficulty: state.difficulty,
      config: state.config
    };
    localStorage.setItem('pop-block-session', JSON.stringify(session));
    localStorage.setItem('pop-block-high-score', state.highScore.toString());
    
    toast({
      description: t.gameSaved,
      duration: 2000,
    });
  }

  useEffect(() => {
    if (mounted) {
      soundManager.setEnabled(soundEnabled);
    }
  }, [soundEnabled, mounted]);

  useEffect(() => {
    if (hintGroups.length > 0) {
      const interval = setInterval(() => {
        setActiveHintIndex(prev => {
          const next = (prev + 1) % hintGroups.length;
          if (next === 0) setHintCycleCount(c => c + 1);
          return next;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [hintGroups]);

  useEffect(() => {
    if (hintCycleCount >= 3) {
      setHintGroups([]);
      setHintCycleCount(0);
    }
  }, [hintCycleCount]);

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
      nextWidth = Math.max(6, nextWidth - 1);
      nextHeight = Math.max(6, nextHeight - 1);
      nextColors = Math.max(3, nextColors - (nextIdx < currentIdx ? 1 : 0));
    }

    return {
      recommendedBoardWidth: nextWidth,
      recommendedBoardHeight: nextHeight,
      recommendedNumColors: nextColors,
      recommendedDifficultyLevel: DIFFICULTY_ORDER[nextIdx],
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
    const topMoves = findTopMoves(finalGrid, 3);
    
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
    setHintGroups(performanceHistory.totalGames < 2 ? topMoves : []);
    setActiveHintIndex(0);
    setHintCycleCount(0);
    setFloatingScores([]);
    setLastIncrement(null);
    setVisualRotation(0);
    setIsAnimatingRotation(false);
    setSuppressTransitions(false);
    setIsLeaderboardOpen(false);
    setIsPerfectClear(false);
    setIsProcessing(false);
    
    localStorage.removeItem('pop-block-session');
  }, [performanceHistory, getHeuristicDifficulty, state.config, state.difficulty]);

  useEffect(() => {
    if (mounted && state.grid.length === 0) {
      startNewGame();
    }
  }, [mounted, state.grid.length, startNewGame]);

  // Mandatory Yandex Games lifecycle synchronization
  useEffect(() => {
    if (mounted && state.grid.length > 0 && sdkReady && !isReadyReported.current) {
      console.log("[Game Lifecycle] Board ready, SDK ready. Reporting 'ready' to platform in 200ms.");
      const timer = setTimeout(() => {
        reportReady();
        isReadyReported.current = true;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [mounted, state.grid.length, sdkReady]);

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver || isAnimatingRotation || isProcessing) return
    if (hintGroups.length > 0) {
      setHintGroups([]);
      setHintCycleCount(0);
    }
    
    const group = getConnectedBlocks(state.grid, x, y)
    if (group.length < 2) {
      soundManager.playClick();
      return;
    }
    
    const groupKey = group.map(p => `${p[0]},${p[1]}`).sort().join('|')
    const targetKey = targetedGroup.map(p => `${p[0]},${p[1]}`).sort().join('|')
    
    if (groupKey === targetKey) {
      setIsProcessing(true);
      soundManager.playPop(group.length);
      const points = calculateMoveScore(group.length)
      
      const gridWithHoles = state.grid.map(row => [...row]);
      for (const [gx, gy] of group) {
        gridWithHoles[gy][gx] = null;
      }
      
      const newScoreBeforeGravity = state.score + points;
      const newFloatingScore = { id: ++scoreCounter.current, x, y, points };
      
      setFloatingScores(prev => [...prev, newFloatingScore]);
      setLastIncrement(points);
      
      if (incrementTimerRef.current) clearTimeout(incrementTimerRef.current);
      incrementTimerRef.current = setTimeout(() => setLastIncrement(null), 2000);

      setTimeout(() => {
        setFloatingScores(prev => prev.filter(s => s.id !== newFloatingScore.id));
      }, 800);

      setState(prev => ({
        ...prev,
        grid: gridWithHoles,
        score: newScoreBeforeGravity,
        moves: prev.moves + 1,
        highScore: Math.max(prev.highScore, newScoreBeforeGravity)
      }));
      
      setTargetedGroup([]);

      setTimeout(() => {
        const finalGrid = applyGravityAndConsolidate(gridWithHoles);
        const isGameOver = checkGameOver(finalGrid);
        const isPerfect = isGameOver && isGridEmpty(finalGrid);
        
        setState(prev => {
          let finalScore = prev.score;
          if (isPerfect) {
            finalScore *= 5;
            setIsPerfectClear(true);
          }

          if (isGameOver) {
            soundManager.playGameOver();
            localStorage.removeItem('pop-block-session');
            setIsLeaderboardOpen(true);
          }

          return {
            ...prev,
            grid: finalGrid,
            score: finalScore,
            gameOver: isGameOver,
            highScore: Math.max(prev.highScore, finalScore)
          }
        });

        setPerformanceHistory(prev => ({
          ...prev,
          lastMaxCombo: Math.max(prev.lastMaxCombo, group.length),
          lastAvgClear: ((prev.lastAvgClear * state.moves) + group.length) / (state.moves + 1)
        }))

        setIsProcessing(false);
      }, 350);

    } else {
      soundManager.playClick();
      setTargetedGroup(group)
    }
  }

  const handleRotate = (direction: 'cw' | 'ccw') => {
    if (state.gameOver || isAnimatingRotation || isProcessing) return;
    soundManager.playClick();
    
    setIsAnimatingRotation(true);
    setVisualRotation(direction === 'cw' ? 90 : -90);
    
    setTimeout(() => {
      setSuppressTransitions(true);
      const rawRotated = rotateGridRaw(state.grid, direction);
      setState(prev => ({
        ...prev,
        grid: rawRotated,
        config: { ...prev.config, width: prev.config.height, height: prev.config.width }
      }));
      setVisualRotation(0);
      setTargetedGroup([]);
      setHintGroups([]);
      setHintCycleCount(0);

      setTimeout(() => {
        setSuppressTransitions(false);
        const finalGrid = applyGravityAndConsolidate(rawRotated);
        const isGameOver = checkGameOver(finalGrid);
        const isPerfect = isGameOver && isGridEmpty(finalGrid);
        
        setState(prev => {
          let newScore = prev.score;
          if (isPerfect) {
            newScore *= 5;
            setIsPerfectClear(true);
          }

          if (isGameOver) {
            soundManager.playGameOver();
            localStorage.removeItem('pop-block-session');
            setIsLeaderboardOpen(true);
          }

          return {
            ...prev,
            grid: finalGrid,
            score: newScore,
            gameOver: isGameOver,
            highScore: Math.max(prev.highScore, newScore)
          }
        });
        
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
    <div className="flex flex-col landscape:flex-row lg:flex-row items-stretch w-full h-full max-w-full p-0 landscape:p-2 lg:p-4 gap-1 landscape:gap-2 lg:gap-4 overflow-hidden min-h-0">
      <div className="w-full landscape:w-[180px] lg:w-[240px] xl:w-[280px] flex flex-col shrink-0 min-h-0 overflow-y-auto landscape:overflow-y-auto lg:overflow-visible relative z-40 bg-background/50 backdrop-blur-sm landscape:bg-transparent">
        <div className="w-full flex justify-between items-center px-2 py-1 lg:py-0 lg:mb-4 shrink-0">
          <div className="flex items-center gap-1">
            <LeaderboardModal open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen} />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleManualSave}
              disabled={isProcessing || state.gameOver}
              title={t.saveGame}
              className="rounded-full w-8 h-8 lg:w-10 lg:h-10 hover:bg-white/20"
            >
              <Save className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('ccw')}
              disabled={isAnimatingRotation || isProcessing}
              title={t.rotateLeft}
              className="rounded-full w-8 h-8 lg:w-10 lg:h-10 hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRotate('cw')}
              disabled={isAnimatingRotation || isProcessing}
              title={t.rotateRight}
              className="rounded-full w-8 h-8 lg:w-10 lg:h-10 hover:bg-white/20"
            >
              <RotateCw className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              disabled={isProcessing}
              onClick={() => {
                soundManager.playClick();
                startNewGame();
              }} 
              title={t.resetSession}
              className="rounded-full h-8 lg:h-10 px-3 lg:px-4 hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full w-8 h-8 lg:w-10 lg:h-10 hover:bg-white/20"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" /> : <VolumeX className="w-4 h-4 lg:w-5 lg:h-5" />}
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

      <div className="relative flex-grow w-full h-full flex items-center justify-center min-h-0 overflow-hidden px-1 landscape:px-0 lg:px-2 pb-1 lg:pb-0">
        <div 
          className={cn(
            "grid gap-0.5 p-1 lg:p-2 rounded-xl lg:rounded-2xl bg-white/20 shadow-2xl border border-white/40 backdrop-blur-xl relative overflow-hidden",
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
              const currentHintGroup = hintGroups[activeHintIndex] || [];
              const isInHint = currentHintGroup.some(group => group[0] === x && group[1] === y);
              const isFingerHead = currentHintGroup.length > 0 && currentHintGroup[0][0] === x && currentHintGroup[0][1] === y;
              
              return (
                <Block 
                  key={`${x}-${y}`} 
                  colorIndex={colorIndex} 
                  isTargeted={targetedGroup.some(p => p[0] === x && p[1] === y)}
                  isHinted={isInHint}
                  showFinger={isFingerHead}
                  onClick={() => handleBlockClick(x, y)} 
                />
              );
            })
          )}

          {floatingScores.map(fs => (
            <div 
              key={fs.id}
              className="absolute z-30 pointer-events-none text-white font-black text-2xl md:text-5xl lg:text-6xl animate-float-up-fade"
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

          {state.gameOver && !isProcessing && (
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
                <h2 className="text-xl md:text-4xl lg:text-5xl font-black text-foreground mb-2 font-headline uppercase tracking-tighter">{t.gameOver}</h2>
                <p className="text-sm md:text-xl lg:text-2xl text-muted-foreground mb-6 font-semibold">{t.finalScore}: <span className="text-primary">{state.score}</span></p>
                <Button size="lg" onClick={finalizeGame} className="rounded-full px-8 lg:px-10 bg-primary hover:bg-primary/90 h-10 md:h-14 lg:h-16 md:text-xl lg:text-2xl font-black shadow-lg shadow-primary/20">
                  <PlayCircle className="mr-2 lg:mr-3 w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8" />
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
