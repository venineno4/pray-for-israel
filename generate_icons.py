from PIL import Image, ImageDraw
import sys

img_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/4750ec2a-b72a-414c-bab5-0b90e0fa3072/media__1778758331456.png'
img = Image.open(img_path).convert('RGBA')
width, height = img.size
pixels = img.load()

# Bounding box of the blue ring from previous run
center_x = 429.5
center_y = 438.0
radius = 358.5 + 2  # slight buffer to keep the edge

# Supersampling factor for anti-aliasing
factor = 4
mask = Image.new('L', (width * factor, height * factor), 0)
draw = ImageDraw.Draw(mask)
cx = center_x * factor
cy = center_y * factor
r = radius * factor
draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)

# Downsample mask
mask = mask.resize((width, height), Image.Resampling.LANCZOS)

# Apply mask
output = Image.new('RGBA', (width, height), (0,0,0,0))
out_pixels = output.load()
for y in range(height):
    for x in range(width):
        alpha = mask.getpixel((x, y))
        if alpha > 0:
            r_val, g_val, b_val, a_val = pixels[x, y]
            # combine alphas
            final_alpha = int((alpha / 255.0) * (a_val / 255.0) * 255)
            out_pixels[x, y] = (r_val, g_val, b_val, final_alpha)

# Crop
crop_box = (int(center_x - radius), int(center_y - radius), int(center_x + radius), int(center_y + radius))
cropped = output.crop(crop_box)

# Define output paths
public_dir = '/Users/vilmosyehudafrank/.gemini/antigravity/scratch/pray-for-israel/public/'

# 1. android-chrome-192x192.png
android_192 = cropped.resize((192, 192), Image.Resampling.LANCZOS)
android_192.save(public_dir + 'android-chrome-192x192.png')

# 2. apple-touch-icon.png (180x180)
apple_180 = cropped.resize((180, 180), Image.Resampling.LANCZOS)
apple_180.save(public_dir + 'apple-touch-icon.png')

# 3. favicon-32x32.png
fav_32 = cropped.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save(public_dir + 'favicon-32x32.png')

# 4. favicon.ico (16x16 and 32x32)
fav_16 = cropped.resize((16, 16), Image.Resampling.LANCZOS)
fav_32.save(public_dir + 'favicon.ico', format='ICO', sizes=[(32, 32), (16, 16)], append_images=[fav_16])

print("Icons generated successfully in public directory.")
