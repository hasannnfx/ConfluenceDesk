"""
generate-og-image.py
Membuat ulang assets/og-image.png (gambar preview media sosial 1200x630).
Jalankan: pip install pillow --break-system-packages && python3 tools/generate-og-image.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "og-image.png")

W, H = 1200, 630
img = Image.new("RGB", (W, H), (10, 12, 17))
draw = ImageDraw.Draw(img, "RGBA")

# --- radial-ish gradient background (approximate with vertical+corner blend) ---
top = (26, 31, 44)
bottom = (10, 12, 17)
for y in range(H):
    t = y / H
    r = int(top[0] + (bottom[0]-top[0])*t)
    g = int(top[1] + (bottom[1]-top[1])*t)
    b = int(top[2] + (bottom[2]-top[2])*t)
    draw.line([(0,y),(W,y)], fill=(r,g,b))

# faint grid lines
for y in (150, 300, 450):
    draw.line([(0,y),(W,y)], fill=(35,40,56,255), width=1)

# gauge arc motif top right (approx with arc)
cx, cy, r = 940, 210, 110
draw.arc([cx-r, cy-r, cx+r, cy+r], start=200, end=340, fill=(42,48,63,255), width=18)
draw.arc([cx-r, cy-r, cx+r, cy+r], start=200, end=300, fill=(201,162,75,255), width=18)
draw.ellipse([cx-9, cy+60-9, cx+9, cy+60+9], fill=(238,240,244,255))
draw.line([cx, cy+60, cx+46, cy+2], fill=(238,240,244,255), width=4)

# price line motif
pts = [(70,470),(170,430),(240,455),(320,380),(400,410),(470,340),
       (560,370),(640,300),(730,330),(820,260),(900,290),(980,220)]
for i in range(len(pts)-1):
    t = i/(len(pts)-2)
    col = (int(124+(201-124)*t), int(134+(162-134)*t), int(152+(75-152)*t), 220)
    draw.line([pts[i], pts[i+1]], fill=col, width=4, joint="curve")

# brand mark (circle + check-ish path)
bx, by = 80, 86
draw.ellipse([bx-26, by-26, bx+26, by+26], outline=(201,162,75,255), width=3)
draw.line([(bx-14, by+10),(bx+3, by-11),(bx+15, by+6),(bx+30, by-16)], fill=(201,162,75,255), width=3, joint="curve")
draw.ellipse([bx+30-3, by-16-3, bx+30+3, by-16+3], fill=(201,162,75,255))

def load_font(candidates, size):
    """Coba beberapa path font umum di Linux/Mac; jatuh ke font default PIL jika tak ada."""
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

display_bold = load_font([
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "arialbd.ttf",
], 62)
brand_font = load_font([
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "arialbd.ttf",
], 24)
body_font = load_font([
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "arial.ttf",
], 21)
mono_font = load_font([
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
    "consolab.ttf",
], 16)
small_font = load_font([
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "arial.ttf",
], 15)

draw.text((130, 74), "CONFLUENCE DESK", font=brand_font, fill=(238,240,244,255))

draw.text((78, 150), "Sinyal Trading,", font=display_bold, fill=(238,240,244,255))
draw.text((78, 222), "Bukan Tebakan.", font=display_bold, fill=(201,162,75,255))

draw.text((80, 302), "AO Divergence \u00d7 Kalkulator Fibonacci \u2014 data real-time TwelveData",
          font=body_font, fill=(167,175,192,255))

chips = ["XAU/USD", "EUR/USD", "GBP/USD", "BTC/USD"]
x = 80
for label in chips:
    w = 140
    draw.rounded_rectangle([x, 460, x+w, 502], radius=21, fill=(22,26,36,255), outline=(42,48,63,255))
    bbox = draw.textbbox((0,0), label, font=mono_font)
    tw = bbox[2]-bbox[0]
    draw.text((x + (w-tw)/2, 471), label, font=mono_font, fill=(238,240,244,255))
    x += w + 14

draw.text((80, 560), "Bukan nasihat keuangan \u2014 gunakan manajemen risiko Anda sendiri.",
          font=small_font, fill=(108,115,134,255))

img.save(OUTPUT_PATH, "PNG")
print("saved", OUTPUT_PATH, img.size)
