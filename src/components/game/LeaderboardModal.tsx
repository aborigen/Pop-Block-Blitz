"use client"

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

export function LeaderboardModal() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t.leaders}
          aria-label={t.leaders}
          className="rounded-full w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground"
        >
          <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-accent-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline">
            <Trophy className="text-primary" />
            {t.leaders}
          </DialogTitle>
        </DialogHeader>

        <div className="py-10 text-center">
          <Users className="mx-auto w-12 h-12 text-muted-foreground opacity-20 mb-3" />
          <p className="text-sm text-muted-foreground">
            Online leaderboards are currently unavailable. 
            Your high score is saved locally!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
