"""
Generate Android launcher icons for all mipmap densities
from the Unidwell source icon.

Android launcher icon sizes:
  mipmap-mdpi:    48x48   (1x baseline)
  mipmap-hdpi:    72x72   (1.5x)
  mipmap-xhdpi:   96x96   (2x)
  mipmap-xxhdpi:  144x144 (3x)
  mipmap-xxxhdpi: 192x192 (4x)

Foreground (used by adaptive icon, API 26+):
  Same densities, but foreground image is larger (108dp safe zone = 72dp usable)
  mdpi:    108x108
  hdpi:    162x162
  xhdpi:   216x216
  xxhdpi:  324x324
  xxxhdpi: 432x432
"""

import os
import math
from PIL import Image, ImageDraw

SOURCE = r"src\assets\unidwell-icon.png"
BASE   = r"android\app\src\main\res"

# (folder, launcher_size, round_size, foreground_size)
DENSITIES = [
    ("mipmap-mdpi",    48,  48,  108),
    ("mipmap-hdpi",    72,  72,  162),
    ("mipmap-xhdpi",   96,  96,  216),
    ("mipmap-xxhdpi",  144, 144, 324),
    ("mipmap-xxxhdpi", 192, 192, 432),
]

def add_rounded_corners(img, radius_pct=0.2):
    """Return a copy of img with rounded corners (RGBA)."""
    img = img.convert("RGBA")
    w, h = img.size
    radius = int(min(w, h) * radius_pct)
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(img, mask=mask)
    return out

def make_circle(img):
    """Crop img into a circle (RGBA)."""
    img = img.convert("RGBA")
    size = min(img.size)
    img = img.crop(
        ((img.width - size) // 2,
         (img.height - size) // 2,
         (img.width + size) // 2,
         (img.height + size) // 2)
    )
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, img.width - 1, img.height - 1], fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, mask=mask)
    return out

def save_png(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG", optimize=True)
    print(f"  Saved: {path}")

# Load source
src = Image.open(SOURCE).convert("RGBA")
print(f"Source loaded: {src.size}")

for folder, launcher_sz, round_sz, fg_sz in DENSITIES:
    print(f"\n[{folder}]")
    out_dir = os.path.join(BASE, folder)

    # --- ic_launcher.png: rounded square ---
    launcher = src.copy().resize((launcher_sz, launcher_sz), Image.LANCZOS)
    launcher_rounded = add_rounded_corners(launcher, radius_pct=0.18)
    # Paste on teal background (#0D3D3B)
    bg = Image.new("RGBA", (launcher_sz, launcher_sz), (13, 61, 59, 255))
    final_launcher = Image.alpha_composite(bg, launcher_rounded)
    save_png(final_launcher.convert("RGB"), os.path.join(out_dir, "ic_launcher.png"))

    # --- ic_launcher_round.png: circle ---
    circle_base = src.copy().resize((round_sz, round_sz), Image.LANCZOS)
    bg_circle = Image.new("RGBA", (round_sz, round_sz), (13, 61, 59, 255))
    final_circle_base = Image.alpha_composite(bg_circle, circle_base)
    round_icon = make_circle(final_circle_base)
    # Paste on white backing to avoid transparency artifacts
    round_bg = Image.new("RGB", (round_sz, round_sz), (255, 255, 255))
    round_bg.paste(round_icon, mask=round_icon.split()[3])
    save_png(round_bg, os.path.join(out_dir, "ic_launcher_round.png"))

    # --- ic_launcher_foreground.png: full icon on transparent for adaptive ---
    # Safe zone: center 72/108 = 66.7% of foreground area
    fg = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
    # Scale logo to fill the safe zone (72dp equivalent)
    safe_ratio = 72.0 / 108.0
    logo_dim = int(fg_sz * safe_ratio)
    logo_resized = src.copy().resize((logo_dim, logo_dim), Image.LANCZOS)
    offset = (fg_sz - logo_dim) // 2
    fg.paste(logo_resized, (offset, offset), logo_resized)
    save_png(fg, os.path.join(out_dir, "ic_launcher_foreground.png"))

print("\nAll icons generated successfully!")
