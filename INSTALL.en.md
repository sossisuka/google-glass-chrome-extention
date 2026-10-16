# Install Google Glass — English

Google Glass 1.4.3 requires Chrome 120 or newer. The extension is already built; you do not need Node.js or npm to install it.

## Install

You can also download the entire repository using **Code → Download ZIP** on GitHub, or clone it. Extract the downloaded repository and use its **`extension`** folder in step 4. No build step is required.

1. Extract **Google-Glass.zip** to a permanent folder.
2. Open **`chrome://extensions`** in Chrome.
3. Enable **Developer mode** at the top right.
4. Click **Load unpacked** and select **`Google-Glass/extension`**, the folder containing **`manifest.json`**. In this workspace, select **`D:\Projects\google\extension`**.
5. Confirm that **Google Glass** is enabled. Open a new tab and choose **Keep it** if Chrome asks about the New Tab change.
6. Refresh open Google, Translate, Yandex, YouTube and Gmail pages. Pin **Google Glass** using Chrome's puzzle-piece **Extensions** menu to access its control panel.

## Update an existing installation

Replace the files in the existing `extension` folder, keeping its path. Open `chrome://extensions` and click **Reload** on Google Glass. Version 1.4 adds access to Google Translate; enable that access if Chrome requests it. Refresh open themed sites and open a fresh new tab. Settings remain saved when the extension ID stays the same.

For the Translate startup repair, confirm **1.4.3** on the extension card and refresh/reopen `https://translate.google.ru/` after reloading. A running local preview does not update JavaScript already injected into existing site tabs. If Chrome loaded another extracted copy, replace that copy or load `D:\Projects\google\extension`. Version 1.4.3 preserves early input and language choices until Google's engine accepts them. URL/history synchronization and the clipboard fallback remain included; no additional permissions are needed.

## Personalize

- **Google Translate:** **Sites → Translate** enables the theme on `translate.google.com` and `translate.google.ru`; it starts enabled. Choose **Translate** in **Appearance → New tab homepage** to use it on New Tab. Google remains the initial default. On the Translate website, text translates automatically using Google's native engine. The language pills and arrows open searchable lists; swap, clear, keyboard, voice, copy and share work with the current text. **Share** copies a reusable translation link. Rating and feedback open Google's native controls. Documents, Images and Websites open Google's existing upload/URL workflows with your languages retained. From New Tab or the local preview, press **Translate** or **Ctrl/Cmd+Enter** to open the official service with your text. Speech requires browser support and microphone permission; click the microphone again to stop. Translation text is not saved locally by the extension.
- **Yandex homepage:** In **Appearance → New tab homepage**, choose **Yandex** or **Google**. The choice updates open New Tab pages. Google remains the initial default. Yandex has its own shortcuts, while theme, custom background and weather settings are shared.
- **Yandex websites:** Enable **Sites → Yandex** to restyle the homepages of `ya.ru`, `yandex.ru`, `yandex.com`, `yandex.by` and `yandex.kz`, with or without `www`. Reload the extension and allow the added site access when upgrading to 1.3, then refresh existing Yandex tabs. Search results and CAPTCHA pages are preserved. The Yandex page's apps menu or footer opens its settings.
- **Yandex cards:** Weather is a labeled sample until live weather is enabled; live weather uses the next five hourly slots when available. The news card contains selected example topics. Mail folder links open Yandex Mail; the extension does not read messages or display invented unread counts.
- **Appearance:** Select **Dark**, **Light** or **System** in the popup's **Appearance** tab. System follows the operating system's color preference.
- **Custom background:** Click **Upload image** in **Appearance**. Choose a JPG, PNG, WebP or AVIF up to 8 MB. It applies to the Google and Yandex homepages, Translate's text interface and New Tab, is resized to a maximum dimension of 2560 pixels and is stored locally as WebP. Click **Remove image** to restore the bundled background. The extension adds a subtle overlay so controls stay readable.
- **Sites:** Enable or disable **Google**, **Yandex**, **Translate**, **YouTube** and **Gmail** independently. The Google homepage, search results and AI Mode have separate switches below the Google switch. These switches control styling; Chrome's site-access permissions are managed in the extension's **Details** page. The website switches do not disable the New Tab override.
- **Search:** Choose English, Russian or Automatic, and a country. Search countries by name/code or click **Show all countries** for 252 countries/territories. The country is sent as `gl` when searching from Google Glass; it does not alter your actual location.
- **Page settings:** **Settings** in the homepage footer opens a HeroUI modal with the same tabs. Changes in this form are applied with **Save changes**. Popup changes save immediately.
- **Account image:** Sign in to Google and visit its homepage or Gmail once. Google Glass uses the avatar exposed by the native account header and reuses the last observed image on New Tab. If it is unavailable, the account button shows a neutral icon. It opens Google's account page; it is not Google's native account-switcher menu. A confirmed signed-out Google header clears the cached avatar.
- **Shortcuts:** Add a name and HTTP/HTTPS address. Right-click a shortcut, or focus it and press **Shift+F10**, to edit/delete. Up to eight are supported.
- **Weather:** In **Search**, enter a city and enable **Live weather**. Open-Meteo receives your city and IP address. Forecasts use Celsius and metres per second and are cached for 30 minutes. Without live weather, the card shows a labeled sample forecast.
- **Search input:** Press Enter to search, or enter an address such as `example.com` to open it. **Ctrl+K** / **Cmd+K** focuses the field. The keyboard icon opens a desktop keyboard, the microphone uses supported Chrome speech recognition, and Lens opens Google Lens.

Modal windows and selectors animate when opening. The operating system's **Reduce motion** preference disables these animations. Inputs have no active outline; keyboard focus indicators remain on buttons.

## Supported pages

Google homepage (`/` and `/webhp` without a query), results (`/search`), AI Mode (`/ai`, `/aimode`, or `/search?udm=50`) on the Google country domains in `manifest.json`; YouTube at `www.youtube.com` / `youtube.com`; Gmail at `mail.google.com`. Google Images' landing page, consent and CAPTCHA routes are excluded. Native result data, AI responses/citations, video playback and email controls remain in place. AI Mode still requires an eligible Google account/device/region.

Google's doodles, homepage autocomplete and account dropdown are replaced by the homepage interface. Native results and application controls receive scoped styles. Google, YouTube and Gmail can change their HTML; specialized widgets may retain their native appearance.

## Troubleshooting

- **Gmail toolbar turns white when scrolling:** Reload the 1.4 extension and refresh Gmail. This version covers the sticky toolbar and its background layers, removes the logo outline and updates native icon colors and the Compose gradient.
- **Translate appears unchanged:** Reload the extension, grant Translate site access and enable **Sites → Translate**, then refresh. Document/image/website workflows keep Google's native layout. Copy and share require a nonempty translation; swap becomes available after selecting a source language or entering text. If Google's result is delayed, use **Open in Google Translate** to continue in its original interface.
- **The old page appears briefly:** Reload the extension and refresh open pages after updating. Version 1.2 moves theme CSS to `document_start`; it cannot update the injection order of tabs loaded by an older version without a refresh.
- **A site did not change:** Check its switch in **Sites**, confirm that the extension is enabled, and allow that domain in **Details → Site access** at `chrome://extensions`. Unsupported routes are excluded.
- **The avatar is still generic:** Visit a signed-in Google homepage/Gmail tab and wait for the native account header to load. Refresh New Tab. No profile lookup or identity permission is used.
- **A background is rejected:** Use a supported format below 8 MB. Export an unreadable file as JPG or PNG and retry. SVG and animated GIF backgrounds are not accepted.
- **“Google Glass” / “Customize Chrome” remains at the bottom:** Chrome renders this extension-attribution footer outside our document. The extension cannot hide it. Its previous longer name was shortened; promotional text inside our page was removed. See [Chrome's New Tab documentation](https://support.google.com/chrome/answer/11032183?hl=en).
- **New Tab did not change:** Another extension may control it. Disable the conflicting New Tab extension, reload Google Glass and accept Chrome's prompt.
- **Weather fails:** Check the city and connection; save weather settings again to retry. The web preview shows sample weather.
- **Manifest missing:** Extract the ZIP and select the inner `extension` folder, not the outer folder or ZIP.
- **Errors or missing files:** Open the extension's **Errors** panel, confirm all files were extracted, reload and refresh the site. Keep the unpacked folder in its original location.

Incognito extensions must be enabled in **Details → Allow in incognito**. Chrome does not let extensions replace incognito New Tab; use a supported Google homepage there.

## Disable or remove

At `chrome://extensions`, disable Google Glass or click **Remove**, then refresh open themed sites. Disabling restores Chrome's normal New Tab. Turning off an individual site switch restores its native styling immediately in existing tabs.

The extension uses local storage and access to the specified Google/Yandex/YouTube/Gmail sites, plus the two Open-Meteo hosts for opt-in weather. It does not request history, cookies, identity, geolocation or arbitrary-site access, and adds no analytics. Backgrounds and the observed avatar URL stay on this device; avatar images load from Google's original URL.

[Chrome's official unpacked-extension instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).
