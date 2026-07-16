# Design QA — 2026-07-16

- source visual truth: `docs/design-audit-2026-07-16/06-integrated-target.png`
- implementation screenshot: `artifacts/design-qa/06-result-pass2-390x844.png`
- combined comparison: `artifacts/design-qa/05-result-comparison.png`
- viewport: 390 × 844
- state: completed three-round result screen, dark theme, dynamic score content
- responsive evidence: `artifacts/design-qa/07-result-320x568.png`, `artifacts/design-qa/08-title-320x568.png`

## Full-view comparison evidence

The source and implementation were placed in one 800 × 844 comparison image. The implementation preserves the source hierarchy: compact result header, score and title, large trajectory field, inline error readout, three-round summary, yellow replay CTA, cyan challenge CTA, and supporting challenge copy. Dynamic score, title, path, and error values intentionally differ from the static mock.

## Focused region comparison evidence

No additional cropped comparison was required. The full-height 390 × 844 comparison renders the score typography, trajectory marks, error label, round values, and both CTA labels at readable size. The title and play states were captured separately because those states are not represented by the result-screen source mock.

## Comparison history

### Pass 1 — blocked

- [P2] Result composition underfilled the viewport.
  - Evidence: `artifacts/design-qa/04-result-390x844.png` ended the primary composition too high and rendered the score, trajectory field, and CTAs smaller than the integrated target.
  - Fix: increased result score scale, title scale, trajectory field from 330px to 350px, result spacing, and both CTA heights in `src/styles.css`.
- [P2] Programmatic Canvas focus used a white outline that competed with the yellow answer state.
  - Evidence: `artifacts/design-qa/02-play-390x844.png` showed white, yellow, and cyan borders with equal visual weight.
  - Fix: changed the focus indicator to a restrained cyan 2px outline while keeping it keyboard-visible.

### Pass 2 — passed

- Evidence: `artifacts/design-qa/06-result-pass2-390x844.png` and the combined comparison.
- Result: the primary composition now fills the viewport with the intended hierarchy; no actionable P0, P1, or P2 visual differences remain.

## Required fidelity surfaces

### Fonts and typography

- `Noto Sans JP Variable` is locally bundled for Japanese UI and `Roboto Mono Variable` for scores and measurements.
- Browser checks confirmed both fonts loaded.
- Japanese heading tracking was reduced; supporting labels remain at 12px or larger.
- Score and title hierarchy match the target intent across two- and three-digit dynamic values.

### Spacing and layout rhythm

- 390 × 844 result composition fills the usable screen without clipping or horizontal overflow.
- 320 × 568 title and result screens fit with both primary actions visible.
- Round summary, CTA spacing, and field proportions preserve the target grouping.

### Colors and visual tokens

- Near-black navy is the sole base surface.
- Cyan is reserved for measurement structure and secondary action; coral for ball/path/error; yellow for the primary action, answer state, and best status.
- Decorative scanline noise and excess glow were removed.

### Image quality and asset fidelity

- The game field is a resolution-aware Canvas at up to 2× device pixel ratio.
- No placeholder raster assets, custom inline SVGs, emoji, or decorative CSS illustrations were introduced.
- Icons use the consistent Phosphor icon family.

### Copy and content

- Primary actions are `もう一度プレイ` and `挑戦状を送る`.
- Supporting copy explains `同じ軌道を送れます`.
- Image save and link copy remain available under the lower-priority `保存・リンク` disclosure.

### States and interactions

- Title demo, normal timed game, unlimited `じっくりモード`, keyboard crosshair, staged reveal, automatic timeout, three-round completion, and replay were exercised.
- Browser console warnings and errors: none.
- Native Web Share / X intent was not launched during browser QA to avoid an external side effect; the existing share unit tests passed.

### Accessibility and responsiveness

- Answer Canvas supports pointer, Arrow keys, and Enter.
- Focus indicators remain visible.
- Phase changes are exposed through a live status region.
- Result Canvas has a descriptive image label containing round, score, and error.
- Reduced-motion disables decorative transition, shake, intro loop, and reveal staging while preserving essential ball motion.
- 320 × 568 and 390 × 844 both reported `scrollWidth === clientWidth`.

## Follow-up polish

- [P3] The source mock contains more decorative corner ticks than the implementation. Their omission is intentional to preserve the audit goal of reducing visual noise.
- [P3] Native share-sheet appearance varies by platform and is outside CSS fidelity control.

## Final result

final result: passed
