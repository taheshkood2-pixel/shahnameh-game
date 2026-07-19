# 🚀 راهنمای انتشار در گیت‌هاب و ساخت خودکار APK

این راهنما بازی رو در گیت‌هاب می‌ذاره و **به‌طور کاملاً خودکار** APK می‌سازه و در Releases قرار می‌ده.

---

## گام ۱: ساخت مخزن (Repository) در GitHub

1. برو به: **https://github.com/new**
2. نام مخزن: `shahnameh-game` (یا هر اسمی)
3. Public انتخاب کن
4. تیک **Add a README file** رو نزن
5. کلیک روی **Create repository**

---

## گام ۲: ساخت Personal Access Token

برای push شدن به گیت‌هاب نیاز به توکن داری (پسورد کار نمی‌کنه):

1. برو به: **https://github.com/settings/tokens/new**
2. Note: `shahnameh push`
3. Expiration: `90 days` (یا هر چقدر خواستی)
4. Scopes: تیک بزن روی
   - ✅ **repo** (تمام زیرشاخه‌ها)
   - ✅ **workflow**
5. کلیک روی **Generate token** → توکن رو کپی کن (فقط یک بار نشون داده می‌شه!)

---

## گام ۳: Push کردن به گیت‌هاب

روی کامپیوترت (Linux/Mac/Windows-WSL):

```bash
# فایل‌های shahnameh_game/ رو کپی کن
cd /path/to/shahnameh_game

# اجرای اسکریپت (username_تو رو بذار)
bash push-to-github.sh YOUR_USERNAME shahnameh-game
```

وقتی پرسید:
- **Username**: نام کاربری گیت‌هابت
- **Password**: **توکنی که ساختی** (نه پسورد گیت‌هاب!)

---

## گام ۴: فعال‌سازی GitHub Pages و Actions

بعد از push:

1. برو به تنظیمات مخزن: `https://github.com/YOUR_USERNAME/shahnameh-game/settings`
2. **Actions → General** → گزینه‌ی **Allow all actions and reusable workflows** رو انتخاب کن → Save
3. **Pages** → Source → گزینه‌ی **GitHub Actions** رو انتخاب کن
4. **Actions → General** پایین صفحه → Workflow permissions → **Read and write permissions** → Save

---

## گام ۵: تماشای ساخت خودکار APK 🎬

1. برو به تب **Actions** در مخزن
2. یه ورک‌فلو با نام "Build APK & Deploy to GitHub Pages" در حال اجراست
3. صبر کن حدود ۵-۷ دقیقه ✅
4. وقتی سبز شد:
   - **APK آماده**: برو به **Releases** → دانلود `app-debug.apk`
   - **نسخه‌ی وب**: `https://YOUR_USERNAME.github.io/shahnameh-game/`

---

## 🔧 عیب‌یابی

### ❌ خطای "workflow files are not enabled"
- Settings → Actions → General → Allow all actions

### ❌ ورک‌فلو fail می‌شه
- برو تب Actions → روی run کلیک کن → لاگ رو بخون
- معمولاً بخاطر مجوز Release هست: Settings → Actions → General → Workflow permissions → Read and write

### ❌ APK نصب نمی‌شه روی گوشی
- گوشیت باید اجازه‌ی نصب از منابع ناشناخته رو داشته باشه (Settings → Security → Unknown Sources)
- APK رو مستقیم از Releases دانلود کن، نه از Artifacts (Artifacts داخل zip هستن)

---

## 🎯 هر بار که تغییر می‌دی

فقط این دو دستور:
```bash
git add -A && git commit -m "توضیحات تغییر"
git push
```

و بعد از ~۵ دقیقه، APK جدید در Releases آماده‌ست 🎉

---

## 📱 نصب مستقیم روی گوشی (بدون APK)

اگر نمی‌خوای APK بسازی:
1. برو به `https://YOUR_USERNAME.github.io/shahnameh-game/` روی Chrome موبایل
2. منوی سه‌نقطه → **Add to Home Screen**
3. آیکون بازی روی صفحه گوشیت می‌آد، مثل اپ واقعی، آفلاین کار می‌کنه

---

ساخته‌شده با ❤️ توسط Arena.ai Agent Mode
