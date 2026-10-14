# Research Portfolio Website

Modern research portfolio website built with Next.js, featuring a clean design and responsive layout.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/davnords/portfolio-website.git
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Impact data

The Impact chart reads a committed snapshot, `src/data/impact.json` — nothing is
fetched from the visitor's browser.

```bash
npm run stats          # refresh the snapshot
```

Citations come from the Semantic Scholar API keyed by arXiv id (name search
collides with other people) and are bucketed by each citing paper's publication
date; stars come from the GitHub API via `starred_at`. Both are rate limited, so
`.github/workflows/refresh-stats.yml` runs the script nightly and commits the
result. Set `GITHUB_TOKEN` locally for a higher GitHub limit, and optionally
`S2_API_KEY` for Semantic Scholar.

To add a paper or repository, extend `PAPERS` / `REPOS` in
`scripts/fetch-stats.mjs` and give it a colour slot in `SLOT` in
`src/components/impact-chart.tsx`.

## License

MIT
