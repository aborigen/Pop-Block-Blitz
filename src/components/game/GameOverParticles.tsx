"use client"

import React, { useMemo } from 'react'
import { COLORS } from '@/lib/game-logic'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  tx: number
  ty: number
  duration: string
}

export function GameOverParticles() {
  const particles = useMemo(() => {
    const p: Particle[] = []
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const velocity = 50 + Math.random() * 200
      p.push({
        id: i,
        x: 50, // center
        y: 50, // center
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 12,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity,
        duration: (0.8 + Math.random() * 1.5).toFixed(2) + 's'
      })
    }
    return p
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            '--tw-translate-x': `${p.tx}px`,
            '--tw-translate-y': `${p.ty}px`,
            '--particle-duration': p.duration,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
