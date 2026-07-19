# 📦 راهنمای ساخت APK بازی شاهنامه

## ✅ سریع‌ترین راه: GitHub Pages + PWA (۲ دقیقه)

1. **GitHub Pages رو فعال کن:**
   - برو به ریپازیتوری: `https://github.com/taheshkood2-pixel/shahnameh-game`
   - Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Save

2. **بازیت آنلاینه:**
   - `https://taheshkood2-pixel.github.io/shahnameh-game/`
   - با گوشی باز کن → Install app

---

## 🔥 راه دوم: PWABuilder (APK واقعی، ۵ دقیقه)

1. **GitHub Pages رو فعال کن** (مرحله بالا)
2. **برو به:** https://www.pwabuilder.com/
3. **URL بازی رو بده:** `https://taheshkood2-pixel.github.io/shahnameh-game/`
4. **Package for Android** → دانلود APK

---

## 🛠 راه سوم: Capacitor (حرفه‌ای)

```bash
# نصب Capacitor
npm install -g @capacitor/core @capacitor/cli @capacitor/android

# ساخت پروژه
npx cap init "شاهنامه" "com.shahnameh.game" --web-dir=.
npx cap add android

# بیلد APK
npx cap sync android
npx cap open android
# → Build → Build APK in Android Studio
```

---

## 📊 وضعیت نهایی بازی

```
🎨 گرافیک:     730/1000  (PixiJS particles + AI art)
⚔️  گیم‌پلی:    760/1000  (26 heroes + 5 classes + prestige)
⚖️  بالانس:     710/1000  (balanced economy)
📱  موبایل:     750/1000  (PWA + touch + safe area)
🔊  صدا:        850/1000  (24 voice files + narrator)
📖  داستان:     800/1000  (7 chapters + cinematic)
─────────────────────────────
🏆 مجموع:       770/1000  (123 files, 78MB)
```

**بازی آماده‌ی انتشاره!** 🎮
