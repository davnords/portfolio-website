'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInView } from './reveal'

/**
 * A paper figure. `plate` renders it on white — the figures exported from the
 * paper carry black axis labels, which would vanish on a dark background.
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  label,
  plate = false,
  priority = false,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  caption: React.ReactNode
  label: string
  plate?: boolean
  priority?: boolean
  className?: string
}) {
  const { ref, seen } = useInView<HTMLElement>(0.05)
  return (
    <figure
      ref={ref}
      className={cn('transition-all duration-700 ease-out', seen ? 'opacity-100' : 'translate-y-4 opacity-0', className)}
    >
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border',
          plate && 'bg-white p-3 sm:p-4',
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="h-auto w-full rounded-md"
          sizes="(max-width: 768px) 100vw, 900px"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{label}</span> {caption}
      </figcaption>
    </figure>
  )
}

export function CopyBlock({ text, language }: { text: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/40">
      {language && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {language}
          </span>
        </div>
      )}
      <button
        onClick={() => {
          navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        className="absolute right-2.5 top-2.5 rounded-md border border-border bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-all hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        {text}
      </pre>
    </div>
  )
}
