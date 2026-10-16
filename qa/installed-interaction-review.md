# Installed-page interaction repair — 1.4.1

final result: passed

This records the 1.4.1 body-isolation repair. The later [1.4.2 state/clipboard review](translate-state-review.md) covers the separately reproduced URL-only updates and Copy denial, with live comparison against the Google homepage.

The user reported that the local preview worked while controls on real sites, including `https://translate.google.com/`, did not. A clean isolated Chrome profile accepted ordinary clicks, so this does not establish the exact state of the user's existing browser tab. Investigation identified a shared structural weakness: custom homepage hosts were children of the native page body, exposing them to its capture handlers, inherited pointer/disabled states and native body controllers.

## Reproduction and fix

On the actual public Translate root URL, the regression test makes the native body inert and adds capture listeners for pointer, mouse and keyboard events. With the previous placement, a trusted mouse click on the apps button failed to open its menu. With the custom host mounted as a sibling of the body under `document.documentElement`, the same interaction passes. No native handlers are removed or monkeypatched by the extension.

The same host-placement correction applies to Google and Yandex homepages. Shadow DOM, visual components, native translation handlers, saved preferences and restoration behavior are retained. The extension version and control-panel badge are **1.4.1** so the installed revision can be confirmed.

## Verification

- **101 regression checks passed.** Google and Yandex fixtures now exercise trusted pointer/keyboard input while their native body is inert and intercepts events.
- **25 separate translator checks passed:** 6 live engine checks, 13 control checks and 6 installed root-page checks. [Installed results](translate-installed-results.json), [live results](translate-live-results.json), [control results](translate-controls-results.json).
- Installed-root checks use `https://translate.google.com/` without preselected URL parameters, in an isolated signed-out profile. They cover apps open/Escape, searchable language selection, settings/save, keyboard/clear, native input/result and zero runtime exceptions. They repeat these controls with the native body disabled and event capture enabled.
- [Post-fix browser capture](translate-installed-interactions.png), 1568 × 882 CSS pixels, device scale factor 1. The snapshot shows the real Google engine result after trusted input and saving light mode. Existing [reference comparisons](../design-qa.md) remain the visual baseline because the components and styling were not changed.

The injected disabled-body/capture conditions are controlled regression conditions, not a claim that those exact flags were observed in the user's browser. The existing user profile and other installed extensions were not accessed. Physical microphone recognition and signed-in account-specific layouts remain outside this verification.

## Install the corrected revision

Reload Google Glass at `chrome://extensions`, confirm **1.4.1**, then close/reopen affected site tabs. Refreshing the local preview alone does not replace an old content script in an existing native-site tab. The compiled workspace directory is `D:\Projects\google\extension`; the regenerated `Google-Glass.zip` contains the same build.

```powershell
npm.cmd test
npm.cmd run test:translate-live
npm.cmd run check
npm.cmd run package
```
