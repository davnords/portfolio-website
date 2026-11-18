import Link from "next/link"
import { ArrowLeftIcon, FileTextIcon, GithubIcon, QuoteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { CopyBlock, Figure } from "@/components/poincar3/figure"
import { HeroCanvas } from "@/components/vggt-mu/hero-canvas"
import { Race } from "@/components/vggt-mu/race"
import {
  EfficiencyScatter,
  RobustnessChart,
  ScalingChart,
  SeparationChart,
} from "@/components/vggt-mu/charts"
import { Downstream } from "@/components/vggt-mu/downstream"
import { LazyPoseViewer } from "@/components/vggt-mu/pose-viewer-lazy"
import { CountUp } from "@/components/vggt-mu/count-up"

export const metadata = {
  title: "VGGT-μ: Lightweight Relative Pose Regression at Scale",
  description:
    "VGGT-μ is a 120M-parameter recurrent pose regressor that estimates camera poses for 1,500 frames in 4 seconds on 9 GiB, handles disconnected view graphs, and predicts metric poses with uncertainty.",
  openGraph: {
    title: "VGGT-μ: Lightweight Relative Pose Regression at Scale",
    description: "Camera poses for 1,500 frames in one forward pass: 4 seconds, 9 GiB, 120M parameters.",
    images: ["/projects/vggt-mu/teaser.png"],
  },
}

// Fill this in when it exists; empty renders the Paper button as "soon".
const ARXIV_ID = ""
const CODE_URL = "https://github.com/davnords/vggt-mu"

const authors = [
  { name: "Ludvig Dillén", aff: "1", url: "https://ludvigdillen.github.io/", equal: true },
  { name: "David Nordström", aff: "2", url: "https://www.davnords.com/", equal: true },
  { name: "Xinyue Zhang", aff: "3", url: "https://scholar.google.com/citations?user=WvixLxcAAAAJ&hl=en" },
  { name: "Yaroslava Lochman", aff: "2", url: "https://ylochman.github.io/" },
  { name: "Janne Heikkilä", aff: "3", url: "https://www.oulu.fi/en/researchers/janne-heikkila" },
  { name: "Fredrik Kahl", aff: "2", url: "https://fredkahl.github.io/" },
  { name: "Viktor Larsson", aff: "1", url: "https://vlarsson.github.io/" },
]

const affiliations = [
  { id: "1", name: "Lund University" },
  { id: "2", name: "Chalmers University of Technology" },
  { id: "3", name: "University of Oulu" },
]

const heroStats = [
  { to: 1500, suffix: "", label: "frames in one forward pass" },
  { to: 4, suffix: " s", label: "on one GPU, π³ needs 18 min" },
  { to: 9, suffix: " GiB", label: "peak memory, VGGT-Ω runs out" },
  { to: 120, suffix: "M", label: "parameters, 9× fewer than VGGT-Ω" },
]

const ideas = [
  {
    step: "01",
    title: "Small where it counts",
    body: "Attention costs O(N²R⁴), so a 256 px input is the biggest single win, 13× on its own. One recurrent block, applied K = 12 times with shared weights, then shrinks the trunk 11.5× in parameters. No depth head.",
  },
  {
    step: "02",
    title: "Relative, not absolute",
    body: "Pairs of camera tokens go through an MLP that predicts the relative pose, a confidence, and a full 6×6 information matrix for every edge. Anisotropic SE(3) averaging turns them into absolute poses.",
  },
  {
    step: "03",
    title: "Distilled from the big brother",
    body: "Per-layer feature distillation from a frozen VGGT-Ω teacher, plus ground-truth supervision, including pose-only data that depth-supervised models can't use. Nine days on 16 GH200s.",
  },
]

const bibtex = `@misc{dillen2026vggtmu,
      title={VGGT-$\\mu$: Lightweight Relative Pose Regression at Scale},
      author={Ludvig Dillén and David Nordström and Xinyue Zhang and Yaroslava Lochman and Janne Heikkilä and Fredrik Kahl and Viktor Larsson},
      year={2026},${
        ARXIV_ID
          ? `
      eprint={${ARXIV_ID}},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/${ARXIV_ID}},`
          : ""
      }
}`

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">{eyebrow}</p>
      <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  )
}

const Mu = () => <span className="text-rose-600 dark:text-rose-400">μ</span>

export default function VggtMuPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <a href={CODE_URL} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-4 w-4" />
                Code
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-16">
        {/* the mask keeps the trajectory clear of the title instead of veiling it */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            maskImage: "radial-gradient(ellipse min(50vw, 700px) 330px at 50% calc(50% + 10px), transparent 62%, black 100%)",
            WebkitMaskImage: "radial-gradient(ellipse min(50vw, 700px) 330px at 50% calc(50% + 10px), transparent 62%, black 100%)",
          }}
        >
          <HeroCanvas className="h-full w-full" />
        </div>
        <div className="absolute left-1/2 top-1/3 -z-20 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-[120px] dark:bg-rose-500/[0.08]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              Preprint
            </span>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 backdrop-blur dark:text-rose-300">
              Feed-forward pose estimation
            </span>
          </div>

          <h1>
            <span className="block text-6xl font-bold tracking-tighter sm:text-8xl md:text-9xl">
              VGGT
              <span className="text-muted-foreground/40">-</span>
              <span className="bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                μ
              </span>
            </span>
            <span className="mt-5 block text-balance text-2xl font-semibold leading-tight tracking-tight text-muted-foreground sm:text-3xl md:text-4xl">
              Lightweight Relative Pose Regression <span className="text-foreground">at Scale</span>
            </span>
          </h1>

          <div className="mx-auto mt-9 flex max-w-2xl flex-wrap justify-center gap-x-2.5 gap-y-1 text-[15px]">
            {authors.map((a, i) => (
              <span key={a.name}>
                {a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={a.equal ? "font-semibold hover:underline" : "text-muted-foreground hover:underline"}
                  >
                    {a.name}
                  </a>
                ) : (
                  <span className={a.equal ? "font-semibold" : "text-muted-foreground"}>{a.name}</span>
                )}
                <sup className="ml-0.5 text-[10px] text-muted-foreground">
                  {a.aff}
                  {a.equal && "*"}
                </sup>
                {i < authors.length - 1 && <span className="text-muted-foreground">,</span>}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {affiliations.map((a) => (
              <span key={a.id}>
                <sup className="mr-0.5">{a.id}</sup>
                {a.name}
              </span>
            ))}
            <span>* equal contribution, random order</span>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-2.5">
            {ARXIV_ID ? (
              <Button asChild>
                <a href={`https://arxiv.org/abs/${ARXIV_ID}`} target="_blank" rel="noopener noreferrer">
                  <FileTextIcon className="h-4 w-4" />
                  Paper
                </a>
              </Button>
            ) : (
              <Button disabled>
                <FileTextIcon className="h-4 w-4" />
                Paper · soon
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={CODE_URL} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-4 w-4" />
                Code
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#cite">
                <QuoteIcon className="h-4 w-4" />
                BibTeX
              </a>
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {heroStats.map((s, i) => (
              <div key={s.label} className="bg-background/80 p-4 backdrop-blur">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                  <CountUp to={s.to} delay={200 + i * 120} />
                  <span className="text-xl text-muted-foreground sm:text-2xl">{s.suffix}</span>
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* ------------------------------------------------------- the race */}
        <section className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="The race"
            title={
              <>
                Every camera of a Cambridge scene. <span className="text-muted-foreground">One forward pass.</span>
              </>
            }
            lead="All mapping frames of each scene go in at once, on one 96 GiB GH200. The clocks below run in real time. Pick a scene and watch who finishes."
          />
          <Race />
        </section>

        {/* -------------------------------------------------------- abstract */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading eyebrow="Abstract" title={<>VGGT-<Mu /> in short</>} />
          <p className="max-w-3xl text-[15px] leading-[1.85] text-muted-foreground">
            Estimating camera poses from a set of images is a core problem in 3D vision. Feed-forward reconstruction
            models, such as VGGT, tackle this problem by jointly predicting camera poses and depth maps in a single forward
            pass. While powerful, these models&apos; runtime and memory requirements grow rapidly with the number of input
            images. In practice, many applications, such as visual localization and odometry, require only camera poses.
            Thus, we propose <span className="font-semibold text-foreground">VGGT-μ</span>, a lightweight recurrent model
            that replaces feed-forward reconstruction with feed-forward pose regression, scaling to thousands of images
            thanks to low-resolution input, low parameter count, and no depth prediction. With only 120M parameters,
            VGGT-μ rivals its bigger brother, VGGT-Ω, on pose benchmarks. Relying on relative pose regression, VGGT-μ
            handles disconnected view graphs while providing metric poses and information matrices for anisotropic pose
            averaging. For example, VGGT-μ reconstructs 1,500 frames in 4 seconds using 9 GiB of VRAM, whereas VGGT-Ω
            runs out of memory and π³ is less accurate despite requiring 18 minutes and 79 GiB.
          </p>
        </section>

        {/* ----------------------------------------------------------- viewer */}
        <section id="explore" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Explore"
            title="Fly through the predictions yourself"
            lead="Every camera VGGT-μ predicted for five Cambridge Landmarks scenes, each from one forward pass and drawn with its own image. Scrub through the sequence, colour by error or by the predicted uncertainty, and click a camera to see its frame. The mixed-scene and localization results are here too."
          />
          <LazyPoseViewer />
        </section>

        {/* ------------------------------------------------------- downstream */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Downstream"
            title="One model, three pipelines"
            lead="Condition on known poses or intrinsics when you have them. The same weights slot into localization, SfM and odometry."
          />
          <Downstream />
        </section>

        {/* ------------------------------------------------------- efficiency */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Efficiency"
            title={
              <>
                Top-tier accuracy, <span className="text-muted-foreground">at a fraction of the cost</span>
              </>
            }
            lead="At 500 frames, VGGT-μ is the fastest model and the one with the least memory, while landing second in accuracy, 1.6 points behind π³, which takes 80× longer."
          />
          <EfficiencyScatter />
          <div className="mt-12">
            <h3 className="mb-2 text-lg font-semibold">Scaling to a thousand frames</h3>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Compared with VGGT-Ω and the efficient VGGT variants, which merge tokens to go faster. VGGT-μ stays
              accurate as sequences grow and is 20× faster than the fastest of them at 1,000 frames. Token merging is
              orthogonal: applied to VGGT-μ (dashed) it halves the time again.
            </p>
            <ScalingChart />
          </div>
        </section>

        {/* ------------------------------------------------------- robustness */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Robustness"
            title={
              <>
                Throw in the wrong photos. <span className="text-muted-foreground">It notices.</span>
              </>
            }
            lead="Feed-forward models assume a single scene and force everything into one coordinate frame. VGGT-μ is trained on disconnected view graphs, so its edge confidences separate scenes and reject distractors in the same pass that estimates the poses."
          />
          <Figure
            src="/projects/vggt-mu/view_graph.png"
            alt="Edge confidence matrix separating two scenes and three distractors"
            width={1792}
            height={477}
            plate
            label="Figure 1."
            caption="Two unordered 7-Scenes sequences plus three distractors. Thresholding the predicted edge confidence ĉᵢⱼ separates the scenes and leaves the distractors out."
          />
          <div className="mt-12">
            <h3 className="mb-2 text-lg font-semibold">Accuracy when the input is messy</h3>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Mixing three scenes costs the baselines 26 to 37 AUC points. VGGT-μ loses 1.7. Switch between the settings
              to watch the drop.
            </p>
            <RobustnessChart />
          </div>
          <div className="mt-8">
            <SeparationChart />
          </div>
        </section>

        {/* ---------------------------------------------------------- method */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Method"
            title="A micro VGGT-Ω that only predicts poses"
            lead="Images, possibly from several unrelated scenes, pass through a DINOv3 encoder and one shared block of frame and global attention, repeated K times. Every pair of camera tokens is decoded into a relative pose, a confidence and an information matrix; pose averaging produces metric trajectories. Known poses and intrinsics can be fed in when you have them."
          />
          <Figure
            src="/projects/vggt-mu/method.png"
            alt="VGGT-μ architecture overview"
            width={1792}
            height={622}
            plate
            label="Figure 2."
            caption="Pairs of learnable camera tokens go into an MLP that predicts pairwise confidences, information matrices and poses. Feature distillation from VGGT-Ω stabilises training; anisotropic pose averaging yields absolute poses."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ideas.map((it) => (
              <div key={it.step} className="group rounded-xl border border-border p-5 transition-colors hover:border-rose-500/40">
                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  {it.step}
                </span>
                <h3 className="mb-2 mt-3 font-semibold">{it.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ uncertainty */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading eyebrow="Uncertainty" title="Every edge knows how wrong it might be" />
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                For each pair, the head outputs the 21 entries of a Cholesky factor L, so the information matrix{" "}
                <span className="font-mono text-foreground">Λ = LLᵀ</span> is positive definite by construction. It is
                trained with a Gaussian negative log-likelihood on the SE(3) residual of close edges.
              </p>
              <p>
                The result is roughly calibrated: Mahalanobis distances follow the expected χ₆ distribution, slightly
                overconfident, and whitened residuals are close to standard normal. Pose averaging uses Λ to weight each
                edge anisotropically, which beats both chaining and isotropic averaging for localization on Indoor6.
              </p>
              <p>
                To see it on real data, colour the{" "}
                <a href="#explore" className="font-medium text-foreground underline underline-offset-4">
                  viewer
                </a>{" "}
                by <span className="font-medium text-foreground">Uncertainty</span>: the cameras the model is least sure
                about light up red.
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Averaging</th>
                      <th className="px-3 py-2 text-right font-medium">cm ↓</th>
                      <th className="px-3 py-2 text-right font-medium">° ↓</th>
                      <th className="px-3 py-2 text-right font-medium">5 cm, 5° ↑</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {[
                      ["Chaining", "4.30", "0.456", "60.48"],
                      ["Isotropic", "4.21", "0.438", "61.12"],
                      ["Anisotropic", "4.09", "0.430", "61.95"],
                    ].map((r, i) => (
                      <tr key={r[0]} className={i === 2 ? "bg-rose-500/[0.05] font-semibold text-foreground" : ""}>
                        {r.map((c, j) => (
                          <td key={j} className={j === 0 ? "px-3 py-2 font-sans text-sm" : "px-3 py-2 text-right"}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Figure
              src="/projects/vggt-mu/uncertainty.png"
              alt="Uncertainty calibration plots"
              width={1185}
              height={1093}
              plate
              label="Figure 3."
              caption="(a) Mahalanobis distance of the residuals under the predicted Λ, against χ₆. (b) Whitened residual components against 𝒩(0, 1)."
            />
          </div>
        </section>

        {/* ---------------------------------------------------------- bibtex */}
        <section id="cite" className="scroll-mt-20 border-t border-border py-16 sm:py-20">
          <SectionHeading eyebrow="Cite" title="BibTeX" />
          <CopyBlock text={bibtex} language="bibtex" />
        </section>
      </div>
    </main>
  )
}
