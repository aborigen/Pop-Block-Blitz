
"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Sparkles, Activity, Layers, Info } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type DifficultyLevel, COLORS } from "@/lib/game-logic"

interface GameStatsProps {
  score: number
  highScore: number
  moves: number
  difficulty: DifficultyLevel
  aiFeedback?: string
  lastIncrement?: number | null
  blockCounts: Record<number, number>
}

export function GameStats({ score, highScore, moves, difficulty, aiFeedback, lastIncrement, blockCounts }: GameStatsProps) {
  const { t } = useTranslation();
  const [pulseScore, setPulseScore] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setPulseScore(true);
      const timer = setTimeout(() => setPulseScore(false), 300);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="flex flex-col gap-1 md:gap-4 w-full">
      {/* Primary Stats - Responsive Layout */}
      <div className="flex flex-row landscape:flex-col landscape:lg:grid landscape:lg:grid-cols-2 gap-1 md:gap-2">
        <div className="relative flex-1">
          <StatItem 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-3 h-3 md:w-4 md:h-4" />} 
            className={cn(pulseScore && "animate-bump ring-1 ring-primary border-primary bg-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-1 -right-1 z-10 bg-primary text-white text-[8px] md:text-xs font-black px-1.5 py-0.5 rounded-full shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatItem 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent w-3 h-3 md:w-4 md:h-4" />} 
        />
        <StatItem 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground w-3 h-3 md:w-4 md:h-4" />} 
        />
        <StatItem 
          label={t.level} 
          value={t.difficulty[difficulty]?.toUpperCase() || difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary w-3 h-3 md:w-4 md:h-4" />} 
          isLevel
        />
      </div>

      {/* Block Counts Panel - Compact in Portrait */}
      <div className="flex items-center gap-2 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg landscape:flex-col landscape:items-start landscape:p-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Layers className="text-muted-foreground w-3 h-3" />
          <span className="text-[8px] md:text-[10px] uppercase font-black text-muted-foreground tracking-widest hidden sm:inline-block landscape:inline-block">{t.remainingBlocks}</span>
        </div>
        <div className="flex flex-row flex-wrap gap-x-2 md:gap-x-4 gap-y-1 items-center">
          {Object.entries(blockCounts).map(([index, count]) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 md:w-3 md:h-3 rounded-full border border-white/20"
                style={{ backgroundColor: COLORS[parseInt(index)] }}
              />
              <span className="text-[10px] md:text-sm font-black text-foreground font-headline">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* AI Master Feedback - Only show if present and screen space allows */}
      {aiFeedback && (
        <div className="hidden sm:flex landscape:flex bg-primary/5 border border-primary/20 rounded-lg p-2 text-[10px] text-primary font-bold items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 w-3 h-3 mt-0.5" />
          <span className="leading-tight">{aiFeedback}</span>
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value, icon, className, isLevel }: { label: string, value: string, icon: React.ReactNode, className?: string, isLevel?: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-lg p-1 md:p-3 transition-all duration-300 min-h-[40px] md:min-h-[60px] flex-1",
      className
    )}>
      <div className="flex items-center gap-1 mb-0.5 opacity-70">
        {icon}
        <span className="text-[7px] md:text-[9px] uppercase font-black text-muted-foreground tracking-tighter md:tracking-widest leading-none hidden xs:inline">{label}</span>
      </div>
      <div className={cn(
        "font-black text-foreground font-headline leading-none tracking-tight",
        isLevel ? "text-[8px] md:text-sm" : "text-[10px] md:text-lg"
      )}>
        {value}
      </div>
    </div>
  )
}
