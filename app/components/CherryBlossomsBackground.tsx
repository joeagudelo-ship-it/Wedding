'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'

interface Petal {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  rotation: number
  drift: number
  wobble: number
}

interface CherryTree {
  x: number
  scale: number
  opacity: number
  layer: 'far' | 'mid' | 'near'
  flip: boolean
}

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 120 - 10,
    size: 20 + Math.random() * 20,
    duration: 30 + Math.random() * 40,
    delay: Math.random() * -20,
    opacity: 0.7 + Math.random() * 0.3,
    rotation: Math.random() * 360,
    drift: -60 + Math.random() * 120,
    wobble: 30 + Math.random() * 50,
  }))
}

function generateTrees(width: number): CherryTree[] {
  const trees: CherryTree[] = []
  trees.push({ x: -5, scale: 1.1, opacity: 0.04, layer: 'far', flip: false })
  trees.push({ x: width * 0.2, scale: 0.8, opacity: 0.03, layer: 'far', flip: true })
  trees.push({ x: width * 0.45, scale: 1.3, opacity: 0.05, layer: 'far', flip: false })
  trees.push({ x: width * 0.7, scale: 0.9, opacity: 0.035, layer: 'far', flip: true })
  trees.push({ x: width * 0.92, scale: 1.0, opacity: 0.04, layer: 'far', flip: false })
  trees.push({ x: 10, scale: 1.4, opacity: 0.06, layer: 'mid', flip: true })
  trees.push({ x: width * 0.35, scale: 1.2, opacity: 0.07, layer: 'mid', flip: false })
  trees.push({ x: width * 0.6, scale: 1.0, opacity: 0.055, layer: 'mid', flip: true })
  trees.push({ x: width * 0.85, scale: 1.5, opacity: 0.065, layer: 'mid', flip: false })
  trees.push({ x: -10, scale: 1.6, opacity: 0.09, layer: 'near', flip: false })
  trees.push({ x: width * 0.5, scale: 1.8, opacity: 0.1, layer: 'near', flip: true })
  trees.push({ x: width * 0.95, scale: 1.4, opacity: 0.08, layer: 'near', flip: false })
  return trees
}

function CherryTreeSVG({ tree }: { tree: CherryTree }) {
  const trunkColor = tree.layer === 'near' ? '#bf8065' : tree.layer === 'mid' ? '#a87060' : '#c59080'
  const blossomColors = [
    tree.layer === 'near' ? 'rgba(144,31,59,0.25)' : 'rgba(255,146,196,0.12)',
    tree.layer === 'near' ? 'rgba(191,128,101,0.3)' : 'rgba(191,128,101,0.15)',
    tree.layer === 'near' ? 'rgba(251,183,221,0.35)' : 'rgba(251,183,221,0.18)',
    tree.layer === 'near' ? 'rgba(255,146,196,0.4)' : 'rgba(255,146,196,0.2)',
    tree.layer === 'near' ? 'rgba(144,31,59,0.15)' : 'rgba(144,31,59,0.08)',
  ]
  const transform = tree.flip ? `scale(-${tree.scale}, ${tree.scale})` : `scale(${tree.scale}, ${tree.scale})`
  return (
    <div style={{ position: 'absolute', bottom: 0, left: tree.x, opacity: tree.opacity, transform, transformOrigin: 'bottom center', pointerEvents: 'none', zIndex: 0, transition: 'transform 0.3s ease-out' }}>
      <svg width="180" height="300" viewBox="0 0 180 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M85 290 Q80 250 75 200 Q70 160 65 130 Q60 100 55 80" stroke={trunkColor} strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M85 290 Q90 250 95 200 Q100 160 105 130 Q110 100 115 80" stroke={trunkColor} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M70 180 Q55 160 40 140 Q30 130 25 120" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M100 170 Q115 150 130 130 Q140 120 145 110" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M65 140 Q50 120 35 100 Q25 90 20 80" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M105 130 Q120 110 135 90 Q145 80 150 70" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M85 120 Q80 90 75 70 Q70 50 65 35" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="75" cy="60" rx="55" ry="45" fill={blossomColors[0]} />
        <ellipse cx="55" cy="90" rx="45" ry="35" fill={blossomColors[1]} />
        <ellipse cx="110" cy="55" rx="50" ry="40" fill={blossomColors[2]} />
        <ellipse cx="35" cy="100" rx="40" ry="30" fill={blossomColors[0]} />
        <ellipse cx="130" cy="80" rx="42" ry="32" fill={blossomColors[1]} />
        <ellipse cx="85" cy="35" rx="48" ry="38" fill={blossomColors[3]} />
        <ellipse cx="60" cy="45" rx="38" ry="28" fill={blossomColors[4]} />
        <ellipse cx="115" cy="30" rx="35" ry="25" fill={blossomColors[3]} />
        {[[60, 40], [80, 50], [100, 45], [45, 70], [70, 30], [90, 60], [110, 35], [55, 55], [75, 75], [120, 60], [35, 85], [130, 50], [65, 25], [85, 65], [105, 70], [50, 45], [95, 25], [115, 80], [40, 60], [80, 85]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5 + Math.random() * 8} fill={blossomColors[i % blossomColors.length]} />
        ))}
      </svg>
    </div>
  )
}

function FallingPetal({ petal, scrollVelocity }: { petal: Petal; scrollVelocity: number }) {
  const absVelocity = Math.min(Math.abs(scrollVelocity), 5)
  const extraDrift = absVelocity * 0.05

  const style: React.CSSProperties = useMemo(() => ({
    ['--petal-x' as string]: `${petal.x}vw`,
    ['--petal-size' as string]: `${petal.size}px`,
    ['--petal-duration' as string]: `${petal.duration}s`,
    ['--petal-delay' as string]: `${petal.delay}s`,
    ['--petal-opacity' as string]: petal.opacity,
    ['--petal-rotation' as string]: `${petal.rotation}deg`,
    ['--petal-drift' as string]: `${petal.drift + extraDrift}px`,
    ['--petal-wobble' as string]: `${petal.wobble}px`,
    position: 'absolute' as const,
    left: `${petal.x}vw`,
    top: '-30px',
    width: `${petal.size}px`,
    height: `${petal.size}px`,
    opacity: petal.opacity,
    pointerEvents: 'none' as const,
    zIndex: 1,
    animation: `petalFall ${petal.duration}s linear ${petal.delay}s infinite, petalWobble ${2 + Math.random() * 3}s ease-in-out ${petal.delay}s infinite, petalSpin ${petal.duration * 0.8}s linear ${petal.delay}s infinite`,
  }), [petal, extraDrift])

  return (
    <div style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z" fill="#fbb7dd" stroke="#ff92c4" strokeWidth="0.3" />
        <path d="M12 2C12 2 16 6 16 10C16 12.2 14.2 14 12 14C9.8 14 8 12.2 8 10C8 6 12 2 12 2Z" fill="#fce8ee" stroke="#fbb7dd" strokeWidth="0.3" />
        <ellipse cx="12" cy="10" rx="1.5" ry="2" fill="#ff92c4" />
      </svg>
    </div>
  )
}

export function CherryBlossomsBackground() {
  const [petals, setPetals] = useState<Petal[]>([])
  const [trees, setTrees] = useState<CherryTree[]>([])
  const [windowWidth, setWindowWidth] = useState(1200)
  const [scrollY, setScrollY] = useState(0)
  const [scrollVelocity, setScrollVelocity] = useState(0)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const rafRef = useRef<number>(0)
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const velocityDecayRef = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    setPetals(generatePetals(50))
  }, [])

  useEffect(() => {
    setTrees(generateTrees(windowWidth))
  }, [windowWidth])

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const now = Date.now()
      const currentY = window.scrollY
      const dt = Math.max(1, now - lastScrollTime.current)
      const velocity = (currentY - lastScrollY.current) / dt * 16
      setScrollY(currentY)
      setScrollVelocity(velocity)
      lastScrollY.current = currentY
      lastScrollTime.current = now
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const decay = () => {
      setScrollVelocity(prev => {
        if (Math.abs(prev) < 0.1) return 0
        return prev * 0.92
      })
      velocityDecayRef.current = requestAnimationFrame(decay)
    }
    velocityDecayRef.current = requestAnimationFrame(decay)
    return () => cancelAnimationFrame(velocityDecayRef.current)
  }, [])

  if (isReducedMotion) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${scrollY * 0.15}px)`, willChange: 'transform' }}>
        {trees.filter(t => t.layer === 'far').map((tree, i) => (<CherryTreeSVG key={`far-${i}`} tree={tree} />))}
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${scrollY * 0.08}px)`, willChange: 'transform' }}>
        {trees.filter(t => t.layer === 'mid').map((tree, i) => (<CherryTreeSVG key={`mid-${i}`} tree={tree} />))}
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${scrollY * 0.03}px)`, willChange: 'transform' }}>
        {trees.filter(t => t.layer === 'near').map((tree, i) => (<CherryTreeSVG key={`near-${i}`} tree={tree} />))}
      </div>
      {petals.map(petal => (<FallingPetal key={petal.id} petal={petal} scrollVelocity={scrollVelocity} />))}
    </div>
  )
}
