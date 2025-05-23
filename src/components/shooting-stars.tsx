"use client"

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export const ShootingStars = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Star class for meteors
    class Star {
      x: number = 0
      y: number = 0
      vx: number = 0
      vy: number = 0
      radius: number = 1
      trail: { x: number; y: number; opacity: number }[] = []

      constructor() {
        this.reset()
      }

      reset() {
        if (!canvas) return
        // Start from left side with random height
        this.x = 0
        this.y = Math.random() * canvas.height
        // Random speed between 3 and 5
        const speed = 3 + Math.random() * 2
        const angle = -Math.PI / 6 + (Math.random() * Math.PI) / 12 // Angle between -30° and -20°
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.radius = 1
        this.trail = []
      }

      update() {
        if (!canvas) return
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y, opacity: 1 })
        
        // Update position
        this.x += this.vx
        this.y += this.vy

        // Update trail opacities
        this.trail = this.trail
          .map(point => ({ ...point, opacity: point.opacity - 0.02 }))
          .filter(point => point.opacity > 0)

        // Reset if off screen
        if (this.x > canvas.width || this.y > canvas.height) {
          this.reset()
        }
      }

      draw() {
        if (!ctx) return

        const color = theme === 'dark' ? '255, 255, 255' : '0, 0, 0'

        // Draw trail
        this.trail.forEach(point => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, this.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${color}, ${point.opacity * 0.5})`
          ctx.fill()
        })

        // Draw star
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, 0.8)`
        ctx.fill()
      }
    }

    // Create stars
    const stars = Array.from({ length: 15 }, () => new Star())

    // Animation loop
    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      stars.forEach(star => {
        star.update()
        star.draw()
      })

      animationFrame = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(animationFrame)
    }
  }, [theme]) // Re-run effect when theme changes

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
} 