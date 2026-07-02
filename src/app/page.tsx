"use client"

import { GameController } from "@/components/game/GameController"
import { Sparkles, Languages } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <main 
      onContextMenu={(e) => e.preventDefault()}
      className="h-screen flex flex-col bg-background overflow-hidden touch-none"
    >
      <header className="py-1.5 px-3 md:py-4 md:px-8 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-sm shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 md:p-2 rounded-lg shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white w-3.5 h-3.5 md:w-5 md:h-5" />
          </div>
          <h1 className="text-sm md:text-xl font-black text-foreground font-headline tracking-tight">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-[9px] font-semibold text-muted-foreground tracking-widest uppercase bg-white/40 px-2 py-1 rounded-full">
            {t.aiPowered}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-7 h-7 md:w-9 md:h-9">
                <Languages size={14} className="md:w-[18px] md:h-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLocale('en')} className={locale === 'en' ? 'bg-accent' : ''}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale('ru')} className={locale === 'ru' ? 'bg-accent' : ''}>
                Русский
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="flex-grow flex items-center justify-center overflow-hidden p-1 md:p-4">
        <GameController />
      </section>

      <footer className="py-1 text-center text-muted-foreground border-t border-white/10 shrink-0">
        <p className="text-[8px] md:text-xs opacity-50">{t.copyright}</p>
      </footer>
    </main>
  )
}
