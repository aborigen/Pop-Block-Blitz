
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
      <header className="hidden lg:flex portrait-hidden py-1.5 px-6 items-center justify-between border-b border-white/20 bg-white/5 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
          <h1 className="text-sm md:text-lg font-black text-foreground font-headline tracking-tight leading-none">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xl:block text-[9px] font-semibold text-muted-foreground tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            {t.aiPowered}
          </div>
        </div>
      </header>

      <section className="flex-grow flex items-center justify-center overflow-hidden min-h-0 relative">
        <GameController />
      </section>
    </main>
  )
}
