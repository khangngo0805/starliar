# CNT Thermoelectric Poster V4 Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $superpower-subagents (recommended) or $superpower-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking via update_plan.

**Goal:** Produce a separate editable A0 V4 poster with selectively enlarged typography while preserving every approved V3 content string and the exhibition-style layout.

**Architecture:** Copy the verified V3 artifact-tool JSX module to a V4 module. Increase font sizes only in the evidence cards, body-copy blocks, flow steps, application labels, and proposal text. Preserve the hero, figures, captions, reference, and exact content strings; render and verify a separate V4 deliverable set.

**Tech Stack:** `@oai/artifact-tool/presentation-jsx`, bundled render helper, PowerPoint XML verification, supplied scientific figure assets.

---

### Task 1: Create The V4 Typography Module

**Files:**
- Create: `outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster/slides/slide-01-v4.mjs`

- [ ] **Step 1: Copy the verified V3 module**

```bash
WORKSPACE="$PWD/outputs/019e796f-812a-7750-a149-b1321eaf7138/presentations/cnt-polymer-thermoelectric-poster"
cp "$WORKSPACE/slides/slide-01-v3.mjs" "$WORKSPACE/slides/slide-01-v4.mjs"
```

- [ ] **Step 2: Increase evidence-card typography**

Increase:

```text
value: 9.1 -> 10.0
label: 4.05 -> 4.55
description: 3.6 -> 4.05
```

Keep all evidence strings unchanged.

- [ ] **Step 3: Increase key lower-panel typography**

Increase:

```text
flow step: 4.0 -> 4.4
application label: 3.95 -> 4.35
Why It Matters body: 4.15 -> 4.55
How It Works body: 3.65 -> 4.0
Published Evidence body: 3.6 -> 3.95
proposal materials/equipment: 3.35/3.15 -> 3.7/3.5
proposal workflow: 3.45 -> 3.75
```

Keep the hero, scientific figure captions, footer reference, and all content
strings unchanged.

### Task 2: Render And Inspect V4

**Files:**
- Create: `preview/cnt-polymer-thermoelectric-poster-v4.png`
- Create: `layout/cnt-polymer-thermoelectric-poster-v4.json`
- Create: `output/cnt-polymer-thermoelectric-poster-v4.pptx`

- [ ] **Step 1: Render V4**

Use the bundled render helper with:

```text
--slide-module slides/slide-01-v4.mjs
--export slide01
--slide-size 3179x4494
--scale 0.75
```

- [ ] **Step 2: Inspect the V4 preview**

Confirm:

- the enlarged evidence descriptions remain fully readable;
- the block text is visibly larger than V3;
- no clipping, overlap, or escaped panel text is visible;
- no approved text has been removed or rewritten;
- the exhibition-style hierarchy remains intact.

### Task 3: Export And Verify V4 Deliverables

**Files:**
- Create: `deliverables-cnt-poster-v4/cnt-polymer-thermoelectric-poster-v4.pptx`
- Create: `deliverables-cnt-poster-v4/cnt-polymer-thermoelectric-poster-v4-preview.pdf`
- Create: `deliverables-cnt-poster-v4/cnt-polymer-thermoelectric-poster-v4-preview.png`

- [ ] **Step 1: Copy the V4 PPTX and PNG and export a one-page PDF**

Export to a new `deliverables-cnt-poster-v4` directory without overwriting V3.

- [ ] **Step 2: Verify the artifacts**

Verify:

```text
slide_size_mm=841.11x1189.04
pdf_pages=1
required_content_items=16/16
evidence_descriptions=3/3
evidence_attribution=PASS
v3_text_preserved=PASS
embedded_image_tags>=4
overclaim_matches=0
pptx_archive_test=PASS
```

