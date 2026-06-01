# CNT Thermoelectric Poster V3 Exhibition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Produce an editable A0 V3 scientific poster with an exhibition-style hero, balanced academic content, explanatory evidence cards, and a more memorable visual rhythm than V2.

**Architecture:** Create a separate V3 artifact-tool JSX module that reuses the verified Planet template and Zhang et al. figure assets. Replace the V2 even card grid with a dominant hero, a three-card published-evidence bridge, and an intentionally uneven two-column content composition. Render, inspect, export, and verify a separate V3 deliverable set.

**Tech Stack:** `@oai/artifact-tool/presentation-jsx`, bundled render helper, PowerPoint XML verification, supplied scientific figure assets.

---

### Task 1: Build The V3 Exhibition Module

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/slides/slide-01-v3.mjs`

- [ ] **Step 1: Start from the verified V2 module**

```bash
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
cp "$WORKSPACE/slides/slide-01-v2.mjs" "$WORKSPACE/slides/slide-01-v3.mjs"
```

- [ ] **Step 2: Replace the upper composition with an exhibition hero**

Use:

```text
A SOFT FIBER THAT
HARVESTS BODY HEAT
```

Add the circular statement:

```text
BODY
HEAT
→
POWER
```

Place the three evidence cards immediately below the hero and label the bridge:

```text
PUBLISHED RESULTS · ZHANG ET AL. (2021)
```

- [ ] **Step 3: Add explanatory evidence cards**

Use these exact values and accessible descriptions:

```text
44.0 μV/K
Stable thermoelectric response
Shows how effectively the fiber converts a temperature difference into voltage after annealing.

~30% STRAIN
Stretchable while working
The fiber maintains thermoelectric performance while being stretched.

0.66 mV
Stable wearable output
A skin-mounted demonstration generated a small but stable voltage output.
```

- [ ] **Step 4: Compose the uneven lower two-column layout**

Keep:

```text
Why It Matters
How It Works
Published Evidence
How The Fiber Is Made
Near-Term Applications
Our Experimental Proposal
Future Potential
Reference
```

Use larger scientific figures than V2 where space permits. Keep Zhang et al. results visually separate from the presenter's proposed reproduction workflow.

### Task 2: Render And Inspect V3

**Files:**
- Create: `preview/cnt-polymer-thermoelectric-poster-v3.png`
- Create: `layout/cnt-polymer-thermoelectric-poster-v3.json`
- Create: `output/cnt-polymer-thermoelectric-poster-v3.pptx`

- [ ] **Step 1: Render V3**

Run:

```bash
SKILL_DIR="/Users/khangngo/.codex/plugins/cache/openai-primary-runtime/presentations/26.513.11550/skills/presentations"
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
NODE_PATH="/Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules" \
  /Users/khangngo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  "$SKILL_DIR/scripts/render_artifact_slide.mjs" \
  --slide-module "$WORKSPACE/slides/slide-01-v3.mjs" \
  --output "$WORKSPACE/preview/cnt-polymer-thermoelectric-poster-v3.png" \
  --layout "$WORKSPACE/layout/cnt-polymer-thermoelectric-poster-v3.json" \
  --pptx "$WORKSPACE/output/cnt-polymer-thermoelectric-poster-v3.pptx" \
  --slide-size 3179x4494 \
  --scale 0.75
```

- [ ] **Step 2: Inspect the rendered poster**

Confirm:

- the hero is the dominant visual entry point;
- the evidence descriptions are readable and understandable;
- the lower region no longer resembles an even dashboard grid;
- figures are larger and captions remain legible;
- proposal and published evidence are visibly distinct;
- no clipping or overlap is visible.

### Task 3: Export And Verify V3 Deliverables

**Files:**
- Create: `deliverables-cnt-poster-v3/cnt-polymer-thermoelectric-poster-v3.pptx`
- Create: `deliverables-cnt-poster-v3/cnt-polymer-thermoelectric-poster-v3-preview.pdf`
- Create: `deliverables-cnt-poster-v3/cnt-polymer-thermoelectric-poster-v3-preview.png`

- [ ] **Step 1: Copy the V3 PPTX and PNG**

```bash
mkdir -p "$PWD/deliverables-cnt-poster-v3"
cp "$WORKSPACE/output/cnt-polymer-thermoelectric-poster-v3.pptx" "$PWD/deliverables-cnt-poster-v3/"
cp "$WORKSPACE/preview/cnt-polymer-thermoelectric-poster-v3.png" "$PWD/deliverables-cnt-poster-v3/cnt-polymer-thermoelectric-poster-v3-preview.png"
```

- [ ] **Step 2: Export a one-page PDF**

Convert the V3 preview PNG to a one-page PDF while preserving the A0 portrait aspect ratio.

- [ ] **Step 3: Verify the artifacts**

Verify:

```text
slide_size_mm=841.11x1189.04
pdf_pages=1
required_content_items=16/16
evidence_descriptions=3/3
evidence_attribution=PASS
embedded_image_tags>=4
overclaim_matches=0
pptx_archive_test=PASS
```

