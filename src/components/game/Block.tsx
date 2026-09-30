
"use client"

import { COLORS, SHAPES } from "@/lib/game-logic"
import { cn } from "@/lib/utils"
import { Square, Circle, Star, Triangle, Pentagon, Hand } from "lucide-react"

interface BlockProps {
  colorIndex: number | null
  onClick: () => void
  isTargeted: boolean
  isHinted?: boolean
  showFinger?: boolean
  isPopping?: boolean
}

export function Block({ colorIndex, onClick, isTargeted, isHinted, showFinger, isPopping }: BlockProps) {
  if (colorIndex === null) {
    return <div className="w-full h-full" />
  }

  const color = COLORS[colorIndex % COLORS.length]
  const ShapeIcon = getShapeIcon(colorIndex)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full rounded-[8px] md:rounded-xl flex items-center justify-center transition-all duration-200 animate-pop-in popit-tile-base relative group p-[8%]",
        isTargeted ? "popit-tile-active z-10 brightness-110" : "hover:brightness-105",
        isPopping && "animate-dissolve pointer-events-none z-20"
      )}
      style={{ backgroundColor: color }}
    >
      {/* Gloss layer */}
      <div className="absolute inset-0 rounded-[8px] md:rounded-xl popit-shine overflow-hidden" />
      
      {/* The "Bubble" part of the Popit */}
      <div 
        className={cn(
          "w-full h-full rounded-full flex items-center justify-center transition-all duration-150 popit-bubble overflow-hidden relative",
          isTargeted && !isPopping && "popit-bubble-active"
        )}
      >
        <div className="text-white/30 w-[65%] h-[65%] flex items-center justify-center">
          <ShapeIcon className="w-full h-full drop-shadow-md" strokeWidth={3.5} />
        </div>
      </div>
      
      {isHinted && !isTargeted && !isPopping && (
        <div className="absolute inset-0 rounded-[8px] md:rounded-xl border-2 border-white/40 bg-white/10 animate-hint-pulse pointer-events-none z-10" />
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
