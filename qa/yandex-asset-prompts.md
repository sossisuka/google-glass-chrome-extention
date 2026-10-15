# Yandex homepage assets

The supplied Yandex reference is saved as `qa/reference-yandex.png`. Its interface was implemented with React and HeroUI components; no screenshot is used as the live interface.

## Particle-wave background

Tool: built-in image generation. Output: `extension/assets/yandex-background.png`.

Prompt: a nearly black 16:9 background with a quiet, sparse silver starfield, empty upper and central space, and two low waves of fine connected silver particles flowing inward from the lower left and right. Monochrome, restrained, low brightness. No interface, cards, lettering, logos, planets or other objects. The generated image is used behind real HTML controls.

## Plus illustration

Tool: built-in image generation with a transparent background. Output: `extension/assets/yandex-plus.png`.

Prompt: a polished iridescent glass ribbon forming an open orbital loop, viewed at an angle, with amber/orange light along the upper left rim, blue/violet refractions along the lower right rim, and a thick rounded magenta-violet plus near the upper right. Compact 4:3 composition for the bottom right of a dark subscription card. No lettering, UI, floor or shadow plane; actual alpha transparency.

## Product marks, icons and photos

Sources and fetched URLs are recorded in `extension/assets/yandex-sources.json`. Marks come from Yandex's public service assets and the 2021 Cyrillic wordmark attributed to Yandex on Wikimedia Commons. The Kinopoisk symbol comes from the Simple Icons collection through Iconify. The crown and existing UI glyphs use Tabler. Weather artwork uses Meteocons. The four small news photographs are illustrative Unsplash images, linked to selected topic searches rather than represented as current news reporting.

`scripts/fetch-yandex-assets.mjs` can refresh the bundled service artwork. It is a development utility, not a runtime dependency. No new remote script or font is loaded by the homepage.
