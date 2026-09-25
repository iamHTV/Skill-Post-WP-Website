# Image SEO completion checklist

Mark each applicable item passed, failed, not tested or not applicable. Do not equate instructions or a media REST response with an actual front-end check.

## Before upload

- View source; read meaningful text. Resolve consequential OCR uncertainty instead of inventing data.
- Match the article context. Distinguish photograph, rendering, floor plan and diagram.
- Use a descriptive ASCII filename with hyphens; no keyword lists.
- Prioritize WebP if the selected WordPress/server setup supports it. Generate actual WebP bytes, not a renamed PNG.
- Set dimensions according to intended display size, pixel density and source resolution. Do not upscale. Retain fine detail on plans/documents; use a detailed version when mobile text otherwise becomes illegible.
- Compare multiple candidates; select the smallest visually acceptable file, not a universal quality setting or arbitrary KB cap. Preserve orientation, aspect ratio, transparency and color. Keep source unchanged.
- Inspect chosen candidate at 100% and at expected display size, especially small labels, numbers and thin lines. Record format, dimensions and byte reduction. Automated similarity is only a screening metric.

## Metadata

- Title is concise and descriptive.
- Alt explains meaningful content in context, naturally phrased; informative images have useful alt, decorative images may have empty alt.
- Caption adds helpful context or identifies a rendering.
- Description gives factual detail, attribution or relevant caveats. It is not the post SEO description.

## WordPress integration

- Correct featured attachment if requested; correct inline placement and no accidental duplicate.
- Inline alt is correct even if attachment alt was later changed; changing media alt does not necessarily update existing post HTML.
- Intrinsic dimensions/aspect ratio reserve layout space. Rendered responsive srcset/sizes select appropriate variants when supported by the theme.
- Read back four media fields and requested post associations; retain publication state.

## Rendered page (conditional)

- Public image URL loads with the correct type and actual file; inspect the served variant/CDN response when relevant.
- Layout is readable on mobile; no stretching or overflow.
- Above-the-fold/LCP image is not lazy-loaded; only the genuinely important image merits high fetch priority. Below-the-fold images may be lazy-loaded. Inspect rendered HTML because WordPress/theme/plugins can alter these attributes.
- Report theme/server issues without silently reconfiguring global behavior. For drafts without authenticated preview, mark front-end checks not tested; do not publish to test.

Sources: [Google image SEO](https://developers.google.com/search/docs/appearance/google-images), [LCP optimization](https://web.dev/articles/optimize-lcp).
