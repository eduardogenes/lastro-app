# INSTRUMENTO — Design System

Version 1.0 · extracted from the Plano Nutricional app · authored for reuse in the training app.

An instrument panel, not a wellness app. The screen is a dark reading surface; the data is set in monospace; the structure is drawn with hairlines instead of cards; and exactly one acid-green accent tells you what is live, what is done, and what to press. It reads as precise rather than motivational, and it never celebrates.

---

## 1. Non-negotiables

These six rules are what make a new screen look like it belongs. If a screen breaks one, it is off-system.

1. **Zero radius.** Everything is square. The only round things in the entire product are status dots, the slider thumb, and the home indicator.
2. **Numbers in mono, prose in display.** IBM Plex Mono carries every quantity, time, weight, macro, count and countdown. Space Grotesk carries every name, sentence and heading. Never mix inside one string — "250 g arroz" is mono only when it is data in a value column; in a prose sentence the whole sentence is display.
3. **Hairlines, not cards.** Structure comes from 1px rules and 1px grid gaps on a flat canvas. A bordered box is reserved for a genuinely detached object (a verdict, a form, a summary block). Never a shadow. Never a fill to "group" things.
4. **One accent, and it means something.** Acid `#CBF35E` = now / done / yours / press this. Amber `#FFC46B` = pay attention. Coral `#FF8A6B` = destroys data. Everything else is greyscale. At most one acid element competing per region of the viewport.
5. **Uppercase mono labels are structural.** A 10px tracked label always introduces a section or names a value. It is never used for emphasis or flavour.
6. **Almost no motion.** There are two animations in the whole product: the live dot pulse (2.4s) and the tab indicator slide (220ms). No entrance animations, no fades, no skeletons that shimmer, no springy sheets.

---

## 2. Tokens

Use `tokens.css`. Summary:

### Surfaces
| Token | Hex | Use |
|---|---|---|
| `--ins-canvas` | `#0C0E0C` | Page background, sheet background, hairline-grid cells |
| `--ins-surface-low` | `#0F120F` | Option rows inside a sheet |
| `--ins-surface` | `#111411` | Inputs, badges, raised option |
| `--ins-surface-acid` | `#161B12` | Selected day / current row |
| `--ins-surface-acid2` | `#1C2416` | Active micro-toggle |
| `--ins-surface-warn` | `#101408` | Verdict card |

### Lines — there are exactly four, and the choice is semantic
| Token | Hex | Means |
|---|---|---|
| `--ins-hairline` | `#161A15` | Between rows *inside* one list |
| `--ins-rule` | `#22271F` | Between sections; the 1px gap in a hairline grid |
| `--ins-border` | `#2B302A` | Resting border (input, inactive chip) |
| `--ins-border-strong` | `#3A4137` | Interactive border (stepper, secondary button) |

### Text — five levels, no more
`#F2F4EF` primary · `#D6DAD0` body inside cards · `#A8AFA1` supporting sentence · `#7C8478` labels and mono meta · `#5E655A` hints, provenance, inactive tabs.

### Signal
`#CBF35E` acid · `#E4FF9B` link hover · `#FFC46B` amber · `#FF8A6B` coral · text on any acid fill is always `#0C0E0C`.

### Spacing
4-based. Only these steps appear: 4, 6, 8, 10, 12, 14, 16, 20, 24, 26, 34.
Page gutter **20px**. Between sections **24–26px**. List row vertical padding **13–16px**. Gap between sibling controls **6–8px**. Always `gap`, never margins between siblings.

### Type scale
| Role | Font | Size / weight / tracking | Used for |
|---|---|---|---|
| metric-xl | mono | 52 / 600 / −.05em | The one number the screen is about |
| metric-l | mono | 34–38 / 500–600 / −.04em | Countdown, current weight |
| metric-m | mono | 22–26 / 600 / −.03em | Metric grid cells |
| metric-s | mono | 19 / 600 / −.03em | Sheet metric cells |
| headline | display | 34 / 700 / −.035em | The focus object's name |
| display | display | 30 / 700 / −.03em | Screen title |
| title | display | 24 / 700 / −.03em | Sheet title |
| subtitle | display | 17 / 500 / −.01em | Row name, card lead |
| body | display | 15 / 400 / 1.4 | Item names |
| body-sm | display | 14 / 400 / 1.5 | Prose |
| body-xs | display | 13 / 400 / 1.5 | Helper prose |
| label | mono | 10 / .18em / upper | Section eyebrow |
| label-sm | mono | 9 / .16em / upper | Micro label in a grid cell |
| data | mono | 11–15 | Quantities, times, values |
| provenance | mono | 10 / .06em | "cru · 3,4 kg prontos" |

**Minimum sizes:** never below 9px for a mono label, never below 13px for prose, never below 15px for a tappable item name.

---

## 3. Components

Anatomy of each. Sizes are exact.

### 3.1 Screen header
Eyebrow (label, uppercase, e.g. `SEXTA-FEIRA, 10 DE AGOSTO`) → 6px → display title (30px). Optionally a right-aligned **state button**: 1px `--ins-border`, `--ins-surface` fill, 8×10px padding, label-sm on top + 15px acid mono value below. Padding-top `14px + safe-area`.

### 3.2 Section rule
`border-top: 1px var(--ins-rule)` + 13–14px padding-top + a label. This is how every section starts. A second, right-aligned 10px `--ins-text-5` line can carry a count or a hint ("toque em ··· para editar").

### 3.3 Focus card — the signature component
Answers "what now?" It is the first thing on the primary screen and it is a single tap target.
- Live dot (7px, pulsing) + `AGORA · 06:42` label
- Row: left = acid label + 34px headline; right = 34px mono countdown + 9px label under it
- 14px → one-line summary in `--ins-text-3`, 14px, `text-wrap: pretty`
- 12px → acid chip CTA
No border, no fill. It floats on the canvas and is separated only by the rules above and below.

### 3.4 Hero metric
Label row (label left, meta right) → 52px mono number + 12px unit baseline-aligned → 14px → 3px progress rail (`--ins-rule` track, acid fill) → 16px → metric grid.

### 3.5 Metric grid
`.ins-hairgrid` with 2, 3 or 4 columns. Each cell: label-sm → 5px → metric-m. Cells after the first get 10–12px left padding so the numbers optically align to their own column.

### 3.6 Timeline row
The spine of any sequenced day (meals; **reuse for exercises**).
```
[ 46px time gutter, right-aligned mono 12px ][ 1px spine + 9px dot ][ content, flex:1 ][ 30px ··· ]
```
Dot at 20px from top, offset −4px onto the spine. Content: 26px checkbox + name/value row + summary line (13px, `--ins-text-4`) + macro line (10px mono, `--ins-text-5`). Bottom border `--ins-hairline`. Done state: name and dot drop to `--ins-text-5`, checkbox fills acid.

### 3.7 Checkbox
26×26, 1px `--ins-border-strong`, square. Checked: acid fill, `✓` in `--ins-on-acid` at 13px mono. No animation.

### 3.8 Bottom sheet
The only modal pattern. `max-height: 92dvh`, top border **1px acid** (this is what says "modal" — not a shadow), background `--ins-canvas`, scrim `rgba(6,8,6,.72)`, 20px side padding, bottom padding `24px + safe-area`. Sticky header (canvas background, 1px rule bottom): eyebrow + 24px title + mono time, with 40×40 `···` and `×` buttons on the right. Primary action is the **last** element, full width. Tapping the scrim closes.
Sheets stack: meal sheet (z 50) → picker (z 70) → editor (z 80). Never more than three.

### 3.9 Expandable edit row
Tap a row → it expands in place with a bordered 14px block containing: stepper (46px − / value / +), then a 2-button row (secondary + destructive), then optional micro-toggles (11px padding, 9px mono). **There is no edit mode.** Editing affordances live where the object is.

### 3.10 Chips / segmented
Padding 9–12px, 1px `--ins-border`, mono 10–12px, .08–.1em tracking. Active = acid fill + `--ins-on-acid` text. Laid out with `display:flex; gap:6px`, wrapping.

### 3.11 Tab bar
Fixed, canvas background, 1px `--ins-rule` top. 5 tabs, `flex:1`, mono 9.5px .1em uppercase, active acid / inactive `--ins-text-5`. A 2px acid indicator sits on the top edge at `left: (index × 20%)`, width 20%, transitioning 220ms. Bottom padding `env(safe-area-inset-bottom)`.

### 3.12 Verdict card
For a computed recommendation. 1px **acid** border, `--ins-surface-warn` fill, 18/16px padding: label → 28px display verdict in the signal colour → 14px explanation → optional acid primary button → 10px mono state line.

### 3.13 Ticks
A quantity you tap up and down (water). `flex` row of N cells, `gap:4px`, each 34px tall, 1px `--ins-border`, filled acid when reached. Tapping the currently-last filled cell removes it. Under it, a 10px mono row: unit per tap ↔ target.

### 3.14 Bar sparkline
14 slots, `gap:3px`, 56px tall, track `--ins-rule`, bar acid, minimum bar height 6%. Empty slots stay as tracks — the gaps in your logging are visible on purpose.

---

## 4. UX laws

The interaction model matters as much as the paint. These carried the nutrition app and should carry the training app.

1. **Answer "what now?" before "what is".** The top of every primary screen is the next action with a live countdown, not a summary. Summaries come after.
2. **Present tense, real clock.** A ticking countdown and a pulsing dot are the only ambient motion; they exist to make the screen feel current.
3. **No edit mode.** Every object carries its own edit affordance (`···` for the container, tap-to-expand for the leaf). Nothing is read-only "until you unlock it".
4. **Destructive one level in.** Remove/delete never appears in a list. It lives inside the expanded row or the editor sheet, in coral, below the constructive options.
5. **Never type the same fact twice.** Anything derivable is derived — the shopping list is computed from the plan × the week's calendar; day totals are computed from the food library. Where a number is derived, a 10px mono provenance line says how ("cru · 3,4 kg prontos").
6. **Edits are permanent, adjustments are temporary — and the UI says which.** Changing an item changes the plan for every day. The porção slider is labelled "só de hoje". This distinction is stated in the label, not learned.
7. **Every global change is reversible.** There is always one documented restore ("restaurar plano original").
8. **Persist silently.** State is written on every mutation; there are no save buttons outside of editor sheets. Reopening lands you exactly where you were.
9. **Scope by rule, not by duplication.** One plan with per-object conditions ("aparece em: todo dia / só treino / só alta") instead of separate plans per day type. The same idea should give the training app one program with per-exercise conditions rather than seven day-screens.
10. **Empty states are one sentence.** No illustrations, no mascots. "Nenhuma medida registrada ainda."
11. **Touch discipline.** 44–46px for any control you press repeatedly (steppers, primary buttons). 26–30px only for a single-tap toggle inside a dense row.
12. **Portuguese, second person, no hype.** Short imperatives ("Registre 4–7 manhãs por semana"). Never exclamation marks, never "parabéns", never emoji.

---

## 5. Merging with the training app

The nutrition app is one half of a two-half product. The system was built expecting this.

### Shell
Keep **one** tab bar and one canvas. Do not nest a second navigation. Proposed 5 tabs:

`HOJE · TREINO · COMIDA · DADOS · GUIA`

- **HOJE** — the unified day: the next thing, whether it is a set or a meal, on one timeline. This is the strongest argument for merging: the pre-workout meal at 05:45 and the session at 06:15 are the same sequence.
- **TREINO** — the program: A–F sessions, exercises, load/rep/RIR history.
- **COMIDA** — food library + plan editing (today's ALIMENTOS tab).
- **DADOS** — weight, waist, photos, and now also volume/load progression. The verdict rule already reads a `performance` boolean; the training app should **write** it instead of the user toggling it.
- **GUIA** — the reference layer for both halves.

Compras becomes a section inside COMIDA, or a sheet off it.

### Direct component reuse
| Nutrition | Training |
|---|---|
| Timeline row | Exercise row in a session (time gutter → set number or target) |
| Metric grid | Load / reps / RIR / volume cells |
| Expandable edit row + stepper | Log a set: weight ± 2.5, reps ± 1 |
| Verdict card | Progression rule: add load, hold, deload |
| Bar sparkline | Volume or e1RM per week |
| Ticks | Sets completed in an exercise |
| Bottom sheet stack | Exercise detail → exercise picker → exercise editor (identical to meal → food picker → food editor) |
| Day-type sheet | Session picker (A–F, descanso) — **already shared state**, see below |

### Shared state (the real integration)
These already exist in the nutrition app and must become one source of truth:

- `dayType` (`A`–`F` | `descanso`) — the nutrition app derives calories from it; the training app derives the session from it. **One value, one editor.** The weekly map (`mapa`, 7 entries) is the schedule for both.
- `performance: boolean` — currently a manual toggle in DADOS feeding the calorie rule. Once the training app logs loads, compute it (e.g. estimated 1RM trending up over two weeks) and keep the toggle as an override.
- `pesos[]` — weight history drives both the calorie verdict and any strength-relative metric.
- `ajuste: -1 | 0 | 1` — the ±150 kcal state. The training app should read it (a cut week is not the week to push a PR).

### Data model already in place
```
foods:  { id, n, cat, u:'g'|'ml', kcal, p, c, g, cru }   // per 100 u
plan:   [ { id, t:'HH:MM', n, tag, quando:'sempre'|'treino'|'alta', nota,
            itens: [ { f: foodId, q, arroz?, alta? } ] } ]
day:    { data, code, done{}, agua, escala{} }            // resets daily
```
Mirror it for training: `exercises` (library) + `program` (sessions with per-exercise conditions) + `session` (today's log). Same shape, same editing affordances, same persistence rule.

### What NOT to bring
No charts with axes and legends — the sparkline is the chart. No cards with shadows. No coloured category system (a second accent will break rule 4). No streaks, badges, or congratulation states.

---

## 6. Files

- `tokens.css` — the variables and base classes.
- `Plano Eduardo.dc.html` — the working nutrition app (design reference).
- `Design System.dc.html` — the visual specimen: palette, type, every component rendered live.
- `support.js` — runtime needed to open the two HTML files locally.
