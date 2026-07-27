from PIL import Image
from pathlib import Path
import json

src = Path(r"c:\Git\Lukaria\mobile\composeApp\src\commonMain\composeResources\drawable\svelte_logo.png")
out_dir = Path(r"c:\Git\Lukaria\mobile\iosApp\iosApp\Assets.xcassets\AppIcon.appiconset")
out_dir.mkdir(parents=True, exist_ok=True)

for old in out_dir.glob("*.png"):
    old.unlink()

img = Image.open(src).convert("RGBA")
w, h = img.size
side = max(w, h)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 255))
canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)

sizes = {
    "iphone-20-2x.png": 40,
    "iphone-20-3x.png": 60,
    "iphone-29-2x.png": 58,
    "iphone-29-3x.png": 87,
    "iphone-40-2x.png": 80,
    "iphone-40-3x.png": 120,
    "iphone-60-2x.png": 120,
    "iphone-60-3x.png": 180,
    "ipad-20-2x.png": 40,
    "ipad-29-2x.png": 58,
    "ipad-40-2x.png": 80,
    "ipad-76-1x.png": 76,
    "ipad-76-2x.png": 152,
    "ipad-83_5-2x.png": 167,
    "ios-marketing-1024.png": 1024,
}

for name, px in sizes.items():
    resized = canvas.resize((px, px), Image.Resampling.LANCZOS)
    rgb = Image.new("RGB", (px, px), (0, 0, 0))
    rgb.paste(resized, mask=resized.split()[-1])
    rgb.save(out_dir / name, "PNG")
    print(name, px)

contents = {
    "images": [
        {"filename": "iphone-20-2x.png", "idiom": "iphone", "scale": "2x", "size": "20x20"},
        {"filename": "iphone-20-3x.png", "idiom": "iphone", "scale": "3x", "size": "20x20"},
        {"filename": "iphone-29-2x.png", "idiom": "iphone", "scale": "2x", "size": "29x29"},
        {"filename": "iphone-29-3x.png", "idiom": "iphone", "scale": "3x", "size": "29x29"},
        {"filename": "iphone-40-2x.png", "idiom": "iphone", "scale": "2x", "size": "40x40"},
        {"filename": "iphone-40-3x.png", "idiom": "iphone", "scale": "3x", "size": "40x40"},
        {"filename": "iphone-60-2x.png", "idiom": "iphone", "scale": "2x", "size": "60x60"},
        {"filename": "iphone-60-3x.png", "idiom": "iphone", "scale": "3x", "size": "60x60"},
        {"filename": "ipad-20-2x.png", "idiom": "ipad", "scale": "2x", "size": "20x20"},
        {"filename": "ipad-29-2x.png", "idiom": "ipad", "scale": "2x", "size": "29x29"},
        {"filename": "ipad-40-2x.png", "idiom": "ipad", "scale": "2x", "size": "40x40"},
        {"filename": "ipad-76-1x.png", "idiom": "ipad", "scale": "1x", "size": "76x76"},
        {"filename": "ipad-76-2x.png", "idiom": "ipad", "scale": "2x", "size": "76x76"},
        {"filename": "ipad-83_5-2x.png", "idiom": "ipad", "scale": "2x", "size": "83.5x83.5"},
        {"filename": "ios-marketing-1024.png", "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024"},
    ],
    "info": {"author": "xcode", "version": 1},
}
(out_dir / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n", encoding="utf-8")
print("done")
