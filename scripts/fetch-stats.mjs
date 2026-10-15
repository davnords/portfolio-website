#!/usr/bin/env node
/**
 * Refreshes src/data/impact.json — the snapshot behind the Impact chart.
 *
 * Citations come from Semantic Scholar, keyed by arXiv id (name search is
 * polluted by other David Nordströms). Every citing paper carries a
 * publicationDate, so we can bucket citations by month rather than just by year.
 *
 * Stars come from the GitHub stargazers endpoint with the star+json media type,
 * which returns starred_at per star.
 *
 * Both APIs are rate limited, so this runs at build time / nightly in CI and
 * commits the result. Nothing is fetched from the browser.
 *
 *   node scripts/fetch-stats.mjs
 *
 * Env: GITHUB_TOKEN is required for stars. Since July 2026 the stargazers
 * listing is limited to each repo's admins and collaborators: anonymous callers
 * get 401, and an Actions GITHUB_TOKEN only reaches the repository the workflow
 * runs in, so it gets 403 on every repo below. Stars therefore need a classic
 * PAT with public_repo, held by someone with push on all of them. A
 * fine-grained PAT cannot work — it grants nothing on another user's repo.
 * S2_API_KEY is optional and raises the Semantic Scholar rate limit.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "impact.json");

/**
 * Colour slot order is the CVD-safe order from the palette and is keyed to the
 * entity, never to its rank — LoMa stays blue whether it is first or fifth, and
 * a paper and its repo share a hue so identity carries across both views.
 */
const PAPERS = [
  { key: "loma",        label: "LoMa",        arxiv: "2604.04931", venue: "ECCV 2026 Oral" },
  { key: "romav2",      label: "RoMa v2",     arxiv: "2511.15706", venue: "ECCV 2026 Oral" },
  { key: "mum",         label: "MuM",         arxiv: "2511.17309", venue: "CVPR 2026" },
  { key: "poincar3",    label: "Poincar3",    arxiv: "2609.39227", venue: "Pre-print" },
  { key: "octic",       label: "Octic ViTs",  arxiv: "2505.15441", venue: "ECCV 2026" },
  { key: "romaomega",   label: "RoMa-Ω", arxiv: "2609.09507", venue: "ECCVW 2026" },
  { key: "orientation", label: "LoMa-R", arxiv: "2604.11809", venue: "CVPRW 2026" },
  { key: "flopping",    label: "Flopping",    arxiv: "2502.05169", venue: "ICML 2025 Spotlight" },
];

const REPOS = [
  { key: "loma",      repo: "davnords/LoMa" },
  { key: "romav2",    repo: "Parskatt/RoMaV2" },
  { key: "mum",       repo: "davnords/MuM" },
  { key: "poincar3",  repo: "davnords/poincar3" },
  { key: "octic",     repo: "davnords/octic-vits" },
  { key: "romaomega", repo: "davnords/RoMa-Omega" },
  { key: "flopping",  repo: "georg-bn/flopping-for-flops" },
];

/** Events worth pinning on the time axis — the spikes line up with these. */
const MILESTONES = [
  { month: "2025-05", label: "ICML 2025 Spotlight" },
  { month: "2025-11", label: "RoMa v2 + MuM pre-prints" },
  { month: "2026-02", label: "MuM @ CVPR 2026" },
  { month: "2026-04", label: "LoMa pre-print" },
  { month: "2026-06", label: "3× ECCV 2026 (2 Orals)" },
  { month: "2026-09", label: "Poincar3 pre-print" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const monthOf = (date) => (date ? String(date).slice(0, 7) : null);

const MAX_WAIT = 120000;

/** The API's own message — which is where GitHub explains what a 403 means. */
async function detailOf(res) {
  try {
    const text = (await res.text()).slice(0, 400);
    try {
      return JSON.parse(text).message ?? text;
    } catch {
      return text || res.statusText;
    }
  } catch {
    return res.statusText;
  }
}

/**
 * How long the response is asking us to wait, or null if it isn't asking.
 * GitHub sends retry-after for secondary limits, and remaining: 0 with an
 * epoch-second reset for primary ones; Semantic Scholar sends neither.
 */
function requestedWait(res) {
  const after = Number(res.headers.get("retry-after"));
  if (Number.isFinite(after) && after > 0) return Math.min(after * 1000, MAX_WAIT);
  if (res.headers.get("x-ratelimit-remaining") === "0") {
    const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000 - Date.now();
    if (Number.isFinite(reset) && reset > 0) return Math.min(reset + 1000, MAX_WAIT);
  }
  return null;
}

async function request(url, { headers = {}, body, tries = 8 } = {}) {
  const init = {
    method: body ? "POST" : "GET",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res.json();
    if (res.status === 404) return null;

    const asked = requestedWait(res);
    // The unauthenticated Semantic Scholar pool is shared and bursty, so 429s
    // are routine rather than exceptional — back off generously. A GitHub 403
    // with rate-limit budget still on the clock is the other thing entirely: a
    // token that may not read this resource. Backoff cannot fix that, so fail
    // on the spot rather than sleeping through eight doublings first.
    const transient =
      res.status === 429 ||
      res.status >= 500 ||
      (res.status === 403 && (asked !== null || !url.includes("api.github.com")));
    if (!transient) throw new Error(`${res.status} on ${url.slice(0, 96)} — ${await detailOf(res)}`);
    if (attempt === tries - 1) break;

    const wait = asked ?? Math.min(5000 * 2 ** attempt, MAX_WAIT);
    console.warn(`  ${res.status} on ${url.slice(0, 96)} — retrying in ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error(`gave up after ${tries} attempts: ${url}`);
}

const getJSON = request;

/* ---------------------------------------------------------------- citations */

const s2Headers = process.env.S2_API_KEY ? { "x-api-key": process.env.S2_API_KEY } : {};
const S2_DELAY = process.env.S2_API_KEY ? 1100 : 3500;

/** One request for all eight papers instead of eight. */
async function fetchPaperMeta(papers) {
  const rows = await request(
    "https://api.semanticscholar.org/graph/v1/paper/batch?fields=title,citationCount,publicationDate",
    { headers: s2Headers, body: { ids: papers.map((p) => `arXiv:${p.arxiv}`) } },
  );
  await sleep(S2_DELAY);
  return new Map(papers.map((p, i) => [p.key, rows?.[i] ?? null]));
}

async function fetchCitations({ key, label, arxiv, venue }, meta) {
  const base = `https://api.semanticscholar.org/graph/v1/paper/arXiv:${arxiv}`;
  if (!meta) {
    console.warn(`  ${label}: not indexed on Semantic Scholar yet — 0 citations`);
    return { key, label, venue, arxiv, title: null, citations: 0, undated: 0, monthly: {} };
  }

  const published = monthOf(meta.publicationDate);
  const monthly = {};
  let undated = 0;
  let total = 0;
  for (let offset = 0; ; offset += 1000) {
    const page = await getJSON(
      `${base}/citations?fields=publicationDate,year&limit=1000&offset=${offset}`,
      { headers: s2Headers },
    );
    await sleep(S2_DELAY);
    const rows = page?.data ?? [];
    for (const row of rows) {
      total++;
      const p = row.citingPaper ?? {};
      // Fall back to mid-year when only a year is known, so the point still lands.
      let month = monthOf(p.publicationDate) ?? (p.year ? `${p.year}-07` : null);
      // Semantic Scholar sometimes dates a citing paper by an earlier version,
      // which lands citations before the cited paper existed. Clamp rather than
      // drop, so the count stays right and the curve stays monotone.
      if (month && published && month < published) month = published;
      // No date at all: place it at the cited paper's release, the earliest
      // month it could plausibly belong to, so the curve still sums to the
      // headline total. Counted in `undated` so the chart can disclose it.
      if (!month) { month = published; undated++; }
      if (month) monthly[month] = (monthly[month] ?? 0) + 1;
    }
    if (rows.length < 1000 || page?.next == null) break;
  }

  console.log(`  ${label}: ${total} citations (${Object.keys(monthly).length} months, ${undated} undated)`);
  return {
    key, label, venue, arxiv,
    title: meta.title ?? null,
    published,
    citations: total,
    reportedCitations: meta.citationCount ?? total,
    undated,
    monthly,
  };
}

/* -------------------------------------------------------------------- stars */

const ghHeaders = {
  "X-GitHub-Api-Version": "2022-11-28",
  // GitHub rejects requests without a User-Agent, and undici sends none.
  "User-Agent": "davnords-portfolio-stats",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function fetchStars({ key, repo }) {
  const meta = await getJSON(`https://api.github.com/repos/${repo}`, { headers: ghHeaders });
  if (!meta) {
    console.warn(`  ${repo}: not found — skipping`);
    return null;
  }

  const monthly = {};
  let total = 0;
  for (let page = 1; page <= 100; page++) {
    const rows = await getJSON(
      `https://api.github.com/repos/${meta.full_name}/stargazers?per_page=100&page=${page}`,
      { headers: { ...ghHeaders, Accept: "application/vnd.github.star+json" } },
    );
    if (!rows?.length) break;
    for (const row of rows) {
      const month = monthOf(row.starred_at);
      if (month) {
        monthly[month] = (monthly[month] ?? 0) + 1;
        total++;
      }
    }
    if (rows.length < 100) break;
  }

  console.log(`  ${meta.full_name}: ${total} dated stars (reported ${meta.stargazers_count})`);
  return {
    key,
    label: meta.full_name,
    repo: meta.full_name,
    url: meta.html_url,
    created: monthOf(meta.created_at),
    stars: total,
    reportedStars: meta.stargazers_count,
    monthly,
  };
}

/**
 * Prove stars are reachable before the slow citation pass, rather than finding
 * out twenty minutes in. Anonymous callers get 401 here, and an Actions
 * GITHUB_TOKEN — scoped to the repository the workflow runs in — gets 403 on
 * every repo above, including the ones under this same account.
 */
async function starAccessError() {
  try {
    await request(`https://api.github.com/repos/${REPOS[0].repo}/stargazers?per_page=1`, {
      headers: { ...ghHeaders, Accept: "application/vnd.github.star+json" },
      tries: 3,
    });
    return null;
  } catch (err) {
    return err.message;
  }
}

/* --------------------------------------------------------------------- main */

function hIndex(counts) {
  const sorted = [...counts].sort((a, b) => b - a);
  let h = 0;
  while (h < sorted.length && sorted[h] >= h + 1) h++;
  return h;
}

/** The last good snapshot. Stale numbers beat wrong ones. */
const previous = await readFile(OUT, "utf8").then(JSON.parse).catch(() => null);
const degraded = [];

/**
 * Keep the previous row when this run can't better it. A source that errors
 * out, or hands back a zero where we already had a count, is a failed read —
 * not a reset — and publishing it would claim the citations went away.
 */
function keepPrevious(kind, metric, key, label, reason) {
  const prior = (previous?.[kind] ?? []).find((row) => row.key === key);
  if (!(prior?.[metric] > 0)) return null;
  console.warn(`  ${label}: ${reason} — keeping ${prior[metric]} from ${previous.generatedAt}`);
  degraded.push(`${label} ${metric}: ${previous.generatedAt} snapshot`);
  return { ...prior, stale: true };
}

// Checked first so a token problem surfaces in seconds, not after the citations.
const starError = await starAccessError();
if (starError) {
  console.warn(`GitHub stars unavailable — ${starError}`);
  console.warn("  Stargazers is limited to each repo's admins and collaborators:");
  console.warn("  use a classic PAT with public_repo, passed in as GITHUB_TOKEN.");
  console.warn("  Actions' built-in token only reaches its own repository.\n");
}

console.log("Citations (Semantic Scholar):");
let meta = new Map();
try {
  meta = await fetchPaperMeta(PAPERS);
} catch (err) {
  console.warn(`  paper metadata unavailable — ${err.message}`);
}

const papers = [];
for (const p of PAPERS) {
  let row;
  try {
    row = await fetchCitations(p, meta.get(p.key) ?? null);
  } catch (err) {
    console.warn(`  ${p.label}: ${err.message}`);
    row = keepPrevious("papers", "citations", p.key, p.label, "fetch failed")
      ?? { key: p.key, label: p.label, venue: p.venue, arxiv: p.arxiv, title: null, citations: 0, undated: 0, monthly: {} };
  }
  // A zero is right for a paper nobody has cited yet, and wrong for one we
  // counted last night; keepPrevious only answers in the second case.
  if (row.citations === 0) row = keepPrevious("papers", "citations", p.key, p.label, "API returned 0") ?? row;
  papers.push(row);
}

console.log("Stars (GitHub):");
const repos = [];
for (const r of REPOS) {
  let row = null;
  if (starError) {
    row = keepPrevious("repos", "stars", r.key, r.repo, "no star access");
  } else {
    try {
      row = await fetchStars(r);
    } catch (err) {
      console.warn(`  ${r.repo}: ${err.message}`);
      row = keepPrevious("repos", "stars", r.key, r.repo, "fetch failed");
    }
    if (row?.stars === 0) row = keepPrevious("repos", "stars", r.key, r.repo, "API returned 0") ?? row;
  }
  if (row) repos.push(row);
}

if (!papers.some((p) => p.citations > 0) && !repos.some((r) => r.stars > 0)) {
  console.error("\nEvery source came back empty and there is nothing to fall back on —");
  console.error("refusing to publish a blank snapshot.");
  process.exit(1);
}

const snapshot = {
  generatedAt: new Date().toISOString().slice(0, 10),
  ...(degraded.length ? { degraded } : {}),
  sources: {
    citations: "Semantic Scholar Academic Graph API",
    stars: "GitHub REST API",
  },
  totals: {
    citations: papers.reduce((a, p) => a + p.citations, 0),
    hIndex: hIndex(papers.map((p) => p.citations)),
    stars: repos.reduce((a, r) => a + r.stars, 0),
    papers: papers.filter((p) => p.title).length,
  },
  milestones: MILESTONES,
  papers,
  repos,
};

await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`\nWrote ${path.relative(process.cwd(), OUT)} — ${snapshot.totals.citations} citations, ${snapshot.totals.stars} stars, h-index ${snapshot.totals.hIndex}`);

// Whatever was fresh still gets written and committed; the stale rows become
// job annotations so a broken source is visible without failing the refresh.
for (const note of degraded) console.log(`::warning::stale ${note}`);
if (degraded.length) console.warn(`${degraded.length} of ${PAPERS.length + REPOS.length} rows came from the previous snapshot.`);
