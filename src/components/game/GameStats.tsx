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
    <div className="w-full space-y-1 lg:space-y-2 mb-1.5 px-1">
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1 lg:gap-2">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-2.5 h-2.5 md:w-4 md:h-4" />} 
            className={cn(pulseScore && "animate-bump border-primary/50 shadow-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-2 -right-1 z-10 bg-primary text-white text-[9px] md:text-xs font-black px-1.5 py-0.5 rounded-full shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatCard 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent-foreground w-2.5 h-2.5 md:w-4 md:h-4" />} 
        />
        <StatCard 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground w-2.5 h-2.5 md:w-4 md:h-4" />} 
        />
        <StatCard 
          label={t.level} 
          value={t.difficulty[difficulty]?.toUpperCase() || difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary w-2.5 h-2.5 md:w-4 md:h-4" />} 
        />
      </div>

      <Card className="p-1 lg:p-2 bg-white/30 backdrop-blur-sm border-white/20">
        <div className="flex items-center gap-1.5 mb-1.5 px-1">
          <Layers className="text-muted-foreground w-2.5 h-2.5 lg:w-3.5 lg:h-3.5" />
          <span className="text-[7px] lg:text-[10px] uppercase font-bold text-muted-foreground tracking-tighter leading-none">{t.remainingBlocks || "Remaining"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 lg:gap-3 px-1">
          {Object.entries(blockCounts).map(([index, count]) => (
            <div key={index} className="flex items-center gap-1 lg:gap-1.5">
              <div 
                className="w-2 h-2 lg:w-3 lg:h-3 rounded-full shadow-sm"
                style={{ backgroundColor: COLORS[parseInt(index)] }}
              />
              <span className="text-[10px] lg:text-sm font-black text-foreground font-headline leading-none">{count}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {aiFeedback && (
        <div className="bg-primary/5 border border-primary/10 rounded-md p-1 lg:p-2 text-[8px] md:text-[10px] text-primary font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 w-2.5 h-2.5 md:w-3 md:h-3" />
          <span className="leading-tight">{aiFeedback}</span>
        </div>
      )}

      <div className="hidden lg:flex items-center justify-center gap-1.5 py-1 opacity-40 hover:opacity-100 transition-opacity">
        <Info size={10} className="text-muted-foreground" />
        <p className="text-[8px] xl:text-[10px] text-muted-foreground font-medium italic select-none">
          {t.scoringRules}
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-1 md:p-2 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/40 shadow-sm transition-all duration-300 min-h-[40px] md:min-h-[60px]", className)}>
      <div className="flex items-center gap-0.5 mb-0.5">
        {icon}
        <span className="text-[6px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-tighter leading-none">{label}</span>
      </div>
      <div className="text-base md:text-xl font-black text-foreground font-headline leading-none">{value}</div>
    </Card>
  )
}
