# Adulting Lab VinCore Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Build an editable A0 portrait poster for the proposed VinCore course `Adulting Lab`, using a playful pastel infographic style and preserving the approved English content structure.

**Architecture:** Create a new artifact-tool slide workspace under `outputs/manual-20260612-adulting-lab/presentations/adulting-lab-vincore-poster`. Implement a one-slide JSX module with editable shapes, text, pastel cards, and simple vector-style icons. Render to PNG/PPTX, inspect the preview, export a separate PDF/PNG/PPTX deliverable set, and verify A0 size plus required content anchors.

**Tech Stack:** `@oai/artifact-tool/presentation-jsx`, bundled render helper, PowerPoint XML verification, editable PowerPoint shapes/text.

---

### Task 1: Create The Adulting Lab Poster Module

**Files:**
- Create: `outputs/manual-20260612-adulting-lab/presentations/adulting-lab-vincore-poster/slides/slide-01.mjs`

- [ ] **Step 1: Create the workspace directories**

```bash
WORKSPACE="$PWD/outputs/manual-20260612-adulting-lab/presentations/adulting-lab-vincore-poster"
mkdir -p "$WORKSPACE/slides" "$WORKSPACE/preview" "$WORKSPACE/layout" "$WORKSPACE/output" "$WORKSPACE/qa"
```

- [ ] **Step 2: Build one editable A0 poster slide**

Create a slide module that includes:

- hero card with `ADULTING LAB`;
- subtitle and supporting line;
- six finding cards: Objective, Fact, Problem, Idea, Solution, Acceptance;
- course module grid with six modules;
- final recommendation box;
- playful pastel background, thick black borders, offset colored shadows, and simple vector icons.

### Task 2: Render And Inspect The Poster

**Files:**
- Create: `preview/adulting-lab-vincore-poster-v1.png`
- Create: `layout/adulting-lab-vincore-poster-v1.json`
- Create: `output/adulting-lab-vincore-poster-v1.pptx`

- [ ] **Step 1: Render the poster**

Use the bundled render helper with:

```text
--slide-module slides/slide-01.mjs
--export slide01
--slide-size 3179x4494
--scale 0.75
```

- [ ] **Step 2: Inspect the preview**

Confirm:

- it visually follows the playful pastel infographic reference;
- it remains readable from a distance;
- Solution Finding is the largest content region;
- all six finding stages are visible;
- final recommendation is visually prominent;
- no text clipping or obvious overlap is visible.

### Task 3: Export And Verify Deliverables

**Files:**
- Create: `deliverables-adulting-lab-poster-v1/adulting-lab-vincore-poster-v1.pptx`
- Create: `deliverables-adulting-lab-poster-v1/adulting-lab-vincore-poster-v1-preview.pdf`
- Create: `deliverables-adulting-lab-poster-v1/adulting-lab-vincore-poster-v1-preview.png`

- [ ] **Step 1: Copy PPTX and PNG and export a one-page PDF**

Export to a new `deliverables-adulting-lab-poster-v1` folder without overwriting older poster deliverables.

- [ ] **Step 2: Verify the final artifacts**

Verify:

```text
slide_size_mm=841.11x1189.04
pdf_pages=1
required_sections=6/6
course_modules=6/6
final_recommendation=PASS
proposal_language=PASS
editable_shape_tags>=80
pptx_archive_test=PASS
```

