import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HardMatch Dataset',
  description: '1000 manually annotated challenging image pairs for benchmarking local feature matching, introduced in LoMa (ECCV 2026 Oral).',
  openGraph: {
    title: 'HardMatch Dataset',
    description: '1000 manually annotated challenging image pairs for benchmarking local feature matching, introduced in LoMa (ECCV 2026 Oral).',
  },
}

export default function HardMatchLayout({ children }: { children: React.ReactNode }) {
  return children
}
