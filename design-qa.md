# Design QA

## Comparison target

- Source visual truth: `/Users/zeljkamikulcic/Desktop/Screenshot 2026-10-04 at 14.18.07.png`
- Source visual truth: `/Users/zeljkamikulcic/Desktop/Screenshot 2026-10-04 at 14.17.13.png`
- Implementation: `http://127.0.0.1:4173/`
- Implementation screenshot path: inline in-app Browser captures; the browser backend did not expose a filesystem path
- State: homepage newsletter, footer and long editorial headings

## Viewports and normalization

- Desktop source: 1188 × 1126 pixels. Implementation captured at a 1188 × 1126 CSS viewport, device scale managed by the in-app Browser.
- Narrow mobile source: 218 × 494 pixels. Implementation tested with the browser's minimum effective 240-pixel CSS viewport and the same narrow mobile state.
- Standard mobile implementation: 390 × 844 CSS viewport.
- No density resampling was required. Comparisons used matching viewport width wherever the browser supported it.

## Full-view comparison evidence

- The source desktop capture showed the newsletter title colliding with the form column and footer content running beyond the right edge.
- The revised desktop capture shows the newsletter as one clear column below 1240 pixels, with the form capped at a readable width and the footer metadata moved to its own row.
- The source narrow capture showed large editorial headings clipped by both viewport edges.
- The revised narrow capture shows the complete heading “Lijep je dobar početak. Ali nije dovoljan.” inside the panel with stable side padding.
- Measured document width equals viewport width at 1188, 390 and the browser's 240-pixel minimum. No horizontal page overflow remains.

## Focused region evidence

- Newsletter: title, paragraph, email field, consent text and submit button are fully contained at desktop and mobile widths.
- Footer: brand, company data, legal link, studio credit and copyright remain inside the viewport and wrap intentionally.
- Long headings: typography scales down only below 360 pixels; normal mobile and desktop hierarchy is preserved.

## Required fidelity surfaces

- Fonts and typography: existing Helvetica stack, weights and uppercase editorial hierarchy are preserved. Only responsive sizing, line height and balancing changed.
- Spacing and layout rhythm: existing panel padding and section rhythm are preserved; new tablet and narrow-phone guardrails prevent collisions.
- Colors and visual tokens: unchanged.
- Image quality and asset fidelity: unchanged; existing photography and brand assets remain intact.
- Copy and content: unchanged. No em dash characters or em dash entities are present in HTML, CSS or JavaScript.

## Findings

- No actionable P0, P1 or P2 issues remain in the reported regions.
- P3: the very narrow 240-pixel view is an edge case and intentionally uses tighter headline typography than a normal phone.

## Comparison history

1. Earlier P1: desktop newsletter used two columns at 1188 pixels, causing visible title and form collision. Fix: switch the newsletter to one column below 1240 pixels and cap form content width. Post-fix evidence: 1188-pixel Browser capture with no overlap and `scrollWidth === viewport`.
2. Earlier P1: long headings used a 40-pixel minimum on a roughly 218-pixel viewport and were clipped. Fix: add a below-360-pixel type scale and reduce panel padding. Post-fix evidence: narrow Browser capture with the full services heading visible and no horizontal document overflow.
3. Earlier P2: footer metadata competed for one desktop row at intermediate widths. Fix: move metadata to a separate row below 1240 pixels and allow long links to wrap on narrow screens. Post-fix evidence: footer content remains within the 1188- and 390-pixel captures.

## Interaction and technical checks

- Primary links and form controls remained present and accessible in the browser tree.
- Console warnings and errors checked: none.
- Horizontal overflow checked at the reported breakpoints: none.

## Implementation checklist

- [x] Prevent intermediate-width newsletter collisions.
- [x] Prevent clipping of long headings on very narrow screens.
- [x] Stabilize footer wrapping at tablet and narrow-phone widths.
- [x] Preserve the existing layout, photography, copy and brand styling.
- [x] Confirm the site contains no em dashes.

final result: passed
