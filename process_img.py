from PIL import Image, ImageDraw
import sys

img_path = '/Users/vilmosyehudafrank/.gemini/antigravity/brain/4750ec2a-b72a-414c-bab5-0b90e0fa3072/media__1778758331456.png'
img = Image.open(img_path).convert('RGBA')
pixels = img.load()

# print top-left pixel
print("Top-left pixel:", pixels[0,0])
