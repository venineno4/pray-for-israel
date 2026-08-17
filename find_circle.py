from PIL import Image, ImageDraw, ImageFilter
import sys
import math

img_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/4750ec2a-b72a-414c-bab5-0b90e0fa3072/media__1778758331456.png'
img = Image.open(img_path).convert('RGBA')
width, height = img.size
pixels = img.load()

# Let's find the outermost dark blue pixels.
# The blue ring is dark blue. Let's find pixels where B > R and B > G and B < 150 and R < 100 and G < 100
blue_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Check if it's a dark blue color
        if b > r + 20 and b > g + 20 and b < 180 and r < 100 and g < 120:
            blue_pixels.append((x, y))

if not blue_pixels:
    print("No blue pixels found.")
    sys.exit(1)

min_x = min(p[0] for p in blue_pixels)
max_x = max(p[0] for p in blue_pixels)
min_y = min(p[1] for p in blue_pixels)
max_y = max(p[1] for p in blue_pixels)

print(f"Blue pixels bounding box: {min_x}, {min_y}, {max_x}, {max_y}")

center_x = (min_x + max_x) / 2
center_y = (min_y + max_y) / 2
radius = max((max_x - min_x) / 2, (max_y - min_y) / 2)

print(f"Center: {center_x}, {center_y}, Radius: {radius}")

# Now let's create a circular mask
mask = Image.new('L', (width, height), 0)
draw = ImageDraw.Draw(mask)
# Add a small buffer to the radius to ensure we don't cut off the anti-aliased edge of the ring.
radius += 2
draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), fill=255)

# Apply mask to the original image
# Instead of applying it to everything, we can just set alpha=0 where mask is 0
output = Image.new('RGBA', (width, height), (0,0,0,0))
out_pixels = output.load()
for y in range(height):
    for x in range(width):
        if mask.getpixel((x, y)) > 0:
            out_pixels[x, y] = pixels[x, y]

# Crop the image to the bounding box of the circle to make it snug
output_cropped = output.crop((int(center_x - radius), int(center_y - radius), int(center_x + radius), int(center_y + radius)))

output_cropped.save('menorah_clean.png')
print(f"Saved menorah_clean.png with size {output_cropped.size}")
