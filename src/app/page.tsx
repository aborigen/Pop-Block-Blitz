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
      className="fixed inset-0 flex flex-col bg-background overflow-hidden touch-none"
    >
      <header className="hidden lg:flex portrait-hidden py-2 px-6 items-center justify-between border-b border-white/20 bg-white/5 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          <h1 className="text-base md:text-xl font-black text-foreground font-headline tracking-tight">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden xl:block text-[10px] font-semibold text-muted-foreground tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {t.aiPowered}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-9 md:h-9">
                <Languages size={16} className="md:w-[18px] md:h-[18px]" />
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

      <section className="flex-grow flex items-center justify-center overflow-hidden min-h-0 relative">
        <GameController />
      </section>
    </main>
  )
}
