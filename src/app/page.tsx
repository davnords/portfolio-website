import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GithubIcon, LinkedinIcon, MailIcon, DownloadIcon, YoutubeIcon, ExternalLinkIcon, AwardIcon, FileTextIcon, PresentationIcon, QuoteIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ShootingStars } from "@/components/shooting-stars"
import Carousel from "@/components/ui/carousel"
import { FlipWords } from "@/components/ui/flip-words"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { Terminal } from "@/components/ui/terminal"
import { Tooltip } from "@/components/ui/tooltip-card"
import { GlobeClient } from "@/components/globe-client"
import { ImpactChart } from "@/components/impact-chart"
import type { GlobeMarker } from "@/components/ui/3d-globe"
import { cn } from "@/lib/utils"
import { VENUE_TAG_COLORS } from "@/lib/venue"

function GoogleScholarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.35 11.1H12v2.8h5.35c-.25 1.4-1.6 4.1-5.35 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.8 3.8 1.5l1.95-1.9C16.4 3.2 14.4 2 12 2 6.95 2 3 6 3 12s3.95 10 9 10c5.2 0 8.65-3.7 8.65-8.9 0-.6-.1-1.3-.3-2z" />
    </svg>
  );
}

const ME = "David Nordström"

const LINK_ICONS = {
  arxiv: FileTextIcon,
  pdf: DownloadIcon,
  code: GithubIcon,
  page: ExternalLinkIcon,
  bibtex: QuoteIcon,
} as const

type PublicationLink = {
  label: string
  href: string
  icon: keyof typeof LINK_ICONS
  internal?: boolean
}

type Publication = {
  title: string
  authors: string[]
  venue: string
  venueTone?: "conference" | "preprint"
  tag?: keyof typeof VENUE_TAG_COLORS
  image?: string
  summary?: React.ReactNode
  links: PublicationLink[]
}

/** Renders a full author list, bolding me and keeping equal-contribution asterisks. */
function AuthorList({ authors, className }: { authors: string[]; className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      {authors.map((author, i) => {
        const equalContribution = author.endsWith("*")
        const name = equalContribution ? author.slice(0, -1) : author
        return (
          <span key={author}>
            <span className={name === ME ? "font-semibold text-foreground" : undefined}>{name}</span>
            {equalContribution && <sup>*</sup>}
            {i < authors.length - 1 && ", "}
          </span>
        )
      })}
    </p>
  )
}

function VenueLine({ pub, className }: { pub: Publication; className?: string }) {
  return (
    <p
      className={cn(
        "text-sm font-semibold italic",
        pub.venueTone === "preprint" && "text-muted-foreground",
        className,
      )}
    >
      {pub.venue}
      {pub.tag && <span className={cn("ml-1.5 not-italic", VENUE_TAG_COLORS[pub.tag])}>({pub.tag})</span>}
    </p>
  )
}

function PublicationLinks({ links, className }: { links: PublicationLink[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {links.map((link) => {
        const Icon = LINK_ICONS[link.icon]
        const linkClassName =
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        const content = (
          <>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {link.label}
          </>
        )
        return link.internal ? (
          <Link key={link.label} href={link.href} className={linkClassName}>
            {content}
          </Link>
        ) : (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            {content}
          </a>
        )
      })}
    </div>
  )
}

/** Highlighted paper: teaser figure alongside the full reference. */
function SelectedPublication({ pub }: { pub: Publication }) {
  return (
    <article className="rounded-lg border p-5 transition-colors hover:bg-muted/50">
      <div className="flex flex-col gap-5 sm:flex-row">
        {pub.image && (
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-md border bg-white sm:w-56">
            <Image
              src={pub.image}
              alt={`${pub.title} teaser figure`}
              fill
              sizes="(max-width: 640px) 100vw, 224px"
              className="object-contain p-1"
            />
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-base font-semibold leading-snug sm:text-lg">{pub.title}</h4>
          <AuthorList authors={pub.authors} className="mt-1.5" />
          <VenueLine pub={pub} className="mt-1.5" />
          {pub.summary && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{pub.summary}</p>}
          <PublicationLinks links={pub.links} className="mt-3.5" />
        </div>
      </div>
    </article>
  )
}

/** Compact reference-list entry for the remaining papers. */
function AdditionalPublication({ pub }: { pub: Publication }) {
  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <h4 className="font-medium leading-snug">{pub.title}</h4>
      <AuthorList authors={pub.authors} className="mt-1.5" />
      <VenueLine pub={pub} className="mt-1.5" />
      <PublicationLinks links={pub.links} className="mt-3" />
    </article>
  )
}

function arxiv(id: string): PublicationLink {
  return { label: `arXiv:${id}`, href: `https://arxiv.org/abs/${id}`, icon: "arxiv" }
}

function bibtex(id: string): PublicationLink {
  return { label: "BibTeX", href: `https://arxiv.org/bibtex/${id}`, icon: "bibtex" }
}

function code(repo: string): PublicationLink {
  return { label: "Code", href: `https://github.com/${repo}`, icon: "code" }
}

const SELECTED_PUBLICATIONS: Publication[] = [
  {
    title: "LoMa: Local Feature Matching Revisited",
    authors: [
      `${ME}*`,
      "Johan Edstedt*",
      "Georg Bökman",
      "Jonathan Astermark",
      "Anders Heyden",
      "Viktor Larsson",
      "Mårten Wadenbäck",
      "Michael Felsberg",
      "Fredrik Kahl",
    ],
    venue: "ECCV 2026",
    tag: "Oral",
    image: "/projects/loma/teaser.png",
    summary: (
      <>
        Revisits local feature matching with large data mixtures and scaled compute.{" "}
        <span className="font-semibold text-foreground">+18.6 mAA</span> on HardMatch over ALIKED+LightGlue.
      </>
    ),
    links: [
      arxiv("2604.04931"),
      { label: "PDF", href: "/papers/LoMa.pdf", icon: "pdf" },
      code("davnords/loma"),
      { label: "Project page", href: "/loma", icon: "page", internal: true },
      { label: "HardMatch", href: "/loma/hardmatch", icon: "page", internal: true },
      bibtex("2604.04931"),
    ],
  },
  {
    title: "MuM: Multi-View Masked Image Modeling for 3D Vision",
    authors: [ME, "Johan Edstedt", "Fredrik Kahl", "Georg Bökman"],
    venue: "CVPR 2026",
    image: "/projects/mum/teaser.png",
    summary:
      "Feature encoder for 3D vision via multi-frame MAE. Beats DINOv3 and CroCo v2 on matching, reconstruction, and pose estimation.",
    links: [
      arxiv("2511.17309"),
      { label: "PDF", href: "/papers/MuM.pdf", icon: "pdf" },
      code("davnords/mum"),
      { label: "Project page", href: "/mum", icon: "page", internal: true },
      bibtex("2511.17309"),
    ],
  },
  {
    title: "Octic Vision Transformers: Quicker ViTs Through Equivariance",
    authors: [ME, "Johan Edstedt", "Fredrik Kahl", "Georg Bökman"],
    venue: "ECCV 2026",
    image: "/projects/octic/method.png",
    summary:
      "Builds 8-fold symmetry into Vision Transformers, reducing compute while improving performance through equivariance.",
    links: [arxiv("2505.15441"), code("davnords/octic-vits"), bibtex("2505.15441")],
  },
  {
    title: "Flopping for FLOPs: Leveraging Equivariance for Computational Efficiency",
    authors: ["Georg Bökman", ME, "Fredrik Kahl"],
    venue: "ICML 2025",
    tag: "Spotlight",
    image: "/projects/flopping/flopping.png",
    summary:
      "Flopping-equivariance in modern vision architectures reduces FLOPs and improves performance — a free lunch from symmetry.",
    links: [arxiv("2502.05169"), code("georg-bn/flopping-for-flops"), bibtex("2502.05169")],
  },
]

const ADDITIONAL_PUBLICATIONS: Publication[] = [
  {
    title: "Poincar3: Emergent Multi-View Geometry Through Self-Distillation",
    authors: [ME, "Thibaut Loiseau", "Vincent Lepetit", "Michael Felsberg", "Guillaume Bourmaud", "Fredrik Kahl"],
    venue: "Pre-print, 2026",
    venueTone: "preprint",
    links: [
      arxiv("2609.39227"),
      code("davnords/poincar3"),
      { label: "Project page", href: "/poincar3", icon: "page", internal: true },
      bibtex("2609.39227"),
    ],
  },
  {
    title: "RoMa v2: Harder Better Faster Denser Feature Matching",
    authors: [
      "Johan Edstedt",
      ME,
      "Yushan Zhang",
      "Georg Bökman",
      "Jonathan Astermark",
      "Viktor Larsson",
      "Anders Heyden",
      "Fredrik Kahl",
      "Mårten Wadenbäck",
      "Michael Felsberg",
    ],
    venue: "ECCV 2026",
    tag: "Oral",
    links: [arxiv("2511.15706"), code("Parskatt/romav2"), bibtex("2511.15706")],
  },
  {
    title: "RoMa-Ω: What Feed-Forward 3D Models Know About Image Matching",
    authors: [ME, "Xinyue Zhang", "Thibaut Loiseau", "Vincent Lepetit", "Fredrik Kahl"],
    venue: "ECCV 2026",
    tag: "Workshop",
    links: [arxiv("2609.09507"), code("davnords/roma-omega"), bibtex("2609.09507")],
  },
  {
    title: "Who Handles Orientation? Investigating Invariance in Feature Matching",
    authors: [ME, "Johan Edstedt", "Fredrik Kahl", "Georg Bökman"],
    venue: "CVPR 2026",
    tag: "Workshop",
    links: [arxiv("2604.11809"), code("davnords/loma"), bibtex("2604.11809")],
  },
]

const SUPERVISED_PUBLICATIONS: (Publication & { role: React.ReactNode })[] = [
  {
    title: "Does VGGT Know What It Does Not Know?",
    authors: ["Adityan Thirumani Srinivasan", ME],
    venue: "Pre-print, 2026",
    venueTone: "preprint",
    role: (
      <>
        Advised <span className="font-medium text-foreground">Adityan Thirumani Srinivasan</span> on his first research
        project, carried out during his final year of high school. The paper shows that a linear probe on VGGT&apos;s
        frozen features predicts pose failure far better than the model&apos;s own confidence.
      </>
    ),
    links: [arxiv("2610.35806"), bibtex("2610.35806")],
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-clip">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
          <nav className="hidden sm:flex items-center space-x-4 md:space-x-8">
            {["About", "News", "Publications", "Supervision", "Impact", "Awards", "Education", "Talks", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="sm:hidden" />
          <div className="mr-2 md:mr-6">
            <ModeToggle />
          </div>
        </div>
      </header>

      <TracingBeam>
      <div className="w-full max-w-5xl mx-auto px-4 pt-20">
        {/* Hero Section */}
        <section id="about" className="flex min-h-[80vh] flex-col items-center justify-center py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ShootingStars />
          </div>
          {/* Globe — hidden on mobile, absolutely positioned to the right on desktop */}
          {/* No z-index here on purpose: it would trap the marker card in its own
              stacking context, below the hero copy. */}
          <div className="absolute -right-72 -bottom-96 hidden md:block w-[640px] h-[640px] md:-bottom-80 md:w-[720px] md:h-[720px]">
            <GlobeClient
              className="h-full w-full"
              /* Anchored to the globe's visible top-left quadrant — the rest of
                 the 720px container is clipped off-screen by the hero section. */
              cardClassName="left-16 bottom-[336px]"
              markers={[
                {
                  lat: 39.74,
                  lng: -104.99,
                  src: "/logos/cvpr2026.png",
                  label: "CVPR 2026",
                  name: "Computer Vision and Pattern Recognition",
                  location: "Denver, CO, USA",
                  dates: "June 2026",
                  papers: [
                    {
                      title: "MuM: Multi-View Masked Image Modeling for 3D Vision",
                      href: "https://arxiv.org/abs/2511.17309",
                    },
                    {
                      title: "Who Handles Orientation? Investigating Invariance in Feature Matching",
                      track: "Workshop",
                      href: "https://arxiv.org/abs/2604.11809",
                    },
                  ],
                },
                {
                  lat: 49.2827,
                  lng: -123.121,
                  src: "/logos/icmlbg.jpg",
                  label: "ICML 2025",
                  name: "International Conference on Machine Learning",
                  location: "Vancouver, Canada",
                  dates: "July 2025",
                  papers: [
                    {
                      title: "Flopping for FLOPs: Leveraging Equivariance for Computational Efficiency",
                      track: "Spotlight",
                      href: "https://arxiv.org/abs/2502.05169",
                    },
                  ],
                },
                {
                  lat: 55.61,
                  lng: 13.0,
                  src: "/logos/eccv2026.png",
                  label: "ECCV 2026",
                  name: "European Conference on Computer Vision",
                  location: "Malmö, Sweden",
                  dates: "September 2026",
                  papers: [
                    {
                      title: "LoMa: Local Feature Matching Revisited",
                      track: "Oral",
                      href: "https://arxiv.org/abs/2604.04931",
                    },
                    {
                      title: "RoMa v2: Harder Better Faster Denser Feature Matching",
                      track: "Oral",
                      href: "https://arxiv.org/abs/2511.15706",
                    },
                    {
                      title: "Octic Vision Transformers: Quicker ViTs Through Equivariance",
                      href: "https://arxiv.org/abs/2505.15441",
                    },
                    {
                      title: "RoMa-\u03a9: What Feed-Forward 3D Models Know About Image Matching",
                      track: "Workshop",
                      href: "https://arxiv.org/abs/2609.09507",
                    },
                  ],
                },
              ] as GlobeMarker[]}
              config={{
                atmosphereColor: "#4da6ff",
                atmosphereIntensity: 20,
                bumpScale: 5,
                autoRotateSpeed: 0.3,
              }}
            />
          </div>
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="mb-8 relative h-48 w-48 overflow-hidden rounded-full border-2 border-border">
              <Image
                src="/profile.jpg"
                alt="David Nordström"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              David Nordström
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              PhD Student in Deep Learning
            </p>
            <div className="mt-4 text-xl text-muted-foreground flex items-center">
              I do
              <FlipWords duration={1500} words={["Deep Learning", "Computer Vision", "3DV", "Feature Matching", "SSL"]} className="text-foreground font-semibold" />
            </div>
            <span className="mt-2 max-w-[700px] text-muted-foreground text-sm block">
              Supervised by{" "}
              <Tooltip content={
              <div>
                <div className="relative aspect-square w-full"><Image src="/team/kahl.jpg" alt="Fredrik Kahl" fill className="rounded-sm object-cover" /></div>
                <div className="my-3 flex flex-col">
                  <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Prof. Fredrik Kahl</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Professor at Chalmers. Legend in computer vision, very mathematical. Always supportive.</p>
                </div>
              </div>
            }>
              <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">Fredrik Kahl</span>
            </Tooltip>
              {" "}and{" "}
              <Tooltip content={
              <div>
                <div className="relative aspect-square w-full"><Image src="/team/GeorgBoekman.jpg" alt="Georg Bökman" fill className="rounded-sm object-cover" /></div>
                <div className="my-3 flex flex-col">
                  <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Dr. Georg Bökman</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">PostDoc in Amsterdam, formerly at Chalmers. Equivariance legend. Best mentor.</p>
                </div>
              </div>
            }>
              <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">Georg Bökman</span>
            </Tooltip>.
            </span>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <div className="flex space-x-4">
                <Button variant="outline" size="icon" asChild>
                  <a href="https://github.com/davnords" target="_blank" rel="noopener noreferrer">
                    <GithubIcon className="h-4 w-4" />
                    <span className="sr-only">GitHub Profile</span>
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="https://scholar.google.com/citations?user=-vJPE04AAAAJ" target="_blank" rel="noopener noreferrer">
                    <GoogleScholarIcon className="h-4 w-4" />
                    <span className="sr-only">Google Scholar Profile</span>
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="mailto:davnords@chalmers.se">
                    <MailIcon className="h-4 w-4" />
                    <span className="sr-only">Email</span>
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="www.linkedin.com/in/david-nordstrom-807b64183" target="_blank" rel="noopener noreferrer">
                    <LinkedinIcon className="h-4 w-4" />
                    <span className="sr-only">LinkedIn Profile</span>
                  </a>
                </Button>
              </div>
              <Button variant="default" asChild>
                <a href="/Resume_David_Nordstrom.pdf" download>
                  <DownloadIcon className="h-4 w-4" />
                  Download Resume
                </a>
              </Button>
            </div>
          </div>
          {/* <TechMarquee className="mt-12 w-full max-w-3xl hidden sm:flex" /> */}
        </section>

        {/* News Section */}
        <section id="news" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">News</h2>
          <div className="divide-y divide-border">

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-4">
              <time dateTime="2026-09-01" className="shrink-0 text-sm text-muted-foreground w-24 pt-0.5">Sep 2026</time>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pre-print released for <span className="font-semibold text-foreground">Poincar3</span>, emerging multi-view geometry from self-distillation without labels.{" "}
                <Link href="/poincar3" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">Project page</Link>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-4">
              <time dateTime="2026-06-01" className="shrink-0 text-sm text-muted-foreground w-24 pt-0.5">Jun 2026</time>
              <p className="text-sm leading-relaxed text-muted-foreground">
                3 papers accepted at ECCV 2026: <span className="font-semibold text-foreground">LoMa</span> <span className="font-semibold text-orange-500">(Oral)</span>, <span className="font-semibold text-foreground">Octic ViTs</span>, and <span className="font-semibold text-foreground">RoMa v2</span> <span className="font-semibold text-orange-500">(Oral)</span>. Also, <span className="font-semibold text-foreground">RoMa-Ω</span> accepted at the SFM-DL workshop.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-4">
              <time dateTime="2026-02-01" className="shrink-0 text-sm text-muted-foreground w-24 pt-0.5">Feb 2026</time>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">MuM</span> accepted at CVPR 2026. Our paper on Multi-View Masked Image Modeling for 3D Vision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-4">
              <time dateTime="2025-11-01" className="shrink-0 text-sm text-muted-foreground w-24 pt-0.5">Nov 2025</time>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pre-prints released for <span className="font-semibold text-foreground">MuM</span> and <span className="font-semibold text-foreground">RoMa v2</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 py-4">
              <time dateTime="2025-05-01" className="shrink-0 text-sm text-muted-foreground w-24 pt-0.5">May 2025</time>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">&quot;Flopping for FLOPs&quot;</span> accepted as <span className="font-semibold text-purple-500">Spotlight</span> Paper at ICML 2025.
              </p>
            </div>

          </div>
        </section>

        {/* Publications Section */}
        <section id="publications" className="py-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-bold tracking-tighter">Publications</h2>
            <a
              href="https://scholar.google.com/citations?user=-vJPE04AAAAJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <GoogleScholarIcon className="h-3.5 w-3.5 shrink-0" />
              Full list on Google Scholar
              <ExternalLinkIcon className="h-3 w-3 shrink-0" />
            </a>
          </div>

          {/* Selected */}
          <h3 className="mb-4 text-base font-semibold uppercase tracking-widest text-muted-foreground">Selected</h3>
          <div className="grid gap-3">
            {SELECTED_PUBLICATIONS.map((pub) => (
              <SelectedPublication key={pub.title} pub={pub} />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <sup>*</sup> Equal contribution.
          </p>

          {/* Other */}
          <h3 className="mb-2 mt-10 text-base font-semibold uppercase tracking-widest text-muted-foreground">Other</h3>
          <div className="divide-y divide-border">
            {ADDITIONAL_PUBLICATIONS.map((pub) => (
              <AdditionalPublication key={pub.title} pub={pub} />
            ))}
          </div>
        </section>

        {/* Supervision Section */}
        <section id="supervision" className="py-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tighter">Supervision</h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Students I have advised, and the work that came out of it.
          </p>
          <div className="grid gap-6">
            {SUPERVISED_PUBLICATIONS.map((pub) => (
              <article key={pub.title} className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
                <h3 className="text-lg font-semibold leading-snug">{pub.title}</h3>
                <AuthorList authors={pub.authors} className="mt-1.5" />
                <VenueLine pub={pub} className="mt-1.5" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pub.role}</p>
                <PublicationLinks links={pub.links} className="mt-3.5" />
              </article>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Impact</h2>
          <ImpactChart />
        </section>

        {/* Awards Section */}
        <section id="awards" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Awards &amp; Recognition</h2>
          <div className="grid gap-6">

            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-muted-foreground" />
                    Conference Distinctions
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-orange-500">Oral</span> at ECCV 2026 (2 papers) and <span className="font-semibold text-purple-500">Spotlight</span> at ICML 2025.
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium bg-gray-500/10 dark:bg-gray-300/10 px-2 py-0.5 rounded">2025&ndash;2026</span>
              </div>
            </div>

            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-muted-foreground" />
                    Outstanding Reviewer, NeurIPS 2026
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected for outstanding reviewing contributions.
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium bg-gray-500/10 dark:bg-gray-300/10 px-2 py-0.5 rounded">2026</span>
              </div>
            </div>

            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AwardIcon className="h-4 w-4 text-muted-foreground" />
                    SSBA Best Paper Award
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Swedish Society for Automated Image Analysis.
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium bg-gray-500/10 dark:bg-gray-300/10 px-2 py-0.5 rounded">2026</span>
              </div>
            </div>

          </div>
        </section>

        {/* Open Source */}
        <section className="py-8">
          <h2 className="mb-2 text-3xl font-bold tracking-tighter">Open Source</h2>
          <Terminal
            className="max-w-full mt-6"
            username="davnords"
            enableSound={false}
            typingSpeed={40}
            delayBetweenCommands={800}
            commands={[
              "git clone https://github.com/davnords/LoMa.git && cd LoMa",
              "uv sync --extra eval",
              "uv run eval.py matcher:loma-b --benchmark wxbs",
            ]}
            outputs={{
              0: [
                "Cloning into 'LoMa'...",
                "✔ Done",
              ],
              1: [
                "Creating virtual environment...",
                "Resolved 24 packages in 1.3s",
                "✔ Installed 24 packages",
              ],
              2: [
                "Loading LoMa-B...",
                "Evaluating on WxBS benchmark...",
                "mAA_10px: 0.6876",
                "✔ Done",
              ],
            }}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Just need the matcher?{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">uv add lomatch</code>
            {" "}works as a drop-in replacement for LightGlue in any SfM or visual localization pipeline.
          </p>
        </section>

        {/* Education Section */}
        <section id="education" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Education</h2>
          <div className="grid gap-6">
            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Image src="/logos/chalmers.png" alt="Chalmers" width={48} height={48} className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">PhD in Geometric Deep Learning and 3D Computer Vision</h3>
                    <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
                  </div>
                </div>
                <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded shrink-0 ml-4">Ongoing</span>
              </div>
              <p className="mt-3 text-sm">Research focus on equivariant neural networks, efficient deep learning architectures and 3D computer vision.</p>
            </div>

            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-4">
                <Image src="/logos/chalmers.png" alt="Chalmers" width={48} height={48} className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">M.Sc. in Engineering Mathematics</h3>
                  <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium">International Experience</p>
                <div className="mt-2 grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <p className="text-sm">Exchange Semester at UC Berkeley</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <p className="text-sm">Exchange Semester at Seoul National University</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Image src="/logos/chalmers.png" alt="Chalmers" width={48} height={48} className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">B.Sc. in Industrial Engineering</h3>
                    <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium bg-blue-500/10 text-blue-500">
                  5.0/5.0 GPA
                </div>
              </div>

              <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Image src="/logos/gu.png" alt="University of Gothenburg" width={48} height={48} className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">B.Sc. in Economics</h3>
                    <p className="text-sm text-muted-foreground">University of Gothenburg</p>
                  </div>
                </div>
                <p className="mt-3 text-sm">Completed in parallel with Industrial Engineering degree</p>
              </div>
            </div>
          </div>
        </section>

        {/* Teaching Section */}
        <section id="teaching" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Teaching</h2>
          <div className="grid gap-6">
            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Computer Vision</h3>
                  <p className="text-sm text-muted-foreground">EEN020, Chalmers University of Technology</p>
                </div>
                <span className="text-sm font-medium bg-gray-500/10 dark:bg-gray-300/10 px-2 py-0.5 rounded">Fall 2025</span>
              </div>
            </div>
            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Deep Machine Learning</h3>
                  <p className="text-sm text-muted-foreground">SSY340, Chalmers University of Technology</p>
                </div>
                <span className="text-sm font-medium bg-gray-500/10 dark:bg-gray-300/10 px-2 py-0.5 rounded">Fall 2025</span>
              </div>
            </div>
          </div>
        </section>

        {/* Talks Section */}
        <section id="talks" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Talks</h2>
          <div className="grid gap-6">
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Learning to Understand 3D in the Age of Feed-forward Reconstruction</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Invited talk at &Eacute;cole des Ponts ParisTech (ENPC), Paris, while visiting Vincent Lepetit. October 2026.
                  </p>
                </div>
                <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded flex items-center gap-1">
                  <PresentationIcon className="h-3.5 w-3.5" />
                  Slides
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/talks/learning-to-understand-3d-enpc/deck.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <PresentationIcon className="h-4 w-4" />
                    Open Slides
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Learning to Understand 3D</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Invited talk at the Workshop on Geometry, Learning and 3D Understanding &mdash; a pre-ECCV mini-workshop at the Centre for Mathematical Sciences, Lund University. September 2026.
                  </p>
                </div>
                <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded flex items-center gap-1">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  Slides
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/talks/learning-to-understand-3d-lund.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    View Slides
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://vlarsson.github.io/workshop26/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    Workshop page
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Feedforward 3D Reconstruction</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Guest lecture in the Computer Vision course at Chalmers University of Technology.
                  </p>
                </div>
                <span className="text-sm font-medium bg-red-500/10 text-red-500 px-2 py-0.5 rounded flex items-center gap-1">
                  <YoutubeIcon className="h-3.5 w-3.5" />
                  Video
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.youtube.com/watch?v=z0Um97MSJoA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <YoutubeIcon className="h-4 w-4" />
                    Watch on YouTube
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            {/* Example structure for future talks with slides:
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Talk Title</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Description of the talk
                  </p>
                </div>
                <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded flex items-center gap-1">
                  <FileTextIcon className="h-3.5 w-3.5" />
                  Slides
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="/path/to/slides.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    View Slides
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            */}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Gallery</h2>
          <div className="relative overflow-hidden w-full h-full py-20">
            <Carousel slides={[
              { title: "SSBA26 Award",                button: "View", src: "/gallery/ssba_award.jpeg" },
              { title: "CVPR 2026",                   button: "View", src: "/gallery/cvpr_26.jpg" },
              { title: "WASP in Singapore",           button: "View", src: "/gallery/singapore_wasp.jpg" },
              { title: "ICML 2025",                  button: "View", src: "/gallery/icml_25.jpeg" },
              { title: "WASP Winter Conference 2026", button: "View", src: "/gallery/wasp_winter_conference_26.jpg" },
              { title: "SSBA26 Presentation",         button: "View", src: "/gallery/ssba_present.jpeg" },
            ]} />
          </div>
        </section>

        {/* Acknowledgements Section */}
        <section className="py-8">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter">Acknowledgements</h2>
          <span className="text-sm text-muted-foreground leading-relaxed block max-w-2xl">
            My research is a result of a great collaboration with{" "}
            <Tooltip content={
              <div>
                <div className="relative aspect-square w-full"><Image src="/team/GeorgBoekman.jpg" alt="Georg Bökman" fill className="rounded-sm object-cover" /></div>
                <div className="my-3 flex flex-col">
                  <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Dr. Georg Bökman</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">PostDoc in Amsterdam, formerly at Chalmers. Equivariance legend. Best mentor.</p>
                </div>
              </div>
            }>
              <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">Georg Bökman</span>
            </Tooltip>
            {" "}and{" "}
            <Tooltip content={
              <div>
                <div className="relative aspect-square w-full"><Image src="/team/edstedt.jpg" alt="Johan Edstedt" fill className="rounded-sm object-cover" /></div>
                <div className="my-3 flex flex-col">
                  <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Johan Edstedt</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Now at Apple, formerly at Linköping University. Image matching guy, creator of RoMa and DKM. Great guy.</p>
                </div>
              </div>
            }>
              <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">Johan Edstedt</span>
            </Tooltip>
            , and my main supervisor{" "}
            <Tooltip content={
              <div>
                <div className="relative aspect-square w-full"><Image src="/team/kahl.jpg" alt="Fredrik Kahl" fill className="rounded-sm object-cover" /></div>
                <div className="my-3 flex flex-col">
                  <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">Prof. Fredrik Kahl</p>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Professor at Chalmers. Legend in computer vision, very mathematical. Always supportive.</p>
                </div>
              </div>
            }>
              <span className="cursor-pointer font-medium text-foreground underline decoration-dotted underline-offset-4">Fredrik Kahl</span>
            </Tooltip>
            {" "}, they have ben instrumental to all of my works. I am also grateful for the nice funding by the Wallenberg AI, Autonomous Systems and Software Program{" "}
            <span className="font-medium text-foreground">(WASP)</span> which has given me many great benefits.
          </span>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Get in Touch</h2>
          <h3 className="font-semibold text-lg">I&apos;m always open to research collaborations and discussions.</h3>
          <p className="text-muted-foreground">
            Feel free to reach out via email for any inquiries or opportunities.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button asChild>
              <a href="mailto:davnords@chalmers.se">
                <MailIcon className="mr-2 h-4 w-4" />
                davnords@chalmers.se
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/Resume_David_Nordstrom.pdf" download>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Resume
              </a>
            </Button>
          </div>
        </section>
      </div>
      </TracingBeam>
      <footer className="border-t py-8 text-center">
        <p className="text-xs text-muted-foreground">
          This site is open source.{" "}
          <a
            href="https://github.com/davnords/portfolio-website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-4 transition-colors"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            davnords/portfolio-website
          </a>
        </p>
      </footer>
    </main>
  )
}
