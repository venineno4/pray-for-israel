import os
from PIL import Image, ImageDraw, ImageFilter

bg_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/2ce461d0-3892-47ce-b92b-c8ee936950a2/media__1777790355771.jpg'
ui_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/2ce461d0-3892-47ce-b92b-c8ee936950a2/media__1777790360857.jpg'
out_path = '/Users/vilmosyehudafrank/.gemini/antigravity/scratch/pray-for-israel/public/banner_1200x1000.png'

os.makedirs(os.path.dirname(out_path), exist_ok=True)

output_w, output_h = 1200, 1000

# 1. Background
bg = Image.open(bg_path).convert('RGBA')

# Crop to tightly bound the globe so it reaches both left and right edges.
# Original image is 1024x1024. Globe is ~900px wide.
left = 62
right = 962
top = 137
bottom = 887

bg = bg.crop((left, top, right, bottom))
bg = bg.resize((output_w, output_h), Image.Resampling.LANCZOS)

# 2. Phone Mockup
ui = Image.open(ui_path).convert('RGBA')
# Phone size
phone_h = int(190 * (output_h / 250)) # 760
phone_w = int(phone_h * (ui.size[0] / ui.size[1]))
ui = ui.resize((phone_w, phone_h), Image.Resampling.LANCZOS)

border = int(6 * (output_h / 250))
radius = int(16 * (output_h / 250))
outer_w, outer_h = phone_w + border*2, phone_h + border*2

phone = Image.new('RGBA', (outer_w, outer_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(phone)

# Outer frame
draw.rounded_rectangle((0, 0, outer_w-1, outer_h-1), radius=radius, fill=(20, 20, 20, 255), outline=(100, 100, 100, 255), width=int(2 * (output_h / 250)))

# Mask for UI
ui_mask = Image.new('L', (phone_w, phone_h), 0)
ui_draw = ImageDraw.Draw(ui_mask)
ui_draw.rounded_rectangle((0, 0, phone_w-1, phone_h-1), radius=radius-border, fill=255)

ui_rounded = ui.copy()
ui_rounded.putalpha(ui_mask)

phone.paste(ui_rounded, (border, border), ui_rounded)

# 3. Composite
final = Image.new('RGBA', (output_w, output_h), (0, 0, 0, 0))
final.paste(bg, (0, 0))

shadow = Image.new('RGBA', (output_w, output_h), (0, 0, 0, 0))
s_draw = ImageDraw.Draw(shadow)

# We move the phone slightly to the right (px=180) to ensure it fully covers the hands
# while keeping the Menorah fully visible to its right.
px = 180
py = (output_h - outer_h) // 2

# Draw shadow
s_draw.rounded_rectangle((px+20, py+20, px+outer_w+20, py+outer_h+20), radius=radius, fill=(0, 0, 0, 150))
shadow = shadow.filter(ImageFilter.GaussianBlur(int(6 * (output_w / 300))))

final = Image.alpha_composite(final, shadow)
final.paste(phone, (px, py), phone)
final.convert('RGB').save(out_path)

print("Generated V5 banner with perfect crop and phone placement.")
