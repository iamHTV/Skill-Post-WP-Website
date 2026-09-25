import hashlib
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageChops
from optimize_webp import optimize


class WebPTests(unittest.TestCase):
    def test_source_unchanged_and_lossless_alpha(self):
        with tempfile.TemporaryDirectory(prefix='webp-skill-') as directory:
            base = Path(directory)
            source = base / 'source.png'
            image = Image.new('RGBA', (48, 24), (10, 90, 170, 80))
            image.putpixel((3, 4), (240, 10, 40, 255))
            image.save(source)
            before = hashlib.sha256(source.read_bytes()).hexdigest()
            report = optimize(source, base / 'out')
            self.assertEqual(before, hashlib.sha256(source.read_bytes()).hexdigest())
            with Image.open(base / 'out/lossless.webp') as decoded:
                self.assertIsNone(ImageChops.difference(image, decoded.convert('RGBA')).getbbox())
            self.assertTrue(all(c['alpha_equal'] for c in report['candidates']))
            self.assertTrue(report['visual_review_required'])
            self.assertEqual(report['output_dimensions'], (48, 24))

    def test_orientation_then_resize_without_upscale(self):
        with tempfile.TemporaryDirectory(prefix='webp-skill-') as directory:
            base = Path(directory)
            source = base / 'source.jpg'
            exif = Image.Exif()
            exif[274] = 6
            Image.new('RGB', (80, 40), 'red').save(source, exif=exif)
            report = optimize(source, base / 'out', 'photo', 40)
            self.assertEqual(report['normalized_dimensions'], (40, 80))
            self.assertEqual(report['output_dimensions'], (20, 40))
            self.assertTrue(report['resized'])
            larger = optimize(source, base / 'larger', 'photo', 400)
            self.assertEqual(larger['output_dimensions'], (40, 80))

    def test_reject_animation_and_existing_output(self):
        with tempfile.TemporaryDirectory(prefix='webp-skill-') as directory:
            base = Path(directory)
            source = base / 'animated.gif'
            Image.new('RGB', (10, 10), 'red').save(source, save_all=True, append_images=[Image.new('RGB', (10, 10), 'blue')])
            with self.assertRaisesRegex(ValueError, 'Animated'):
                optimize(source, base / 'out')
            self.assertFalse((base / 'out').exists())
            Image.new('RGB', (10, 10), 'red').save(base / 'still.png')
            (base / 'out').mkdir()
            with self.assertRaises(FileExistsError):
                optimize(base / 'still.png', base / 'out')

    def test_existing_webp_reused(self):
        with tempfile.TemporaryDirectory(prefix='webp-skill-') as directory:
            base = Path(directory)
            source = base / 'source.webp'
            Image.new('RGB', (20, 10), 'blue').save(source, 'WEBP')
            report = optimize(source, base / 'out')
            self.assertEqual(report['recommended_file'], str(source.resolve()))
            self.assertEqual(report['candidates'], [])


if __name__ == '__main__':
    unittest.main()
