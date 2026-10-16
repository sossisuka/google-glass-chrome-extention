# Translate and Gmail review — 1.4.0

final result: passed

The [root report](../design-qa.md) records the full reference comparison, iteration history, required fidelity surfaces and limits. Review date: 2026-10-16.

## Evidence

| State | Screenshot or comparison |
| --- | --- |
| Supplied Translate design | [Reference](reference-translate.png) |
| Dark desktop | [Full reference/render](compare-translate-full.png), [header](compare-translate-header.png), [panes](compare-translate-panes.png), [methods](compare-translate-methods.png) |
| Additional Translate states | [Mobile](translate-mobile.png), [light](translate-light.png), [settings](translate-settings.png) |
| Actual Google translation | [Hello → Привет](translate-live-result.png), [empty native integration](translate-live-empty.png) |
| Native workflows | [Documents](translate-live-docs.png), [images](translate-live-images.png), [website entry](translate-live-websites.png) |
| Gmail regression | [Top](gmail-scroll-top.png), [scrolled](gmail-scroll-dark.png) |
| Safe Gmail control comparisons | [Compose](compare-gmail-compose.png), [logo](compare-gmail-logo.png), [toolbar](compare-gmail-toolbar.png) |

## Functional behavior

The themed text surface sends input and language choices to Google's existing page and displays its actual result. Native document/image/website handlers remain available; active-mode observation handles transitions even when Google leaves the URL unchanged. Returning to Text restores the theme. Native text, accessibility attributes and page scroll state survive disabling the theme.

Selected language pills and arrows open 249 languages plus source autodetection. Quick choices, swap, clear and the 5,000-character limit work. The keyboard supports sequential keys, spaces, deletion and replacement of selected text, using Cyrillic for Russian sources and Latin otherwise. Speech supports start/stop, transcript input and visible unsupported/permission-error states. Copy writes the actual result; Share copies a Google Translate URL with encoded text and languages. Rating and feedback open Google's own controls without silently submitting anything.

On extension New Tab and the local preview, Translate/Ctrl/Cmd+Enter opens the official service with the chosen languages and text. No unofficial translation endpoint or fabricated fallback is used. Google remains the default New Tab provider and existing preferences remain intact. The Translate site theme starts enabled. Shared settings supply dark/light/system mode and local custom backgrounds.

Gmail keeps its native inbox layout. The sticky toolbar and background layers remain opaque and dark. The supplied logo container has no capsule/border/shadow. Compose uses the sampled bright upper-left blue to dark lower-right gradient with a light pencil. Monochrome icons are visible; gold stars keep their color.

## Results

- `npm test`: 99 checks across nine suites, passed.
- [Translate deterministic results](translate-test-results.json): 10 checks, passed; [layout](translate-layout.json), [first paint](translate-first-paint.json).
- [Live translation results](translate-live-results.json): 6 checks, passed against current public Google Translate in an isolated signed-out profile.
- [Translator control results](translate-controls-results.json): 13 checks, passed, including trusted mouse/keyboard, clipboard, native modes and return navigation. Speech uses controlled API callbacks rather than recorded audio.
- [Gmail scroll results](gmail-scroll-test-results.json): 5 checks, passed, including light-mode/site-disable restoration.
- `npm run check`: Manifest V3, resources, syntax and CSP checks passed. Production dependency audit: zero vulnerabilities.

No actionable P0/P1/P2 difference remains in the reviewed scope. Accepted P3 differences are regenerated Earth/star texture, minor antialiasing and gradient interpolation. Signed-out avatars and removed slogans are intentional. Fixtures do not establish fidelity for every live Gmail layout. The private inbox and full Gmail reference are excluded from the public repository; Gmail comparisons show controls only.

## Reproduce

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd test
npm.cmd run test:translate-live
node scripts/translate-visual-qa.mjs
node scripts/gmail-scroll-visual-qa.mjs
```

The Gmail comparison generator needs the supplied image privately retained at `.browser-profile/references/gmail-glass-reference.png`; the checked-in safe comparisons remain inspectable without it. Set `CHROME_BINARY` if necessary. Live checks require network access and Google's current public interface. They do not submit feedback, ratings or private files. Native file processing, physical microphone input and signed-in Gmail remain the test limits documented in the root report.
