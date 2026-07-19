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
}

export function Block({ colorIndex, onClick, isTargeted, isHinted, showFinger }: BlockProps) {
  if (colorIndex === null) {
    return <div className="w-full h-full" />
  }

  const color = COLORS[colorIndex % COLORS.length]
  const ShapeIcon = getShapeIcon(colorIndex)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full rounded-[6px] md:rounded-lg flex items-center justify-center transition-all duration-200 animate-pop-in popit-tile-base relative group p-[10%]",
        isTargeted ? "brightness-110 scale-[1.03] z-10" : "hover:brightness-105"
      )}
      style={{ backgroundColor: color }}
    >
      {/* The "Bubble" part of the Popit */}
      <div 
        className={cn(
          "w-full h-full rounded-full flex items-center justify-center transition-all duration-150 popit-bubble overflow-hidden",
          isTargeted && "popit-bubble-active"
        )}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div className="text-white/40 w-[60%] h-[60%] flex items-center justify-center">
          <ShapeIcon className="w-full h-full drop-shadow-sm" strokeWidth={3} />
        </div>
      </div>
      
      {isHinted && !isTargeted && (
        <div className="absolute inset-0 rounded-[6px] md:rounded-lg border-2 border-white/50 bg-white/10 animate-hint-pulse pointer-events-none z-10" />
      )}

      {showFinger && !isTargeted && (
        <div className="absolute -bottom-2 -right-2 z-50 pointer-events-none animate-finger-tap text-white filter drop-shadow-md">
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
