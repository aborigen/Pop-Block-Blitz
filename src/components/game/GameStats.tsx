
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
    <div className="w-full space-y-1 lg:space-y-4 px-2 lg:px-1 shrink-0">
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-3">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-3 h-3 md:w-4 md:h-4" />} 
            className={cn(pulseScore && "animate-bump border-primary/60 shadow-lg shadow-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-1.5 -right-0.5 z-10 bg-primary text-white text-[8px] md:text-[11px] font-black px-1 py-0.5 rounded-full shadow-xl animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatCard 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent-foreground w-3 h-3 md:w-4 md:h-4" />} 
        />
        <StatCard 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground w-3 h-3 md:w-4 md:h-4" />} 
        />
        <StatCard 
          label={t.level} 
          value={t.difficulty[difficulty]?.toUpperCase() || difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary w-3 h-3 md:w-4 md:h-4" />} 
        />
      </div>

      <Card className="p-1.5 lg:p-3 bg-white/10 backdrop-blur-md border-white/10 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1.5 lg:mb-2 px-1">
          <Layers className="text-muted-foreground w-3 h-3 lg:w-3.5 lg:h-3.5" />
          <span className="text-[9px] lg:text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none">{t.remainingBlocks || "Remaining"}</span>
        </div>
        <div className="flex flex-row flex-wrap lg:flex-wrap items-center gap-2.5 lg:gap-4 px-1">
          {Object.entries(blockCounts).map(([index, count]) => (
            <div key={index} className="flex items-center gap-1.5 lg:gap-2">
              <div 
                className="w-3 h-3 lg:w-4 lg:h-4 rounded-full shadow-lg border-2 border-white/20"
                style={{ backgroundColor: COLORS[parseInt(index)] }}
              />
              <span className="text-xs lg:text-base font-black text-foreground font-headline leading-none">{count}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {aiFeedback && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-1.5 lg:p-2.5 text-[8px] md:text-[10px] text-primary font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 w-2.5 h-2.5 md:w-3.5 md:h-3.5 mt-0.5" />
          <span className="leading-tight">{aiFeedback}</span>
        </div>
      )}

      <div className="hidden lg:flex items-center justify-center gap-2 py-0.5 opacity-50 hover:opacity-100 transition-opacity cursor-help">
        <Info size={10} className="text-muted-foreground" />
        <p className="text-[10px] xl:text-xs text-muted-foreground font-semibold italic select-none text-center">
          {t.scoringRules}
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-1.5 lg:p-2.5 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border-white/10 shadow-md transition-all duration-300 min-h-[42px] md:min-h-[58px]", className)}>
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <span className="text-[7px] md:text-[9px] uppercase font-black text-muted-foreground tracking-widest leading-none">{label}</span>
      </div>
      <div className="text-xs md:text-lg font-black text-foreground font-headline leading-none tracking-tight">{value}</div>
    </Card>
  )
}
