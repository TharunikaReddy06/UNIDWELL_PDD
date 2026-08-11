"""
Generate official Unidwell Android launcher icons and splash screens.
Uses src/assets/unidwell-logo.png (the official 1024x1024 Unidwell asset).
"""

import os
from PIL import Image, ImageDraw

SOURCE_LOGO = r"src\assets\unidwell-logo.png"
RES_DIR = r"android\app\src\main\res"

# Brand background color
BRAND_TEAL = (1, 64, 69, 255) # #014045
BRAND_HEX = "#014045"

# Android mipmap densities: (folder, launcher_size, round_size, foreground_size)
MIPMAP_DENSITIES = [
    ("mipmap-mdpi",    48,  48,  108),
    ("mipmap-hdpi",    72,  72,  162),
    ("mipmap-xhdpi",   96,  96,  216),
    ("mipmap-xxhdpi",  144, 144, 324),
    ("mipmap-xxxhdpi", 192, 192, 432),
]

# Android splash screen dimensions (drawable-port-* and drawable-land-*)
SPLASH_PORTRAIT = [
    ("drawable-port-mdpi",    320,  480),
    ("drawable-port-hdpi",    480,  800),
    ("drawable-port-xhdpi",   720,  1280),
    ("drawable-port-xxhdpi",  960,  1600),
    ("drawable-port-xxxhdpi", 1280, 1920),
]

SPLASH_LANDSCAPE = [
    ("drawable-land-mdpi",    480,  320),
    ("drawable-land-hdpi",    800,  480),
    ("drawable-land-xhdpi",   1280, 720),
    ("drawable-land-xxhdpi",  1600, 960),
    ("drawable-land-xxxhdpi", 1920, 1280),
]

def make_circle(img):
    """Crop img into a circle with anti-aliasing."""
    img = img.convert("RGBA")
    size = min(img.size)
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask=mask)
    return out

def add_rounded_corners(img, radius_pct=0.22):
    """Return image with smooth rounded corners."""
    img = img.convert("RGBA")
    w, h = img.size
    radius = int(min(w, h) * radius_pct)
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask=mask)
    return out

def generate_all():
    print(f"Loading source logo: {SOURCE_LOGO}")
    src = Image.open(SOURCE_LOGO).convert("RGBA")
    
    # 1. Extract the inner dark teal card region from 1024x1024
    # The teal card is located approximately at x=[75, 949], y=[55, 969]
    card_crop = src.crop((75, 55, 949, 969))
    print(f"Cropped card size: {card_crop.size}")

    # =========================================================================
    # 1. GENERATE MIPMAP LAUNCHER ICONS (LEGACY & ADAPTIVE FOREGROUND)
    # =========================================================================
    for folder, l_sz, r_sz, fg_sz in MIPMAP_DENSITIES:
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)
        print(f"\nProcessing {folder} (Launcher: {l_sz}px, Round: {r_sz}px, FG: {fg_sz}px)...")

        # --- A. ic_launcher.png: Rounded Square on Teal ---
        # Resize card to target launcher size
        launcher_img = card_crop.resize((l_sz, l_sz), Image.LANCZOS)
        launcher_rounded = add_rounded_corners(launcher_img, radius_pct=0.20)
        launcher_path = os.path.join(out_dir, "ic_launcher.png")
        launcher_rounded.save(launcher_path, "PNG", optimize=True)
        print(f"  Saved {launcher_path}")

        # --- B. ic_launcher_round.png: Circular Icon on Teal ---
        round_img = card_crop.resize((r_sz, r_sz), Image.LANCZOS)
        round_circle = make_circle(round_img)
        round_path = os.path.join(out_dir, "ic_launcher_round.png")
        round_circle.save(round_path, "PNG", optimize=True)
        print(f"  Saved {round_path}")

        # --- C. ic_launcher_foreground.png: Centered in Adaptive Safe Zone ---
        # In Android adaptive icons: total canvas = fg_sz x fg_sz (108dp)
        # Safe zone diameter = 72dp = 66.7% of fg_sz.
        # Inside the safe zone (66.7%), the full Unidwell logo is completely visible on any mask shape!
        fg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        
        # Scale card so it comfortably fills 68% of the 108dp area
        logo_size = int(fg_sz * 0.68)
        logo_resized = card_crop.resize((logo_size, logo_size), Image.LANCZOS)
        logo_rounded = add_rounded_corners(logo_resized, radius_pct=0.22)
        
        offset = (fg_sz - logo_size) // 2
        fg_canvas.paste(logo_rounded, (offset, offset), mask=logo_rounded.split()[3])
        
        fg_path = os.path.join(out_dir, "ic_launcher_foreground.png")
        fg_canvas.save(fg_path, "PNG", optimize=True)
        print(f"  Saved {fg_path}")

    # =========================================================================
    # 2. UPDATE ADAPTIVE BACKGROUND COLOR
    # =========================================================================
    # Set ic_launcher_background to the Unidwell Teal #014045
    bg_xml_path = os.path.join(RES_DIR, "values", "ic_launcher_background.xml")
    with open(bg_xml_path, "w", encoding="utf-8") as f:
        f.write(f'''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">{BRAND_HEX}</color>
</resources>
''')
    print(f"\nUpdated {bg_xml_path} with {BRAND_HEX}")

    # Remove the old Capacitor grid vector background in drawable/ if present
    drawable_bg_xml = os.path.join(RES_DIR, "drawable", "ic_launcher_background.xml")
    if os.path.exists(drawable_bg_xml):
        os.remove(drawable_bg_xml)
        print(f"Removed legacy grid vector {drawable_bg_xml}")

    # =========================================================================
    # 3. GENERATE NATIVE SPLASH SCREENS (PORTRAIT & LANDSCAPE)
    # =========================================================================
    print("\nGenerating Unidwell Splash Screens...")
    
    # Generic drawable/splash.png
    gen_dir = os.path.join(RES_DIR, "drawable")
    os.makedirs(gen_dir, exist_ok=True)
    splash_gen = Image.new("RGBA", (480, 800), BRAND_TEAL)
    # Place logo in center of splash (size 220px)
    logo_splash = card_crop.resize((220, 220), Image.LANCZOS)
    logo_splash_r = add_rounded_corners(logo_splash, radius_pct=0.22)
    splash_gen.paste(logo_splash_r, ((480 - 220) // 2, (800 - 220) // 2), mask=logo_splash_r.split()[3])
    splash_gen.save(os.path.join(gen_dir, "splash.png"), "PNG", optimize=True)
    print(f"  Saved {os.path.join(gen_dir, 'splash.png')}")

    for folder, w, h in SPLASH_PORTRAIT:
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)
        splash_img = Image.new("RGBA", (w, h), BRAND_TEAL)
        
        # Logo size roughly 38% of min dimension
        logo_sz = int(min(w, h) * 0.45)
        logo_scaled = card_crop.resize((logo_sz, logo_sz), Image.LANCZOS)
        logo_scaled_r = add_rounded_corners(logo_scaled, radius_pct=0.22)
        
        ox = (w - logo_sz) // 2
        oy = (h - logo_sz) // 2
        splash_img.paste(logo_scaled_r, (ox, oy), mask=logo_scaled_r.split()[3])
        
        out_path = os.path.join(out_dir, "splash.png")
        splash_img.save(out_path, "PNG", optimize=True)
        print(f"  Saved {out_path}")

    for folder, w, h in SPLASH_LANDSCAPE:
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)
        splash_img = Image.new("RGBA", (w, h), BRAND_TEAL)
        
        logo_sz = int(min(w, h) * 0.45)
        logo_scaled = card_crop.resize((logo_sz, logo_sz), Image.LANCZOS)
        logo_scaled_r = add_rounded_corners(logo_scaled, radius_pct=0.22)
        
        ox = (w - logo_sz) // 2
        oy = (h - logo_sz) // 2
        splash_img.paste(logo_scaled_r, (ox, oy), mask=logo_scaled_r.split()[3])
        
        out_path = os.path.join(out_dir, "splash.png")
        splash_img.save(out_path, "PNG", optimize=True)
        print(f"  Saved {out_path}")

    # =========================================================================
    # 4. ALSO UPDATE src/assets/unidwell-icon.png SO VITE / WEB USES FULL LOGO
    # =========================================================================
    card_crop.save(r"src\assets\unidwell-icon.png", "PNG", optimize=True)
    print(r"Synchronized src\assets\unidwell-icon.png with full logo!")

    print("\nSUCCESS: All Unidwell launcher icons and splash screens generated!")

if __name__ == "__main__":
    generate_all()
