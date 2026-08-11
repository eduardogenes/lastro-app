# Handoff: Instrumento — nutrition app + design system

## Overview
A mobile nutrition app ("Plano Eduardo") built from a personalised nutrition PDF, and the design system extracted from it. The intent is to **merge this app with an existing training-focused app** so that one product covers both halves of the athlete's day — keeping this system's visual language and interaction model as the shared foundation.

The app itself: a day-driven nutrition tool. It knows what type of training day it is, shows the next meal with a live countdown, lets every part of the plan be edited (foods, quantities, meals, schedule), derives the shopping list from the plan, and applies the plan's own weight-progression rules to recommend a calorie adjustment.

## About the design files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behaviour, not production code to copy. The task is to **recreate them in the target codebase's environment** (React Native, SwiftUI, React, whatever the training app uses) with that codebase's patterns and libraries. If no environment exists yet, pick the appropriate framework and implement there.

`DESIGN_SYSTEM.md` and `tokens.css` are the exception: they are meant to be adopted directly. `tokens.css` can be dropped into a web codebase as-is, or transcribed into the platform's theme format.

## Fidelity
**High fidelity.** Colours, typography, spacing, component anatomy and interaction states are final and exact. Recreate them precisely — the values in `DESIGN_SYSTEM.md` are authoritative, and the HTML is the reference implementation.

## Screens

### HOJE — the primary screen
**Purpose:** answer "what do I do now?" then "how is the day going?" then "what's left?"
**Layout:** single column, 20px gutters, sections separated by 1px rules.
1. Header — weekday/date eyebrow + "Hoje" (30px) + right-aligned day-type button (opens the day-type sheet).
2. Focus card — pulsing dot + `AGORA · HH:MM`, next meal name (34px) with a live countdown (34px mono) on the right, one-line contents summary, acid CTA chip. Whole block is one tap target → opens the meal sheet.
3. Energy block — 52px mono kcal registered, 3px progress rail, 3-cell hairline grid (protein / carbs / fat, each "done/target"), and a mono state line naming the current adjustment and rice quantity.
4. Timeline — one row per meal (see DESIGN_SYSTEM 3.6). Checkbox marks it done; body opens the sheet; `···` opens the meal editor.
5. `+ ADICIONAR REFEIÇÃO` (dashed).
6. Water — 14 tick cells at 250 ml each.

### ALIMENTOS — the food library
Search field, `+ CADASTRAR ALIMENTO`, then foods grouped by shopping category, each showing kcal and macros per 100 g/ml. Tap to edit. Custom foods are shown in acid. Below: a cooked→raw converter (chips + stepper), the PDF's alternative meals, and the "eating out" rule.

### COMPRAS — derived shopping list
Not a stored list. It sums every meal across the 7 days of the training calendar, multiplies by the horizon (7/14/30 days), and converts cooked quantities to raw where a factor exists — each converted row shows its provenance ("cru · 3,4 kg prontos"). Check off, remove rows, add free-text items. Below: the prep sequence.

### DADOS — measurement and the rule engine
Weight stepper + `REGISTRAR HOJE` + 14-slot sparkline; weekly average and trend cells; two signal toggles (performance rising / visual fat rising); the **verdict card** running the plan's rule (subir +150 / manter / reduzir −150 / observar / coletando) with a one-tap apply that rewrites rice quantities across the plan; waist; photo cadence; the written rules.

### GUIA — reference
Phase goal and profile, live totals per day type (computed from the current plan, with the PDF's originals quoted underneath), the tappable weekly training calendar, around-training guidance, supplements, scientific basis, and the two reset actions (clear today / restore the original plan).

### Sheets
Meal sheet (metrics, "só de hoje" portion slider, editable item rows, add food, mark done) → food picker (searchable, category-ordered) → food editor (name, category, unit, macros per 100, raw factor) · meal editor (name, time, tag, when it appears, note, duplicate, remove) · day-type sheet.

## Interactions & behaviour
- **Live clock**: 1s interval drives the countdown and the "agora" label.
- **Day type**: derived from the weekday via the 7-entry calendar map; overridable for today; the override expires when the date changes.
- **Editing**: no edit mode. `···` opens a container's editor; tapping a leaf row expands it in place with stepper / trocar / remover / condition toggles.
- **Scope**: item and meal edits change the plan permanently (all days). The portion slider is explicitly "só de hoje" and resets with the date.
- **Derivation**: changing a food's macros, a quantity, a meal, or the calendar immediately recomputes day totals, per-day-type totals, and the shopping list.
- **Persistence**: every mutation writes to `localStorage` under one key. Daily state (`done`, `agua`, `escala`, day-type override) is namespaced by date and resets on a new day; plan, foods, calendar, measurements and shopping state persist.
- **Transitions**: only the tab indicator (220ms). Sheets appear without animation.

## State
```
screen, now
plano[]                      // meals with items → food ids
foodsCustom{}, foodsHidden{} // overrides on the built-in library
mapa[7]                      // weekday → A-F | descanso
dia, done{}, agua, escala{}  // today only, date-stamped
ajuste (-1|0|1), perf, gord  // rule inputs/outputs
pesos[], cinturas[], fotoData
comprado{}, extras[], compraRemovida{}, dias
sheet, itemAberto, picker, fEditor, mEditor, tipoAberto  // ephemeral UI
```
No network. No auth. Local only.

## Design tokens
See `tokens.css` and `DESIGN_SYSTEM.md` §2. Summary: canvas `#0C0E0C`; four line values `#161A15 / #22271F / #2B302A / #3A4137`; five text levels `#F2F4EF / #D6DAD0 / #A8AFA1 / #7C8478 / #5E655A`; acid `#CBF35E`, amber `#FFC46B`, coral `#FF8A6B`; Space Grotesk + IBM Plex Mono; radius 0; 4-based spacing with a 20px page gutter.

## Merging with the training app
`DESIGN_SYSTEM.md` §5 is the important section: proposed tab structure, the component-for-component mapping (timeline row → exercise row, verdict card → progression rule, sheet stack → exercise picker), the state that must become a single source of truth (`dayType`, `performance`, `pesos`, `ajuste`), and what deliberately should not be carried over.

## Assets
None. No images, no icon fonts, no SVG illustrations. Fonts are Google Fonts: Space Grotesk (400/500/700) and IBM Plex Mono (400/500/600).

## Files
- `DESIGN_SYSTEM.md` — the system: non-negotiables, tokens, component anatomy, UX laws, merge plan.
- `tokens.css` — CSS variables and base classes.
- `Plano Eduardo.dc.html` — the working app (design reference).
- `Design System.dc.html` — visual specimen of the system.
- `support.js` — runtime required to open either HTML file locally.
