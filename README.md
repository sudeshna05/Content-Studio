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

- **Node.js 18.17+** (you have v20; note: sharp is pinned to 0.33.x for Node <20.10)
- **FFmpeg** on your PATH (`ffmpeg -version`). Install via `brew install ffmpeg`.

## Setup

```bash
npm install
cp .env.example .env      # optional — V1 needs nothing in it
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

### Approval & scheduling (`src/schedule/`)
- Manual approval is required — nothing auto-publishes. Only `RENDERED` items can
  be approved; only `APPROVED` items can be scheduled.
- Scheduling is a local calendar: pick date + time, item appears in **Upcoming**.
  No real posting happens.

### Instagram publishing (`src/publish/`)
- `InstagramPublisher` interface with `publishReel()`. V1 ships
  `MockInstagramPublisher` — simulates `UPLOAD → PROCESSING → PUBLISHED` and
  returns a clearly-fake permalink. **Nothing leaves your machine.**
- A big `TODO` block in `MockInstagramPublisher.js` documents exactly how the real
  Meta Instagram Graph API integration will slot in (V3), reading secrets from env
  only. **No passwords, no cookies, ever.**

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

## What is intentionally NOT built (yet)

- No AI content generation (V2). The interface is ready; the impl is not.
- No real Instagram publishing (V3). Mock only.
- No analytics / performance learning (V4).
- No database, auth, cloud, Docker, tracking, cookies.

## Next steps for V2+
See the roadmap section in this repo's issues / the TODO in
`MockInstagramPublisher.js`. Short version:
- **V2:** add `AIContentGenerator implements ContentGenerator` behind the existing
  interface (optional, paid — clearly isolated).
- **V3:** add `RealInstagramPublisher implements InstagramPublisher` using Meta's
  Graph API, secrets via `.env`.
- **V4:** performance tracking → auto-tune the distribution.
