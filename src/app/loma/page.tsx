import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ShootingStars } from "@/components/shooting-stars"
import { ExternalLinkIcon, ArrowLeftIcon, FileTextIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "LoMa: Local Feature Matching Revisited",
  description: "Project page for LoMa: Local Feature Matching Revisited",
}

const authors = [
  { name: "David Nordström", affiliation: "1†", url: "https://www.davnords.com/", isMe: false },
  { name: "Johan Edstedt", affiliation: "2†", url: "https://johanedstedt.com/", isMe: false },
  { name: "Georg Bökman", affiliation: "3", url: "https://georg-bn.github.io/", isMe: false },
  { name: "Jonathan Astermark", affiliation: "4", url: "https://jastermark.github.io/", isMe: false },
  { name: "Anders Heyden", affiliation: "4", url: "https://scholar.google.com/citations?user=9j-6i_oAAAAJ&hl=en", isMe: false },
  { name: "Viktor Larsson", affiliation: "4", url: "https://vlarsson.github.io/", isMe: false },
  { name: "Mårten Wadenbäck", affiliation: "2", url: "https://scholar.google.com/citations?user=6WRQpCQAAAAJ&hl=en", isMe: false },
  { name: "Michael Felsberg", affiliation: "2", url: "https://scholar.google.com/citations?user=lkWfR08AAAAJ&hl=en", isMe: false },
  { name: "Fredrik Kahl", affiliation: "1", url: "https://fredkahl.github.io/", isMe: false },
]

const affiliations = [
  { id: "1", name: "Chalmers University of Technology" },
  { id: "2", name: "Linköping University" },
  { id: "3", name: "University of Amsterdam" },
  { id: "4", name: "Lund University" },
]

const links = [
  { label: "Paper", icon: FileTextIcon, href: "/papers/LoMa.pdf" },
  { label: "arXiv", icon: ExternalLinkIcon, href: "https://arxiv.org/abs/TBD" },
  { label: "GitHub", icon: ExternalLinkIcon, href: "http://github.com/davnords/loma" },
]

// const bibtex = `@article{nordstrom2025loma,
//   title     = {LoMa: Local Feature Matching Revisited},
//   author    = {Nordström, David},
//   journal   = {arXiv preprint},
//   year      = {2025},
// }`
const bibtex = `Preprint coming soon...`

export default function LoMaPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 pt-16">
        {/* Hero / Title Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-20 overflow-hidden min-h-[60vh]">
          <div className="absolute inset-0 z-0">
            <ShootingStars />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Venue badge */}
            <div className="mb-6">
              <span className="inline-block rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
                Preprint 2026
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8">
              LoMa: Local Feature Matching{" "}
              <span className="text-muted-foreground">Revisited</span>
            </h1>

            {/* Authors */}
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-lg mb-2">
              {authors.map((author, i) => (
                <span key={author.name}>
                  {author.url ? (
                    <a
                      href={author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline ${author.isMe ? "font-semibold" : "text-muted-foreground"}`}
                    >
                      {author.name}
                    </a>
                  ) : (
                    <span className={author.isMe ? "font-semibold" : "text-muted-foreground"}>
                      {author.name}
                    </span>
                  )}
                  <sup className="text-xs text-muted-foreground ml-0.5">{author.affiliation}</sup>
                  {i < authors.length - 1 && <span className="text-muted-foreground">,</span>}
                </span>
              ))}
            </div>

            {/* Affiliations */}
            <div className="flex flex-wrap justify-center gap-x-4 text-sm text-muted-foreground mb-2">
              {affiliations.map((a) => (
                <span key={a.id}>
                  <sup className="mr-0.5">{a.id}</sup>{a.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-8">
              <sup>†</sup> Equal contribution. Listing order is random.
            </p>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-3">
              {links.map((link) => (
                <Button key={link.label} variant="outline" asChild>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Teaser Figure */}
        <section className="max-w-5xl mx-auto py-12 border-t border-border">
          <Image src="/projects/loma/thresholds.png" alt="LoMa teaser" width={1600} height={900} className="w-full h-auto rounded-lg" />
          <p className="mt-3 text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Figure 1.</strong> LoMa achieves state-of-the-art results, even beating the RoMa-family, on various benchmarks. Here we report percentage-of-correct keypoints for different pixel thresholds on HardMatch (a new benchmark that we will release soon). 
          </p>
        </section>

        {/* Abstract */}
        <section className="max-w-3xl mx-auto py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-4 text-center">Abstract</h2>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Local feature matching is a fundamental component of 3D vision systems such as Structure-from-Motion (SfM), yet progress in this area has recently lagged behind the rapid advances of modern data-driven models. Learning-based local feature matching models are, however, still trained on only a few mid-sized datasets, whereas there has been an ongoing revolution in data-driven approaches, particularly towards feed-forward reconstruction. It remains unclear whether similar scaling could benefit local feature matching. To investigate this, we revisit local feature matching from a data-driven perspective. We scale training data by constructing a large and diverse data mixture with modern training recipes, and scale model capacity and compute, leading to strong improvements across the board. Since current standard benchmarks, such as MegaDepth and ScanNet, mainly rely on collecting sparse views from successful 3D reconstructions, the evaluation of progress in feature matching is limited. The resulting saturation of benchmarks demands new datasets, which we address in our work. We manually annotate correspondences for internet-collected image pairs, that are often unmatchable by state-of-the-art (SotA) feature matching models. We collect 1000 such pairs into a benchmark, which we call HardMatch. We show that, by our aforementioned scaling of traditional feature matching methods, we make significant progress on this benchmark, e.g. outperforming the SotA LightGlue by 18.6 mAA.
          </p>
        </section>

        {/* Method */}
        <section className="max-w-5xl mx-auto py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-8 text-center">Method</h2>
          <Image src="/projects/loma/method.png" alt="LoMa method" width={1600} height={900} className="w-full h-auto rounded-lg" />
          <p className="mt-3 text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Figure 2.</strong> Method overview.
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            LoMa takes the best of prior work and combines it in a novel matching pipeline. The descriptor and matcher are trained on a large collection of 3D vision datasets. The resulting models achieve state-of-the-art results, even surpassing dense matchers on some benchmarks.
          </p>
        </section>

        {/* BibTeX */}
        <section className="max-w-3xl mx-auto py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-6 text-center">BibTeX</h2>
          <div className="rounded-lg border border-border bg-muted/50 p-6">
            <pre className="text-sm text-muted-foreground font-mono whitespace-pre overflow-x-auto leading-relaxed">
              {bibtex}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-3xl mx-auto py-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Website template inspired by{" "}
            <a href="https://nerfies.github.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">
              Nerfies
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  )
}
