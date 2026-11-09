"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { 
  generateGrid, 
  getConnectedBlocks, 
  calculateMoveScore, 
  checkGameOver,
  isGridEmpty,
  findTopMoves,
  rotateGridRaw,
  applyGravityAndConsolidate,
  getBlockCounts,
  type Grid,
  type GameState,
  type DifficultyLevel,
  type TileStyle 
} from "@/lib/game-logic"
import { Block } from "./Block"
import { GameStats } from "./GameStats"
import { SettingsModal } from "./SettingsModal"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlayCircle, Volume2, VolumeX, RotateCcw, RotateCw, Sparkles, Save, Lightbulb } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { soundManager } from "@/lib/sound-effects"
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [state, setState] = useState<GameState>({
    grid: [],
    score: 0,
    highScore: 0,
    gameOver: false,
    moves: 0,
    difficulty: 'very_easy',
    tileStyle: 'popit',
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
  const [poppingGroup, setPoppingGroup] = useState<[number, number][]>([])
  const [hintGroups, setHintGroups] = useState<[number, number][][]>([])
  const [activeHintIndex, setActiveHintIndex] = useState(0)
  const [hintCycleCount, setHintCycleCount] = useState(0)
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [lastIncrement, setLastIncrement] = useState<number | null>(null)
  const [visualRotation, setVisualRotation] = useState(0)
  const [isAnimatingRotation, setIsAnimatingRotation] = useState(false)
  const [suppressTransitions, setSuppressTransitions] = useState(false)
  
  const scoreCounter = useRef(0)
  const incrementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialized = useRef(false)

  const blockCounts = useMemo(() => getBlockCounts(state.grid), [state.grid]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    setMounted(true);
    
    const savedHighScore = localStorage.getItem('pop-block-high-score');
    if (savedHighScore) {
      setState(prev => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
    }

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
          tileStyle: session.tileStyle || 'popit',
          config: session.config
        }));
      } catch (e) {
        console.warn("Failed to restore session", e);
      }
    }
  }, [])

  useEffect(() => {
    if (mounted && state.grid.length > 0 && !state.gameOver) {
      const session = {
        grid: state.grid,
        score: state.score,
        moves: state.moves,
        difficulty: state.difficulty,
        tileStyle: state.tileStyle,
        config: state.config
      };
      localStorage.setItem('pop-block-session', JSON.stringify(session));
      localStorage.setItem('pop-block-high-score', state.highScore.toString());
    }
  }, [state.grid, state.score, state.moves, state.highScore, state.difficulty, state.tileStyle, state.config, state.gameOver, mounted]);

  const handleManualSave = () => {
    if (state.gameOver) return;
    soundManager.playClick();
    const session = {
      grid: state.grid,
      score: state.score,
      moves: state.moves,
      difficulty: state.difficulty,
      tileStyle: state.tileStyle,
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

  const triggerHint = () => {
    if (state.gameOver || isAnimatingRotation) return;
    soundManager.playClick();
    const topMoves = findTopMoves(state.grid, 3);
    if (topMoves.length > 0) {
      setHintGroups(topMoves);
      setActiveHintIndex(0);
      setHintCycleCount(0);
    } else {
      toast({ description: t.noData, duration: 2000 });
    }
  }

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
    setPoppingGroup([]);
    setHintGroups(performanceHistory.totalGames < 2 ? topMoves : []);
    setActiveHintIndex(0);
    setHintCycleCount(0);
    setFloatingScores([]);
    setLastIncrement(null);
    setVisualRotation(0);
    setIsAnimatingRotation(false);
    setSuppressTransitions(false);
    
    localStorage.removeItem('pop-block-session');
  }, [performanceHistory, getHeuristicDifficulty, state.config, state.difficulty]);

  useEffect(() => {
    if (mounted && state.grid.length === 0) {
      startNewGame();
    }
  }, [mounted, state.grid.length, startNewGame]);

  const handleBlockClick = (x: number, y: number) => {
    if (state.gameOver || isAnimatingRotation) return
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
      setPoppingGroup(group);
      soundManager.playPop(group.length);
      const points = calculateMoveScore(group.length)
      
      const newFloatingScore = { id: ++scoreCounter.current, x, y, points };
      setFloatingScores(prev => [...prev, newFloatingScore]);
      setLastIncrement(points);
      
      if (incrementTimerRef.current) clearTimeout(incrementTimerRef.current);
      incrementTimerRef.current = setTimeout(() => setLastIncrement(null), 2000);

      setTimeout(() => {
        setFloatingScores(prev => prev.filter(s => s.id !== newFloatingScore.id));
      }, 800);

      setTimeout(() => {
        const gridWithHoles = state.grid.map(row => [...row]);
        for (const [gx, gy] of group) {
          gridWithHoles[gy][gx] = null;
        }
        
        const newScoreBeforeGravity = state.score + points;
        
        setState(prev => ({
          ...prev,
          grid: gridWithHoles,
          score: newScoreBeforeGravity,
          moves: prev.moves + 1,
          highScore: Math.max(prev.highScore, newScoreBeforeGravity)
        }));
        
        setPoppingGroup([]);
        setTargetedGroup([]);

        setTimeout(() => {
          const finalGrid = applyGravityAndConsolidate(gridWithHoles);
          const isGameOver = checkGameOver(finalGrid);
          const isPerfect = isGameOver && isGridEmpty(finalGrid);
          
          setState(prev => {
            let finalScore = prev.score;
            if (isPerfect) {
              finalScore *= 5;
            }

            if (isGameOver) {
              soundManager.playGameOver();
              localStorage.removeItem('pop-block-session');
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
        }, 300);
      }, 300);

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
        
        setState(prev => {
          if (isGameOver) {
            soundManager.playGameOver();
            localStorage.removeItem('pop-block-session');
          }

          return {
            ...prev,
            grid: finalGrid,
            gameOver: isGameOver,
            highScore: Math.max(prev.highScore, prev.score)
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

  const setTileStyle = (style: TileStyle) => {
    setState(prev => ({ ...prev, tileStyle: style }));
    toast({ description: t.gameSaved, duration: 1500 });
  }

  if (!mounted || state.grid.length === 0) return null

  return (
    <div className="flex flex-col landscape:flex-row w-full h-full p-1 md:p-4 gap-1 md:gap-4 overflow-hidden items-stretch justify-center relative z-10">
      <div className="flex flex-col shrink-0 w-full landscape:w-[200px] lg:landscape:w-[240px] gap-1 md:gap-4 z-20">
        <div className="flex items-center justify-between px-1 landscape:px-0">
          <div className="flex items-center gap-1.5 md:gap-2">
            <LeaderboardModal />
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={triggerHint}
              disabled={state.gameOver || isAnimatingRotation}
              title={t.hint}
              className="rounded-full w-8 h-8 md:w-10 md:h-10 popit-control-btn bg-accent text-accent-foreground border-accent-foreground/20"
            >
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <SettingsModal 
              currentStyle={state.tileStyle} 
              onStyleChange={setTileStyle} 
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10 gap-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRotate('ccw')}
                disabled={isAnimatingRotation || state.gameOver}
                title={t.rotateLeft}
                className="rounded-full w-7 h-7 md:w-9 md:h-9 hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRotate('cw')}
                disabled={isAnimatingRotation || state.gameOver}
                title={t.rotateRight}
                className="rounded-full w-7 h-7 md:w-9 md:h-9 hover:bg-white/10"
              >
                <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>

            <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10 ml-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleManualSave}
                disabled={state.gameOver}
                title={t.saveGame}
                className="rounded-full w-7 h-7 md:w-9 md:h-9 hover:bg-white/10 text-primary"
              >
                <Save className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full w-7 h-7 md:w-9 md:h-9 hover:bg-white/10"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-accent" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  soundManager.playClick();
                  startNewGame();
                }} 
                title={t.resetSession}
                className="rounded-full w-7 h-7 md:w-9 md:h-9 hover:bg-white/10 text-destructive"
              >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
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

      <div className="flex-grow flex items-center justify-center relative min-h-0 w-full h-full p-1 md:p-2 overflow-hidden">
        <div 
          className={cn(
            "grid gap-1 p-1 md:p-2 rounded-xl bg-white/10 shadow-2xl border border-white/20 backdrop-blur-md relative overflow-hidden",
            isAnimatingRotation && !suppressTransitions && "board-transition"
          )}
          style={{ 
            gridTemplateColumns: `repeat(${state.config.width}, 1fr)`,
            gridTemplateRows: `repeat(${state.config.height}, 1fr)`,
            aspectRatio: `${state.config.width} / ${state.config.height}`,
            width: '100%',
            height: '100%',
            maxWidth: `${(state.config.width / state.config.height) * 100}vh`,
            maxHeight: '100%',
            transform: `rotate(${visualRotation}deg) scale(${isAnimatingRotation ? 0.96 : 1})`,
            margin: 'auto',
            objectFit: 'contain'
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
                  isPopping={poppingGroup.some(p => p[0] === x && p[1] === y)}
                  isHinted={isInHint}
                  showFinger={isFingerHead}
                  style={state.tileStyle}
                  onClick={() => handleBlockClick(x, y)} 
                />
              );
            })
          )}

          {floatingScores.map(fs => (
            <div 
              key={fs.id}
              className="absolute z-30 pointer-events-none text-white font-black text-2xl md:text-6xl animate-float-up-fade"
              style={{
                left: `${(fs.x / state.config.width) * 100}%`,
                top: `${(fs.y / state.config.height) * 100}%`,
                transform: 'translate(-50%, -50%)',
                textShadow: '0 0 20px rgba(0,0,0,0.8)'
              }}
            >
              +{fs.points}
            </div>
          ))}

          {state.gameOver && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl rounded-xl animate-in fade-in duration-300 p-4 md:p-8 text-center">
              <GameOverParticles />
              {isGridEmpty(state.grid) && (
                <div className="mb-4 md:mb-6 animate-bounce bg-accent text-accent-foreground px-4 md:px-6 py-2 md:py-3 rounded-full font-black text-xl md:text-4xl flex items-center gap-2 md:gap-3 shadow-2xl">
                  <Sparkles className="w-5 h-5 md:w-10 md:h-10" />
                  {t.perfectClear}
                  <Sparkles className="w-5 h-5 md:w-10 md:h-10" />
                </div>
              )}
              <h2 className="text-2xl md:text-6xl font-black text-foreground mb-2 md:mb-4 font-headline uppercase tracking-tighter">
                {t.gameOver}
              </h2>
              <p className="text-lg md:text-3xl text-muted-foreground mb-4 md:mb-8 font-bold">
                {t.finalScore}: <span className="text-primary">{state.score}</span>
              </p>
              <Button 
                size="lg" 
                onClick={finalizeGame} 
                className="rounded-full px-8 md:px-16 bg-primary hover:bg-primary/90 h-12 md:h-20 text-lg md:text-3xl font-black shadow-xl shadow-primary/30 transition-all hover:scale-105"
              >
                <PlayCircle className="mr-2 md:mr-3 w-6 h-6 md:w-10 md:h-10" />
                {t.playAgain}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
