'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'

const KEYWORDS = new Set([
  'for', 'in', 'with', 'if', 'else', 'return', 'def', 'import', 'from', 'None', 'True', 'False',
])

/** Deliberately tiny: enough to colour the paper's pseudo-code, nothing more. */
function highlight(line: string, key: number) {
  const hash = line.indexOf('#')
  const code = hash === -1 ? line : line.slice(0, hash)
  const comment = hash === -1 ? '' : line.slice(hash)

  const parts = code.split(/([A-Za-z_][A-Za-z0-9_]*|\d+\.?\d*)/g)

  return (
    <div key={key} className="whitespace-pre">
      {parts.map((part, i) => {
        if (!part) return null
        if (KEYWORDS.has(part)) {
          return (
            <span key={i} className="font-semibold text-violet-500 dark:text-violet-400">
              {part}
            </span>
          )
        }
        if (/^\d/.test(part)) {
          return (
            <span key={i} className="text-amber-600 dark:text-amber-400">
              {part}
            </span>
          )
        }
        if (/^[A-Za-z_]/.test(part)) {
          return (
            <span key={i} className="text-foreground">
              {part}
            </span>
          )
        }
        return (
          <span key={i} className="text-muted-foreground">
            {part}
          </span>
        )
      })}
      {comment && <span className="italic text-emerald-600 dark:text-emerald-500">{comment}</span>}
    </div>
  )
}

export function PseudoCode({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const lines = code.replace(/\n$/, '').split('\n')

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <CheckIcon className="h-3 w-3 text-emerald-500" /> : <CopyIcon className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="min-w-max font-mono text-[11.5px] leading-[1.75]">
          {lines.map((l, i) => highlight(l, i))}
        </div>
      </div>
    </div>
  )
}
