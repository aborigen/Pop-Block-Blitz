
"use client"

import { GameController } from "@/components/game/GameController"
import { Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

export default function Home() {
  const { t } = useTranslation();

  return (
    <main 
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 h-[100dvh] flex flex-col bg-background overflow-hidden touch-none"
    >
      <header className="hidden lg:flex portrait-hidden py-2 px-6 items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 rotate-6">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-black text-foreground font-headline tracking-tight leading-none uppercase">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {t.aiPowered}
          </div>
        </div>
      </header>

      <div className="flex-grow relative overflow-hidden flex flex-col items-center justify-center">
        <GameController />
      </div>
    </main>
  )
}
