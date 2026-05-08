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
    <main className="min-h-screen flex flex-col">
      <header className="py-6 px-8 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-foreground font-headline tracking-tight">
            {t.title} <span className="text-primary">{t.subtitle}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs font-semibold text-muted-foreground tracking-widest uppercase bg-white/40 px-3 py-1.5 rounded-full">
            {t.aiPowered}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Languages size={20} />
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

      <section className="flex-grow">
        <GameController />
      </section>

      <footer className="py-6 text-center text-muted-foreground text-sm border-t border-white/10">
        <p className="font-medium px-4">{t.instruction}</p>
        <p className="opacity-50 mt-1">{t.copyright}</p>
      </footer>
    </main>
  )
}
