'use client'

import dynamic from 'next/dynamic'
import { useInView } from '@/components/poincar3/reveal'

// three.js is heavy: fetch it only once the viewer is about to scroll into view
const PoseViewer = dynamic(() => import('./pose-viewer').then((m) => m.PoseViewer), {
  ssr: false,
  loading: () => <div className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-muted/30 sm:aspect-[16/9]" />,
})

export function LazyPoseViewer() {
  const { ref, seen } = useInView<HTMLDivElement>(0)
  return (
    <div ref={ref}>
      {seen ? <PoseViewer /> : <div className="aspect-[4/3] rounded-2xl border border-border bg-muted/30 sm:aspect-[16/9]" />}
    </div>
  )
}
