# AUREN CONTENT STUDIO

A private, local tool to generate, render, and (eventually) publish Instagram
Reels for **@aurentarot**. Built to save you time: generate a week of content,
review it in ~15–30 min, render, approve.

- Runs **entirely on your machine**. No cloud, no accounts, no telemetry.
- **$0/month.** No paid APIs, no AI APIs, no SaaS.
- Nothing is ever posted in V1 — publishing is a **mock**.

`TAROT FOR THE CONSIDERED MIND`

---

## Requirements

- **Node.js 18.17+** (note: sharp is pinned to 0.33.x for Node <20.10)
- **FFmpeg** on your PATH (`ffmpeg -version`). Install via `brew install ffmpeg`.
- **cloudflared** (optional — only for real Instagram publishing): `brew install cloudflare/cloudflare/cloudflared`

## Setup

```bash
npm install
cp .env.example .env      # fill in any optional integrations (see .env.example)
npm run dev
```

Open **http://localhost:4321**.

To batch-render from the terminal instead of the UI:

```bash
npm run render            # renders all un-rendered items
npm run render <itemId>   # renders one
```

---

## How to use it (the 15-minute loop)

1. Click **Generate 7 Reels** — 7 varied concepts appear in the queue, spread
   across the week and across your content pillars.
2. Click **Open** on any card to edit copy, caption, hashtags, template,
   background mode, and schedule. **Save**.
3. Click **Render Reel** — an MP4 is produced (1080×1920, 9:16) in a few seconds.
4. Preview it in the editor. Happy? **Approve**.
5. **Schedule** it (date + time). It shows under **Upcoming**.
6. **Publish (mock)** simulates the Instagram flow — *nothing is actually posted.*

Statuses flow: `GENERATED → RENDERED → APPROVED → SCHEDULED → PUBLISHED (mock)`.

---

## How it works

### Content generation (`src/generator/`)
- `ContentGenerator` is the interface; `LocalContentGenerator` is the V1 impl —
  **deterministic, template-based, no AI, no network.**
- `library.js` holds hand-written concepts per pillar (founder / tarot / product
  / relatable / experimental). Each concept is a full Reel (hook / body / cta /
  caption) so output never sounds like AI mad-libs. **Add more by appending to
  the arrays** — that's the whole extension model.
- Distribution (default 30/25/20/15/10) is apportioned with largest-remainder so
  7 items always sum to 7 and respect your percentages. Edit in `data/settings.json`
  or `src/config.js`.
- Within a batch, concepts are picked **distinct** per pillar, so the 7 posts are
  genuinely varied — never 7 near-identical posts.
- Quality rules (no fake metrics, lowercase-casual, no cringe) are baked into the
  copy itself.

### Caption generation (`src/caption/captionBuilder.js`)
Built from the same content object: base caption + one CTA line + a short,
relevant hashtag set. Not spammy, not keyword-stuffed.

### Rendering (`src/render/`)
- `ReelRenderer` interface; `FFmpegReelRenderer` is the V1 impl.
- Each template (`templates.js`) is **data-driven** — it maps a content item to
  one or more scenes. Three templates ship: `founder` (single screen),
  `relatable` (hook → punchline reveal), `product` (overlays → branded end frame).
- `frame.js` renders each scene as an **SVG → PNG** via `sharp` — real typography,
  exact AUREN colors, centered layout, no headless browser.
- `emoji.js` sanitizes text baked into video frames — librsvg (used by sharp)
  can't render color emoji, so a curated map substitutes AUREN-appropriate symbols
  (e.g. ✨ → ☽). Caption text sent to Instagram is untouched.
- FFmpeg turns each frame into a clip (fade in/out + subtle zoom) and concatenates
  them into a **1080×1920, 30fps, H.264 MP4** with `+faststart`.
- Output lands in `content/rendered/` with predictable names like
  `2026-09-26-founder-001.mp4`.

### Local storage (`src/storage/`)
- `Storage` interface; `JsonStorage` is the V1 impl. **No database.**
- `data/content.json` (your queue) and `data/settings.json` (config).
- **Recovers gracefully:** missing file → defaults; corrupt file → backed up as
  `*.corrupt-<ts>` and started fresh. Writes are atomic (temp + rename).
- Swap in SQLite/Postgres later by implementing the same `Storage` interface.

### Music (`src/music/`)
- `jamendo.js` — search and download royalty-free / Creative Commons tracks from
  **Jamendo** (free API). Returns track metadata including license info so you
  know when attribution is required.
- Requires `JAMENDO_CLIENT_ID` in `.env` (free — register at
  developer.jamendo.com). Music is optional; the app renders fine without it.

### Approval & scheduling (`src/schedule/`)
- Manual approval is required — nothing auto-publishes. Only `RENDERED` items can
  be approved; only `APPROVED` items can be scheduled.
- Scheduling is a local calendar: pick date + time, item appears in **Upcoming**.
  No real posting happens.

### Instagram publishing (`src/publish/`)
- `InstagramPublisher` interface with `publishReel()`. Ships two impls:
  - `MockInstagramPublisher` — simulates `UPLOAD → PROCESSING → PUBLISHED` with a
    clearly-fake permalink. **Nothing leaves your machine.** Default.
  - `RealInstagramPublisher` — posts for real via the **Instagram API with
    Instagram Login** (`graph.instagram.com`). Requires `IG_ACCESS_TOKEN` (an
    `IGAA…` token from Meta's app dashboard) and a public `https://` video URL.
    Flow: create media container → poll until `FINISHED` → publish.
- **No passwords, no cookies, ever.** Secrets come from `.env` only.

### Cloud upload (`src/publish/r2.js`)
Uploads the rendered MP4 to a **Cloudflare R2** bucket and returns a public
`https://` URL that Instagram can fetch. Uses R2's S3-compatible API with a
hand-rolled AWS SigV4 signature — zero extra dependencies. Configure via
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`R2_PUBLIC_BASE_URL` in `.env`. Only needed for real publishing (V3+).

### Public tunnel (`src/publish/tunnel.js`)
Spins up an ephemeral public URL via **`cloudflared` quick tunnel** (free, no
account) so Instagram can reach the local server to pull the video file. Starts
only while publishing; killed immediately after. Requires `cloudflared` on your
PATH (`brew install cloudflare/cloudflare/cloudflared`). Override the binary path
with `CLOUDFLARED_PATH` in `.env`.

---

## Brand assets

Optional — the app renders fine without them. See `assets/README.md`. Drop a
font in `assets/fonts/` (or set `AUREN_FONT=/path/to/font.ttf` in `.env`) to use
AUREN's typeface; otherwise a clean serif/sans stack is used.

## Config knobs (`src/config.js`)
- `DEFAULT_SETTINGS.distribution` — pillar percentages
- `DEFAULT_SETTINGS.brand` — name, tagline, handle, CTA line
- `VIDEO` — dimensions, fps, default duration
- `PALETTE` / `BACKGROUND_MODES` — the AUREN Midnight & Moonlit color systems

---

## Optional integrations (all off by default)

| Feature | Env vars needed | What it does |
|---------|----------------|--------------|
| Real Instagram posting | `IG_ACCESS_TOKEN` | Posts reels for real via Instagram Login API |
| Cloudflare R2 upload | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` | Hosts the MP4 at a public URL Instagram can fetch |
| Cloudflare tunnel | `cloudflared` on PATH | Ephemeral public URL for local server (needed for real posting) |
| Jamendo music | `JAMENDO_CLIENT_ID` | Search royalty-free tracks to bake into reels |
| Custom font | `AUREN_FONT=/path/to/font.ttf` | Use AUREN's typeface in rendered frames |

Everything else runs with no `.env` values at all.

---

## What is intentionally NOT built (yet)

- No AI content generation (V2). The interface is ready; the impl is not.
- No analytics / performance learning (V4).
- No database, auth, Docker, tracking, cookies.

## Next steps for V2+
- **V2:** add `AIContentGenerator implements ContentGenerator` behind the existing
  interface (optional, paid — clearly isolated).
- **V4:** performance tracking → auto-tune the distribution.
