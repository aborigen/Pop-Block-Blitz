"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, Check, Volume2, VolumeX } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { type TileStyle } from "@/lib/game-logic"
import { cn } from "@/lib/utils"
import { soundManager } from "@/lib/sound-effects"

interface SettingsModalProps {
  currentStyle: TileStyle
  onStyleChange: (style: TileStyle) => void
  soundEnabled: boolean
  onSoundToggle: (enabled: boolean) => void
}

export function SettingsModal({ currentStyle, onStyleChange, soundEnabled, onSoundToggle }: SettingsModalProps) {
  const { t } = useTranslation()

  const styles: { id: TileStyle; label: string; previewClass: string }[] = [
    { id: 'popit', label: t.stylePopit, previewClass: 'tile-popit' },
    { id: 'classic', label: t.styleClassic, previewClass: 'tile-classic' },
    { id: 'glass', label: t.styleGlass, previewClass: 'tile-glass' },
  ]

  const handleStyleSelect = (id: TileStyle) => {
    soundManager.playClick()
    onStyleChange(id)
  }

  const handleSoundToggle = (checked: boolean) => {
    onSoundToggle(checked)
    if (checked) {
      // Play a small click only if turning it ON
      setTimeout(() => soundManager.playClick(), 50);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t.settings}
          className="rounded-full w-8 h-8 md:w-10 md:h-10 text-muted-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-tighter">
            <Settings className="text-primary" />
            {t.settings}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
              Audio
            </h3>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  soundEnabled ? "bg-accent/20 text-accent" : "bg-muted/20 text-muted-foreground"
                )}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <Label htmlFor="sound-toggle" className="font-bold cursor-pointer">
                  {t.soundEffects}
                </Label>
              </div>
              <Switch 
                id="sound-toggle" 
                checked={soundEnabled} 
                onCheckedChange={handleSoundToggle}
              />
            </div>
          </div>

          {/* Tile Style Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
              {t.tileStyle}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all group relative overflow-hidden",
                    currentStyle === style.id 
                      ? "border-primary bg-primary/10" 
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center",
                    style.previewClass
                  )} style={{ backgroundColor: '#4DCCE6' }}>
                    {currentStyle === style.id && (
                      <Check className="text-white w-5 h-5 drop-shadow-md" strokeWidth={3} />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter",
                    currentStyle === style.id ? "text-primary" : "text-muted-foreground"
                  )}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
