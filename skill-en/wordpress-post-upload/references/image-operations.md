# Image operations when no companion skill is installed

Open the source image and read visible text before composing media title, alt_text, caption and description. Describe only visible or confirmed context; do not invent prices, dimensions or a project name. Use a descriptive filename matching the actual selected format.

Prioritize WebP before new uploads when supported by the site. If wordpress-image-upload is available, use its candidate-generation and visual-review workflow. Otherwise use an available local encoder to compare high-quality/lossless WebP candidates, retaining the original and inspecting text, lines, color and transparency. Choose the smallest visually acceptable candidate; do not force a KB cap, upscale or re-encode an already optimized WebP. Retain a suitable original if conversion is larger or loses meaningful detail. Record before/after bytes and dimensions. No third-party compression service is required.

Use this skill's scripts/wp-api.mjs via api-helper.md. POST binary to /wp/v2/media, retain returned ID immediately, then POST the four fields to /wp/v2/media/{id}. Verify title.raw, alt_text, caption.raw and description.raw with context=edit. Set featured_media on the intended post only when requested.

For an inline image, read latest content.raw, preserve it and insert a Gutenberg wp:image block at the requested position. Use the saved source_url, correct intrinsic dimensions and escaped alt and caption; check for existing attachment ID to avoid duplicate insertion. “Below the title” means beginning of article content, not a theme change. If only a URL/attachment ID is provided, inspect/read the existing media rather than uploading again. For public pages inspect mobile layout, responsive variants and whether the actual LCP image is incorrectly lazy-loaded; report untested or theme-dependent items instead of marking them passed.

A draft article does not make an uploaded media URL private. Keep the post's original publication status. Do not perform additional transformations or uploads outside the requested task.
