# FitTrack A2 Academic Poster Design

## Deliverables

- Editable PowerPoint poster in A2 portrait format.
- PDF export for print review.
- English-only content.
- All diagrams, text blocks, and layout elements remain editable.

## Audience And Goal

The poster is for a COMP1020 academic presentation and grading. It should make
the team's object-oriented design decisions easy to inspect while still showing
the application as a finished, coherent product.

## Visual Direction

Use a balanced academic and technical-showcase style:

- Off-white background for print readability.
- Charcoal section bars and body text.
- FitTrack orange as the primary accent and cyan as a secondary accent.
- A structured three-column research-poster layout with generous spacing.
- Screenshots framed cleanly and used as evidence, not decoration.
- No invented logos. Use the FitTrack wordmark visible in the supplied app
  screenshots only where appropriate.

## Content Structure

### Header

- Title: `FITTRACK`
- Subtitle: `A Desktop Fitness Tracker Built with Object-Oriented Design`
- Course and institution: `VinUniversity | COMP1020`
- Team: `Tran, Hieu, Han, Khang, Minh`

### Column 1: Motivation And Product

- Problem: fitness data, training plans, and recovery reminders are often split
  across separate tools.
- Solution: FitTrack combines workout logging, workload calculations, health
  tracking, and recovery reminders in one desktop app.
- Feature summary: workout logging, recovery scheduling, BMI tracking, and
  progress visualization.
- Use the Dashboard screenshot as the primary visual proof.

### Column 2: Architecture And OOP Design

- Present an editable four-layer diagram:
  `Presentation -> Service -> Model -> Data`.
- Architecture labels:
  - Presentation: JavaFX FXML Views, Controllers
  - Service: FitnessTrackerService
  - Model: User, WorkoutSession, BodyPart, Exercise, SetRecord,
    ReminderService, ProgressTracker, HealthMetrics
  - Data: SQLiteRepository, fittrack.db
- Do not mention Firestore.
- Present an editable composition path:
  `User -> WorkoutSession -> BodyPart -> Exercise -> SetRecord`.
- Highlight polymorphism through the three SetRecord specializations:
  Strength, Cardio, and Endurance.
- Use the Workout Builder screenshot as supporting visual proof.

### Column 3: Analytics, Data Structures, And Verification

- Present concise workload formulas:
  - Strength: `reps x weight`
  - Cardio: `duration x distance`
  - Endurance: `(duration x heart rate) / 10`
- Present analytics:
  - BMI calculation
  - Sliding-window moving average for progress trends
- Data structures:
  - ArrayList for workout entries
  - LinkedHashMap for ordered history
  - TreeMap for chronological summaries
  - PriorityQueue for recovery reminders
- Do not mention insertion sort.
- Testing summary:
  - Validate non-positive or malformed inputs
  - Verify workload, BMI, and trend calculations
  - Confirm stable SQLite operations
- Use the Progress Analytics screenshot as supporting visual proof.

### Footer

- Challenges: keeping the UI responsive, mapping polymorphic records, and
  maintaining consistent local data.
- Future work: automatic local backup, richer health metrics, and predictive
  progress insights.
- Keep this section compact.

## Supplied Assets

- `/Users/khangngo/Documents/Screenshot/Screenshot 2026-05-30 at 22.18.39.png`
- `/Users/khangngo/Documents/Screenshot/Screenshot 2026-05-30 at 22.18.52.png`
- `/Users/khangngo/Documents/Screenshot/Screenshot 2026-05-30 at 22.19.03.png`

## Quality Checks

- Render the PowerPoint and inspect the full poster at thumbnail and readable
  sizes.
- Check that no text is clipped or too small for an A2 print.
- Confirm screenshots retain their aspect ratios.
- Confirm diagrams and text remain editable in the PPTX.
- Export a PDF and render it for final visual review.
