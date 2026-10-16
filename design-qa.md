# Visual and functional QA — Google Glass 1.4.3

final result: passed

Reviewed on 2026-10-16 using Chrome for Testing through native Chrome DevTools Protocol. The [detailed functional review](qa/translate-gmail-design-qa.md) links additional evidence and reproduction commands. No actionable P0/P1/P2 finding remains in the reviewed scope.

Version 1.4.1 additionally repairs installed-page interaction isolation; [reproduction and post-fix results](qa/installed-interaction-review.md). The component design is unchanged, so the reference comparisons below remain the visual baseline.

Version 1.4.2 fixes separately reproduced URL-only/native-value synchronization and denied-clipboard cases. The [state/clipboard review](qa/translate-state-review.md) includes the Google homepage comparison and [real ru→en result](qa/translate-live-ru-en.png). These are functional repairs; the design baseline is unchanged.

Version 1.4.3 fixes early text/language commands being lost during native initialization, reproduced directly on `translate.google.ru`. The [startup/domain review](qa/translate-startup-review.md) records the previous-version failure, delayed-controller regression and separate live `.ru` results. Its [real translation/Copy capture](qa/translate-live-ru-en-ru.png) was opened and visually checked. The component design remains unchanged.

## Source, implementation and normalization

- Translate visual truth: [supplied reference](qa/reference-translate.png), 1567 × 882 pixels. Implementation: [desktop capture](qa/translate-desktop.png), 1568 × 882 pixels, 1568 × 882 CSS viewport, device scale factor 1, Russian interface, dark theme, empty text. The reference is normalized horizontally to 1568 pixels for comparison.
- [Full comparison](qa/compare-translate-full.png), [header](qa/compare-translate-header.png), [translation panes](qa/compare-translate-panes.png) and [method cards](qa/compare-translate-methods.png) put reference and render in the same image. They were opened and visually reviewed after the final fixes.
- Gmail visual truth: the supplied Gmail design reference, retained privately at `.browser-profile/references/gmail-glass-reference.png` (1567 × 882). Implementation: anonymized native-layout fixtures at 1568 × 882, device scale factor 1, dark mode, including a scroll position of 410px. Focused comparisons contain only safe controls: [Compose](qa/compare-gmail-compose.png), [logo](qa/compare-gmail-logo.png) and [scrolled toolbar](qa/compare-gmail-toolbar.png). Crops are normalized to 150 × 60, 120 × 40 and 600 × 58 pixels respectively. The user's actual inbox capture is excluded from Git.

The neutral account icon is intentional for the isolated signed-out profile; installed pages use an observed real Google avatar when available. Side slogans were removed as requested. Native Gmail retains its configured inbox layout, and Translate's document/image/website workflows retain Google's layout and handlers.

## Comparison history and final findings

| Earlier finding | Fix | Post-fix evidence |
| --- | --- | --- |
| P1: Gmail toolbar and pseudo layers became white on scroll | Opaque scoped toolbar/wrapper/pseudo backgrounds | Scrolled screenshot, toolbar comparison and five scrolling checks |
| P2: Gmail logo received search-field styling | Semantic logo reset; search styling scoped to the actual search role | Logo comparison and exact supplied DOM fixture |
| P2: Compose gradient and native icon contrast differed | Sampled blue stops, white pencil, muted monochrome icons, preserved gold stars | Compose comparison, sampled colors and Gmail regressions |
| P2: Translate Earth position, pane brightness, placeholder spacing, method wrapping and icons drifted | Background offset, sampled panel token, normal letter spacing, explicit photo-label wrap, official icon variants | Final full/panes/method comparisons; `qa/translate-color-samples.json` |
| P2: Mobile language row scaled the viewport; light-mode method icons lacked contrast | Flexible language labels; pale-blue light-mode icon surfaces and blue icons | Final mobile/light screenshots; width 390px, scroll width ≤390px, scale 1 |
| P1: Native mode changes left text UI covering other controls, or failed to restore it | Follow Google's active mode and `aria-current` mutations; native mode handlers | Live tests and screenshots; return from all three modes remounts text UI |
| P2: Selected-language and rating actions appeared inactive; sharing depended on an OS sheet | Selected pill opens searchable list; current native rating target; reusable share-link copy | Trusted pointer tests, real clipboard reads, native rating/feedback flows |
| P2: Keyboard needed multi-key/cursor behavior; voice needed stop/error states | Current-text/caret refs, selection replacement, source-language layout, recognition lifecycle | Multi-key/delete/space/selection checks and controlled SpeechRecognition callbacks |

## Required fidelity surfaces

- **Fonts/typography:** bundled Inter, normal 400 control weights, measured 25px editor/result text, 20px methods heading, consistent line heights and photo-label wrapping. The official Google wordmark supplies the silver mask. The raster reference's softer antialiasing is a minor residual difference.
- **Spacing/layout:** workspace x=154, y=308, width=1260, height=235; editor surfaces, mode row, central swap, method row and footer follow the reference's rhythm. [Layout metrics](qa/translate-layout.json) record computed fonts and geometry. Mobile stacks panes without scaling or horizontal overflow.
- **Colors/tokens:** dark pane RGB at (160,330) is (20,25,30), reference (21,25,30). Compose's sampled gradient points differ by at most five RGB levels per channel. Dark/light/system modes and readable disabled controls were checked. Native upload/URL surfaces also receive readable colors.
- **Images/assets:** generated opaque Earth/star background, actual Google/Translate/Gemini marks, official Material Symbols and Tabler assets. No fabricated avatar. Individual stars and Earth texture are regenerated rather than pixel-identical; this decorative difference is accepted P3. [Asset sources and full prompts](qa/translate-asset-prompts.md).
- **Copy/content:** Russian/English labels, source/target languages, character limit and action feedback work. Removed slogans stay absent. Real translations come from Google's native engine; fixtures are labeled and never used as production translations.

## Verification and limits

All **115 regression checks**, **30 live `.com` checks** (6 engine, 15 controls, 9 root-page/comparison) and **24 `.ru` checks** (15 controls, 9 root-page/comparison) passed. `npm run check` passed. No runtime exceptions or React console errors were observed in the automated flows. Live rating and feedback workflows were opened without submitting anything. Clipboard permission is denied before the Copy/Share checks and read access is granted only after copying, to verify the result. A `.com` attempt stalled on Google's consent-save navigation; rerunning the suite passed. This external navigation failure is recorded in the startup review.

Primary flows: native translation and non-common language selection, trusted mouse/keyboard, real clipboard copy/share, swap, language popovers/Escape, keyboard selection replacement, voice lifecycle, settings, independent site switch, first paint, mobile, light mode, custom background persistence, provider changes, native file chooser/URL entry and return to text mode.

Speech callbacks were controlled in QA; physical microphone recognition was not recorded. Native file choosers and website entry were exercised, but Google document/image processing and third-party website translation were not exhaustively tested. Signed-in Gmail and eligible AI accounts are unavailable in the isolated profile; Gmail uses anonymized native fixtures. Google markup changes may require adapter updates. New Tab/local previews launch the official service for translation; the installed Translate website displays native results in place.

## Implementation checklist

- [x] Fix and compare Gmail toolbar, logo, Compose and icons.
- [x] Implement, recapture and compare Translate desktop, light and mobile states.
- [x] Verify translator actions, native mode transitions and accessibility restoration.
- [x] Preserve Google as the default homepage; add independent Translate switch/provider.
- [x] Update bilingual guides, README imagery, asset credits and test evidence.

Prior reviews: [Yandex](qa/yandex-design-qa.md), [sites](qa/sites-design-qa.md), [v2](qa/v2-design-qa.md), [homepage](qa/homepage-design-qa.md), and [results/selectors](qa/results-design-qa.md).
