# YouTube, Gmail and control panel review

Functional verification: passed.
Exact visual comparison: blocked.
final result: blocked

The two source references are the YouTube and Gmail image attachments in the request (1672 × 941 pixels each). They are visible in the conversation but do not have local source paths. A normalized, combined source/render comparison could not be saved, so this report does not claim a pixel-exact visual pass. The extension implementation and browser interaction checks are complete.

## Rendered evidence

- `qa/sites-youtube-dark.png`, `qa/sites-youtube-light.png`: 1672 × 941 CSS/pixel viewport, deviceScaleFactor 1, representative native feed with legacy and modern YouTube markup.
- `qa/sites-gmail-dark.png`, `qa/sites-gmail-light.png`: 1672 × 941 CSS/pixel viewport, deviceScaleFactor 1, inbox and split reading-pane fixture.
- `qa/sites-youtube-mobile.png`, `qa/sites-gmail-mobile.png`: 390 × 844 CSS/pixel viewport, deviceScaleFactor 1. The tests assert a true 390px layout viewport, preventing automatic desktop scaling from masking overflow.
- `qa/sites-popup-switches.png`, `qa/sites-popup-switches-off.png`: 390 × 590, selected and unselected switches.
- `qa/v2-live-youtube.png` and `qa/v2-live-results.json`: actual signed-out YouTube, including the site's empty-feed message and the HeroUI shell.
- `qa/sites-test-results.json`: automated browser interactions and console results.

## Visual surfaces checked

- Typography: Inter is bundled and loaded in each component shadow root. Headings, titles and muted metadata have separate sizes and line heights. Long titles clamp to two lines. Gmail message and sender typography uses the same font stack.
- Layout: YouTube uses a 256px sidebar, 66px header, categories, a three-column featured shelf, four recommendation columns, and horizontal Shorts. Narrow layouts collapse the navigation and use a single feed column. Gmail retains its native configured layout, with rounded inbox/reading surfaces. Switching the theme does not change Gmail's reading-pane setting.
- Tokens: near-black background, dark elevated surfaces, subtle borders, white text, muted metadata, red YouTube actions and pale blue Gmail controls follow the attachments. Light mode has separate tokens. Keyboard focus remains visible.
- Imagery: production cards use the thumbnails and avatars already supplied by YouTube. QA fixtures use existing bundled images and cannot establish subject/crop fidelity against the nature/anime imagery in the references. Gmail attachment and email image URLs remain native.
- Content: production titles, channels, video links, categories and menu actions are extracted from the native page. The featured CTA opens the actual channel; the reference's subscription action is not simulated. Inbox subjects, messages and drafts remain Gmail-owned.

## Comparison and repair history

1. Render inspection found the featured shelf's related cards stacked their text below thumbnails. Setting their CardBody direction to row restored the reference's compact horizontal composition. The corrected desktop capture is `qa/sites-youtube-dark.png`.
2. The initial mobile fixtures lacked viewport metadata and appeared as scaled desktop pages. Added proper viewport metadata and an explicit layout-width assertion. This exposed a Shorts shelf sizing issue; border-box sizing and a contained horizontal strip fixed it. Final mobile captures show a true narrow layout with the search and account controls visible.
3. Live inspection found a brief unstyled HeroUI header while its shadow stylesheets loaded. Native chrome is now kept visible until the component styles are ready, and observer updates run at bounded intervals instead of being postponed by continuous page mutations.
4. Track/thumb measurements and keyboard testing verify that both switch states fit in 44 × 26px tracks. The selected thumb translates 18px and remains contained. The two control-panel captures show the final states.

## Functional checks

### YouTube repair in 1.2.1

The reported screenshot exposed failures the earlier simplified fixtures did not cover. The generic attributed-string selector selected thumbnail durations instead of the current camel-case video heading. Synthetic clicks on concealed controls did not exercise the original input and popup behavior. Combining every guide renderer also repeated navigation entries and selected external YouTube Music links by their `/` path.

The repair selects explicit title headings and separate duration badges. Version 1.2.2 shows HeroUI skeletons when metadata is missing and while thumbnails download; ads and promotions remain native. It reads one guide, removes duplicate URLs and compares link origins when determining the selected page. Categories remain above the featured shelf when YouTube nests its filter bar inside the rich grid.

Native header, category and video-menu elements retain their original parents and handlers and receive browser input at the visible HeroUI control positions. The themed placeholders are excluded from keyboard navigation; the native controls retain focus, with focus and hover mirrored visually. Placement follows resize, font loading and scrolling, including scroll events inside shadow roots, and clips off-screen controls. Theme removal restores native markup and control positions.

The new fixture checks use trusted browser mouse and keyboard input and reject synthetic clicks. They include the actual camel-case heading/badge structure, duplicate guides, missing titles during hydration, native modal opening, category scrolling at 390px, physical search-button clicks and restored native controls. The full regression suite passes.

Live public YouTube checks also passed: real video titles, a native video action menu, a Share modal with loaded content, Escape dismissal, the signed-out header settings dropdown and unique navigation. Captures are `qa/youtube-fixed-live-feed.png`, `qa/youtube-fixed-live-menu.png`, `qa/youtube-fixed-live-share.png` and `qa/youtube-fixed-live-settings.png`; results are `qa/youtube-live-test-results.json`. The public channel components are tested on a home-route surface; its remaining channel tabs are part of that test setup. This run does not claim signed-in account/notification verification.

Browser checks cover native category and menu forwarding, sidebar collapse, legacy/modern video extraction, added/recycled feed items, video/channel links, Unicode search submission, watch/home SPA transitions, mobile width, live dark/light changes, accessibility restoration, keyboard switches, persisted legacy preferences, and Gmail reply draft retention. No JavaScript exceptions or React console errors were recorded in the fixture runs.

The full regression suite also verifies the existing homepage, search results, country selectors, backgrounds, weather, avatars, popup and settings dialogs. `npm run check` verifies Manifest V3 resources, permissions, syntax and CSP-compatible extension HTML.

## Remaining verification limits

The 1.2.2 Gmail review, fresh before/after captures and contrast findings are recorded in [gmail-theme-review.md](gmail-theme-review.md). The YouTube loading capture is `sites-youtube-skeleton.png`. Tests also cover empty renderers, metadata hydration/recycling, delayed/failed thumbnails and reduced-motion behavior.

Exact combined visual comparison needs local copies of the supplied reference attachments. Live signed-in Gmail and a personalized signed-in YouTube feed were unavailable in the isolated test profile. Gmail uses representative native fixtures. YouTube additionally has live checks with public channel components, native menus and a Share dialog, as recorded above. These are verification limits, not prompts inside the product.
