from PIL import Image
from pathlib import Path

src = Path(r"c:\Git\Lukaria\public\images\Lukaria_logo_background_removed_small.png")
res = Path(r"c:\Git\Lukaria\mobile\composeApp\src\androidMain\res")
img = Image.open(src).convert("RGBA")

sizes = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}


def fit_square(im, size, pad_ratio=0.12, bg=(0, 0, 0, 255)):
    canvas = Image.new("RGBA", (size, size), bg)
    max_inner = int(size * (1 - 2 * pad_ratio))
    w, h = im.size
    scale = min(max_inner / w, max_inner / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def fit_foreground(im, size, pad_ratio=0.22):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    max_inner = int(size * (1 - 2 * pad_ratio))
    w, h = im.size
    scale = min(max_inner / w, max_inner / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


for folder, (launcher, fg) in sizes.items():
    d = res / folder
    d.mkdir(parents=True, exist_ok=True)
    fit_square(img, launcher).save(d / "ic_launcher.png", optimize=True)
    fit_square(img, launcher).save(d / "ic_launcher_round.png", optimize=True)
    fit_foreground(img, fg).save(d / "ic_launcher_foreground.png", optimize=True)
    Image.new("RGBA", (fg, fg), (0, 0, 0, 255)).save(d / "ic_launcher_background.png", optimize=True)
    print("wrote", folder)

anydpi = res / "mipmap-anydpi-v26"
anydpi.mkdir(parents=True, exist_ok=True)
(anydpi / "ic_launcher.xml").write_text(
    """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
    encoding="utf-8",
)
(anydpi / "ic_launcher_round.xml").write_text(
    """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
""",
    encoding="utf-8",
)
print("adaptive icons ok")
