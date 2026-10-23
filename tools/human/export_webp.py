# Đổi ảnh render (out/*.png) sang WebP nền trong suốt cho app: public/poses/<tên>.webp (512 px) và <tên>-sm.webp (192 px).
#   training/food/.venv/Scripts/python -I tools/human/export_webp.py
import os
import sys

from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'out')
DST = os.path.join(HERE, '..', '..', 'public', 'poses')
os.makedirs(DST, exist_ok=True)


def edge_mask(size, band=0.08):
    """Bóng đổ trên sàn lan tới mép ảnh: mờ dần ở dải mép để không lộ khung vuông (người mẫu cách mép 10%)"""
    ramp = [min(1.0, min(i, size - 1 - i) / (size * band)) for i in range(size)]
    mask = Image.new('L', (size, size))
    mask.putdata([int(255 * (ramp[x] * ramp[y]) ** 0.8) for y in range(size) for x in range(size)])
    return mask


masks = {}
total = 0
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith('.png'):
        continue
    name = fn[:-4]
    img = Image.open(os.path.join(SRC, fn)).convert('RGBA')
    mask = masks.setdefault(img.width, edge_mask(img.width))
    r, g, b, a = img.split()
    img = Image.merge('RGBA', (r, g, b, ImageChops.multiply(a, mask)))
    for suffix, size, q in (('', 512, 80), ('-sm', 192, 78)):
        out = os.path.join(DST, f'{name}{suffix}.webp')
        im = img if img.width == size else img.resize((size, size), Image.LANCZOS)
        im.save(out, 'WEBP', quality=q, method=4)
        total += os.path.getsize(out)
print(f'{total / 1024:.0f} KB', file=sys.stderr)
