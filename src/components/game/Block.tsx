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
        "w-full h-full rounded-[4px] md:rounded-md flex items-center justify-center transition-all duration-200 animate-pop-in game-block-shadow game-block-active relative",
        isTargeted ? "brightness-110 scale-105 z-10" : "hover:brightness-105"
      )}
      style={{ backgroundColor: color }}
    >
      <div className="text-white/30 w-1/2 h-1/2">
        <ShapeIcon className="w-full h-full" strokeWidth={3} />
      </div>
      
      {isHinted && !isTargeted && (
        <div className="absolute inset-0 rounded-[4px] md:rounded-md border-2 border-white bg-white/20 animate-hint-pulse pointer-events-none z-10" />
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