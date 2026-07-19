#!/usr/bin/env python3
# Split sprite sheet into individual item images
from PIL import Image
import os

# Load sprite sheet
sheet = Image.open('assets/items/sprite_sheet_50_items.png')
width, height = sheet.size

# Assume 5 columns x 10 rows based on prompt
cols = 5
rows = 10
cell_w = width // cols
cell_h = height // rows

output_dir = 'assets/items/split'
os.makedirs(output_dir, exist_ok=True)

item_names = [
    'weapon_sword_01','weapon_sword_02','weapon_axe_01','weapon_bow_01','weapon_spear_01',
    'weapon_mace_01','weapon_dagger_01','weapon_hammer_01','weapon_lance_01','weapon_staff_01',
    'helm_leather_01','helm_bronze_01','helm_steel_01','helm_gold_01','helm_crown_01',
    'helm_royal_01','helm_dark_01','helm_legend_01','helm_ancient_01','helm_divine_01',
    'armor_leather_01','armor_scale_01','armor_plate_01','armor_royal_01','armor_legend_01',
    'armor_tiger_01','armor_immortal_01','armor_dark_01','armor_golden_01','armor_divine_01',
    'boots_leather_01','boots_steel_01','boots_royal_01','boots_legend_01','boots_divine_01',
    'boots_race_01','boots_war_01','boots_magic_01','boots_ancient_01','boots_shadow_01',
    'ring_bronze_01','ring_silver_01','ring_gold_01','ring_ruby_01','ring_emerald_01',
    'ring_turquoise_01','ring_sapphire_01','ring_amethyst_01','ring_legend_01','ring_divine_01',
    'neck_amulet_01','neck_chain_01','neck_pendant_01','neck_golden_01','neck_royal_01',
    'belt_leather_01','belt_steel_01','belt_golden_01','belt_royal_01','belt_legend_01',
]

# Fill remaining if less than 50
while len(item_names) < cols * rows:
    item_names.append(f'item_extra_{len(item_names)+1:02d}')

for idx in range(cols * rows):
    x = (idx % cols) * cell_w
    y = (idx // cols) * cell_h
    crop = sheet.crop((x, y, x + cell_w, y + cell_h))
    # Resize to square for uniform icons
    crop = crop.resize((128, 128), Image.Resampling.LANCZOS)
    # Add padding to preserve aspect if needed
    filename = f'{item_names[idx]}.png'
    crop.save(os.path.join(output_dir, filename))
    print(f'Saved {filename} ({crop.size})')

print(f"Split {cols * rows} items to {output_dir}/")
