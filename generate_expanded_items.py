#!/usr/bin/env python3
# Generate expanded ITEMS array with 50 items per category
categories = {
    'weapon': [
        ('sword_01','Common',6), ('sword_02','Common',8), ('axe_01','Rare',14), ('bow_01','Rare',16),
        ('spear_01','Rare',18), ('mace_01','Epic',26), ('dagger_01','Epic',28), ('hammer_01','Epic',30),
        ('lance_01','Legendary',45), ('staff_01','Legendary',48),
    ],
    'helm': [
        ('leather_01','Common',4,12), ('bronze_01','Common',8,24), ('steel_01','Rare',14,36),
        ('gold_01','Rare',16,40), ('crown_01','Epic',20,60,4), ('royal_01','Epic',24,70,6),
        ('dark_01','Rare',12,30), ('legend_01','Legendary',28,100,8),
        ('ancient_01','Legendary',32,110,10), ('divine_01','Legendary',40,140,15),
    ],
    'armor': [
        ('leather_01','Common',12,36), ('scale_01','Rare',22,60), ('plate_01','Epic',30,85,4),
        ('royal_01','Epic',34,95,6), ('legend_01','Legendary',50,150,10),
        ('tiger_01','Legendary',52,160,12), ('immortal_01','Legendary',55,180,15),
        ('dark_01','Rare',18,50), ('golden_01','Epic',36,100,8), ('divine_01','Legendary',60,200,20),
    ],
    'boots': [
        ('leather_01','Common',4,2), ('steel_01','Rare',8,4), ('royal_01','Rare',12,6),
        ('legend_01','Legendary',20,12,30), ('divine_01','Legendary',25,15,40),
        ('race_01','Rare',10,8,10), ('war_01','Epic',14,6,20), ('magic_01','Epic',16,10,25),
        ('ancient_01','Rare',10,4,15), ('shadow_01','Epic',18,8,22),
    ],
    'ring': [
        ('bronze_01','Common',4), ('silver_01','Rare',10,3), ('gold_01','Rare',12,3),
        ('ruby_01','Epic',22,8), ('emerald_01','Epic',24,6), ('turquoise_01','Rare',14,4),
        ('sapphire_01','Rare',16,5), ('amethyst_01','Epic',20,7), ('legend_01','Legendary',32,10),
        ('divine_01','Legendary',40,15),
    ],
    'necklace': [
        ('amulet_01','Rare',8,10), ('chain_01','Rare',10,15), ('pendant_01','Epic',18,25),
        ('golden_01','Epic',22,30,5), ('royal_01','Legendary',30,50,10),
        ('silver_01','Common',6,8), ('bronze_01','Common',4,6), ('crystal_01','Rare',12,20),
        ('shadow_01','Rare',14,22), ('divine_01','Legendary',36,60,12),
    ],
    'belt': [
        ('leather_01','Common',2,8), ('steel_01','Rare',6,16), ('golden_01','Rare',8,20),
        ('royal_01','Epic',12,30,4), ('legend_01','Legendary',18,45,8),
        ('dark_01','Rare',5,14), ('ancient_01','Rare',7,18), ('magic_01','Epic',10,25),
        ('war_01','Rare',8,20), ('shadow_01','Epic',14,30,6),
    ],
}

# Generate names and data for 50 items per category
items_data = []

for cat, templates in categories.items():
    for i in range(50):
        if i < len(templates):
            t = templates[i]
            suffix = t[0]
        else:
            suffix = f'{i+1:02d}'
        # Generate rarity progression
        rarity_cycle = ['Common','Rare','Epic','Legendary','Common','Rare','Epic','Legendary','Rare','Epic']
        rarity = rarity_cycle[i % len(rarity_cycle)]
        item_id = f'{cat}_{suffix}'
        name_fa = f'{cat} {suffix.replace("_", " ").title()}'
        name_en = f'{cat.capitalize()} {suffix.replace("_", " ").title()}'
        # Stats based on category
        stats = {}
        if cat == 'weapon':
            stats['atk'] = 6 + (i // 5) * 8
            if i > 35: stats['crit'] = 5 + (i % 5) * 3
        elif cat == 'helm':
            stats['def'] = 4 + (i // 5) * 4
            stats['hp'] = 10 + (i // 5) * 15
            if i > 20: stats['atk'] = 2 + (i % 3)
        elif cat == 'armor':
            stats['def'] = 10 + (i // 5) * 6
            stats['hp'] = 20 + (i // 5) * 20
            if i > 30: stats['atk'] = 4 + (i % 4)
        elif cat == 'boots':
            stats['def'] = 2 + (i // 5) * 3
            stats['spd'] = 1 + (i // 3) * 2
            if i > 25: stats['hp'] = 10 + (i % 5) * 5
        elif cat == 'ring':
            stats['atk'] = 4 + (i // 5) * 6
            if i > 20: stats['crit'] = 2 + (i % 4)
            if i > 10: stats['def'] = 2 + (i % 3)
        elif cat == 'necklace':
            stats['hp'] = 15 + (i // 5) * 10
            stats['def'] = 3 + (i // 5) * 3
            if i > 30: stats['atk'] = 5 + (i % 5)
        elif cat == 'belt':
            stats['def'] = 3 + (i // 5) * 4
            stats['hp'] = 12 + (i // 5) * 12
            stats['spd'] = 1 + (i % 5)
        
        item_obj = {
            'id': item_id,
            'type': cat,
            'rarity': rarity,
            'name': {'fa': name_fa, 'en': name_en},
        }
        item_obj.update(stats)
        if i < 10:
            heroes = ['rostam','arash','fereydun','garshasp']
            item_obj['hero'] = heroes[i % len(heroes)]
        # Build JS string using concatenation to avoid f-string brace issues
        parts = []
        parts.append(f"  {{id:'{item_obj['id']}',type:'{cat}',rarity:'{rarity}',name:")
        parts.append(f"{{fa:'{name_fa}',en:'{name_en}'}}")
        for k, v in stats.items():
            parts.append(f",{k}:{v}")
        if 'hero' in item_obj:
            parts.append(f",hero:'{item_obj['hero']}'")
        parts.append("},")
        entry_str = ''.join(parts)
        items_data.append(entry_str)

# Write output
with open('expanded_items_array.js', 'w', encoding='utf-8') as f:
    f.write('// Expanded ITEMS array — 50 items per category (350 total)\n')
    f.write('const EXPANDED_ITEMS = [\n')
    for line in items_data:
        f.write(line + '\n')
    f.write('];\n')
    print(f"Generated {len(items_data)} items")
