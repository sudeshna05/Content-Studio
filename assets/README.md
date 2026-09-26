# Assets

Drop your AUREN brand assets here (all optional for V1 — the app renders fine without them).

- `logo/` — AUREN wordmark/logo (PNG with transparency ideally). Not yet composited by the renderer; V1 renders the wordmark as text. Reserved for a future template that overlays the image logo.
- `fonts/` — a `.ttf` / `.otf` for AUREN's typeface. To use it, either:
  1. Install it system-wide (macOS: double-click → Install), **or**
  2. Set `AUREN_FONT=/absolute/path/to/font.ttf` in your `.env`.
  The SVG references it as `AURENCustom`; without it, a clean serif/sans stack is used.
- `product/` — screenshots or a screen recording of the AUREN website for the
  PRODUCT template. V1's product template renders text scenes; compositing your
  screenshot behind the text is a small extension point in `src/render/templates.js`.

Nothing in these folders is committed to git (see `.gitignore`).
