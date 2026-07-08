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
import { Trophy, Users, LogIn } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { getLeaderboardEntries, isPlayerAuthorized, authorizePlayer } from "@/lib/yandex-games"
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
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      checkAuthAndLoad()
    }
  }, [isOpen])

  const checkAuthAndLoad = async () => {
    const authStatus = await isPlayerAuthorized()
    setIsAuthorized(authStatus)
    loadLeaderboard()
  }

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

  const handleAuthorize = async () => {
    const success = await authorizePlayer()
    if (success) {
      checkAuthAndLoad()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t.leaders}
          className="rounded-full w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground"
        >
          <Trophy className="w-5 h-5 lg:w-7 lg:h-7 text-accent-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline">
            <Trophy className="text-primary" />
            {t.leaders}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {!isAuthorized && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center gap-2 text-center">
              <p className="text-xs font-medium text-primary leading-tight">
                {t.loginToSeeRank}
              </p>
              <Button size="sm" onClick={handleAuthorize} className="h-8 rounded-full bg-primary hover:bg-primary/90">
                <LogIn size={14} className="mr-2" />
                {t.login}
              </Button>
            </div>
          )}

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
