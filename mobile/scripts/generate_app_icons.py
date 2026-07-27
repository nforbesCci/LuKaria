from PIL import Image
from pathlib import Path

src = Path(r"c:\Git\Lukaria\mobile\composeApp\src\commonMain\composeResources\drawable\svelte_logo.png")
out_dir = Path(r"c:\Git\Lukaria\mobile\iosApp\iosApp\Assets.xcassets\AppIcon.appiconset")
out_dir.mkdir(parents=True, exist_ok=True)

img = Image.open(src).convert("RGBA")
w, h = img.size
side = max(w, h)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 255))
canvas.paste(img, ((side - w) // 2, (side - h) // 2), img)

sizes = {
    "icon-20@2x.png": 40,
    "icon-20@3x.png": 60,
    "icon-29@2x.png": 58,
    "icon-29@3x.png": 87,
    "icon-40@2x.png": 80,
    "icon-40@3x.png": 120,
    "icon-60@2x.png": 120,
    "icon-60@3x.png": 180,
    "icon-76.png": 76,
    "icon-76@2x.png": 152,
    "icon-83.5@2x.png": 167,
    "icon-1024.png": 1024,
}

for name, px in sizes.items():
    resized = canvas.resize((px, px), Image.Resampling.LANCZOS)
    if name == "icon-1024.png":
        rgb = Image.new("RGB", (px, px), (0, 0, 0))
        rgb.paste(resized, mask=resized.split()[-1])
        rgb.save(out_dir / name, "PNG")
    else:
        resized.save(out_dir / name, "PNG")
    print(name, px)

contents = """{
  "images" : [
    { "filename" : "icon-20@2x.png", "idiom" : "iphone", "scale" : "2x", "size" : "20x20" },
    { "filename" : "icon-20@3x.png", "idiom" : "iphone", "scale" : "3x", "size" : "20x20" },
    { "filename" : "icon-29@2x.png", "idiom" : "iphone", "scale" : "2x", "size" : "29x29" },
    { "filename" : "icon-29@3x.png", "idiom" : "iphone", "scale" : "3x", "size" : "29x29" },
    { "filename" : "icon-40@2x.png", "idiom" : "iphone", "scale" : "2x", "size" : "40x40" },
    { "filename" : "icon-40@3x.png", "idiom" : "iphone", "scale" : "3x", "size" : "40x40" },
    { "filename" : "icon-60@2x.png", "idiom" : "iphone", "scale" : "2x", "size" : "60x60" },
    { "filename" : "icon-60@3x.png", "idiom" : "iphone", "scale" : "3x", "size" : "60x60" },
    { "filename" : "icon-20@2x.png", "idiom" : "ipad", "scale" : "2x", "size" : "20x20" },
    { "filename" : "icon-29@2x.png", "idiom" : "ipad", "scale" : "2x", "size" : "29x29" },
    { "filename" : "icon-40@2x.png", "idiom" : "ipad", "scale" : "2x", "size" : "40x40" },
    { "filename" : "icon-76.png", "idiom" : "ipad", "scale" : "1x", "size" : "76x76" },
    { "filename" : "icon-76@2x.png", "idiom" : "ipad", "scale" : "2x", "size" : "76x76" },
    { "filename" : "icon-83.5@2x.png", "idiom" : "ipad", "scale" : "2x", "size" : "83.5x83.5" },
    { "filename" : "icon-1024.png", "idiom" : "ios-marketing", "scale" : "1x", "size" : "1024x1024" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
"""
(out_dir / "Contents.json").write_text(contents, encoding="utf-8")

assets = Path(r"c:\Git\Lukaria\mobile\iosApp\iosApp\Assets.xcassets")
(assets / "Contents.json").write_text('{\n  "info" : { "author" : "xcode", "version" : 1 }\n}\n', encoding="utf-8")

preview = Path(r"c:\Git\Lukaria\mobile\iosApp\iosApp\Preview Content\Preview Assets.xcassets")
preview.mkdir(parents=True, exist_ok=True)
(preview / "Contents.json").write_text('{\n  "info" : { "author" : "xcode", "version" : 1 }\n}\n', encoding="utf-8")
print("done")
