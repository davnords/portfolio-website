import Image from "next/image"
import Link from "next/link"
import { ArrowLeftIcon, BoxIcon, FileTextIcon, GithubIcon, PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MultiViewCanvas } from "@/components/poincar3/multiview-canvas"
import { MethodDiagram } from "@/components/poincar3/method-diagram"
import { AblationLadder, AdapterChart, CorrespondenceChart, HeadlineResults } from "@/components/poincar3/charts"
import { CopyBlock, Figure } from "@/components/poincar3/figure"
import { PseudoCode } from "@/components/poincar3/pseudocode"

export const metadata = {
  title: "Poincar3: Emergent Multi-View Geometry Through Self-Distillation",
  description:
    "Poincar3 learns 3D-aware visual representations from unlabeled image sequences through multi-view self-distillation — no RGB reconstruction, no 3D supervision.",
  openGraph: {
    title: "Poincar3: Emergent Multi-View Geometry Through Self-Distillation",
    description:
      "Multi-view self-distillation yields state-of-the-art self-supervised features for pose estimation, reconstruction and zero-shot correspondence.",
    images: ["/projects/poincar3/attention_grid.jpg"],
  },
}

const authors = [
  { name: "David Nordström", aff: "1", url: "https://www.davnords.com/", isMe: true },
  { name: "Thibaut Loiseau", aff: "2", url: "https://scholar.google.com/citations?user=qDSlhTUAAAAJ" },
  { name: "Vincent Lepetit", aff: "2", url: "https://scholar.google.com/citations?user=h0a5q3QAAAAJ" },
  { name: "Michael Felsberg", aff: "3", url: "https://scholar.google.com/citations?user=lkWfR08AAAAJ" },
  { name: "Guillaume Bourmaud", aff: "4", url: "https://scholar.google.com/citations?user=d4v2IYMAAAAJ" },
  { name: "Fredrik Kahl", aff: "1", url: "https://fredkahl.github.io/" },
]

const affiliations = [
  { id: "1", name: "Chalmers University of Technology" },
  { id: "2", name: "ENPC, IP Paris" },
  { id: "3", name: "Linköping University" },
  { id: "4", name: "University of Bordeaux, CNRS" },
]

const stats = [
  { value: "94.9", unit: "PCK@50", label: "Zero-shot multi-view correspondence on ScanNet, straight from the attention map" },
  { value: "650", unit: "M params", label: "ViT-L encoder plus a 12-layer alternating-attention multi-view decoder" },
  { value: "0", unit: "3D labels", label: "Trained from scratch on unlabeled internet videos. No poses, no depth, no correspondences" },
  { value: "3", unit: "days · 8×H200", label: "400k steps at 256×256, sequences of 2 to 24 views" },
]

const ingredients = [
  {
    step: "01",
    title: "An image-level objective",
    gain: "+11.0",
    body: "Masked-patch distillation alone plateaus. Adding a per-frame [CLS] loss is what steers self-distillation towards a 3D-aware representation rather than a semantic one.",
  },
  {
    step: "02",
    title: "A teacher that sees more",
    gain: "+3.5",
    body: "The teacher receives T extra frames of the same scene, sampled uniformly from 0 to 12. They never enter the loss — they only leak geometric context through multi-view attention, so the student has to infer what it cannot see.",
  },
  {
    step: "03",
    title: "Whole images, no crops",
    gain: "+6.0",
    body: "DINOv2's local/global crop scheme destroys the very geometry the multi-view attention is trying to exploit. Keeping full frames turns a failing objective into a working one.",
  },
]

const pseudocode = `# fs, ft: student and teacher networks
# tps, tpt: student and teacher temperatures
# l: EMA momentum rate
# M, T: number of student and extra teacher views
ft.params = fs.params

for imgs in loader:            # mini-batch of M+T frame sequences
    sv = augment(imgs[:, :M])  # student views
    tv = augment(imgs)         # teacher views, M+T of them
    mask = sample_mask(sv)     # patch mask [B, M, N]

    P_s, G_s, G_raw = fs(sv, mask=mask)
    with no_grad():
        P_t, G_t, _ = ft(tv, mask=None)

    # masked patch distillation (iBOT-style)
    P_t = sknopp(P_t[:, :M][mask].detach(), tpt)
    P_s = log_softmax(P_s[mask] / tps, dim=-1)
    L_patch = -(P_t * P_s).sum(-1).mean()

    # per-frame image objective (DINO-style)
    G_t = sknopp(G_t[:, :M].detach(), tpt)
    G_s = log_softmax(G_s / tps, dim=-1)
    L_global = -(G_t * G_s).sum(-1).mean()

    L_koleo = koleo(G_raw)

    loss = L_patch + 0.5 * L_global + 0.1 * L_koleo
    loss.backward()
    update(fs)                              # AdamW
    ft.params = l * ft.params + (1 - l) * fs.params`


const bibtex = `@misc{nordstrom2026emergentmultiview,
      title={Emergent Multi-View Geometry Through Self-Distillation}, 
      author={David Nordström and Thibaut Loiseau and Vincent Lepetit and Michael Felsberg and Guillaume Bourmaud and Fredrik Kahl},
      year={2026},
      eprint={2609.39227},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2609.39227}, 
}`

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {lead && <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  )
}

export default function Poincar3Page() {
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
              <a href="https://github.com/davnords/poincar3" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-4 w-4" />
                Code
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden pt-16">
        {/* the mask keeps the animation clear of the title instead of veiling it */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            maskImage:
              "radial-gradient(ellipse 22% 15% at 50% 35%, transparent 20%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 22% 15% at 50% 35%, transparent 20%, black 100%)",
          }}
        >
          <MultiViewCanvas className="h-full w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              Preprint
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              SSL for 3D vision
            </span>
          </div>

          <p className="mb-4 font-mono text-sm tracking-[0.35em] text-muted-foreground">POINCAR3</p>
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Emergent Multi-View Geometry
            <br className="hidden sm:block" />{" "}
            <span className="text-muted-foreground">Through Self-Distillation</span>
          </h1>

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-2.5 gap-y-1 text-[15px]">
            {authors.map((a, i) => (
              <span key={a.name}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={a.isMe ? "font-semibold hover:underline" : "text-muted-foreground hover:underline"}
                >
                  {a.name}
                </a>
                <sup className="ml-0.5 text-[10px] text-muted-foreground">{a.aff}</sup>
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
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-2.5">
            <Button variant="default" asChild>
              <a href="https://github.com/davnords/poincar3" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-4 w-4" />
                Code
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/davnords/storage/releases/download/mumv2/poincar3.pth"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BoxIcon className="h-4 w-4" />
                Weights
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://pypi.org/project/poincar3/" target="_blank" rel="noopener noreferrer">
                <PackageIcon className="h-4 w-4" />
                PyPI
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://arxiv.org/abs/2609.39227" target="_blank" rel="noopener noreferrer">
                <FileTextIcon className="h-4 w-4" />
                Paper
              </a>
            </Button>
          </div>

          <p className="mx-auto mt-10 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Poincar3 inputs a sequence of images from the same scene without labels and is trained using a multi-view self-distillation objective. Interstingly, it obtains a strong understanding of multiple-view geometry, illustrated by zero-shot correspondence estimation abilities and rapid finetuning for feedforward-reconstruction.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* ------------------------------------------------- the argument */}
        <section className="border-t border-border py-16 sm:py-20">
          <div className="grid items-center gap-10 sm:grid-cols-[160px_1fr]">
            <div className="mx-auto w-40 sm:mx-0">
              <Image
                src="/projects/poincar3/poincare.jpg"
                alt="Henri Poincaré"
                width={547}
                height={700}
                className="rounded-xl border border-border grayscale"
              />
              <p className="mt-2 text-center text-[11px] text-muted-foreground sm:text-left">
                Henri Poincaré, 1854–1912
              </p>
            </div>
            <blockquote className="border-l-2 border-foreground/20 pl-6">
              <p className="text-balance text-xl font-medium leading-relaxed sm:text-2xl">
                Motivated by Henri Poincaré
              </p>
              <footer className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Over a century ago, Henri Poincaré argued that &quot;A motionless being could never have acquired the concept of space because, he would have had no reason to distinguish [changes of position] from changes of state. Nor would he have been able to acquire it if his movements had not been voluntary.&quot; Motivated by this, we question why state-of-the-art SSL models like DINO are built on single-view data. To this end, we introduce a multi-view SSL pipeline that learns 3D geometry, just like Poincaré conjectured.
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ----------------------------------------------------- at a glance */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="At a glance"
            title="Main results"
            lead="Poincar3 outperforms DINOv3, MuM and Muskie on camera pose, point clouds, correspondence and SE(3) structure alike. Bars are drawn so that longer is always better."
          />
          <HeadlineResults />

          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.unit} className="bg-background p-5">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tracking-tight tabular-nums">{s.value}</span>
                  <span className="text-xs font-medium text-muted-foreground">{s.unit}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- abstract */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading eyebrow="Abstract" title="Poincar3 in short" />
          <p className="max-w-3xl text-[15px] leading-[1.85] text-muted-foreground">
            Over a century ago, Henri Poincaré argued that a motionless observer cannot acquire the notion of space.
            Yet most visual representation learning methods operate on individual images, while those that leverage
            multiple views rely on RGB reconstruction, entangling geometry with appearance. We propose{" "}
            <span className="font-semibold text-foreground">Poincar3</span>, a self-supervised method that learns
            representations from multiple views through self-distillation instead of RGB reconstruction. We combine
            masked patch and image-level distillation with a teacher that observes additional views, enabling training
            from scratch without explicit 3D supervision. Poincar3 outperforms both previous single and multi-view
            self-supervised approaches such as DINOv3, MuM and Muskie on correspondence estimation, camera pose
            estimation and 3D reconstruction. Using a lightweight Poincaré adapter, we also find that our learned
            features encode camera motion more accurately than existing self-supervised representations.
          </p>
        </section>

        {/* ------------------------------------------------------- emergence */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Emergence"
            title="Emergent matching capabilities without supervision."
            lead={
              <>
                The model never sees a correspondence label. Yet pick a query patch and follow the highest attention activation across frames, and you get beautiful tracks.
              </>
            }
          />
          <Figure
            src="/projects/poincar3/attention_grid.jpg"
            alt="Attention tracks across image sequences"
            width={2000}
            height={683}
            label="Figure 1."
            priority
            caption={
              <>
                Given query keypoints, we visualise the tracks formed by selecting the patch with the highest attention
                activation. Despite receiving neither correspondence labels nor explicit attention supervision, the model
                identifies patch correspondences across images. Reproduce it with{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">demo.py</code> in the
                repository.
              </>
            }
          />
        </section>

        {/* ---------------------------------------------------------- method */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Method"
            title="Multi-view self-distillation"
            lead={
              <>
                A student and an EMA teacher both run a multi-view transformer over a sequence from the same scene.
                The student gets M masked, photometrically augmented frames; the teacher gets those M frames unmasked
                plus T extra views. The two are aligned with a patch loss on masked tokens and an image-level loss on
                the per-frame [CLS] tokens. No pixels are ever reconstructed.
              </>
            }
          />

          <div className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
            <MethodDiagram />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {ingredients.map((ing) => (
              <div key={ing.step} className="rounded-xl border border-border p-5">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">{ing.step}</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {ing.gain} PCK
                  </span>
                </div>
                <h3 className="mb-2 font-semibold">{ing.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{ing.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
            <PseudoCode code={pseudocode} title="Multi-view self-distillation — training step" />
            <Figure
              src="/projects/poincar3/student_teacher_view_009.jpg"
              alt="A training sequence as seen by the student and the teacher"
              width={1028}
              height={1100}
              plate
              label="Figure 2."
              caption="One training sequence. The student sees M = 6 masked, independently augmented frames; the teacher sees the same six clean plus T = 2 more."
            />
          </div>
        </section>

        {/* --------------------------------------------------------- results */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Results · correspondence"
            title="Zero-shot multi-view matching"
            lead="Patch tracking across eight views, with no finetuning. The attention map turns out to be an even stronger correspondence estimator than the features themselves. It even outperforms feed-forward reconstruction models that were trained with 3D supervision."
          />
          <CorrespondenceChart />

          <div className="mt-12 space-y-12">
            <Figure
              src="/projects/poincar3/mv_tracks_pair_seq9.jpg"
              alt="Predicted versus ground-truth multi-view tracks"
              width={2000}
              height={817}
              plate
              label="Figure 3."
              caption="Predicted tracks (blue), ground truth (green) and the error between them (red)."
            />
            <Figure
              src="/projects/poincar3/feature_correlation.jpg"
              alt="Feature correlation maps for RGB reconstruction versus Poincar3"
              width={2000}
              height={748}
              plate
              label="Figure 4."
              caption="Given a query patch (green star), the feature correlation across frames, with the maximum response circled. RGB reconstruction spreads its response over the whole facade; self-distillation localises it on the corresponding patch."
            />
          </div>
        </section>

        {/* ----------------------------------------- feed-forward reconstruction */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Results · reconstruction"
            title="Feed-forward 3D reconstruction"
            lead="Relative pose by AUC over 10 random frames, and point clouds by median accuracy in mm and normal consistency. Three protocols of increasing cost: heads only, a transformer on top, and a full finetune."
          />
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2} className="w-[150px] align-bottom">
                      Method
                    </TableHead>
                    <TableHead colSpan={2} className="border-l border-border text-center">
                      RE10K
                    </TableHead>
                    <TableHead colSpan={2} className="border-l border-border text-center">
                      ScanNet++
                    </TableHead>
                    <TableHead colSpan={2} className="border-l border-border text-center">
                      MegaDepth
                    </TableHead>
                    <TableHead colSpan={2} className="border-l border-border text-center">
                      ETH3D
                    </TableHead>
                    <TableHead colSpan={2} className="border-l border-border text-center">
                      DTU
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    {["@3°", "@30°", "@3°", "@30°", "@3°", "@30°"].map((m, i) => (
                      <TableHead key={i} className={`text-center text-[11px] ${i % 2 === 0 ? "border-l border-border" : ""}`}>
                        {m}
                      </TableHead>
                    ))}
                    <TableHead className="border-l border-border text-center text-[11px]">Acc ↓</TableHead>
                    <TableHead className="text-center text-[11px]">NC ↑</TableHead>
                    <TableHead className="border-l border-border text-center text-[11px]">Acc ↓</TableHead>
                    <TableHead className="text-center text-[11px]">NC ↑</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(
                    [
                      ["group", "Train only heads on top of the frozen backbone"],
                      ["DINOv3", 0.0, 18.9, 0.0, 9.4, 1.5, 55.5, 1.18, 0.59, 10.76, 0.54],
                      ["Muskie", 1.1, 36.3, 0.0, 19.0, 0.1, 46.9, 1.12, 0.6, 11.43, 0.55],
                      ["MuM", 0.0, 29.8, 0.0, 18.7, 0.1, 48.5, 1.12, 0.6, 12.6, 0.54],
                      ["Poincar3", 2.4, 51.9, 0.1, 48.7, 3.7, 67.5, 0.82, 0.65, 10.6, 0.59],
                      ["group", "Train a transformer on top of the frozen backbone"],
                      ["DINOv3", 1.0, 29.1, 0.0, 22.0, 1.7, 65.6, 0.95, 0.66, 10.63, 0.58],
                      ["Muskie", 1.8, 41.5, 0.0, 28.1, 1.7, 58.9, 0.88, 0.67, 11.95, 0.58],
                      ["MuM", 1.4, 40.1, 0.0, 30.2, 1.9, 60.8, 1.0, 0.6, 12.26, 0.56],
                      ["Poincar3", 5.2, 62.2, 1.3, 52.1, 5.2, 69.5, 0.75, 0.68, 10.52, 0.61],
                      ["group", "Finetune the backbone"],
                      ["Random init.", 0.0, 17.4, 0.0, 11.3, 0.0, 35.9, 1.24, 0.6, 12.34, 0.56],
                      ["DINOv3 init.", 1.3, 31.2, 0.0, 30.9, 6.9, 73.8, 0.98, 0.68, 10.87, 0.59],
                      ["Poincar3", 8.3, 68.2, 4.5, 67.0, 7.4, 74.6, 0.81, 0.8, 6.73, 0.63],
                    ] as (string | number)[][]
                  ).map((row, ri) => {
                    if (row[0] === "group") {
                      return (
                        <TableRow key={ri} className="hover:bg-transparent">
                          <TableCell colSpan={11} className="bg-muted/40 px-4 py-2 text-xs font-semibold italic text-muted-foreground">
                            {row[1]}
                          </TableCell>
                        </TableRow>
                      )
                    }
                    const ours = row[0] === "Poincar3"
                    const dim = typeof row[0] === "string" && row[0].includes("init.")
                    return (
                      <TableRow key={ri} className={ours ? "font-semibold" : undefined}>
                        <TableCell className={dim ? "text-muted-foreground" : undefined}>{row[0]}</TableCell>
                        {row.slice(1).map((v, i) => (
                          <TableCell
                            key={i}
                            className={`text-center tabular-nums ${i % 2 === 0 ? "border-l border-border" : ""} ${
                              dim ? "text-muted-foreground" : ""
                            }`}
                          >
                            {typeof v === "number" ? v.toFixed(i >= 6 ? 2 : 1) : v}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            MuM and Muskie are excluded from the finetuning block because their architectures differ substantially,
            making a direct comparison less meaningful. Each run: 4×H200 for three days.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Figure
              src="/projects/poincar3/recon_init_ablation.png"
              alt="Training curves for different initialisations"
              width={1400}
              height={657}
              plate
              label="Figure 5."
              caption="Learning pose from scratch is hard (green), and initialising the encoder from DINOv3 barely helps (red). Starting from Poincar3 (blue) gets to AUC@30° of 65%+ on RE10K in 10k steps."
            />
            <Figure
              src="/projects/poincar3/pareto.png"
              alt="Correspondence accuracy versus training compute"
              width={1400}
              height={831}
              plate
              label="Figure 6."
              caption="Multi-view correspondence accuracy against training compute. Poincar3 matches DINOv3 after a single day on 8×H200s."
            />
          </div>
        </section>

        {/* -------------------------------------------------- Poincaré adapter */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Results · SE(3)"
            title="The Poincaré adapter"
            lead="Do the features encode the geometry of rigid motion, and not just its appearance? We fit a small MLP per scene and ask it to make feature displacements linear in the se(3) twist between two frames."
          />

          <div className="mb-8 rounded-xl border border-border bg-muted/30 px-6 py-8">
            <p className="overflow-x-auto text-center font-mono text-base text-foreground sm:text-lg">
              ΔP<sub className="text-[0.7em]">t,s</sub>
              <span className="mx-3 text-muted-foreground">≈</span>
              W<span className="text-muted-foreground">(</span>
              φ<span className="text-muted-foreground">(</span>H<sub className="text-[0.7em]">t+s</sub>
              <span className="text-muted-foreground">)</span>
              <span className="mx-1.5 text-muted-foreground">−</span>
              φ<span className="text-muted-foreground">(</span>H<sub className="text-[0.7em]">t</sub>
              <span className="text-muted-foreground">))</span>
            </p>
            <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
              The adapter φ tries to unroll the non-linear feature space into a homogeneous coordinate system where a
              change of pose is just a translation. How well it can is a direct measure of how much SE(3) structure the
              representation already holds.
            </p>
          </div>

          <AdapterChart />

        </section>

        {/* -------------------------------------------------------- ablations */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading
            eyebrow="Ablations"
            title="How each ingredient earns its place"
            lead="Same architecture, same data, same compute budget throughout. Row I is the RGB reconstruction objective used by MuM and Muskie; row II is single-view DINOv2. Naively lifting DINOv2 to multiple views (III) is worse than reconstruction — it takes all three ingredients to overtake it."
          />
          <AblationLadder />

          <div className="mt-8 rounded-xl border border-border bg-card/40 p-5 sm:p-6">
            <h3 className="mb-2 font-semibold">Data nobody else can use</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Because nothing in the objective needs 3D annotations, training can draw on internet video that
              reconstruction models simply cannot touch. Adding it on top of the 3D-labelled datasets lifts PCK@50 from{" "}
              <span className="font-mono font-semibold text-foreground">87.5 → 94.9</span> on ScanNet and{" "}
              <span className="font-mono font-semibold text-foreground">78.5 → 86.5</span> on NAVI.
            </p>
          </div>

        </section>

        {/* ---------------------------------------------------------- bibtex */}
        <section className="border-t border-border py-16 sm:py-20">
          <SectionHeading eyebrow="Cite" title="BibTeX" />
          <CopyBlock text={bibtex} language="bibtex" />
        </section>
      </div>
    </main>
  )
}
