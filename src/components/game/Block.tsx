"use client"

import { COLORS, SHAPES, type TileStyle } from "@/lib/game-logic"
import { cn } from "@/lib/utils"
import { Square, Circle, Star, Triangle, Pentagon, Hand } from "lucide-react"

interface BlockProps {
  colorIndex: number | null
  onClick: () => void
  isTargeted: boolean
  isHinted?: boolean
  showFinger?: boolean
  isPopping?: boolean
  style?: TileStyle
}

export function Block({ colorIndex, onClick, isTargeted, isHinted, showFinger, isPopping, style = 'popit' }: BlockProps) {
  if (colorIndex === null) {
    return <div className="w-full h-full" />
  }

  const color = COLORS[colorIndex % COLORS.length]
  const ShapeIcon = getShapeIcon(colorIndex)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full flex items-center justify-center transition-all duration-200 animate-pop-in relative group p-[8%]",
        style === 'popit' && "tile-popit",
        style === 'classic' && "tile-classic",
        style === 'glass' && "tile-glass",
        isTargeted ? "popit-tile-active z-10 brightness-110" : "hover:brightness-105",
        isPopping && "animate-dissolve pointer-events-none z-20"
      )}
      style={{ 
        backgroundColor: style === 'glass' ? `${color}99` : color,
      }}
    >
      {/* Gloss layer (Popit and Glass only) */}
      {(style === 'popit' || style === 'glass') && (
        <div className="absolute inset-0 rounded-[inherit] popit-shine overflow-hidden" />
      )}
      
      {/* Inner design */}
      <div 
        className={cn(
          "w-full h-full flex items-center justify-center transition-all duration-150 overflow-hidden relative",
          style === 'popit' && cn("rounded-full popit-bubble", isTargeted && !isPopping && "popit-bubble-active"),
          style === 'glass' && "rounded-lg",
          style === 'classic' && "rounded-sm"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          style === 'popit' ? "text-white/30 w-[65%] h-[65%]" : "text-white/50 w-[80%] h-[80%]"
        )}>
          <ShapeIcon className="w-full h-full drop-shadow-md" strokeWidth={style === 'popit' ? 3.5 : 2} />
        </div>
      </div>
      
      {isHinted && !isTargeted && !isPopping && (
        <div className="absolute inset-0 rounded-[inherit] border-2 border-white/40 bg-white/10 animate-hint-pulse pointer-events-none z-10" />
      )}

      {showFinger && !isTargeted && !isPopping && (
        <div className="absolute -bottom-2 -right-2 z-50 pointer-events-none animate-finger-tap text-white filter drop-shadow-lg">
          <Hand size={32} fill="white" className="rotate-[-20deg]" />
        </div>
      )}
    </button>
  )
}

function getShapeIcon(index: number) {
  const shape = SHAPES[index % SHAPES.length]
  switch (shape) {
    case 'circle': return Circle
    case 'star': return Star
    case 'triangle': return Triangle
    case 'pentagon': return Pentagon
    default: return Square
  }
}
