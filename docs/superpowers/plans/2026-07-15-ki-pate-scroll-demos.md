# KI-Pate Scroll Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three CI-faithful, mobile-first, interactive scroll demos that share one content model and engine while rendering three clearly different spatial concepts.

**Architecture:** A build-free browser application is generated from one HTML template and canonical JavaScript content into three committed route pages. A shared scroll/video engine maps native scroll progress to six scene states and two deterministic media clips; each concept supplies only a renderer and CSS. Development-only Node tooling extracts `kipate-site.zip`, serves byte-range MP4 responses, and runs unit plus Playwright tests.

**Tech Stack:** Static HTML5, CSS custom properties and 3D transforms, vanilla ES modules, Node.js built-ins, `adm-zip`, `node:test`, Playwright Chromium, Higgsfield GPT Image 2 and Seedance 2.0, FFmpeg for deterministic delivery encoding.

## Global Constraints

- Work only on `Ki-Pate/ki-pate.at`, branch `codex/scroll-demos`; never modify or merge `main`.
- `index.html`, contact PHP, sitemap, robots and production deployment files remain unchanged.
- `designsystem.md` is the CI source of truth: exact existing colors, Space Grotesk, IBM Plex Sans and IBM Plex Mono.
- Six canonical scene IDs: `chaos`, `inbox`, `offer`, `meeting`, `knowledge`, `control`.
- The three demos share copy, CTA behavior, calculation and scroll/video engine; only renderer parameters and media vary.
- Mobile master viewport is 390 × 844; support 320, 768 and 1440 widths without horizontal overflow.
- Scroll track uses `600svh`; stage uses `100dvh`; no scroll jail or WebGL.
- Media is 720 × 1280 H.264, 30 fps, `yuv420p`, CRF 23–24, GOP 4, faststart, no audio, exactly 180 frames per clip.
- Each concept has two clips at no more than 2.5 MB each and a poster below 220 KB.
- `prefers-reduced-motion: reduce` must prevent any MP4 request. Save-Data starts Static and requires explicit current-page opt-in.
- Every behavior is test-first: write the test, observe the expected failure, implement the minimum, rerun green.

---

## File Map

### Development and tests

- `.gitignore`: ignores `.preview/`, `node_modules/`, `test-results/`, `playwright-report/` and the SDD scratch ledger.
- `package.json`, `package-lock.json`: development dependencies and repeatable commands only.
- `playwright.config.mjs`: local webServer lifecycle and browser projects.
- `tools/prepare-preview.mjs`: render pages, extract the asset ZIP and construct `.preview/`.
- `tools/render-demos.mjs`: generate three route pages from canonical data and one template.
- `tools/serve-preview.mjs`: static server with MIME, 404 and byte-range support.
- `tests/content.unit.test.mjs`: canonical scene and calculator contract.
- `tests/scroll-engine.unit.test.mjs`: scene/clip mapping and buffer window.
- `tests/server.unit.test.mjs`: range parser and path safety.
- `tests/demos.spec.mjs`: browser behavior, accessibility, network and responsive checks.

### Shared browser application

- `demos/template.html`: source template for all generated route pages and no-JS static story.
- `demos/index.html`: comparison launcher.
- `demos/shared/content.js`: canonical copy, calculator and route metadata.
- `demos/shared/scroll-engine.js`: pure mapping functions plus native scroll controller.
- `demos/shared/media-controller.js`: two-clip loader, seek coalescing, iOS priming and fallback.
- `demos/shared/mode-controller.js`: Full/Lite/Static priority and persistence.
- `demos/shared/use-case-check.js`: accessible dialog and local calculation.
- `demos/shared/demo-app.js`: composition root; imports only the selected renderer.
- `demos/shared/ci.css`: exact brand tokens, typography, grid and primitives.
- `demos/shared/demo-shell.css`: stage, copy, controls, dialog and responsive layout.
- `demos/shared/media-manifest.js`: paths plus bytes, duration, frames and SHA-256.

### Variant renderers

- `demos/arbeitsfluss/index.html`, `demo.css`, `renderer.js`: construction-table flow machine.
- `demos/betrieb-im-schnitt/index.html`, `demo.css`, `renderer.js`: vertical cutaway building.
- `demos/use-case-inseln/index.html`, `demo.css`, `renderer.js`: isometric routed islands.
- `demos/media/<slug>/`: three keyframes, two clips and one poster per concept.

---

### Task 1: Reproducible red test harness

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `playwright.config.mjs`
- Create: `tests/content.unit.test.mjs`
- Create: `tests/scroll-engine.unit.test.mjs`
- Create: `tests/server.unit.test.mjs`

**Interfaces:**
- Consumes: the approved design spec.
- Produces: executable failing tests for `calculatePotentialHours`, `getSceneState`, `getClipState`, `getBufferWindow` and `parseRangeHeader`.

- [ ] **Step 1: Add the deterministic development package**

`package.json` must use `type: module`, pin `@playwright/test` and `adm-zip`, and define:

```json
{
  "scripts": {
    "test:unit": "node --test tests/*.unit.test.mjs",
    "preview:prepare": "node tools/prepare-preview.mjs",
    "preview": "npm run preview:prepare && node tools/serve-preview.mjs",
    "test:demos": "npm run test:unit && npm run preview:prepare && playwright test"
  }
}
```

- [ ] **Step 2: Write failing domain and engine tests**

Required assertions:

```js
assert.deepEqual(calculatePotentialHours(10), { min: 92, max: 184 });
assert.deepEqual(calculatePotentialHours(20), { min: 184, max: 368 });
assert.throws(() => calculatePotentialHours(0), /1 bis 80/);
assert.equal(getSceneState(0.5833).id, 'meeting');
assert.deepEqual(getClipState(0.5, 2), { index: 1, progress: 0 });
assert.deepEqual(getBufferWindow(2, 5), [1, 2, 3]);
assert.deepEqual(parseRangeHeader('bytes=100-199', 1000), { start: 100, end: 199 });
```

- [ ] **Step 3: Install and verify RED**

Run:

```powershell
npm install
npx playwright install chromium
npm run test:unit
```

Expected: tests fail because the imported production modules do not exist.

- [ ] **Step 4: Commit the red harness**

```powershell
git add .gitignore package.json package-lock.json playwright.config.mjs tests
git commit -m "test: define scroll demo contracts"
```

### Task 2: Canonical content, calculator and pure engine

**Files:**
- Create: `demos/shared/content.js`
- Create: `demos/shared/scroll-engine.js`
- Create: `tools/serve-preview.mjs`
- Test: `tests/content.unit.test.mjs`
- Test: `tests/scroll-engine.unit.test.mjs`
- Test: `tests/server.unit.test.mjs`

**Interfaces:**
- Produces `SCENES`, `DEMO_ROUTES`, `calculatePotentialHours(hours)`, `getSceneState(progress)`, `getClipState(progress, count)`, `getBufferWindow(index, count)`, `createScrollController(options)` and `parseRangeHeader(value, size)`.
- `createScrollController` calls `onFrame({ progress, scene, clip })` and returns `{ start, stop, scrollToScene }`.

- [ ] **Step 1: Implement the minimum calculator and canonical data**

`calculatePotentialHours` accepts only integer values 1–80 and returns rounded values using 46 weeks and 20–40 percent. `SCENES` contains the exact six approved IDs, labels, problem, solution, headline and result terms.

- [ ] **Step 2: Run the content test green**

Run: `node --test tests/content.unit.test.mjs`
Expected: all content/calculator assertions pass.

- [ ] **Step 3: Implement pure progress functions**

Use these exact contracts:

```js
export function getSceneState(progress) {
  const p = clamp01(progress);
  const index = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
  return { ...SCENES[index], index, localProgress: p === 1 ? 1 : p * 6 - index };
}
```

`getClipState` maps exact clip boundaries to the following clip and `getBufferWindow` returns sorted unique indices within `current ± 1`.

- [ ] **Step 4: Implement and test the range parser**

Reject multiple, malformed, negative and out-of-bounds ranges with `null`; support normal and suffix byte ranges. Export `createPreviewServer({ root, port, host })` without starting on import.

- [ ] **Step 5: Run all unit tests green and commit**

```powershell
npm run test:unit
git add demos/shared/content.js demos/shared/scroll-engine.js tools/serve-preview.mjs
git commit -m "feat: add canonical content and scroll contracts"
```

### Task 3: Generated shells, preview pipeline and vertical slice A

**Files:**
- Create: `demos/template.html`
- Create: `demos/index.html`
- Create: `demos/shared/ci.css`
- Create: `demos/shared/demo-shell.css`
- Create: `demos/shared/mode-controller.js`
- Create: `demos/shared/media-controller.js`
- Create: `demos/shared/use-case-check.js`
- Create: `demos/shared/demo-app.js`
- Create: `demos/arbeitsfluss/demo.css`
- Create: `demos/arbeitsfluss/renderer.js`
- Create: `tools/render-demos.mjs`
- Create: `tools/prepare-preview.mjs`
- Generate: `demos/arbeitsfluss/index.html`
- Test: `tests/demos.spec.mjs`

**Interfaces:**
- `resolveMode(environment, session, explicit)` returns `{ mode, reason, needsSaveDataConsent }`.
- `createMediaController({ videos, manifest, onReady, onError })` returns `{ setProgress, prime, destroy }`.
- A renderer exports `mount(stage, context)`, `render(frame)` and `destroy()`.

- [ ] **Step 1: Write failing Playwright tests for A**

Cover status/MIME/sentinel, six canonical headings, midpoint scene IDs, no overflow, calculator vectors, focus/escape/return, Reduced Motion with zero MP4 requests, Save-Data consent, Full/Lite observability, no-JS content and zero requests after calculator input.

- [ ] **Step 2: Run the browser test and verify RED**

Run: `npm run test:demos -- --grep "Arbeitsfluss"`
Expected: fail because preview tooling and route do not exist.

- [ ] **Step 3: Implement deterministic page generation and preview preparation**

`render-demos.mjs` imports `SCENES`, escapes all text, renders the six static sections and writes route pages from `template.html`. `prepare-preview.mjs` validates its target is exactly `.preview`, recreates it, extracts `kipate-site.zip`, copies the tracked site/demos and never mutates source files.

- [ ] **Step 4: Implement CI shell and mode behavior**

Use exact existing tokens and fonts. Reduced Motion is decided before assigning `video.src`; Save-Data ignores stored Full/Lite until the visible consent button is clicked. Lite sets `data-mode="lite"`, creates no particles, has one video element and no filter/backdrop-filter.

- [ ] **Step 5: Implement accessible calculator dialog**

Use a native `<dialog>` where supported, explicit focus entry/return, Escape, inert background and visible error messages. Never change URL, storage or issue a request based on input.

- [ ] **Step 6: Implement A renderer**

Mount one perspective workbench with three rails, recognizable inbox cards, offer sheet, meeting tokens, source cards and a physical approval gate. `render(frame)` changes CSS custom properties only; no layout reads occur inside RAF.

- [ ] **Step 7: Run A green and commit**

```powershell
npm run test:demos -- --grep "Arbeitsfluss"
git add demos tools tests/demos.spec.mjs
git commit -m "feat: build Arbeitsfluss demo vertical slice"
```

### Task 4: Renderer variants B and C

**Files:**
- Create: `demos/betrieb-im-schnitt/demo.css`
- Create: `demos/betrieb-im-schnitt/renderer.js`
- Create: `demos/use-case-inseln/demo.css`
- Create: `demos/use-case-inseln/renderer.js`
- Generate: both route `index.html` files
- Modify: `tests/demos.spec.mjs`

**Interfaces:**
- Both renderers implement exactly the A renderer contract and consume the same frame object.

- [ ] **Step 1: Add failing route and parity tests**

Loop over all three routes and assert identical serialized scene IDs/copy/calculator config. Assert B mounts six floors and C mounts six islands; fail if either imports a separate content file.

- [ ] **Step 2: Observe RED**

Run: `npm run test:demos -- --grep "Varianten"`
Expected: B/C routes or renderer sentinels missing.

- [ ] **Step 3: Implement B with a vertical camera**

Use six stacked technical floors, a visible service core and active-floor lighting. Scroll changes `--camera-y`, `--camera-z` and per-floor activation only. Avoid office-photo cards and glassmorphism.

- [ ] **Step 4: Implement C with a routed isometric plane**

Use six distinct machine islands connected by a teal route. Camera keyframes are fixed per scene and interpolated through CSS variables. No free drag, mini-game UI or neon city.

- [ ] **Step 5: Run parity tests green and commit**

```powershell
npm run test:demos -- --grep "Varianten"
git add demos tests/demos.spec.mjs
git commit -m "feat: add building and island demo renderers"
```

### Task 5: Higgsfield media and real two-clip scrubbing

**Files:**
- Create: `demos/media/<slug>/keyframe-01.webp`
- Create: `demos/media/<slug>/keyframe-02.webp`
- Create: `demos/media/<slug>/keyframe-03.webp`
- Create: `demos/media/<slug>/clip-01.mp4`
- Create: `demos/media/<slug>/clip-02.mp4`
- Create: `demos/media/<slug>/poster.webp`
- Create: `demos/shared/media-manifest.js`
- Modify: `tests/demos.spec.mjs`

**Interfaces:**
- Manifest entries contain `{ src, bytes, duration: 6, frames: 180, sha256 }`.
- Media controller maps global progress `0–0.5` to clip 1 and `0.5–1` to clip 2.

- [ ] **Step 1: Add failing manifest/media tests**

Assert every file exists, manifest bytes/hash match, each MP4 reports H.264/yuv420p/30 fps/180 frames/no audio and each poster is below 220 KB.

- [ ] **Step 2: Generate three keyframes and two clips per direction**

Use GPT Image 2 for 9:16 CI-faithful keyframes and Seedance 2.0 with exact start/end frames for 6-second motion. Use the actual final frame from clip 1 as the start input for clip 2. No generated text, logo or Karl likeness.

- [ ] **Step 3: Encode deterministic delivery assets**

Use FFmpeg H.264 with `-r 30 -pix_fmt yuv420p -g 4 -keyint_min 4 -sc_threshold 0 -crf 23 -movflags +faststart -an`; verify 180 frames and size, increasing CRF only to 24 if required.

- [ ] **Step 4: Bind media and handle failure**

Poster remains visible until `requestVideoFrameCallback` or fallback confirms a frame. Coalesce seeks, retry one rejected iOS prime on the next interaction and switch to Static on decode/media failure.

- [ ] **Step 5: Run media/browser tests green and commit**

```powershell
npm run test:demos
git add demos/media demos/shared/media-manifest.js demos/shared/media-controller.js tests
git commit -m "feat: add Higgsfield scroll preview media"
```

### Task 6: Responsive, accessibility and visual QA

**Files:**
- Modify only files directly failing tests under `demos/`, `tools/` or `tests/`.
- Create: `artifacts/screenshots/*.png` only if explicitly retained; otherwise keep reports ignored.

**Interfaces:**
- No new product behavior; this task hardens the approved behavior.

- [ ] **Step 1: Run the complete automated matrix**

```powershell
npm run test:demos
```

Expected: all unit and Playwright tests pass at 320, 390, 768 and 1440 widths with no console/page/request errors.

- [ ] **Step 2: Run manual browser inspection**

Verify each demo at 390 × 844 and 1440 × 900, Full/Lite/Static, fast forward/back, dialog keyboard flow, 404 and all transition seams. Capture one mobile and one desktop screenshot per concept.

- [ ] **Step 3: Verify source isolation and budgets**

```powershell
git diff --exit-code origin/main -- index.html kontakt.php sitemap.xml robots.txt .htaccess DEPLOY.md
git status --short
```

Expected: protected files unchanged; only intentional demo/plan/test files tracked.

- [ ] **Step 4: Commit QA-only corrections**

```powershell
git add demos tools tests package.json package-lock.json playwright.config.mjs .gitignore
git commit -m "fix: harden scroll demos across devices"
```

### Task 7: Independent code and UX review

**Files:**
- No planned file additions; corrections must trace to a review finding and receive their own test.

**Interfaces:**
- Produces a clean reviewed branch and a stable local preview URL.

- [ ] **Step 1: Request independent code review**

Reviewer checks shared-state isolation, mode priority, seek lifecycle, accessibility, privacy, CI fidelity and absence of changes to protected files.

- [ ] **Step 2: Reproduce each accepted finding with a failing test**

Run the narrowest test and record the expected failure before editing production code.

- [ ] **Step 3: Fix accepted findings and rerun full verification**

```powershell
npm run test:demos
git diff --check
git status --short
```

- [ ] **Step 4: Push the branch without merging**

```powershell
git push origin codex/scroll-demos
```

The final handoff includes the local preview URL and the GitHub branch URL. No production deployment occurs.
