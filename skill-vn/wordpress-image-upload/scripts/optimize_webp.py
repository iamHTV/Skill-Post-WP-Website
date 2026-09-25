"""Produce inspectable WebP candidates; never equate a metric with visual approval."""
import argparse
import hashlib
import io
import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageCms, ImageOps, ImageStat, features


def similarity(reference, candidate):
    if reference.size != candidate.size:
        raise ValueError('Cannot compare different dimensions')
    a, b = reference.convert('RGBA'), candidate.convert('RGBA')
    alpha_equal = ImageChops.difference(a.getchannel('A'), b.getchannel('A')).getbbox() is None
    errors = []
    for bg in ['white', 'black']:
        aa = Image.new('RGBA', a.size, bg)
        bb = Image.new('RGBA', b.size, bg)
        aa.alpha_composite(a)
        bb.alpha_composite(b)
        rms = ImageStat.Stat(ImageChops.difference(aa.convert('RGB'), bb.convert('RGB'))).rms
        errors.append(sum(v * v for v in rms) / len(rms))
    mse = max(errors)
    return (None if mse == 0 else 10 * math.log10(255 ** 2 / mse)), alpha_equal


def optimize(source, output_dir, kind='text', max_edge=None):
    source, output_dir = Path(source).resolve(), Path(output_dir).resolve()
    if kind not in ('text', 'photo') or (max_edge is not None and max_edge < 1):
        raise ValueError('Invalid kind or max edge')
    if not features.check('webp'):
        raise ValueError('Pillow WebP support is unavailable')
    raw = source.read_bytes()
    with Image.open(io.BytesIO(raw)) as opened:
        if getattr(opened, 'n_frames', 1) != 1:
            raise ValueError('Animated/multi-frame input requires a separate preservation workflow')
        fmt = opened.format
        if opened.mode not in ('1', 'L', 'LA', 'P', 'RGB', 'RGBA', 'CMYK'):
            raise ValueError('Unsupported mode; normalize bit depth/color deliberately first')
        original_size = opened.size
        oriented = ImageOps.exif_transpose(opened)
        icc = opened.info.get('icc_profile')
        image = oriented.convert('RGBA')
        if icc:
            color = oriented.convert('CMYK' if oriented.mode == 'CMYK' else 'RGB')
            converted = ImageCms.profileToProfile(color, ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile('sRGB'), outputMode='RGB')
            converted.putalpha(image.getchannel('A'))
            image = converted
        elif opened.mode == 'CMYK':
            raise ValueError('CMYK without ICC profile requires explicit color handling')
        normalized_size = image.size
        if max_edge:
            image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    if max(image.size) > 16383:
        raise ValueError('Dimensions exceed WebP limit; choose an appropriate max edge')
    output_dir.mkdir(parents=True, exist_ok=False)
    report = {
        'source': str(source), 'source_sha256': hashlib.sha256(raw).hexdigest(),
        'source_format': fmt, 'source_bytes': len(raw), 'original_dimensions': original_size,
        'normalized_dimensions': normalized_size, 'output_dimensions': image.size,
        'resized': image.size != normalized_size, 'kind': kind, 'candidates': [],
        'visual_review_required': True,
    }
    if fmt == 'WEBP' and not report['resized']:
        report.update(recommended_file=str(source), reason='Existing WebP: avoid unnecessary recompression')
    else:
        threshold = 40 if kind == 'text' else 36
        qualities = [95, 90, 85] if kind == 'text' else [90, 85, 80, 75]
        for quality in [None] + qualities:
            lossless = quality is None
            destination = output_dir / ('lossless.webp' if lossless else f'q{quality}.webp')
            image.save(destination, 'WEBP', lossless=lossless, quality=100 if lossless else quality, method=6, exact=True)
            with Image.open(destination) as decoded:
                psnr, alpha_equal = similarity(image, decoded)
                if decoded.format != 'WEBP' or decoded.size != image.size:
                    raise ValueError('Encoded image failed validation')
            candidate = {
                'path': str(destination), 'bytes': destination.stat().st_size,
                'lossless': lossless, 'quality': quality, 'psnr_db': psnr,
                'alpha_equal': alpha_equal,
                'screening_pass': alpha_equal and (psnr is None or psnr >= threshold),
            }
            report['candidates'].append(candidate)
        accepted = [c for c in report['candidates'] if c['screening_pass']]
        if not accepted:
            raise ValueError('No candidate preserved required image properties')
        best = min(accepted, key=lambda c: c['bytes'])
        retain_original = not report['resized'] and fmt in ('PNG', 'JPEG') and len(raw) <= best['bytes']
        report.update(recommended_file=str(source) if retain_original else best['path'],
                      reason='Original is no larger than screened WebP candidates' if retain_original else 'Smallest screened candidate; visual review still required')
    selected_bytes = Path(report['recommended_file']).stat().st_size
    report.update(recommended_bytes=selected_bytes, saving_percent=round(100 * (1 - selected_bytes / len(raw)), 2))
    (output_dir / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True)
    parser.add_argument('--output-dir', required=True)
    parser.add_argument('--kind', choices=['photo', 'text'], default='text')
    parser.add_argument('--max-edge', type=int)
    args = parser.parse_args()
    try:
        print(json.dumps(optimize(args.input, args.output_dir, args.kind, args.max_edge), ensure_ascii=False, indent=2))
    except (ValueError, OSError) as exc:
        parser.exit(1, f'{exc}\n')
