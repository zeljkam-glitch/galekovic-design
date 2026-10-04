# Design QA

## Comparison target

- Source visual truth path: `/Users/zeljkamikulcic/Desktop/Screenshot 2026-10-04 at 14.25.29.png`
- Implementation: `http://127.0.0.1:4173/savjeti/namjestaj-po-mjeri-ili-gotovi/`
- Implementation screenshot path: inline in-app Browser capture; the browser backend did not expose a filesystem path
- State: collapsed article FAQ on a narrow mobile viewport

## Viewport and normalization

- Source pixels: 232 × 432.
- Implementation CSS viewport requested: 232 × 432; browser minimum effective viewport: 240 × 432.
- Implementation document width: 240 pixels with no horizontal overflow.
- Density normalization: no resampling; the comparison uses the closest supported CSS viewport and the same collapsed FAQ state.

## Full-view comparison evidence

- The source showed native triangular disclosure markers and a compressed heading rhythm where the caron above Č visually collided with the row above.
- The revised capture shows the diagonal slash before each FAQ question and clear vertical space above “Česta pitanja”.
- The revised narrow layout preserves the existing type family, weights, borders, palette and content hierarchy.

## Focused region comparison evidence

- FAQ heading: computed line height is 34.16 pixels at the effective 240-pixel viewport; the Č caron has visible clearance.
- FAQ summaries: computed native list style is `none`; the custom `::before` content is `/`.
- The same slash treatment already used by the homepage FAQ is now shared by article FAQs.

## Required fidelity surfaces

- Fonts and typography: original Helvetica stack, sizes and weights retained; display line heights increased to protect Croatian diacritics.
- Spacing and layout rhythm: only vertical line rhythm changed; section spacing and borders remain unchanged.
- Colors and visual tokens: unchanged.
- Image quality and asset fidelity: unchanged; no assets were added or replaced.
- Copy and content: unchanged; the slash is presentation only.

## Findings

- No actionable P0, P1 or P2 issues remain in the reported region.
- No remaining native disclosure triangles were found in the current summary components.

## Comparison history

1. Earlier P1: article FAQ used the browser's native triangle marker. Fix: suppress native markers and add the brand slash through the article FAQ summary style. Post-fix evidence: narrow Browser capture and computed `list-style: none`, with `::before` equal to `/`.
2. Earlier P2: tight display line heights left insufficient clearance for Č, Š and Ž in stacked headings. Fix: add diacritic-safe line heights to main and inner-page display heading groups. Post-fix evidence: narrow article capture and homepage mobile capture show clear separation between lines.
3. Earlier P2: inner-page CSS could remain cached because the stylesheet URL had no version. Fix: version the `inner.css` reference on all inner pages. Post-fix evidence: the browser loaded `inner.css?v=20261004-2` and applied the new marker and line-height rules.

## Interaction and technical checks

- FAQ items remain native `<details>` controls and keep their expand/collapse behavior.
- Responsive layout checked at effective 240-pixel and 390-pixel widths.
- Horizontal overflow: none at 390 pixels; narrow page remains limited only by the browser's supported minimum width.
- Browser console errors checked: none observed during the visual pass.

## Implementation checklist

- [x] Replace article FAQ disclosure triangles with `/`.
- [x] Prevent native disclosure markers across supported browsers.
- [x] Increase display heading line height for Croatian diacritics.
- [x] Version inner-page CSS references so the fix appears immediately after deployment.
- [x] Preserve existing copy, assets, colors and interactions.

final result: passed
