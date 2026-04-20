import { GameController } from "@/components/game/GameController"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="py-6 px-8 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 rotate-12">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-foreground font-headline tracking-tight">
            POP BLOCK <span className="text-primary">BLITZ</span>
          </h1>
        </div>
        <div className="hidden md:block text-xs font-semibold text-muted-foreground tracking-widest uppercase bg-white/40 px-3 py-1.5 rounded-full">
          Powered by Adaptive AI
        </div>
      </header>

      <section className="flex-grow">
        <GameController />
      </section>

      <footer className="py-6 text-center text-muted-foreground text-sm border-t border-white/10">
        <p className="font-medium">Pop adjacent same-color blocks to win! Larger groups = More points.</p>
        <p className="opacity-50 mt-1">© 2024 Pop Block Blitz Studios</p>
      </footer>
    </main>
  )
}
