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
    <main className="min-h-screen flex flex-col bg-background">
      <header className="py-2 px-3 md:py-6 md:px-8 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white w-4 h-4 md:w-6 md:h-6" />
          </div>
          <h1 className="text-base md:text-2xl font-black text-foreground font-headline tracking-tight">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block text-[10px] font-semibold text-muted-foreground tracking-widest uppercase bg-white/40 px-3 py-1.5 rounded-full">
            {t.aiPowered}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-9 md:h-9">
                <Languages size={16} />
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

      <section className="flex-grow flex items-center justify-center">
        <GameController />
      </section>

      <footer className="py-2 md:py-6 text-center text-muted-foreground text-[9px] md:text-sm border-t border-white/10">
        <p className="font-medium px-4">{t.instruction}</p>
        <p className="opacity-50 mt-0.5">{t.copyright}</p>
      </footer>
    </main>
  )
}
