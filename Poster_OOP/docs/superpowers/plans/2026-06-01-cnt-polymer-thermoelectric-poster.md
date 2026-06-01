# CNT/Polymer Thermoelectric Fiber A0 Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Build an editable A0 portrait PowerPoint poster, PDF preview, and PNG preview that present CNT/polymer thermoelectric fibers to a mixed audience using the approved application-led showcase narrative.

**Architecture:** Use one `@oai/artifact-tool/presentation-jsx` module for a single A0 portrait slide. Preserve the supplied Planet event template as a verified background asset, then construct the light content canvas, headings, callouts, flows, captions, and reference block with editable PowerPoint shapes and text. Extract and crop selected scientific figures from the supplied Zhang et al. paper into stable local assets before layout work.

**Tech Stack:** `@oai/artifact-tool/presentation-jsx`, bundled `render_artifact_slide.mjs`, bundled Python runtime, `pypdf`, Pillow, supplied PDF sources.

---

## File Structure

Use this workspace:

`outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster`

Create:

- `assets/template-planet.png`: rendered official event background.
- `assets/fig-wet-spinning.png`: fabrication schematic from the paper.
- `assets/fig-measurement.png`: measurement setup and thermoelectric performance figure.
- `assets/fig-strain-stability.png`: stretchability evidence figure.
- `assets/fig-wearable-module.png`: wearable device figure.
- `scripts/prepare-assets.py`: deterministic extraction and crop script.
- `slides/slide-01.mjs`: editable A0 poster composition.
- `profile-plan.txt`: presentation mode, profile, proof objects, and QA gates.
- `source-notes.txt`: provenance for every source asset and scientific claim.
- `reference-audit.txt`: visual and content audit of the template and proposal PDFs.
- `qa/comeback-scorecard.txt`: rendered-quality review notes.
- `preview/cnt-polymer-thermoelectric-poster-v1.png`: rendered poster preview.
- `layout/cnt-polymer-thermoelectric-poster-v1.json`: layout diagnostics.
- `output/cnt-polymer-thermoelectric-poster-v1.pptx`: editable PowerPoint.

Copy final deliverables to:

`deliverables-cnt-poster-v1`

---

### Task 1: Create Poster Workspace And Record Source Provenance

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/profile-plan.txt`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/source-notes.txt`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/reference-audit.txt`

- [ ] **Step 1: Create the thread-scoped workspace**

Run:

```bash
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
mkdir -p "$WORKSPACE"/{assets,scripts,slides,preview,layout,qa,output}
mkdir -p "$PWD/deliverables-cnt-poster-v1"
```

Expected: all directories exist below the CNT poster workspace.

- [ ] **Step 2: Write the profile plan**

Create `profile-plan.txt` with:

```text
task mode: create
primary deck-profile: engineering-platform
secondary profile gates: consumer-retail readability for a mixed audience
required proof objects:
- application-led hero hook
- body heat to electrical voltage mechanism flow
- wet-spinning fabrication schematic
- published evidence KPIs labelled as Zhang et al. (2021) results
- proposed reproduction workflow labelled as proposal
source requirements:
- preserve Planet event-template identity
- use only supplied scientific figures from Zhang et al. paper
brand constraints:
- use the supplied event template as the verified source for event identity
- do not redraw or approximate VinUniversity logos
QA gates:
- A0 portrait physical size
- readable thumbnail hierarchy
- no application overclaim
- published results and proposal clearly separated
- editable text, panels, flows, and KPI callouts
```

- [ ] **Step 3: Write source notes and reference audit**

Record the four supplied PDF paths, the Zhang et al. DOI, and these approved claims:

```text
44.0 μV/K stable Seebeck coefficient after annealing
approximately 30% tensile strain while maintaining thermoelectric performance
0.66 mV stable voltage output from a wearable device attached to skin
```

Record that the Planet PDF is the official event-template reference and that scientific figure captions must use `Adapted from Zhang et al. (2021).`

---

### Task 2: Prepare Template And Scientific Figure Assets

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/scripts/prepare-assets.py`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/assets/template-planet.png`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/assets/fig-wet-spinning.png`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/assets/fig-measurement.png`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/assets/fig-strain-stability.png`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/assets/fig-wearable-module.png`

- [ ] **Step 1: Add the deterministic extraction script**

Implement `prepare-assets.py`:

```python
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
import io
import shutil
import subprocess
import sys

workspace = Path(sys.argv[1])
assets = workspace / "assets"
assets.mkdir(parents=True, exist_ok=True)

template_pdf = Path("/Users/khangngo/Downloads/Poster khoa học #3 (A0_84x119cm)_Planet.pdf")
paper_pdf = Path("/Users/khangngo/Downloads/2021_Hightly stretchable carbon nanotubes_Chunyang Zhang_IMAGES (1) (1) (1).pdf")

template_tmp = workspace / "assets" / "template-render"
template_tmp.mkdir(exist_ok=True)
subprocess.run(["qlmanage", "-t", "-s", "3600", "-o", str(template_tmp), str(template_pdf)], check=True)
rendered = next(template_tmp.glob("*.png"))
shutil.copy2(rendered, assets / "template-planet.png")

reader = PdfReader(str(paper_pdf))
targets = {
    (2, 1): "fig-wet-spinning.png",
    (3, 1): "fig-measurement.png",
    (4, 1): "fig-strain-stability.png",
    (5, 1): "fig-wearable-module.png",
}
for (page_number, image_number), filename in targets.items():
    image_file = reader.pages[page_number - 1].images[image_number - 1]
    image = Image.open(io.BytesIO(image_file.data)).convert("RGB")
    image.save(assets / filename, quality=95)

print("prepared_assets=5")
```

- [ ] **Step 2: Run asset preparation**

Run:

```bash
PY="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
"$PY" "$WORKSPACE/scripts/prepare-assets.py" "$WORKSPACE"
file "$WORKSPACE"/assets/*.png
```

Expected:

```text
prepared_assets=5
```

and five valid PNG assets.

- [ ] **Step 3: Create a figure contact sheet**

Run:

```bash
PY="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
"$PY" - "$WORKSPACE" <<'PY'
from pathlib import Path
from PIL import Image, ImageDraw
import sys
workspace = Path(sys.argv[1])
files = sorted((workspace / "assets").glob("fig-*.png"))
canvas = Image.new("RGB", (1600, 1500), "white")
draw = ImageDraw.Draw(canvas)
for i, path in enumerate(files):
    image = Image.open(path).convert("RGB")
    image.thumbnail((740, 600))
    x = 30 + (i % 2) * 780
    y = 35 + (i // 2) * 710
    draw.text((x, y), path.name, fill="black")
    canvas.paste(image, (x, y + 30))
canvas.save(workspace / "qa" / "scientific-figures-contact-sheet.png")
PY
```

Inspect `qa/scientific-figures-contact-sheet.png`. Expected: the wet-spinning schematic, measurement figure, strain-stability figure, and wearable module figure are readable enough to guide layout placement.

---

### Task 3: Build The Editable A0 Application-Led Poster

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/slides/slide-01.mjs`

- [ ] **Step 1: Add the A0 canvas and helper functions**

Create `slide-01.mjs` with a scalable `594 x 840` reference coordinate system and use `3179 x 4494` for export:

```javascript
import path from "node:path";

const C = {
  forest: "#173F32", deep: "#0B3027", canvas: "#F8FAF4", white: "#FFFFFF",
  ink: "#17342C", slate: "#5D716A", line: "#C8D8D0",
  teal: "#18BCB1", yellow: "#F4C84A", coral: "#EE6955", mint: "#DDEEE6",
};

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  const { addShape, addText, addImage, line } = ctx;
  const sx = ctx.W / 594;
  const sy = ctx.H / 840;
  const sf = Math.min(sx, sy);
  const X = (value) => value * sx;
  const Y = (value) => value * sy;
  const asset = (name) => path.join(ctx.assetDir, name);
  const rect = (x, y, w, h, fill, stroke = fill, sw = 0) =>
    addShape(slide, { x: X(x), y: Y(y), w: X(w), h: Y(h), fill, line: line(stroke, sw * sf), geometry: "rect" });
  const text = (value, x, y, w, h, opts = {}) =>
    addText(slide, {
      text: value, x: X(x), y: Y(y), w: X(w), h: Y(h * 1.15),
      fontSize: (opts.size ?? 10) * sf, color: opts.color ?? C.ink,
      bold: opts.bold ?? false, typeface: opts.face ?? "Aptos",
      align: opts.align ?? "left", valign: opts.valign ?? "top",
      fill: "#00000000", line: line("#00000000", 0),
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  const image = async (file, x, y, w, h, alt, fit = "contain") =>
    addImage(slide, { path: asset(file), x: X(x), y: Y(y), w: X(w), h: Y(h), fit, alt });
```

- [ ] **Step 2: Add template background and light content canvas**

Add:

```javascript
  await image("template-planet.png", 0, 0, 594, 840, "VinUniversity Research Day event template", "cover");
  rect(24, 102, 546, 650, "#F8FAF4F2", C.line, 0.8);
```

Keep the official event header and footer visible. Do not place body text outside the light canvas.

- [ ] **Step 3: Add hero, applications, and mechanism flow**

Use these exact content anchors:

```text
WHAT IF YOUR CLOTHES COULD HARVEST BODY HEAT?
Stretchable CNT/polymer fibers can convert temperature differences into small but stable electrical outputs while bending and stretching with the body.
WHY IT MATTERS
Wearable devices still depend on rigid batteries that require charging. Human body heat is a continuous energy source, but a wearable generator must remain functional while the body moves.
NEAR-TERM APPLICATIONS
Heat-harvesting patches
Smart clothing
Low-power health sensors
HOW IT WORKS
Body heat -> Temperature difference -> Seebeck effect -> Electrical voltage
When the two ends of the fiber are at different temperatures, charge carriers move and generate a measurable voltage.
```

Create all application cards and flow boxes as editable shapes. Use warm yellow for application cards and teal connectors for the mechanism flow.

- [ ] **Step 4: Add fabrication and proposal panels**

Embed `fig-wet-spinning.png` with the caption:

```text
Improved wet-spinning fabrication. Adapted from Zhang et al. (2021).
```

Add the editable fabrication flow:

```text
CNT dispersion -> Wet-spinning -> Polymer infiltration -> Washing and annealing
```

Add the proposal panel:

```text
OUR EXPERIMENTAL PROPOSAL
Proposed reproduction workflow
Materials: carboxylic SWNTs, water, SDS, WPU, PVA, and conductive silver paste.
Equipment: probe ultrasonicator, syringe pump, vacuum oven, Cu plates, PI heater, thermocouples, and nanovoltmeter.
Workflow: Disperse -> Wet-spin -> Infiltrate -> Wash and anneal -> Measure voltage
```

Use the word `proposed` visibly so the panel cannot be mistaken for completed experimental results.

- [ ] **Step 5: Add published evidence and application potential**

Embed `fig-strain-stability.png` and `fig-wearable-module.png` at readable sizes with:

```text
PUBLISHED EVIDENCE · ZHANG ET AL. (2021)
44.0 μV/K
Stable Seebeck coefficient after annealing
~30%
Tensile strain while maintaining thermoelectric performance
0.66 mV
Stable output from a wearable device attached to skin
The fiber maintains a stable voltage output while bending and stretching, which is essential for wearable applications.
FUTURE POTENTIAL
Sports wearables · self-powered monitoring · soft wearable electronics with less frequent charging
```

Use coral KPI callouts and keep `Zhang et al. (2021)` visible above the metrics.

- [ ] **Step 6: Add concise reference and presenter footer**

Add:

```text
PRESENTER · NGO QUY KHANG
REFERENCE
Zhang, C. et al. (2021). Highly Stretchable Carbon Nanotubes/Polymer Thermoelectric Fibers. Nano Letters, 21(2), 1047-1055. https://doi.org/10.1021/acs.nanolett.0c04252
```

End the module with:

```javascript
  return slide;
}
```

---

### Task 4: Render V1 And Run Layout Diagnostics

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/preview/cnt-polymer-thermoelectric-poster-v1.png`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/layout/cnt-polymer-thermoelectric-poster-v1.json`
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/output/cnt-polymer-thermoelectric-poster-v1.pptx`

- [ ] **Step 1: Render the poster**

Run:

```bash
SKILL_DIR="/Users/khangngo/.codex/plugins/cache/openai-primary-runtime/presentations/26.513.11550/skills/presentations"
NODE="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
"$NODE" "$SKILL_DIR/scripts/render_artifact_slide.mjs" \
  --workspace "$WORKSPACE" \
  --slide-module "$WORKSPACE/slides/slide-01.mjs" \
  --export slide01 \
  --output "$WORKSPACE/preview/cnt-polymer-thermoelectric-poster-v1.png" \
  --layout "$WORKSPACE/layout/cnt-polymer-thermoelectric-poster-v1.json" \
  --pptx "$WORKSPACE/output/cnt-polymer-thermoelectric-poster-v1.pptx" \
  --slide-size 3179x4494 \
  --scale 0.75
```

- [ ] **Step 2: Scan diagnostics**

Run:

```bash
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
rg -n 'overflow|clip|warning|error' "$WORKSPACE/layout/cnt-polymer-thermoelectric-poster-v1.json" || true
```

Expected: no unintended clipping or overflow warnings.

- [ ] **Step 3: Inspect the rendered preview**

Open the PNG and inspect:

- hero hook readability;
- contrast against the Planet background;
- figure label readability;
- separation of published evidence and proposal;
- KPI alignment;
- application cards;
- reference legibility;
- event header and footer visibility.

Record the visual QA notes in `qa/comeback-scorecard.txt`. Patch `slide-01.mjs` and rerender until the preview is coherent at thumbnail and readable sizes.

---

### Task 5: Export Deliverables And Verify Content

**Files:**
- Create: `deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1.pptx`
- Create: `deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.pdf`
- Create: `deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.png`

- [ ] **Step 1: Copy PPTX and PNG deliverables**

Run:

```bash
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
DELIVERABLES="$PWD/deliverables-cnt-poster-v1"
cp "$WORKSPACE/output/cnt-polymer-thermoelectric-poster-v1.pptx" "$DELIVERABLES/"
cp "$WORKSPACE/preview/cnt-polymer-thermoelectric-poster-v1.png" "$DELIVERABLES/cnt-polymer-thermoelectric-poster-v1-preview.png"
```

- [ ] **Step 2: Create one-page PDF preview**

Run:

```bash
sips -s format pdf \
  "$PWD/deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.png" \
  --out "$PWD/deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.pdf"
```

- [ ] **Step 3: Verify A0 size, content, and editability**

Run:

```bash
set -euo pipefail
PPTX="$PWD/deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1.pptx"
PDF="$PWD/deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.pdf"
PNG="$PWD/deliverables-cnt-poster-v1/cnt-polymer-thermoelectric-poster-v1-preview.png"
PY="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
XML=$(mktemp)
PRES=$(mktemp)
unzip -t "$PPTX" >/dev/null
unzip -p "$PPTX" ppt/slides/slide1.xml > "$XML"
unzip -p "$PPTX" ppt/presentation.xml > "$PRES"
for content in \
  "WHAT IF YOUR CLOTHES COULD HARVEST BODY HEAT?" \
  "NEAR-TERM APPLICATIONS" \
  "HOW IT WORKS" \
  "OUR EXPERIMENTAL PROPOSAL" \
  "Proposed reproduction workflow" \
  "PUBLISHED EVIDENCE" \
  "44.0 μV/K" \
  "~30%" \
  "0.66 mV" \
  "FUTURE POTENTIAL" \
  "NGO QUY KHANG" \
  "10.1021/acs.nanolett.0c04252"; do
  rg -Fq "$content" "$XML" || { echo "missing_content=$content"; exit 1; }
done
if rg -qi 'fully power a smartwatch|completed experiment|our results' "$XML"; then
  echo "overclaim_found"
  exit 1
fi
SHAPES=$(rg -o '<p:sp>' "$XML" | wc -l | tr -d ' ')
IMAGES=$(rg -o '<p:pic>' "$XML" | wc -l | tr -d ' ')
"$PY" - "$PRES" "$PDF" <<'PY'
import re
import sys
from pypdf import PdfReader
xml = open(sys.argv[1]).read()
match = re.search(r'<p:sldSz cx="(\d+)" cy="(\d+)"', xml)
assert match
cx, cy = map(int, match.groups())
millimeters = lambda emu: emu / 36000
print(f"slide_size_mm={millimeters(cx):.2f}x{millimeters(cy):.2f}")
assert abs(millimeters(cx) - 841) < .5
assert abs(millimeters(cy) - 1189) < .5
reader = PdfReader(sys.argv[2])
print(f"pdf_pages={len(reader.pages)}")
assert len(reader.pages) == 1
PY
rm -f "$XML" "$PRES"
file "$PPTX" "$PDF" "$PNG"
printf 'editable_shape_tags=%s\nembedded_image_tags=%s\npptx_archive_test=PASS\n' "$SHAPES" "$IMAGES"
```

Expected:

```text
slide_size_mm=841.11x1189.04
pdf_pages=1
pptx_archive_test=PASS
```

with editable shape tags greater than zero and embedded image tags for the template and scientific figures.

- [ ] **Step 4: Inspect the final PNG one last time**

Confirm the copied PNG matches the approved render and that the final artifact is ready to hand off.

