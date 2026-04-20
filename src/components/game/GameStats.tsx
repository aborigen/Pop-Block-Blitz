"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, Sparkles, Activity } from "lucide-react"

interface GameStatsProps {
  score: number
  highScore: number
  moves: number
  difficulty: string
  aiFeedback?: string
}

export function GameStats({ score, highScore, moves, difficulty, aiFeedback }: GameStatsProps) {
  return (
    <div className="w-full max-w-xl mx-auto space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
          label="Score" 
          value={score.toLocaleString()} 
          icon={<Target className="text-primary" size={18} />} 
        />
        <StatCard 
          label="Best" 
          value={highScore.toLocaleString()} 
          icon={<Trophy className="text-accent-foreground" size={18} />} 
        />
        <StatCard 
          label="Moves" 
          value={moves.toString()} 
          icon={<Activity className="text-muted-foreground" size={18} />} 
        />
        <StatCard 
          label="Level" 
          value={difficulty.toUpperCase()} 
          icon={<Sparkles className="text-primary" size={18} />} 
        />
      </div>
      
      {aiFeedback && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-primary font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="shrink-0" size={14} />
          <span>AI Master: {aiFeedback}</span>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="p-3 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/40 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground font-headline leading-none">{value}</div>
    </Card>
  )
}
