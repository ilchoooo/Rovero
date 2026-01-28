"""
Convert all .webp images in this folder to .jpg for mobile fallback.
Run: pip install Pillow   then   python convert_webp_to_jpg.py
"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow first: pip install Pillow")
    raise SystemExit(1)

folder = Path(__file__).parent
for p in sorted(folder.glob("*.webp")):
    jpg = p.with_suffix(".jpg")
    img = Image.open(p)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(jpg, "JPEG", quality=88)
    print(jpg.name)
