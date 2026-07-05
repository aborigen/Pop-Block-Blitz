"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Users } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { getLeaderboardEntries } from "@/lib/yandex-games"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LeaderboardEntry {
  rank: number
  score: number
  player: {
    publicName: string
    getAvatarSrc: (size: string) => string
  }
}

export function LeaderboardModal() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
    }
  }, [isOpen])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await getLeaderboardEntries('leaders')
      if (data && data.entries) {
        setEntries(data.entries)
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t.leaders}
          className="rounded-full w-7 h-7 lg:w-9 lg:h-9 text-muted-foreground"
        >
          <Trophy className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-accent-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline">
            <Trophy className="text-primary" />
            {t.leaders}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{t.loading}</p>
            </div>
          ) : entries.length > 0 ? (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div 
                    key={entry.rank} 
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center font-black text-primary italic">
                        #{entry.rank}
                      </div>
                      <Avatar className="w-8 h-8 border border-white/20">
                        <AvatarImage src={entry.player.getAvatarSrc('small')} />
                        <AvatarFallback><Users size={14} /></AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-sm truncate max-w-[120px]">
                        {entry.player.publicName || "Anonymous"}
                      </span>
                    </div>
                    <div className="font-black text-accent-foreground">
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <Users className="mx-auto w-12 h-12 text-muted-foreground opacity-20 mb-3" />
              <p className="text-sm text-muted-foreground">{t.noData}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
