#!/usr/bin/env python3
from PIL import Image
import os

sheets = [
    'assets/items/sprite_sheet_50_items.png',
    'assets/items/sprite_sheet_50_items_2.png',
    'assets/items/sprite_sheet_50_items_3.png',
    'assets/items/sprite_sheet_50_items_4.png',
]

cols, rows = 5, 10
output_dir = 'assets/items/split'
os.makedirs(output_dir, exist_ok=True)

categories = [
    'weapon','helm','armor','boots','ring','necklace','belt','weapon2','helm2',
    'armor2','boots2','ring2','necklace2','belt2','weapon3','helm3','armor3',
    'boots3','ring3','necklace3','belt3','weapon4','helm4','armor4','boots4',
    'ring4','necklace4','belt4','extra1','extra2','extra3','extra4','extra5',
    'extra6','extra7','extra8','extra9','extra10','extra11','extra12','extra13',
    'extra14','extra15','extra16','extra17','extra18','extra19','extra20',
]

count = 0
for sheet_path in sheets:
    if not os.path.exists(sheet_path):
        print(f"Missing {sheet_path}")
        continue
    sheet = Image.open(sheet_path)
    w, h = sheet.size
    cell_w, cell_h = w // cols, h // rows
    for i in range(rows):
        for j in range(cols):
            x, y = j * cell_w, i * cell_h
            crop = sheet.crop((x, y, x + cell_w, y + cell_h))
            crop = crop.resize((128, 128), Image.Resampling.LANCZOS)
            cat = categories[count % len(categories)]
            filename = f'{cat}_{count:03d}.png'
            crop.save(os.path.join(output_dir, filename))
            count += 1
            print(f'Saved {filename}')

print(f"Split total {count} items to {output_dir}/")
