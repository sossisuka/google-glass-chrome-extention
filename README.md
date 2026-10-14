# Google Glass 1.2

A ready-to-load Chrome Manifest V3 extension based on the supplied Google homepage, search-results and selector references. Includes HeroUI / NextUI controls, light and dark themes, uploaded backgrounds, Google AI Mode, YouTube and Gmail styling.

**Install:** [English](INSTALL.en.md) · [Русский](INSTALL.ru.md). Extract `Google-Glass.zip`, open `chrome://extensions`, enable Developer mode and load the inner `extension` folder. The archive contains compiled files; installation requires no Node.js or build step.

To install from GitHub, choose **Code → Download ZIP** and extract it, or clone this repository. Load its **`extension`** folder in Chrome. The compiled extension and all required assets are included.

The ZIP contains the ready-to-load extension and guides. Editable source, development scripts and QA evidence are available in the full project workspace.

## Screenshots

The following screenshots come from the project's browser QA captures.

### Dark and light themes

| Dark | Light |
| --- | --- |
| ![Google Glass homepage with the silver Google logo and dark glass cards](qa/v2-newtab-dark.png) | ![Google Glass homepage with the light theme enabled](qa/v2-newtab-light.png) |

### Custom background

![Uploaded custom background on the Google Glass homepage](qa/v2-custom-background.png)

### Google search results

The reference preview reproduces the supplied Glusk example. On Google, the extension styles the site's actual results.

![HeroUI search results reference preview with a Glusk knowledge panel](qa/results-desktop.png)

### Country selector

![Searchable country selector with flags and Belarus selected](qa/selectors-desktop.png)

### Settings

![Animated HeroUI settings modal with theme and background controls](qa/v2-settings-desktop.png)

<p align="center">
  <img src="qa/v2-popup-light.png" width="280" alt="Google Glass toolbar control panel in light mode">
  <img src="qa/v2-settings-mobile.png" width="280" alt="Google Glass settings modal adapted to a mobile viewport">
</p>

<details>
<summary>YouTube theme — live signed-out QA capture</summary>

![YouTube with the Google Glass dark theme and native navigation](qa/v2-live-youtube.png)

</details>

## What changed in 1.2

- Removed the homepage side copy and promotional footer text. The Google wordmark now uses a silver gradient shaped by the official logo.
- Uses the real account image exposed by Google's native header. The last observed image is also shown on New Tab; a neutral icon is used when unavailable. Visiting a signed-out Google page clears the cached image.
- Upload a JPG, PNG, WebP or AVIF background for the homepage and New Tab. Images are resized to at most 2560 pixels, encoded as WebP and stored on this device. Original uploads may be up to 8 MB.
- Actual HeroUI Modal, Input, Button, Switch, Tabs, RadioGroup, Popover, Listbox and related controls, with appearance animations and reduced-motion support.
- Dark, light and system color modes. Inputs have no active outline or focus ring; buttons retain keyboard focus indicators.
- Independent Google, YouTube and Gmail switches in the control panel. Google homepage, results and AI Mode can also be switched separately.
- Scoped styles preserve native Google results, AI responses, citations, YouTube playback and Gmail controls. The extension does not replace their data.
- Manifest CSS and a small startup script apply the native themes before rendering. Results and Gmail use small native adapters. YouTube has its own locally bundled HeroUI interface. Google and YouTube SPA transitions update the theme automatically.

Existing features remain: English/Russian UI, searchable country selectors with 252 countries/territories, Google search and URL navigation, up to eight editable shortcuts, an apps launcher, Lens and optional voice input, and opt-in Open-Meteo weather.

## Controls

Version **1.2.2** adds HeroUI skeletons for loading YouTube video metadata and thumbnails, including infinite-scroll items. Skeletons follow the card dimensions, respect reduced motion and disappear when the real content arrives. Failed thumbnails stop animating and keep the video link available. It also retains the 1.2.1 repairs for missing titles, repeated sidebar entries and inactive menus: original interactive elements stay aligned with their HeroUI styling so mouse and keyboard actions reach YouTube's native handlers.

YouTube now uses locally bundled HeroUI navigation, search, category controls, featured videos, video cards, and Shorts. The featured shelf uses the first four native feed videos when at least eight are available. Video titles, thumbnails, channel links, filters, and action menus come from YouTube; empty feeds keep YouTube's own message. Switching YouTube off restores its original interface.

Gmail's dark theme covers the inbox, category tabs, sidebar, reading pane, HTML messages, attachments, compose/reply windows, and settings menus. Unified panels, muted toolbars, distinct unread rows and blue accents follow the reference. Rendered email colors are adapted against their actual backgrounds: neutral light surfaces become dark, and low-contrast text becomes readable while readable brand colors remain intact. Images and authored inline styles are preserved. Turning the theme off or choosing light mode removes the email overrides. Gmail keeps its configured inbox and reading-pane layout. Both sites also support the light and system preferences.

The Sites switches have fixed tracks and contained thumbs in both states, with keyboard focus and Space support.

Pin Google Glass in Chrome's Extensions menu. Its popup has **Appearance**, **Sites** and **Search** tabs. Popup changes save immediately. Homepage **Settings** opens the same controls in a HeroUI modal; choose **Save changes** to commit that form.

New Tab remains controlled by the extension while it is enabled, regardless of the Google website switch. Chrome adds its own extension-attribution / Customize Chrome footer outside the extension document. This browser-owned footer cannot be hidden by the extension. The extension name is now simply **Google Glass**.

## Scope and privacy

Supported Google country domains are listed in `extension/manifest.json`. Themes cover `/`, `/webhp`, `/search`, `/ai` and `/aimode`, plus `youtube.com` / `www.youtube.com` and `mail.google.com`. Consent and CAPTCHA routes are excluded. Specialized widgets may keep some native styles as these sites change their markup.

The extension uses `storage`, content-script access to those sites, and the two Open-Meteo hosts for optional weather. It does not request cookies, history, geolocation, identity or access to arbitrary sites. There is no analytics or query logging. Backgrounds, settings, shortcuts, avatar URL and weather cache stay in local extension storage. Avatar images are loaded from the URL already exposed by Google. The selected theme name is also cached in supported sites' local storage to select the initial page background. Weather sends the entered city and IP address to Open-Meteo only when enabled. Chrome's optional speech recognition may process audio through its own service.

## Source and development

```text
extension/              Load this directory in Chrome
  boot.js / boot.css    Early preferences, route handling and paint protection
  app.js / page.css     Homepage and New Tab interface
  content.js            Isolated Google homepage integration
  results-content.js    Native results and AI DOM annotations
  results.css           Native Google / AI theme
  sites.css             YouTube / Gmail themes
  gmail-content.js      Local contrast adaptation for rendered HTML mail
  youtube-content.js    Native YouTube feed and navigation integration
  youtube-ui.js         Locally bundled HeroUI YouTube components
  youtube.css           Isolated YouTube component styles
  control-panel.js      Toolbar popup integration
  ui.js / ui.css        Locally bundled React and HeroUI
src/                    Editable HeroUI components and styles
scripts/                Build, browser checks, preview and packaging
qa/                     Screenshots, comparisons and verification reports
```

Development in the full project workspace requires Node.js 22+ and Python 3 for ZIP packaging. On Windows:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run dev
npm.cmd run check
npm.cmd test
npm.cmd run package
```

Use `npm` on macOS/Linux. The local homepage preview is `http://127.0.0.1:4173/`; the supplied search and selector references are reproduced at `/results.html` and `/selectors.html`. Browser-only features require installation.

Tests use native Chrome DevTools Protocol in an isolated Chrome for Testing / Chromium profile. Set `CHROME_BINARY` to a suitable executable if needed. They check installed extension flows, native-site fixtures, first-frame styling, real avatar propagation, image upload, independent site switches, light mode, modal dismissal, search region, accessibility restoration and dynamic results. Live signed-out YouTube and Google AI entry-page checks are separate. Gmail and AI response/composer checks use fixtures because the test profile has no signed-in Gmail or eligible AI account. See [design-qa.md](design-qa.md).

Run `npm run test:sites` for the YouTube/Gmail and switch checks. Screenshots and results are saved under `qa/sites-*`. These screenshots use representative native markup and the existing bundled fixture images; installed YouTube always uses the user's actual feed imagery.

Run `node scripts/gmail-theme-test.mjs` for plain and formatted email contrast, preserved brand colors, dynamic content, light-mode restoration and draft retention. The full `npm test` includes these checks. The Gmail review and before/after screenshots are in `qa/gmail-theme-review.md`. Signed-in Gmail is not available in the isolated test profile; fixtures do not establish fidelity for every live Gmail view or contrast over background images.

`node scripts/live-youtube-check.mjs` checks current public YouTube video components, video menus, the Share modal and the signed-out header dropdown. It uses a public channel's components on a home-route test surface, without a signed-in profile. Evidence is saved under `qa/youtube-fixed-live-*` and `qa/youtube-live-test-results.json`.

## Credits

HeroUI 2.8.10 and React 18 are bundled locally; MIT notices are in `extension/HEROUI-LICENSE.txt` and `extension/ui.js.LEGAL.txt`. Inter and its SIL OFL are in `assets/fonts`; flag-icons and its MIT license are in `assets/flags`. Product logos use the SVG Logos collection, icons use Tabler / Simple Icons / Meteocons, the Google wordmark uses Google's official image, and decorative artwork was generated from the user's references. Prompts are included in `qa/asset-prompts.md` and `qa/results-asset-prompts.md`. Reference previews are labeled examples; installed Google pages display native results.

This is an independent project, unaffiliated with Google or HeroUI.
# google-glass-chrome-extention
