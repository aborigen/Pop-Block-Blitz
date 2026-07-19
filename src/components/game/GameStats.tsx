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
    <div className="w-full space-y-2 lg:space-y-4 px-1 shrink-0">
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-3">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-3 h-3 md:w-4 md:h-4" />} 
            className={cn(pulseScore && "animate-bump border-primary/60 shadow-lg shadow-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-2 -right-1 z-10 bg-primary text-white text-[9px] md:text-[11px] font-black px-1.5 py-0.5 rounded-full shadow-xl animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300">
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

      <Card className="p-2 lg:p-4 bg-white/10 backdrop-blur-md border-white/10 shadow-sm">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Layers className="text-muted-foreground w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span className="text-[10px] lg:text-xs uppercase font-black text-muted-foreground tracking-widest leading-none">{t.remainingBlocks || "Remaining"}</span>
        </div>
        <div className="flex flex-wrap gap-3 lg:gap-5 px-1">
          {Object.entries(blockCounts).map(([index, count]) => (
            <div key={index} className="flex items-center gap-2 lg:gap-2.5">
              <div 
                className="w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full shadow-lg border-2 border-white/20"
                style={{ backgroundColor: COLORS[parseInt(index)] }}
              />
              <span className="text-sm lg:text-lg font-black text-foreground font-headline leading-none">{count}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {aiFeedback && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-2 lg:p-3 text-[9px] md:text-[11px] text-primary font-semibold flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 w-3 h-3 md:w-4 md:h-4 mt-0.5" />
          <span className="leading-normal">{aiFeedback}</span>
        </div>
      )}

      <div className="hidden lg:flex items-center justify-center gap-2 py-1 opacity-50 hover:opacity-100 transition-opacity cursor-help">
        <Info size={12} className="text-muted-foreground" />
        <p className="text-[10px] xl:text-xs text-muted-foreground font-semibold italic select-none text-center">
          {t.scoringRules}
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-2 lg:p-3 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border-white/10 shadow-md transition-all duration-300 min-h-[48px] md:min-h-[64px]", className)}>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[8px] md:text-[10px] uppercase font-black text-muted-foreground tracking-widest leading-none">{label}</span>
      </div>
      <div className="text-sm md:text-xl font-black text-foreground font-headline leading-none tracking-tight">{value}</div>
    </Card>
  )
}
