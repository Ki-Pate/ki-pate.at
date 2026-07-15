# Higgsfield Hero Video Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, verify, and publish three conceptual photorealistic Higgsfield hero videos plus one expression-driven full Hero preview for Karl Pilz as clickable server previews.

**Architecture:** Nano Banana Pro first creates one identity-faithful 16:9 start/end frame per concept from Karl's existing portraits. Seedance 2.0 animates each frame into an eight-second silent loop; the existing seated Higgsfield clip additionally acts as the expression reference for variant D. The verified MP4 files are presented in an isolated `/hero-previews/` comparison page without changing the production homepage.

**Tech Stack:** Higgsfield CLI, Nano Banana Pro, Seedance 2.0, FFmpeg, static HTML/CSS, existing KI-Pate deployment endpoint.

## Global Constraints

- Photorealistic output with Karl clearly recognizable, friendly, wearing no tie.
- Identity reference: `.preview/assets/karl-pilz-ki-berater-salzburg.webp`.
- Only accent color: `#2BC8B7`; all other colors black, graphite, or off-white.
- No generated text, logos, pseudo-readable interfaces, purple neon, horror, or robot clichés.
- At least the left 42 percent of every frame remains a quiet text-safe area.
- Video output: 16:9, 1920 × 1080, eight seconds, no audio, loop-friendly.
- Do not modify the current production homepage.

---

### Task 1: Validate generation inputs

**Files:**
- Read: `.preview/assets/karl-pilz-ki-berater-salzburg.webp`
- Create at runtime: `.preview/higgsfield/hero-videos/`

**Interfaces:**
- Consumes: authenticated Higgsfield account and Karl's local portrait.
- Produces: confirmed model schemas and an output directory for later tasks.

- [ ] **Step 1: Confirm account and model schemas**

Run the Higgsfield account status command and inspect `nano_banana_pro` plus `seedance_2_0` with `higgsfield model get`.

- [ ] **Step 2: Verify the portrait file**

Open the reference image and confirm that Karl's face, glasses, beard, open collar, and friendly expression are clearly visible.

- [ ] **Step 3: Create the runtime output directory**

Create `.preview/higgsfield/hero-videos/` without adding it to Git.

### Task 2: Generate four photorealistic start/end frames

**Files:**
- Create: `.preview/higgsfield/hero-videos/hero-a-human-machine-start.png`
- Create: `.preview/higgsfield/hero-videos/hero-b-ai-workbench-start.png`
- Create: `.preview/higgsfield/hero-videos/hero-c-chaos-to-system-start.png`
- Create: `.preview/higgsfield/hero-videos/hero-d-expression-start.png`

**Interfaces:**
- Consumes: Karl's identity reference and the three exact concept prompts below.
- Produces: four local 16:9 images used as both first and last frame by Task 3.

- [ ] **Step 1: Generate variant A with Nano Banana Pro**

Prompt:

```text
Create a cinematic photorealistic 16:9 hero frame using the supplied man as the exact identity reference. Preserve his face, black rectangular glasses, short light hair, reddish-blond beard, natural body proportions and friendly subtle smile. He stands in the right third, approachable and confident, wearing a modern charcoal overshirt over an open-collar dark shirt, absolutely no tie. Deep graphite environment. One side of his face and shoulder contains elegant anatomically plausible biomechanical details integrated beneath natural skin, refined and human, never horror or Terminator. A restrained turquoise #2BC8B7 light pulse and a few shallow-depth particles create layered cinematic depth. Keep the entire left 42 percent dark, low-detail and empty for website typography. Photorealistic skin, realistic optics, premium commercial cinematography, 35mm lens, soft directional key light. No text, no logo, no letters, no other people, no purple, no blue neon, no helmet, no exaggerated robot eye.
```

- [ ] **Step 2: Generate variant B with Nano Banana Pro**

Prompt:

```text
Create a cinematic photorealistic 16:9 hero frame using the supplied man as the exact identity reference. Preserve his face, black rectangular glasses, short light hair, reddish-blond beard, natural body proportions and friendly subtle smile. He stands in the right third in a credible contemporary AI workshop, approachable and confident, wearing a modern charcoal overshirt over an open-collar dark shirt, absolutely no tie. Around him are sparse translucent glass planes, textless geometric process nodes and thin data paths, sophisticated and physically believable rather than a science-fiction dashboard. Only #2BC8B7 appears as an accent; everything else is black, graphite and off-white. Keep the entire left 42 percent dark, low-detail and empty for website typography. Photorealistic skin, real glass reflections, premium commercial cinematography, 35mm lens, controlled depth. No text, no logo, no letters, no other people, no purple, no blue neon, no fake interface text.
```

- [ ] **Step 3: Generate variant C with Nano Banana Pro**

Prompt:

```text
Create a cinematic photorealistic 16:9 hero frame using the supplied man as the exact identity reference. Preserve his face, black rectangular glasses, short light hair, reddish-blond beard, natural body proportions and friendly subtle smile. He stands calmly in the right third, approachable and confident, wearing a modern charcoal overshirt over an open-collar dark shirt, absolutely no tie. In layered depth around him float a small number of abstract textless material fragments representing documents, messages, meetings and tasks; their shapes begin disordered but visually converge toward one precise process path accented only in turquoise #2BC8B7. Everything else is black, graphite and off-white. Keep the entire left 42 percent dark, low-detail and empty for website typography. Photorealistic skin and materials, premium commercial cinematography, 35mm lens. No readable paper, no text, no logo, no letters, no other people, no purple, no blue neon, no literal app icons.
```

- [ ] **Step 4: Generate expression-driven Hero frame D with Nano Banana Pro**

Use both `.preview/assets/karl-pilz-ki-berater-salzburg.webp` for identity and `.preview/assets/karl-hollywood-video-poster.webp` for seated composition.

```text
Create a wide cinematic photorealistic 16:9 website hero frame. Use the first supplied portrait as the exact facial identity and the second supplied seated image only as composition and atmosphere reference. Karl sits confidently in a dark leather chair on the right side of a sophisticated warm wood-panelled room, facing the camera with a calm serious expression. Preserve his black rectangular glasses, short light hair, reddish-blond beard and natural proportions. Replace the tie with a refined dark open-collar shirt and charcoal jacket, absolutely no tie. Keep the entire left 42 percent dark, calm and low-detail for website copy. Natural warm practical lamp light, restrained cinematic contrast, premium 35mm commercial photography. No text, no logo, no letters, no other people, no purple or blue neon.
```

- [ ] **Step 5: Inspect all four images**

Open each image at original detail. Reject an image if Karl is not recognizable, looks unfriendly, wears a tie, has malformed glasses or anatomy, contains generated lettering, or violates the text-safe area.

### Task 3: Animate all three variants with Seedance 2.0

**Files:**
- Create: `.preview/higgsfield/hero-videos/hero-a-human-machine-1080p.mp4`
- Create: `.preview/higgsfield/hero-videos/hero-b-ai-workbench-1080p.mp4`
- Create: `.preview/higgsfield/hero-videos/hero-c-chaos-to-system-1080p.mp4`
- Create: `.preview/higgsfield/hero-videos/hero-d-expression-1080p.mp4`

**Interfaces:**
- Consumes: the four approved start images from Task 2 as both `--start-image` and `--end-image`.
- Produces: four eight-second silent 1080p videos for verification and publishing.

- [ ] **Step 1: Animate variant A**

```text
Single continuous premium photorealistic shot. Very slow camera dolly toward Karl while he remains friendly, calm and nearly still. A restrained #2BC8B7 light pulse travels once across the biomechanical side of his face and shoulder, revealing fine realistic mechanisms beneath natural skin; a few particles pass through foreground and background depth. No cut, no speaking, no lip motion, no body morph, no wardrobe change. Keep the left 42 percent quiet and dark. Finish in the exact initial composition for a seamless loop.
```

- [ ] **Step 2: Animate variant B**

```text
Single continuous premium photorealistic shot. A slow controlled camera arc adds parallax while Karl remains friendly, calm and nearly still. One #2BC8B7 process signal unfolds sparse textless glass layers and geometric workflow nodes around him, then the layers settle back into the exact initial composition. Realistic glass, optics and depth. No cut, no speaking, no lip motion, no fake letters, no body morph, no wardrobe change. Keep the left 42 percent quiet and dark. End on the exact starting frame for a seamless loop.
```

- [ ] **Step 3: Animate variant C**

```text
Single continuous premium photorealistic shot. Karl remains the friendly calm anchor while a few abstract textless fragments drift in controlled shallow depth. A restrained #2BC8B7 pulse organizes them into one elegant process stream, then they gently return to the exact initial arrangement. Very slow camera push, realistic materials and physics. No cut, no speaking, no lip motion, no letters, no body morph, no wardrobe change. Keep the left 42 percent quiet and dark. End on the exact starting frame for a seamless loop.
```

- [ ] **Step 4: Animate expression-driven Hero variant D**

Use `.preview/assets/karl-hollywood-video.mp4` as the motion and expression reference in addition to the generated start/end frame.

```text
Single continuous premium photorealistic 16:9 Hero shot based on the supplied seated motion reference. Karl begins with the same calm serious direct expression and remains still for roughly the first 2.5 seconds. Between 2.5 and 4.5 seconds his expression naturally softens into a very slight confident grin, never a broad smile. At roughly 5 seconds he gives exactly one brief natural wink with one eye, then holds the subtle grin before returning gently to the initial serious neutral expression by the final frame. Only realistic micro-movements: breathing, tiny head motion and natural eyes. No speaking, no lip articulation, no cut, no camera shake, no body morph, no wardrobe change. Keep the left 42 percent dark and quiet. End on the exact starting composition for a seamless loop.
```

Use `--aspect_ratio 16:9 --duration 8 --resolution 1080p --mode std --generate_audio false --wait --wait-timeout 30m` for each render.

### Task 4: Verify the generated media

**Files:**
- Read: `.preview/higgsfield/hero-videos/*.mp4`
- Create: `.preview/higgsfield/hero-videos/qa/*.jpg`

**Interfaces:**
- Consumes: the three generated MP4 files.
- Produces: four accepted videos or a precise corrective prompt for a failed variant.

- [ ] **Step 1: Verify media metadata**

Use FFmpeg inspection to confirm 1920 × 1080, eight-second duration within normal encoder tolerance, H.264-compatible delivery, and no audio stream.

- [ ] **Step 2: Extract visual checkpoints**

Extract frames at 0.1, 2.5, 4.5, 5.2, and 7.8 seconds for every video. For variant D specifically confirm serious start, subtle grin, exactly one visible wink, and neutral loop return.

- [ ] **Step 3: Review hard acceptance criteria**

Check identity, friendliness, no tie, face/glasses/anatomy, accent color, left safe-zone, lack of text, and start/end similarity. A failed variant receives at most two corrective renders.

### Task 5: Publish the isolated comparison page

**Files:**
- Create: `hero-previews/index.html`
- Create: `hero-previews/media/hero-a-human-machine-1080p.mp4`
- Create: `hero-previews/media/hero-b-ai-workbench-1080p.mp4`
- Create: `hero-previews/media/hero-c-chaos-to-system-1080p.mp4`
- Create: `hero-previews/media/hero-d-expression-1080p.mp4`
- Create: `hero-previews/hero.html`

**Interfaces:**
- Consumes: the three accepted local videos.
- Produces: one comparison overview, four direct public preview anchors, and one full-viewport Hero mockup under `https://ki-pate.at/hero-previews/`.

- [ ] **Step 1: Copy only accepted videos into the public preview subtree**

Keep generated working files in `.preview`; place only the three final MP4 files in `hero-previews/media/`.

- [ ] **Step 2: Build the comparison page**

Create a mobile-first static page with four full-width video cards. Every video uses `autoplay muted loop playsinline controls`, shows its variant name, and has a direct anchor `#a`, `#b`, `#c`, or `#d`. Do not alter the production `index.html`.

Create `hero-previews/hero.html` as a full-viewport Hero using variant D as `<video autoplay muted loop playsinline>`. Overlay the existing Hero copy as real HTML: `KI ist weit mehr, als du denkst.`, the current supporting paragraph, `KI-Sprechstunde buchen`, and `Use Cases ansehen`. Use `#2BC8B7` for the emphasized words and primary CTA. During scroll, fade the filled headline into a transparent outlined state before revealing supporting text and CTAs. Do not bake text into the video.

- [ ] **Step 3: Run local verification**

Serve the repository and confirm the overview plus all video requests return HTTP 200 and play without console errors.

- [ ] **Step 4: Commit and deploy**

Commit only `hero-previews/` and the implementation plan, push `main`, invoke the existing KI-Pate deployment endpoint, and verify the three public links return HTTP 200.

### Task 6: Deliver selection links

**Files:**
- Read: deployed `hero-previews/index.html`

**Interfaces:**
- Consumes: the verified server deployment.
- Produces: four clickable URLs in the final response.

- [ ] **Step 1: Provide the comparison and direct links**

Return:

```text
https://ki-pate.at/hero-previews/
https://ki-pate.at/hero-previews/#a
https://ki-pate.at/hero-previews/#b
https://ki-pate.at/hero-previews/#c
https://ki-pate.at/hero-previews/#d
https://ki-pate.at/hero-previews/hero.html
```

- [ ] **Step 2: Ask Karl to select A, B, C, or D**

Do not start the mobile render or production homepage integration before Karl chooses a winning variant.
