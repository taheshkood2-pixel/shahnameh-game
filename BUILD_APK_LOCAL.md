# 📱 ساخت APK به صورت محلی

GitHub Actions مشکل داره، ولی می‌تونی خیلی راحت روی کامپیوتر خودت APK بسازی:

## روش ۱: استفاده از PWABuilder (ساده‌ترین - ۵ دقیقه)

1. **GitHub Pages رو فعال کن:**
   - برو به: https://github.com/taheshkood2-pixel/shahnameh-game/settings/pages
   - Branch: `main` → Save

2. **صبر کن تا Pages deploy بشه** (معمولاً ۱-۲ دقیقه)

3. **برو به PWABuilder:**
   - https://www.pwabuilder.com/
   - URL بازی رو وارد کن: `https://taheshkood2-pixel.github.io/shahnameh-game/`
   - روی "Package for Stores" → "Android" کلیک کن
   - APK رو دانلود کن!

---

## روش ۲: Capacitor (حرفه‌ای - ۱۰ دقیقه)

### پیش‌نیازها:
```bash
# نصب Node.js (اگه نداری)
# https://nodejs.org/

# نصب Android Studio
# https://developer.android.com/studio
```

### مراحل:
```bash
# ۱. Clone repo
git clone https://github.com/taheshkood2-pixel/shahnameh-game.git
cd shahnameh-game

# ۲. نصب Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# ۳. آماده‌سازی web files
mkdir -p www
cp index.html data.js game.js music.js sw.js manifest.json www/
cp -r assets www/

# ۴. ساخت config
cat > capacitor.config.json << CEOF
{
  "appId": "com.shahnameh.game",
  "appName": "شاهنامه",
  "webDir": "www"
}
CEOF

# ۵. اضافه کردن Android
npx cap add android
npx cap sync android

# ۶. باز کردن در Android Studio
npx cap open android

# ۷. در Android Studio:
#    - File → Sync Project with Gradle Files
#    - Build → Build Bundle(s) / APK(s) → Build APK(s)
#    - APK در: android/app/build/outputs/apk/debug/
```

---

## روش ۳: استفاده از بازی آنلاین (فوری!)

بازی همین الان آنلاینه و می‌تونی روی موبایل نصبش کنی:

1. با Chrome موبایل برو به:
   ```
   https://taheshkood2-pixel.github.io/shahnameh-game/
   ```

2. منو (⋮) → "Add to Home Screen"

3. آیکون بازی روی صفحه اصلی اضافه میشه - مثل یه اپ واقعی!

---

## 🎮 بازی آنلاین

همین الان می‌تونی بازی کنی:
👉 https://taheshkood2-pixel.github.io/shahnameh-game/

بازی PWA هست، پس روی موبایل مثل اپ واقعی کار می‌کنه! 🚀
