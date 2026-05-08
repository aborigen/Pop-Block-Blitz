"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Sparkles, Activity } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GameStatsProps {
  score: number
  highScore: number
  moves: number
  difficulty: 'easy' | 'medium' | 'hard'
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
    <div className="w-full max-w-sm md:max-w-xl mx-auto space-y-3 md:space-y-4 mb-4 md:mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary" size={16} />} 
            className={cn(pulseScore && "animate-bump border-primary/50 shadow-primary/10")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-2 -right-1 z-10 bg-primary text-white text-[10px] md:text-xs font-black px-1.5 py-0.5 rounded-full shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatCard 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent-foreground" size={16} />} 
        />
        <StatCard 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground" size={16} />} 
        />
        <StatCard 
          label={t.level} 
          value={t.difficulty[difficulty].toUpperCase()} 
          icon={<Sparkles className="text-primary" size={16} />} 
        />
      </div>
      
      {aiFeedback && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 text-[10px] md:text-xs text-primary font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0 mt-0.5" size={12} />
          <span className="leading-tight">{t.aiMaster}: {aiFeedback}</span>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-2 md:p-3 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/40 shadow-sm transition-all duration-300", className)}>
      <div className="flex items-center gap-1 mb-0.5 md:mb-1">
        {icon}
        <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</span>
      </div>
      <div className="text-sm md:text-lg font-bold text-foreground font-headline leading-none">{value}</div>
    </Card>
  )
}
