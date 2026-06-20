import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GithubIcon, LinkedinIcon, MailIcon, DownloadIcon, YoutubeIcon, ExternalLinkIcon, AwardIcon, CalendarIcon, NewspaperIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ShootingStars } from "@/components/shooting-stars"
import Carousel from "@/components/ui/carousel"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { FlipWords } from "@/components/ui/flip-words"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { TechMarquee } from "@/components/ui/tech-marquee"
import { Terminal } from "@/components/ui/terminal"
import { Tooltip } from "@/components/ui/tooltip-card"
import { GlobeClient } from "@/components/globe-client"
import type { GlobeMarker } from "@/components/ui/3d-globe"

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

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
          <nav className="hidden sm:flex items-center space-x-4 md:space-x-8">
            {["About", "News", "Publications", "Education", "Talks", "Contact"].map((item) => (
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
          <div className="">
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
          <div className="absolute -right-72 -bottom-96 z-10 hidden md:block w-[640px] h-[640px] md:-bottom-80 md:w-[720px] md:h-[720px]">
            <GlobeClient
              className="h-full w-full"
              markers={[
                { lat: 39.74, lng: -104.99, src: "/logos/cvpr2026.png", label: "CVPR 2026" },
                { lat: 49.2827, lng: -123.121, src: "/logos/icmlbg.jpg", label: "ICML 2025" },
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
                <img src="/team/kahl.jpg" alt="Fredrik Kahl" className="aspect-square w-full rounded-sm object-cover" />
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
                <img src="/team/GeorgBoekman.jpg" alt="Georg Bökman" className="aspect-square w-full rounded-sm object-cover" />
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
          <TechMarquee className="mt-12 w-full max-w-3xl hidden sm:flex" />
        </section>

        {/* News Section */}
        <section id="news" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">News</h2>
          <div className="space-y-6">

            <div className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <AwardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-2 h-full w-px bg-border"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">3 papers accepted at ECCV 2026</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        LoMa, Octic ViTs, and RoMa v2 all accepted at ECCV 2026.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime="2026-06-01">Jun, 2026</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                    <AwardIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="mt-2 h-full w-px bg-border"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">MuM accepted at CVPR 2026</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Our paper on Multi-View Masked Image Modeling for 3D Vision has been accepted at CVPR 2026.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime="2026-02-01">Feb, 2026</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                    <NewspaperIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="mt-2 h-full w-px bg-border"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">Pre-prints out now for MuM and RoMa v2</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Released our work on Multi-View Masked Image Modeling for 3D Vision and a new dense feature matcher, RoMa v2.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime="2025-01-15">Nov, 2025</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                    <AwardIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="mt-2 h-full w-px bg-border"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">ICML 2025 Spotlight</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        &quot;Flopping for FLOPs&quot; accepted as Spotlight Paper at ICML 2025.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime="2025-01-10">May, 2025</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Publications Section */}
        <section id="publications" className="py-8">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Publications</h2>

          {/* Selected */}
          <h3 className="mb-4 text-base font-semibold uppercase tracking-widest text-muted-foreground">Selected</h3>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-10">
            {/* LoMa */}
            <CardContainer containerClassName="py-2 w-full" className="w-full">
              <CardBody className="h-auto w-full rounded-xl border bg-card p-6 dark:border-white/[0.2] dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1]">
                <CardItem translateZ={50} className="w-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    ★ ECCV 2026
                  </span>
                </CardItem>
                <CardItem translateZ={60} className="w-full mt-3">
                  <h3 className="text-xl font-bold leading-snug">LoMa</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Local Feature Matching Revisited</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1"><span className="font-medium text-foreground">D. Nordström</span><sup>*</sup>, J. Edstedt<sup>*</sup>, G. Bökman, J. Astermark, A. Heyden, V. Larsson, M. Wadenbäck, M. Felsberg, F. Kahl</p>
                </CardItem>
                <CardItem translateZ={100} className="w-full mt-4">
                  <img src="/projects/loma/teaser.png" alt="LoMa method" className="h-44 w-full object-cover rounded-xl" />
                </CardItem>
                <CardItem translateZ={30} className="w-full mt-2">
                  <p className="text-sm text-muted-foreground">Revisits local feature matching with large data mixtures and scaled compute. <span className="font-semibold text-foreground">+18.6 mAA</span> on HardMatch over ALIKED+LightGlue.</p>
                </CardItem>
                <CardItem translateZ={45} className="w-full mt-5">
                  <div className="flex items-center gap-3">
                    <a href="https://arxiv.org/abs/2604.04931" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.shields.io/badge/arXiv-2604.04931-b31b1b" alt="arXiv" className="h-5" />
                    </a>
                    <a href="https://github.com/davnords/loma" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                    <Link href="/loma" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      <span>Project page</span>
                    </Link>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* MuM */}
            <CardContainer containerClassName="py-2 w-full" className="w-full">
              <CardBody className="h-auto w-full rounded-xl border bg-card p-6 dark:border-white/[0.2] dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1]">
                <CardItem translateZ={50} className="w-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    ★ CVPR 2026
                  </span>
                </CardItem>
                <CardItem translateZ={60} className="w-full mt-3">
                  <h3 className="text-xl font-bold leading-snug">MuM</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Multi-View Masked Image Modeling for 3D Vision</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1"><span className="font-medium text-foreground">D. Nordström</span>, J. Edstedt, F. Kahl, G. Bökman</p>
                </CardItem>
                <CardItem translateZ={100} className="w-full mt-4">
                  <img src="/projects/mum/teaser.png" alt="MuM teaser" className="h-44 w-full object-cover rounded-xl" />
                </CardItem>
                <CardItem translateZ={30} className="w-full mt-2">
                  <p className="text-sm text-muted-foreground">Feature encoder for 3D vision via multi-frame MAE. Beats DINOv3 and CroCo v2 on matching, reconstruction, and pose estimation.</p>
                </CardItem>
                <CardItem translateZ={45} className="w-full mt-5">
                  <div className="flex items-center gap-3">
                    <a href="https://arxiv.org/abs/2511.17309" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.shields.io/badge/arXiv-2511.17309-b31b1b" alt="arXiv" className="h-5" />
                    </a>
                    <a href="https://github.com/davnords/mum" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                    <Link href="/mum" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                      <span>Project page</span>
                    </Link>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* Octic Vision Transformers */}
            <CardContainer containerClassName="py-2 w-full" className="w-full">
              <CardBody className="h-auto w-full rounded-xl border bg-card p-6 dark:border-white/[0.2] dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1]">
                <CardItem translateZ={50} className="w-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    ★ ECCV 2026
                  </span>
                </CardItem>
                <CardItem translateZ={60} className="w-full mt-3">
                  <h3 className="text-xl font-bold leading-snug">Octic ViTs</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Octic Vision Transformers: Quicker ViTs Through Equivariance</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1"><span className="font-medium text-foreground">D. Nordström</span>, J. Edstedt, F. Kahl, G. Bökman</p>
                </CardItem>
                <CardItem translateZ={100} className="w-full mt-4">
                  <img src="/projects/octic/method.png" alt="Octic ViTs" className="h-44 w-full object-cover rounded-xl" />
                </CardItem>
                <CardItem translateZ={30} className="w-full mt-2">
                  <p className="text-sm text-muted-foreground">Builds 8-fold symmetry into Vision Transformers, reducing compute while improving performance through equivariance.</p>
                </CardItem>
                <CardItem translateZ={45} className="w-full mt-5">
                  <div className="flex items-center gap-3">
                    <a href="https://arxiv.org/abs/2505.15441" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.shields.io/badge/arXiv-2505.15441-b31b1b" alt="arXiv" className="h-5" />
                    </a>
                    <a href="https://github.com/davnords/octic-vits" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>

            {/* Flopping for FLOPs */}
            <CardContainer containerClassName="py-2 w-full" className="w-full">
              <CardBody className="h-auto w-full rounded-xl border bg-card p-6 dark:border-white/[0.2] dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1]">
                <CardItem translateZ={50} className="w-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ★ ICML 2025 Spotlight
                  </span>
                </CardItem>
                <CardItem translateZ={60} className="w-full mt-3">
                  <h3 className="text-xl font-bold leading-snug">Flopping for FLOPs</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Leveraging equivariance for computational efficiency</p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">G. Bökman, <span className="font-medium text-foreground">D. Nordström</span>, F. Kahl</p>
                </CardItem>
                <CardItem translateZ={100} className="w-full mt-4">
                  <img src="/projects/flopping/flopping.png" alt="Flopping for FLOPs" className="h-44 w-full object-cover rounded-xl" />
                </CardItem>
                <CardItem translateZ={30} className="w-full mt-2">
                  <p className="text-sm text-muted-foreground">Flopping-equivariance in modern vision architectures reduces FLOPs and improves performance — a free lunch from symmetry.</p>
                </CardItem>
                <CardItem translateZ={45} className="w-full mt-5">
                  <div className="flex items-center gap-3">
                    <a href="https://arxiv.org/abs/2502.05169" target="_blank" rel="noopener noreferrer">
                      <img src="https://img.shields.io/badge/arXiv-2502.05169-b31b1b" alt="arXiv" className="h-5" />
                    </a>
                    <a href="https://github.com/georg-bn/flopping-for-flops" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>

          {/* Other */}
          <h3 className="mb-4 text-base font-semibold uppercase tracking-widest text-muted-foreground">Other</h3>
          <div className="grid gap-3">
            <div className="group rounded-lg border px-5 py-4 transition-colors hover:bg-muted/50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium">Who Handles Orientation? Investigating Invariance in Feature Matching</h3>
                  <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">David Nordström</span>, Johan Edstedt, Fredrik Kahl, Georg Bökman</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-blue-500">CVPRW 2026</span>
                  <a href="https://arxiv.org/abs/2604.11809" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img src="https://img.shields.io/badge/arXiv-2604.11809-b31b1b" alt="arXiv" className="h-5" />
                  </a>
                  <a href="https://github.com/davnords/loma" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <GithubIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="group rounded-lg border px-5 py-4 transition-colors hover:bg-muted/50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="font-medium">RoMa v2: Harder Better Faster Denser Feature Matching</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Johan Edstedt, <span className="font-medium text-foreground">David Nordström</span>, Yushan Zhang, Georg Bökman, Jonathan Astermark, Viktor Larsson, Anders Heyden, Fredrik Kahl, Mårten Wadenbäck, Michael Felsberg</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="text-sm font-medium text-blue-500">ECCV 2026</span>
                  <a href="https://arxiv.org/abs/2511.15706" target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img src="https://img.shields.io/badge/arXiv-2511.15706-b31b1b" alt="arXiv" className="h-5" />
                  </a>
                  <a href="https://github.com/Parskatt/romav2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <GithubIcon className="h-4 w-4" />
                  </a>
                </div>
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
                  <img src="/logos/chalmers.png" alt="Chalmers" className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
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
                <img src="/logos/chalmers.png" alt="Chalmers" className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
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
                  <img src="/logos/chalmers.png" alt="Chalmers" className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
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
                  <img src="/logos/gu.png" alt="University of Gothenburg" className="h-12 w-12 rounded-full object-contain border bg-white p-1 shrink-0" />
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
                <img src="/team/GeorgBoekman.jpg" alt="Georg Bökman" className="aspect-square w-full rounded-sm object-cover" />
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
                <img src="/team/edstedt.jpg" alt="Johan Edstedt" className="aspect-square w-full rounded-sm object-cover" />
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
                <img src="/team/kahl.jpg" alt="Fredrik Kahl" className="aspect-square w-full rounded-sm object-cover" />
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
