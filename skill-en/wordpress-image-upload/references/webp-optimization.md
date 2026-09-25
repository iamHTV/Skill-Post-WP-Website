# WebP before upload

Requires Python 3 and Pillow with WebP support. Inspect `python -c "from PIL import features; print(features.check('webp'))"`. If absent, use an available maintained encoder or install the dependency within the authorized environment. Do not send images to a third-party compression service by default.

```powershell
python SKILL_DIR/scripts/optimize_webp.py --input SOURCE.png --output-dir NEW_OUTPUT_FOLDER --kind text
```

Use `--kind text` for plans, diagrams and images with small labels; use `--kind photo` for photography. Optional `--max-edge N` only when the intended display dimensions justify downscaling. Omit it to keep dimensions. Site-specific width/density/byte-budget conventions belong in its profile; byte budgets are soft goals subject to legibility.

The script creates lossless and multiple lossy WebP candidates plus `report.json`, with source hash, true format, orientation-corrected dimensions, byte counts, PSNR and a provisional recommendation. It never overwrites the source or an existing output folder. Source and compressed candidates are compared at the same normalized dimensions; this metric cannot assess detail lost by resizing. Exact transparency is checked separately. Animated inputs and unsupported modes are rejected rather than flattened silently.

Initial quality ladders: text 95/90/85, photo 90/85/80/75; lossless is also tried. These are practical starting values, not SEO rules or proof of optimal quality. For text, test lossless first as a reference. PSNR screening defaults (40 dB text, 36 dB photo) are conservative heuristics, not perceptual guarantees.

Open the source and provisional candidate, compare fine text and lines at 100% and display size. If it fails, inspect a higher-quality candidate or lossless. A smaller lower-quality candidate can be selected only after direct visual review. Never report an absolute “smallest possible, sharpest possible” result: minimize bytes among tested candidates that pass review. If original is smaller and already suitable, it may be retained; WebP is a preference, not a reason to inflate bytes. Existing WebP is reused by default unless a specific further optimization is justified.

Image metadata such as EXIF/GPS is not copied; source orientation is applied and embedded ICC is converted to sRGB. Required copyright attribution should remain in the caption/description or be preserved separately. Transparent pixels stay transparent. Keep the original for future edits and avoid repeated lossy recompression.

Pass the **selected output file** and a matching `.webp` upload_name to `scripts/wp-api.mjs`; the upload helper does not run conversion itself. Verify that the selected site accepts WebP and generates required thumbnails before calling the whole workflow verified. A rejected upload should trigger investigation, not a renamed extension or blind retry.

Source: [Pillow WebP encoding options](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html#webp).

Earlier local check assets, if present, are under assets/image-optimization-check. They are ignored local data, not required resources or default upload inputs. Do not upload them unless selected by the user.
