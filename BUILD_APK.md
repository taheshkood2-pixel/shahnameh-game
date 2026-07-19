# 📦 راهنمای ساخت APK از بازی شاهنامه

بازی به صورت **HTML5 PWA کامل و آفلاین** ساخته شده. برای تبدیل به APK اندروید سه روش داری، از راحت‌ترین به حرفه‌ای‌ترین:

---

## ✅ روش ۱: بدون APK (سریع‌ترین راه — همین الان)

بازی رو با هر مرورگر موبایل باز کن:
1. فایل‌های `shahnameh_game/` رو روی گوشی کپی کن یا روی یه هاست بذار (GitHub Pages، Netlify، Vercel رایگانن)
2. تو Chrome باز کن → منو (⋮) → **"Install app"** یا **"Add to Home Screen"**
3. آیکون بازی روی صفحه‌ی گوشی نصب می‌شه، کاملاً آفلاین کار می‌کنه، مثل اپ واقعیه

---

## 🔥 روش ۲: PWA Builder (خودکار، ۵ دقیقه)

1. فایل‌ها رو روی یه دامنه HTTPS بذار (مثلاً `https://username.github.io/shahnameh/`)
2. برو به: **https://www.pwabuilder.com/**
3. آدرس بازی رو بده → روی **Package for Stores → Android** کلیک کن
4. APK امضاشده رو دانلود کن، آماده‌ی نصب و انتشار در گوگل‌پلی/کافه‌بازار

---

## 🛠 روش ۳: Capacitor (محلی، بهترین کنترل)

روی کامپیوتر خودت:

```bash
# ۱. Node.js و Android Studio نصب کن
# ۲. پروژه رو بساز:
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Shahnameh" "com.arena.shahnameh" --web-dir=shahnameh_game
npx cap add android

# ۳. کپی و باز کردن پروژه اندروید:
npx cap sync android
npx cap open android

# ۴. توی Android Studio: Build → Build APK
```

فایل APK در مسیر `android/app/build/outputs/apk/debug/app-debug.apk` ساخته می‌شه.

برای انتشار در Play Store:
```bash
cd android && ./gradlew bundleRelease
```

---

## 🎯 روش ۴: Cordova (کلاسیک)

```bash
npm install -g cordova
cordova create shahnamehApp com.arena.shahnameh Shahnameh
cd shahnamehApp
# محتویات shahnameh_game/ رو تو www/ کپی کن
cordova platform add android
cordova build android --release
```

---

## 📝 نکات مهم

- **مجوزها**: بازی نیازی به مجوز خاصی نداره (کاملاً آفلاین، بدون شبکه)
- **حجم APK نهایی**: حدود ۲۵ مگابایت (بخاطر تصاویر HD)
- **بهینه‌سازی**: اگه خواستی حجم رو کم کنی، تصاویر رو با ابزار [Squoosh](https://squoosh.app) به WebP تبدیل کن (تا ۷۰٪ کاهش)
- **امضای دیجیتال**: برای انتشار حتماً APK باید signed باشه — Android Studio یا `apksigner` این کار رو می‌کنه
- **کافه‌بازار**: می‌تونی همین APK رو مستقیم روی [cafebazaar.ir](https://developers.cafebazaar.ir) بذاری

---

## 💰 راه‌های درآمدزایی

1. **AdMob** — تبلیغات پاداشی (ویدیوی ۳۰ ثانیه = ۲× طلا)
2. **In-App Purchase** — پکیج الماس، Battle Pass ماهانه
3. **کافه‌بازار Pardakht** — برای بازار ایران
4. **Myket IAP** — بازار جایگزین ایران

کد بازی از قبل جای گذاشتن SDKها آماده‌ست — کافیه در `index.html` تابع `doSummon` رو با فراخوانی SDK تبلیغات جایگزین کنی.
