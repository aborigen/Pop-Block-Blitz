
"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Sparkles, Activity } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type DifficultyLevel } from "@/lib/game-logic"

interface GameStatsProps {
  score: number
  highScore: number
  moves: number
  difficulty: DifficultyLevel
  aiFeedback?: string
  lastIncrement?: number | null
}

export function GameStats({ score, highScore, moves, difficulty, aiFeedback, lastIncrement }: GameStatsProps) {
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
    <div className="w-full space-y-1 lg:space-y-4 mb-1.5 px-1">
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1 lg:gap-4">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-2.5 h-2.5 md:w-5 md:h-5" />} 
            className={cn(pulseScore && "animate-bump border-primary/50 shadow-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-2 -right-1 z-10 bg-primary text-white text-[10px] md:text-lg font-black px-2 py-0.5 rounded-full shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-1 duration-300">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatCard 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent-foreground w-2.5 h-2.5 md:w-5 md:h-5" />} 
        />
        <StatCard 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground w-2.5 h-2.5 md:w-5 md:h-5" />} 
        />
        <StatCard 
          label={t.level} 
          value={t.difficulty[difficulty]?.toUpperCase() || difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary w-2.5 h-2.5 md:w-5 md:h-5" />} 
        />
      </div>
      
      {aiFeedback && (
        <div className="bg-primary/5 border border-primary/10 rounded-md p-1.5 lg:p-3 text-[8px] md:text-xs text-primary font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 w-2.5 h-2.5 md:w-4 md:h-4" />
          <span className="leading-tight">{aiFeedback}</span>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-1.5 md:p-4 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/40 shadow-sm transition-all duration-300 min-h-[50px] md:min-h-[100px]", className)}>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[7px] md:text-[12px] uppercase font-bold text-muted-foreground tracking-tighter leading-none">{label}</span>
      </div>
      <div className="text-xl md:text-4xl font-black text-foreground font-headline leading-none">{value}</div>
    </Card>
  )
}
