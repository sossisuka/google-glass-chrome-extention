# Google Translate background asset

- File: `extension/assets/translate-background.png`
- Generated with the built-in image-generation tool on 2026-10-16; opaque PNG, 1672 × 941 pixels (approximately 16:9).
- Visual source: the user-provided Google Translate reference, saved as `qa/reference-translate.png`. Only its background composition informed this asset; no interface, text, logos, or account image was copied into the raster.
- Inspection: dark clean center/top/left, subtle navy star field, cropped Earth and restrained blue network nodes in the bottom-right. There is no side copy, interface, or transparency.

## Initial prompt

Use case: stylized-concept.
Asset type: opaque full-page website background only, wide 16:9, target composition 1567 by 882 pixels.
Create the background for a sophisticated near-black Google Translate glass-style webpage. The entire background is deep charcoal black (#070b0e) with very subtle soft dark navy haze and hundreds of tiny, extremely dim desaturated blue-gray star specks, widely spaced. Keep the central 70% of the image, the whole top, and the left side clean and nearly black so interface elements can be placed there later. No interface elements are part of this image.
An extremely dark realistic Earth quarter-sphere occupies ONLY the far bottom-right corner, heavily cropped by the bottom and right edges. At 1567x882 reference coordinates, the top of its curved limb enters the right border at approximately y=505, and the limb intersects the bottom border at approximately x=1200. Its center is well outside the frame toward the bottom-right. Earth must never extend into the center. Thin muted steel-blue atmospheric glow around the limb, delicate shadowy geographic surface texture barely visible in black, six to ten small cold blue network nodes on the visible globe connected by very faint thin dashed/dotted arcs, restrained and sparse. A few subtle pinprick stars above it. No bright continents, no sun, no clouds, no milky way, no nebula.
Style: understated high-end dark astronomy background, matte, low contrast, reference-faithful layout. The Earth is barely illuminated, not a bright hero planet. Most pixels almost black with a hint of navy.
Text: none.
Avoid absolutely all text, side copy, labels, UI controls, inputs, cards, panels, logos, buttons, watermarks, white borders, and decorative objects. Opaque background; no transparency.

## Refinement

The Earth was reduced into the bottom-right corner, then its rim was darkened and its height adjusted while preserving the negative space and star field.

## Final refinement prompt

Use case: precise-object-edit. Use this image as the edit target. Preserve all stars, nearly black background, clean negative space, current planet left boundary at 76.6% of image width on the bottom edge. Change only the visible planet and its rim: increase the planet height upward so that the atmospheric curve at the RIGHT edge starts precisely at 57% of the image height instead of the current 64%. Keep the planet's leftmost intersection with the bottom edge in exactly the same place. Make the blue rim thinner, darker and subtler, and the planet surface about 35% dimmer; preserve the small blue network nodes. This is a background asset, no text, UI, logos, watermark, or transparency.

Attribution: AI-generated project asset, created specifically for this extension from the user's supplied visual direction. No external stock photograph is used.

## Product marks, icons and languages

- Official Translate product mark: `https://www.gstatic.com/images/branding/product/1x/translate_48dp.png`, saved as `extension/assets/translate-mark.png`.
- Google wordmark: the existing official `extension/assets/google.png`, used as a silhouette mask with the reference's silver gradient. No wordmark was redrawn.
- Gemini silhouette: Simple Icons `googlegemini`, fetched through Iconify and saved as `extension/assets/translate-gemini.svg`; CSS applies its purple-blue gradient.
- Filled and outlined controls: official Material Symbols and Tabler SVG assets, recorded reproducibly in `scripts/fetch-translate-assets.mjs`. Google's Apache 2.0 icon license is `extension/TRANSLATE-ICONS-LICENSE.txt`. Inter is the existing bundled OFL font.
- Language codes: 250 entries, including automatic detection, read from the current public Google Translate language controls on 2026-10-16. Display names come from the browser's `Intl.DisplayNames`; the snapshot is `extension/assets/translate-languages.json`.
- The native account avatar is reused only when exposed by a real signed-in Google header; a neutral account icon is the expected signed-out state. The reference portrait is not bundled as a user avatar.
