
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
    <div className="flex flex-col gap-2 md:gap-4 w-full">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 landscape:grid-cols-1 landscape:lg:grid-cols-2 gap-2">
        <div className="relative">
          <StatCard 
            label={t.score} 
            value={score.toLocaleString()} 
            icon={<Target className="text-primary w-4 h-4" />} 
            className={cn(pulseScore && "animate-bump ring-2 ring-primary border-primary shadow-lg shadow-primary/20")}
          />
          {lastIncrement !== null && lastIncrement !== undefined && (
            <div className="absolute -top-2 -right-2 z-10 bg-primary text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full shadow-lg animate-in fade-in zoom-in slide-in-from-bottom-2">
              +{lastIncrement}
            </div>
          )}
        </div>
        <StatCard 
          label={t.best} 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent w-4 h-4" />} 
        />
        <StatCard 
          label={t.moves} 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground w-4 h-4" />} 
        />
        <StatCard 
          label={t.level} 
          value={t.difficulty[difficulty]?.toUpperCase() || difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary w-4 h-4" />} 
        />
      </div>

      {/* Block Counts Panel */}
      <Card className="p-3 bg-white/5 backdrop-blur-sm border-white/10 shadow-inner">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="text-muted-foreground w-3.5 h-3.5" />
          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t.remainingBlocks}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(blockCounts).map(([index, count]) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-lg border border-white/20"
                style={{ backgroundColor: COLORS[parseInt(index)] }}
              />
              <span className="text-sm font-black text-foreground font-headline">{count}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* AI Master Feedback */}
      {aiFeedback && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-[11px] text-primary font-bold flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="shrink-0 w-4 h-4 mt-0.5" />
          <span className="leading-tight">{aiFeedback}</span>
        </div>
      )}

      {/* Footer Info */}
      <div className="hidden landscape:flex items-center justify-center gap-2 py-1 opacity-40 hover:opacity-100 transition-opacity cursor-help text-center">
        <Info size={12} className="text-muted-foreground shrink-0" />
        <p className="text-[10px] text-muted-foreground font-semibold italic leading-snug">
          {t.scoringRules}
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, className }: { label: string, value: string, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("p-3 flex flex-col items-center justify-center bg-white/5 border-white/10 shadow-sm transition-all duration-300 min-h-[60px]", className)}>
      <div className="flex items-center gap-1.5 mb-1 opacity-70">
        {icon}
        <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest leading-none">{label}</span>
      </div>
      <div className="text-base md:text-lg font-black text-foreground font-headline leading-none tracking-tight">{value}</div>
    </Card>
  )
}
