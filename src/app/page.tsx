import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { GithubIcon, LinkedinIcon, MailIcon } from "lucide-react"
import Image from "next/image"
import { ShootingStars } from "@/components/shooting-stars"

function GoogleScholarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M21.35 11.1H12v2.8h5.35c-.25 1.4-1.6 4.1-5.35 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.8 3.8 1.5l1.95-1.9C16.4 3.2 14.4 2 12 2 6.95 2 3 6 3 12s3.95 10 9 10c5.2 0 8.65-3.7 8.65-8.9 0-.6-.1-1.3-.3-2z"/>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center space-x-8 ml-6">
            {["About", "Publications", "Education", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-20">
        {/* Hero Section */}
        <section id="about" className="flex min-h-[80vh] flex-col items-center justify-center py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ShootingStars />
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
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              David Nordström
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              PhD Student in Deep Learning
            </p>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              I like Deep Learning and Computer Vision. Make GPUs go brrr.
            </p>
            <p className="mt-4 max-w-[700px] text-muted-foreground text-sm">
              Supervised by Prof. Fredrik Kahl and Dr. Georg Bökman.
            </p>
            <div className="mt-6 flex space-x-4">
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
          </div>
        </section>

        {/* Publications Section */}
        <section id="publications" className="py-16">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Publications</h2>
          <div className="grid gap-6">
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <h3 className="font-semibold text-lg">MuM: Multi-View Masked Image Modeling for 3D Vision</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">David Nordström</span>, Johan Edstedt, Fredrik Kahl, Georg Bökman
              </p>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Pre-print</span>
                <a href="https://arxiv.org/abs/2511.17309" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img src="https://img.shields.io/badge/arXiv-2511.17309-b31b1b" alt="arXiv" className="h-5" />
                </a>
                <a href="https://github.com/davnords/mum" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="mt-2 text-sm">MuM is a feature encoder tailored for 3D vision. We extend the MAE objective to arbitrarily many frames and show that when scaling this we can beat DINOv3 and CroCo v2 on matching, feedforward reconstruction, and relative pose estimation.</p>
            </div>
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <h3 className="font-semibold text-lg">RoMa v2: Harder Better Faster Denser Feature Matching</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Johan Edstedt, <span className="font-medium text-foreground">David Nordström</span>, Yushan Zhang, Georg Bökman, Jonathan Astermark, Viktor Larsson, Anders Heyden, Fredrik Kahl, Mårten Wadenbäck, Michael Felsberg
              </p>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Pre-print</span>
                <a href="https://arxiv.org/abs/2511.15706" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img src="https://img.shields.io/badge/arXiv-2511.15706-b31b1b" alt="arXiv" className="h-5" />
                </a>
                <a href="https://github.com/Parskatt/romav2" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="mt-2 text-sm">RoMa v2 is a dense feature matcher that combines speed with diverse data and novel architecture and matching loss. The result is a state-of-the-art model that excels on a wide range of tasks.</p>
            </div>
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <h3 className="font-semibold text-lg">Octic Vision Transformers: Quicker ViTs Through Equivariance</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">David Nordström</span>, Johan Edstedt, Fredrik Kahl, Georg Bökman
              </p>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium">Pre-print</span>
                <a href="https://arxiv.org/abs/2505.15441" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img src="https://img.shields.io/badge/arXiv-2505.15441-b31b1b" alt="arXiv" className="h-5" />
                </a>
                <a href="https://github.com/davnords/octic-vits" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="mt-2 text-sm">Introducing octic-equivariant Vision Transformers, achieving 40% FLOPs reduction while improving both classification and segmentation performance for DeiT III and DINOv2.</p>
            </div>
            <div className="group rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <h3 className="font-semibold text-lg">Flopping for FLOPs: Leveraging equivariance for computational efficiency</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Georg Bökman, <span className="font-medium text-foreground">David Nordström</span>, Fredrik Kahl
              </p>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-blue-500">ICML 2025 Spotlight Paper</span>
                <a href="https://arxiv.org/abs/2502.05169" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img src="https://img.shields.io/badge/arXiv-2502.05169-b31b1b" alt="arXiv" className="h-5" />
                </a>
                <a href="https://github.com/georg-bn/flopping-for-flops" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="mt-2 text-sm">We show that building flopping-equivariance into modern vision architectures reduces the number of FLOPs and increases performance.</p>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-16">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Education</h2>
          <div className="grid gap-6">
            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">PhD in Geometric Deep Learning and 3D Computer Vision</h3>
                  <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
                </div>
                <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Ongoing</span>
              </div>
              <p className="mt-2 text-sm">Research focus on equivariant neural networks, efficient deep learning architectures and 3D computer vision.</p>
            </div>

            <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
              <div>
                <h3 className="font-semibold text-lg">M.Sc. in Engineering Mathematics</h3>
                <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
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
                <h3 className="font-semibold text-lg">B.Sc. in Industrial Engineering</h3>
                <p className="text-sm text-muted-foreground">Chalmers University of Technology</p>
                <div className="mt-2 inline-flex items-center rounded-md border px-2.5 py-0.5 text-sm font-medium bg-blue-500/10 text-blue-500">
                  5.0/5.0 GPA
                </div>
              </div>

              <div className="rounded-lg border p-6 transition-colors hover:bg-muted/50">
                <h3 className="font-semibold text-lg">B.Sc. in Economics</h3>
                <p className="text-sm text-muted-foreground">University of Gothenburg</p>
                <p className="mt-2 text-sm">Completed in parallel with Industrial Engineering degree</p>
              </div>
            </div>
          </div>
        </section>

        {/* Teaching Section */}
        <section id="teaching" className="py-16">
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

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <h2 className="mb-8 text-3xl font-bold tracking-tighter">Get in Touch</h2>
          <h3 className="font-semibold text-lg">I&apos;m always open to research collaborations and discussions.</h3>
          <p className="text-muted-foreground">
            Feel free to reach out via email for any inquiries or opportunities.
          </p>
          <div className="mt-4 flex space-x-4">
            <Button asChild>
              <a href="mailto:davnords@chalmers.se">
                <MailIcon className="mr-2 h-4 w-4" />
                davnords@chalmers.se
              </a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
