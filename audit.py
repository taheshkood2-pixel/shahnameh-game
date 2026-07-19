#!/usr/bin/env python3
import os, re

print("=" * 70)
print("🏆 FINAL HONEST SCORES (out of 1000)")
print("=" * 70)

# Count actual content
with open('data.js', 'r') as f:
    data = f.read()

heroes_count = data[:data.find('TALENT_TREE')].count("id:'")  # rough count
items_section = data[data.find('const ITEMS'):data.find('// ---------------- PETS')]
items_count = items_section.count("id:'")
enemies_section = data[data.find('const ENEMIES'):data.find('const ITEMS')]
enemies_count = enemies_section.count("id:'")

# Item SVG quality
svg_sizes = [os.path.getsize('assets/items/'+f) for f in os.listdir('assets/items') if f.endswith('.svg')]
avg_svg = sum(svg_sizes) // len(svg_sizes) if svg_sizes else 0

# Hero portrait quality  
hero_sizes = [os.path.getsize('assets/heroes/'+f) for f in os.listdir('assets/heroes') if f.endswith('.png')]
avg_hero = sum(hero_sizes) // len(hero_sizes) // 1024 if hero_sizes else 0

# Scene quality
scene_sizes = [os.path.getsize('assets/story/'+f) for f in os.listdir('assets/story') if f.endswith('.png')]
avg_scene = sum(scene_sizes) // len(scene_sizes) // 1024 if scene_sizes else 0

# Audio files
audio_count = len([f for f in os.listdir('assets/audio') if f.endswith('.mp3')])

print(f"\n📊 Content Stats:")
print(f"  Heroes: 26 | Enemies: {enemies_count} | Items: {items_count}")
print(f"  Hero portraits: avg {avg_hero}KB | Scenes: avg {avg_scene}KB")
print(f"  Item SVGs: avg {avg_svg} bytes | Audio: {audio_count} files")

print(f"""
{'═'*70}
🎨 GRAPHICS (گرافیک)                                    420/1000
{'─'*70}
  ✅ AI-generated hero portraits (26 unique)     → 680/1000
  ✅ AI-generated cinematic scenes (7)           → 620/1000  
  ✅ CSS UI polished (dark/gold theme)           → 720/1000
  ⚠️ Item SVGs are simple vector shapes          → 350/1000
  ⚠️ Battle sprites are STATIC (no animation)    → 380/1000
  ⚠️ Background SVGs are very basic              → 400/1000
  ❌ No animated sprites / particle systems       → 200/1000
  ❌ No equipment-on-character visual             → 150/1000

⚔ GAMEPLAY (گیم‌پلی)                                   710/1000
{'─'*70}
  ✅ 5 class-based skills (warrior/tank/mage/..) → 780/1000
  ✅ 7-slot equipment + enhancement              → 800/1000
  ✅ Star evolution + Prestige system            → 850/1000
  ✅ Daily challenge + Set bonuses               → 750/1000
  ✅ Shop + Auto-equip                           → 700/1000
  ⚠️ Minigames basic (archery/race/forge)        → 600/1000
  ⚠️ No formation positioning UI                 → 500/1000

⚖️ BALANCE (بالانس)                                     680/1000
{'─'*70}
  ✅ Starting experience (Lv3 Kaveh + SR hero)   → 750/1000
  ✅ Minigame cooldowns prevent exploit          → 700/1000
  ✅ Boss scaling gentler (0.18/chapter)         → 700/1000
  ⚠️ Early game still tight on resources         → 600/1000
  ⚠️ Item drop rates could be higher early       → 650/1000

📱 MOBILE UX (تجربه موبایل)                             730/1000
{'─'*70}
  ✅ 48px+ touch targets                         → 800/1000
  ✅ Safe area support (notch/home bar)          → 850/1000
  ✅ PWA + offline support                       → 800/1000
  ✅ RTL/LTR + bilingual                         → 750/1000
  ⚠️ Some screens dense on small phones          → 600/1000

🔊 AUDIO (صدا)                                         550/1000
{'─'*70}
  ✅ 44 voice files (hero/enemy voices)          → 700/1000
  ✅ 7 cinematic narration tracks                → 700/1000
  ✅ Procedural Persian music (WebAudio)         → 500/1000
  ⚠️ SFX are basic oscillator tones              → 450/1000
  ❌ No ambient sounds / battle cries            → 300/1000

📖 STORY (داستان)                                       720/1000
{'─'*70}
  ✅ Rich Shahnameh content (26 heroes)          → 850/1000
  ✅ 7 chapters with cinematic intro             → 750/1000
  ✅ Bilingual text (FA + EN)                    → 800/1000
  ⚠️ Only chapter intros have story scenes       → 550/1000
  ❌ No inter-chapter narrative / dialogues      → 400/1000

{'═'*70}
  WEIGHTED TOTAL:                                   635/1000
{'═'*70}
""")

print("🔴 BIGGEST WEAKNESSES (what drags score down):")
print("  1. Equipment doesn't visually appear ON characters (150/1000)")
print("  2. No animated battle sprites — just static images (380/1000)")  
print("  3. Item SVGs are simple shapes, not game-quality art (350/1000)")
print("  4. Background SVGs are extremely basic (400/1000)")
print("  5. No ambient/battle sound effects (300/1000)")
print("  6. Story only at chapter start — no inter-mission narrative (400/1000)")
