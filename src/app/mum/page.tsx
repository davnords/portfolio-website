import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ShootingStars } from "@/components/shooting-stars"
import { ExternalLinkIcon, ArrowLeftIcon, FileTextIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata = {
  title: "MuM: Multi-View Masked Image Modeling for 3D Vision",
  description: "Project page for MuM: Multi-View Masked Image Modeling for 3D Vision",
}

const authors = [
  { name: "David Nordström", affiliation: "1", url: "https://www.davnords.com/", isMe: true },
  { name: "Johan Edstedt", affiliation: "2", url: "https://johanedstedt.com/", isMe: false },
  { name: "Fredrik Kahl", affiliation: "1", url: "https://fredkahl.github.io/", isMe: false },
  { name: "Georg Bökman", affiliation: "3", url: "https://georg-bn.github.io/", isMe: false },
]

const affiliations = [
  { id: "1", name: "Chalmers University of Technology" },
  { id: "2", name: "Linköping University" },
  { id: "3", name: "University of Amsterdam" },
]

const links = [
  { label: "Paper", icon: FileTextIcon, href: "/papers/MuM.pdf" },
  { label: "arXiv", icon: ExternalLinkIcon, href: "https://arxiv.org/pdf/2511.17309" },
  { label: "GitHub", icon: ExternalLinkIcon, href: "https://github.com/davnords/MuM" },
]

const bibtex = `@inproceedings{nordstrom2026mum,
  title={MuM: Multi-View Masked Image Modeling for 3D Vision}, 
  author={David Nordström and Johan Edstedt and Fredrik Kahl and Georg Bökman},
  booktitle={IEEE/CVF Conference on Computer Vision and Pattern Recognition},
  year={2026}
}`

export default function MuMPage() {
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
                CVPR 2026
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-8">
              MuM: Multi-View{" "}
              <span className="text-muted-foreground">Masked Image Modeling</span>{" "}
              for 3D Vision
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
            <div className="flex flex-wrap justify-center gap-x-4 text-sm text-muted-foreground mb-8">
              {affiliations.map((a) => (
                <span key={a.id}>
                  <sup className="mr-0.5">{a.id}</sup>{a.name}
                </span>
              ))}
            </div>

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
          <Image src="/projects/mum/teaser.png" alt="MuM teaser" width={1600} height={900} className="w-full h-auto rounded-lg" />
          <p className="mt-3 text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Figure 1.</strong> MuM extends masked autoencoders to arbitrarily many views, learning features tailored for 3D vision that outperform DINOv3 and CroCo v2 on feedforward reconstruction, dense matching, and relative pose estimation.
          </p>
        </section>

        {/* Abstract */}
        <section className="max-w-3xl mx-auto py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-4 text-center">Abstract</h2>
          <p className="text-muted-foreground leading-relaxed text-justify">
            Self-supervised learning on images seeks to extract meaningful visual representations from unlabeled data. When scaled to large datasets, this paradigm has achieved state-of-the-art performance and the resulting trained models such as DINOv3 have seen widespread adoption. However, most prior efforts are optimized for semantic understanding rather than geometric reasoning. One important exception is Cross-View Completion, CroCo, which is a form of masked autoencoding (MAE) tailored for 3D understanding. In this work, we continue on the path proposed by CroCo and focus on learning features tailored for 3D vision. In a nutshell, we extend MAE to arbitrarily many views of the same scene. By uniformly masking all views and employing a lightweight decoder with inter-frame attention, our approach is inherently simpler and more scalable than CroCo. We evaluate the resulting model, MuM, extensively on downstream tasks including feedforward reconstruction, dense image matching and relative pose estimation, finding that it outperforms the state-of-the-art visual encoders DINOv3 and CroCo v2. Code is available at{" "}
            <a href="https://github.com/davnords/mum" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">github.com/davnords/mum</a>.
          </p>
        </section>

        {/* Results */}
        <section className="max-w-4xl mx-auto py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-8 text-center">Results</h2>

          <Image src="/projects/mum/training.png" alt="MuM training" width={1600} height={900} className="w-full h-auto rounded-lg" />
          <p className="mt-3 text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Figure 2.</strong> Training dynamics.
          </p>
          <p className="mt-6 text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
            The MuM objective is trivially scalable
          </p>


          {/* Table 2: Camera Pose Estimation */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-1 text-center">Multi-view Camera Pose Estimation</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              AUC@30 (↑) for 10 random frames.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Method</TableHead>
                    <TableHead className="text-center">CO3Dv2</TableHead>
                    <TableHead className="text-center">Re10K</TableHead>
                    <TableHead className="text-center">MegaDepth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-xs font-semibold text-muted-foreground bg-muted/30 py-2 px-4">
                      Frozen encoder
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CroCo v2</TableCell>
                    <TableCell className="text-center">58.2</TableCell>
                    <TableCell className="text-center">27.7</TableCell>
                    <TableCell className="text-center">60.7</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DINOv3</TableCell>
                    <TableCell className="text-center">66.9</TableCell>
                    <TableCell className="text-center">36.7</TableCell>
                    <TableCell className="text-center">59.3</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>MuM</TableCell>
                    <TableCell className="text-center">71.5</TableCell>
                    <TableCell className="text-center">50.8</TableCell>
                    <TableCell className="text-center">73.0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-xs font-semibold text-muted-foreground bg-muted/30 py-2 px-4">
                      Distillation finetuning
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Random init.</TableCell>
                    <TableCell className="text-center text-muted-foreground">10.6</TableCell>
                    <TableCell className="text-center text-muted-foreground">28.0</TableCell>
                    <TableCell className="text-center text-muted-foreground">41.8</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>MuM</TableCell>
                    <TableCell className="text-center">62.6</TableCell>
                    <TableCell className="text-center">50.9</TableCell>
                    <TableCell className="text-center">78.6</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Table 3: Point Cloud Estimation */}
          <div>
            <h3 className="text-lg font-semibold mb-1 text-center">Point Cloud Estimation</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Median accuracy and completeness on DTU and ETH3D (↓ is better).
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]" rowSpan={2}>Method</TableHead>
                    <TableHead className="text-center" colSpan={2}>DTU</TableHead>
                    <TableHead className="text-center" colSpan={2}>ETH3D</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-center">Acc. ↓</TableHead>
                    <TableHead className="text-center">Comp. ↓</TableHead>
                    <TableHead className="text-center">Acc. ↓</TableHead>
                    <TableHead className="text-center">Comp. ↓</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-xs font-semibold text-muted-foreground bg-muted/30 py-2 px-4">
                      Frozen encoder
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CroCo v2</TableCell>
                    <TableCell className="text-center">8.5</TableCell>
                    <TableCell className="text-center">12.3</TableCell>
                    <TableCell className="text-center">0.9</TableCell>
                    <TableCell className="text-center">1.0</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DINOv3</TableCell>
                    <TableCell className="text-center">6.4</TableCell>
                    <TableCell className="text-center">3.7</TableCell>
                    <TableCell className="text-center">0.9</TableCell>
                    <TableCell className="text-center">1.0</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>MuM</TableCell>
                    <TableCell className="text-center">3.7</TableCell>
                    <TableCell className="text-center">1.6</TableCell>
                    <TableCell className="text-center">0.8</TableCell>
                    <TableCell className="text-center">0.8</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="text-xs font-semibold text-muted-foreground bg-muted/30 py-2 px-4">
                      Distillation finetuning
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Random init.</TableCell>
                    <TableCell className="text-center text-muted-foreground">8.4</TableCell>
                    <TableCell className="text-center text-muted-foreground">11.7</TableCell>
                    <TableCell className="text-center text-muted-foreground">1.0</TableCell>
                    <TableCell className="text-center text-muted-foreground">1.4</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>MuM</TableCell>
                    <TableCell className="text-center">6.4</TableCell>
                    <TableCell className="text-center">2.6</TableCell>
                    <TableCell className="text-center">0.6</TableCell>
                    <TableCell className="text-center">0.5</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
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
