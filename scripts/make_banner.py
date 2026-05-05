import os
from PIL import Image, ImageDraw, ImageFilter

bg_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/2ce461d0-3892-47ce-b92b-c8ee936950a2/media__1777790355771.jpg'
ui_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/2ce461d0-3892-47ce-b92b-c8ee936950a2/media__1777790360857.jpg'
out_path = '/Users/vilmosyehudafrank/.gemini/antigravity/scratch/pray-for-israel/public/banner_300x250.png'

os.makedirs(os.path.dirname(out_path), exist_ok=True)

# 1. Background
bg = Image.open(bg_path).convert('RGBA')
bg_w, bg_h = bg.size
target_ratio = 300 / 250.0

if bg_w / bg_h > target_ratio:
    new_w = int(bg_h * target_ratio)
    left = (bg_w - new_w) // 2
    bg = bg.crop((left, 0, left + new_w, bg_h))
else:
    new_h = int(bg_w / target_ratio)
    top = (bg_h - new_h) // 2
    bg = bg.crop((0, top, bg_w, top + new_h))

bg = bg.resize((300, 250), Image.Resampling.LANCZOS)

# 2. Phone Mockup
ui = Image.open(ui_path).convert('RGBA')
phone_h = 190
phone_w = int(phone_h * (ui.size[0] / ui.size[1]))
ui = ui.resize((phone_w, phone_h), Image.Resampling.LANCZOS)

border = 6
radius = 16
outer_w, outer_h = phone_w + border*2, phone_h + border*2

phone = Image.new('RGBA', (outer_w, outer_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(phone)

# Outer frame
draw.rounded_rectangle((0, 0, outer_w-1, outer_h-1), radius=radius, fill=(20, 20, 20, 255), outline=(100, 100, 100, 255), width=2)

# Mask for UI
ui_mask = Image.new('L', (phone_w, phone_h), 0)
ui_draw = ImageDraw.Draw(ui_mask)
ui_draw.rounded_rectangle((0, 0, phone_w-1, phone_h-1), radius=radius-border, fill=255)

ui_rounded = ui.copy()
ui_rounded.putalpha(ui_mask)

phone.paste(ui_rounded, (border, border), ui_rounded)

# Removed notch to prevent covering the screen


# 3. Composite Left
final_left = Image.new('RGBA', (300, 250), (0, 0, 0, 0))
final_left.paste(bg, (0, 0))

shadow = Image.new('RGBA', (300, 250), (0, 0, 0, 0))
s_draw = ImageDraw.Draw(shadow)
px, py = 15, (250 - outer_h) // 2
s_draw.rounded_rectangle((px+5, py+5, px+outer_w+5, py+outer_h+5), radius=radius, fill=(0, 0, 0, 120))
shadow = shadow.filter(ImageFilter.GaussianBlur(6))

final_left = Image.alpha_composite(final_left, shadow)
final_left.paste(phone, (px, py), phone)
final_left.convert('RGB').save(out_path.replace('.png', '_left.png'))

# 4. Composite Right
final_right = Image.new('RGBA', (300, 250), (0, 0, 0, 0))
final_right.paste(bg, (0, 0))

shadow2 = Image.new('RGBA', (300, 250), (0, 0, 0, 0))
s_draw2 = ImageDraw.Draw(shadow2)
px2 = 300 - outer_w - 15
s_draw2.rounded_rectangle((px2+5, py+5, px2+outer_w+5, py+outer_h+5), radius=radius, fill=(0, 0, 0, 120))
shadow2 = shadow2.filter(ImageFilter.GaussianBlur(6))

final_right = Image.alpha_composite(final_right, shadow2)
final_right.paste(phone, (px2, py), phone)
final_right.convert('RGB').save(out_path.replace('.png', '_right.png'))

print("Generated both left and right compositions.")
