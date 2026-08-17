from PIL import Image
img_path = '/Users/vilmosyehudafrank/.gemini/antigravity/scratch/pray-for-israel/public/android-chrome-192x192.png'
# Wait, let's use the cropped version from earlier so it's high res
import os
os.system("python3 -c \"from PIL import Image; img=Image.open('menorah_clean.png'); img.resize((512,512), Image.Resampling.LANCZOS).save('public/android-chrome-512x512.png')\"")
