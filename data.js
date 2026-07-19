// ============================================================
// SHAHNAMEH: RISE OF KINGS - GAME DATA
// همه قهرمانان، دشمنان، آیتم‌ها، فصل‌ها، دیالوگ‌ها
// ============================================================

// ---------------- HEROES (26 total) ----------------
const HEROES = [
  // ===== SSR - LEGENDARY (افسانه‌ای) =====
  {id:'rostam',ext:'png',name:{fa:'رستم دستان',en:'Rostam the Mighty'},title:{fa:'جهان‌پهلوان',en:'World Champion'},rarity:'SSR',class:'warrior',
    hp:280,atk:55,def:40,spd:12,crit:20,
    skill:{fa:'گرز گاوسر — ضربه ویرانگر، ۲.۵ برابر آسیب',en:'Bull-Mace — Devastating strike, 2.5× damage'},
    lore:{fa:'بزرگترین پهلوان شاهنامه، سوار بر رخش، با ببر بیان و گرز گاوسر. هفت خوان را پیمود و دیو سپید را کشت.',en:'The greatest hero of Shahnameh, riding Rakhsh, wearing the Tiger-Cloak; completed the Seven Labors.'},
    voice:'rostam_voice'},
  {id:'esfandiar',ext:'png',name:{fa:'اسفندیار رویین‌تن',en:'Esfandiar the Invincible'},title:{fa:'شاهزاده رویین‌تن',en:'Brazen Prince'},rarity:'SSR',class:'tank',
    hp:320,atk:42,def:55,spd:8,crit:10,
    skill:{fa:'تن رویین — ۳ نوبت مصونیت کامل',en:'Brazen Body — 3-turn immunity'},
    lore:{fa:'شاهزاده رویین‌تن که تنها چشمانش آسیب‌پذیر بود و در هفت خوان خود اژدها و دیو را کشت.',en:'The invincible prince whose only weakness was his eyes.'},voice:null},
  {id:'fereydun',ext:'png',name:{fa:'فریدون',en:'Fereydun the King'},title:{fa:'شاه دادگر',en:'The Just King'},rarity:'SSR',class:'support',
    hp:250,atk:38,def:35,spd:14,crit:15,
    skill:{fa:'فرمان شاهانه — درمان کل تیم +۳۰٪',en:'Royal Command — Heal team +30%'},
    lore:{fa:'شاه دادگر ایران که ضحاک ماردوش را شکست داد و به بند کشید. حکومت ۵۰۰ ساله او دوران طلایی بود.',en:'The just king who defeated Zahhak and chained him under Mount Damavand.'},voice:null},
  {id:'jamshid',ext:'png',name:{fa:'جمشید',en:'Jamshid the Radiant'},title:{fa:'شاه فرمند',en:'The Radiant King'},rarity:'SSR',class:'mage',
    hp:220,atk:60,def:25,spd:13,crit:25,
    skill:{fa:'جام جهان‌نما — پیش‌گویی، ضربه دو برابر',en:'Cup of Jamshid — Foresight, 2× damage'},
    lore:{fa:'شاه چهارم پیشدادی، مخترع آتش، فلز، پزشکی. جام جم را داشت که هفت اقلیم را در آن می‌دید.',en:'Fourth Pishdadian king, inventor of fire, metal, medicine. Owned the Cup of Foresight.'},voice:null},
  {id:'kourosh',ext:'png',name:{fa:'کوروش بزرگ',en:'Cyrus the Great'},title:{fa:'پدر ایران',en:'Father of Iran'},rarity:'SSR',class:'support',
    hp:260,atk:45,def:42,spd:15,crit:18,
    skill:{fa:'منشور کوروش — افزایش دائم آمار کل تیم',en:'Cyrus Cylinder — Permanent team stat boost'},
    lore:{fa:'بنیانگذار امپراتوری هخامنشی، نویسنده اولین منشور حقوق بشر. یهود را از بابل آزاد کرد.',en:'Founder of the Achaemenid Empire; author of the first human rights charter.'},voice:null},
  {id:'dariush',ext:'png',name:{fa:'داریوش بزرگ',en:'Darius the Great'},title:{fa:'شاهنشاه',en:'King of Kings'},rarity:'SSR',class:'warrior',
    hp:270,atk:50,def:38,spd:12,crit:16,
    skill:{fa:'راه شاهی — همه متحدان یک حمله اضافه',en:'Royal Road — All allies extra attack'},
    lore:{fa:'شاهنشاه هخامنشی که تخت‌جمشید را ساخت و راه شاهی ۲۵۰۰ کیلومتری را برپا کرد.',en:'Achaemenid emperor who built Persepolis and the 2500km Royal Road.'},voice:null},
  {id:'siavash',ext:'png',name:{fa:'سیاوش',en:'Siavash the Pure'},title:{fa:'شاهزاده پاک',en:'The Pure Prince'},rarity:'SSR',class:'mage',
    hp:200,atk:52,def:28,spd:16,crit:22,
    skill:{fa:'گذر از آتش — پاکسازی و درمان',en:'Pass Through Fire — Cleanse and heal'},
    lore:{fa:'شاهزاده پاک که برای اثبات بی‌گناهی از آتش گذشت. کینه خونش جنگ بزرگ ایران و توران را برانگیخت.',en:'The pure prince who walked through fire to prove his innocence.'},voice:null},
  {id:'kaykhosrow',ext:'png',name:{fa:'کیخسرو',en:'Kay Khosrow'},title:{fa:'شاه مقدس',en:'The Holy King'},rarity:'SSR',class:'support',
    hp:240,atk:44,def:36,spd:14,crit:17,
    skill:{fa:'فره ایزدی — احیای متحد افتاده',en:'Divine Glory — Revive fallen ally'},
    lore:{fa:'پسر سیاوش، شاه بزرگ ایران که انتقام پدرش را از افراسیاب گرفت.',en:'Son of Siavash; the great king who avenged his father against Afrasiab.'},voice:null},
  {id:'garshasp',ext:'svg',name:{fa:'گرشاسپ',en:'Garshasp the Dragonslayer'},title:{fa:'اژدهاکش',en:'Dragon Slayer'},rarity:'SSR',class:'warrior',
    hp:290,atk:53,def:35,spd:11,crit:20,
    skill:{fa:'گرز اژدهاکش — سه ضربه پی در پی',en:'Dragon-Slayer Club — 3 consecutive strikes'},
    lore:{fa:'پهلوان اسطوره‌ای که اژدهای بزرگ گندرو را کشت و ۹ روز با آن جنگید.',en:'Legendary hero who slew the great dragon Gandarva after 9 days of battle.'},voice:null},
  {id:'babak',ext:'svg',name:{fa:'بابک خرمدین',en:'Babak Khorramdin'},title:{fa:'قهرمان آزادی',en:'Champion of Freedom'},rarity:'SSR',class:'warrior',
    hp:260,atk:48,def:40,spd:15,crit:19,
    skill:{fa:'قیام سرخ — افزایش خشم متحدان',en:'Red Uprising — Rage boost for allies'},
    lore:{fa:'قهرمان بزرگ ایرانی که ۲۰ سال در برابر خلافت عباسی از قلعه بذ مقاومت کرد.',en:'Great Iranian hero who resisted the Abbasid Caliphate for 20 years from Babak Castle.'},voice:null},
  {id:'surena',ext:'svg',name:{fa:'سورنا',en:'Surena the Parthian'},title:{fa:'فاتح روم',en:'Conqueror of Rome'},rarity:'SSR',class:'archer',
    hp:220,atk:58,def:30,spd:18,crit:25,
    skill:{fa:'رگبار پارتی — ۵ تیر پیاپی',en:'Parthian Shot — 5 arrows'},
    lore:{fa:'سردار پارتی که با ۱۰ هزار سرباز، ۵۰ هزار رومی به فرماندهی کراسوس را در حران شکست داد.',en:'Parthian general who defeated 50,000 Romans with only 10,000 soldiers at Carrhae.'},voice:null},
  {id:'purandokht',ext:'svg',name:{fa:'پوران‌دخت',en:'Purandokht'},title:{fa:'ملکه ساسانی',en:'Sasanian Queen'},rarity:'SSR',class:'support',
    hp:230,atk:42,def:38,spd:15,crit:16,
    skill:{fa:'فرمان ملکه — سکوت دشمن',en:'Queens Decree — Silence enemy'},
    lore:{fa:'اولین ملکه ایران در دوره ساسانی که پس از هرج و مرج به تخت نشست.',en:'First queen of Iran during the Sasanian era.'},voice:null},

  // ===== SR - EPIC (حماسی) =====
  {id:'arash',ext:'png',name:{fa:'آرش کمانگیر',en:'Arash the Archer'},title:{fa:'مرزبان جاودان',en:'Eternal Borderer'},rarity:'SR',class:'archer',
    hp:130,atk:45,def:15,spd:20,crit:30,
    skill:{fa:'تیر جانفشان — آسیب سه برابر، خودکشی',en:'Soul-Arrow — Triple damage, self-sacrifice'},
    lore:{fa:'کمانگیری که برای تعیین مرز ایران، جان خود را در تیر نهاد.',en:'Archer who put his soul into an arrow to define Irans border.'},voice:'arash_voice'},
  {id:'gordafarid',ext:'png',name:{fa:'گردآفرید',en:'Gordafarid'},title:{fa:'دخت پهلوان',en:'Warrior Maiden'},rarity:'SR',class:'warrior',
    hp:150,atk:35,def:25,spd:17,crit:22,
    skill:{fa:'شمشیر آذرین — ضدحمله ۱۰۰٪',en:'Fiery Sword — 100% counter'},
    lore:{fa:'نخستین بانوی جنگاور شاهنامه که در برابر سهراب ایستاد.',en:'The first female warrior in Shahnameh.'},voice:'gordafarid_voice'},
  {id:'sohrab',ext:'png',name:{fa:'سهراب',en:'Sohrab'},title:{fa:'شیرزاده',en:'Lion Cub'},rarity:'SR',class:'warrior',
    hp:180,atk:40,def:22,spd:16,crit:20,
    skill:{fa:'خشم جوانی — سرعت دو برابر ۳ نوبت',en:'Youthful Fury — Double speed 3 turns'},
    lore:{fa:'پسر رستم و تهمینه، جوان‌مردی که در نبردی تراژیک به دست پدر خود کشته شد.',en:'Son of Rostam; tragically slain by his own father.'},voice:null},
  {id:'zal',ext:'png',name:{fa:'زال',en:'Zal the White'},title:{fa:'پرورده سیمرغ',en:'Raised by Simorgh'},rarity:'SR',class:'mage',
    hp:170,atk:38,def:28,spd:15,crit:18,
    skill:{fa:'پر سیمرغ — احضار سیمرغ برای حمله',en:'Simorgh Feather — Summon Simorgh'},
    lore:{fa:'پدر رستم که با موی سپید به دنیا آمد و سیمرغ او را پروراند.',en:'Father of Rostam, born with white hair, raised by the Simorgh.'},voice:null},
  {id:'rudabeh',ext:'png',name:{fa:'رودابه',en:'Rudabeh'},title:{fa:'پرنسس کابل',en:'Princess of Kabul'},rarity:'SR',class:'support',
    hp:140,atk:32,def:20,spd:16,crit:15,
    skill:{fa:'گیسوی بلند — درمان متحد',en:'Long Tresses — Heal ally'},
    lore:{fa:'دختر شاه کابل و مادر رستم. عشق او و زال از داستان‌های عاشقانه شاهنامه است.',en:'Daughter of the King of Kabul and mother of Rostam.'},voice:null},
  {id:'tahmineh',ext:'png',name:{fa:'تهمینه',en:'Tahmineh'},title:{fa:'مادر سهراب',en:'Mother of Sohrab'},rarity:'SR',class:'support',
    hp:135,atk:30,def:22,spd:17,crit:14,
    skill:{fa:'مهر مادری — احیای متحد با نیمی از جان',en:'Motherly Love — Revive ally at 50% HP'},
    lore:{fa:'شاهدخت سمنگان که همسر یک شب رستم شد و مادر سهراب.',en:'Princess of Samangan; Rostams one-night wife.'},voice:null},
  {id:'bijan',ext:'png',name:{fa:'بیژن',en:'Bijan'},title:{fa:'پهلوان جوان',en:'Young Champion'},rarity:'SR',class:'warrior',
    hp:160,atk:36,def:24,spd:18,crit:19,
    skill:{fa:'شمشیر عاشق — آسیب بیشتر به قوی‌ترین دشمن',en:'Lovers Blade — Extra damage to strongest'},
    lore:{fa:'پهلوان جوان ایران که عاشق منیژه دختر افراسیاب شد و در چاه افتاد.',en:'Young champion who fell in love with Manijeh, daughter of Afrasiab.'},voice:null},
  {id:'manijeh',ext:'svg',name:{fa:'منیژه',en:'Manijeh'},title:{fa:'دلداده بیژن',en:'Beloved of Bijan'},rarity:'SR',class:'support',
    hp:130,atk:28,def:20,spd:19,crit:13,
    skill:{fa:'وفاداری — کاهش آسیب متحدان',en:'Loyalty — Reduce ally damage taken'},
    lore:{fa:'دختر افراسیاب که عاشق بیژن ایرانی شد و برای او همه چیز را رها کرد.',en:'Daughter of Afrasiab; gave up everything for Bijan.'},voice:null},
  {id:'sam',ext:'svg',name:{fa:'سام نریمان',en:'Sam Nariman'},title:{fa:'پهلوان کهن',en:'The Ancient Champion'},rarity:'SR',class:'tank',
    hp:220,atk:34,def:42,spd:9,crit:12,
    skill:{fa:'دیوار سام — تانک، جذب آسیب متحدان',en:'Sams Wall — Absorb ally damage'},
    lore:{fa:'پدر زال و پدربزرگ رستم. پهلوان بزرگ عهد منوچهر.',en:'Father of Zal, grandfather of Rostam.'},voice:null},
  {id:'hooshang',ext:'svg',name:{fa:'هوشنگ',en:'Hooshang'},title:{fa:'کاشف آتش',en:'Discoverer of Fire'},rarity:'SR',class:'mage',
    hp:150,atk:44,def:20,spd:14,crit:20,
    skill:{fa:'آتش هوشنگ — سوزاندن، آسیب مداوم',en:'Hooshangs Fire — Burn, ongoing damage'},
    lore:{fa:'دومین شاه پیشدادی، کاشف آتش و بنیانگذار جشن سده.',en:'Second Pishdadian king; discoverer of fire.'},voice:null},
  {id:'tahmoures',ext:'svg',name:{fa:'طهمورث دیوبند',en:'Tahmoures'},title:{fa:'به‌بند کشنده دیوان',en:'Demon Binder'},rarity:'SR',class:'warrior',
    hp:180,atk:40,def:32,spd:13,crit:17,
    skill:{fa:'زنجیر دیوبند — فلج دشمن ۲ نوبت',en:'Demon-Chain — Paralyze enemy 2 turns'},
    lore:{fa:'سومین شاه پیشدادی که دیوان را به بند کشید و از آنها خط آموخت.',en:'Third Pishdadian king; bound the demons and learned writing from them.'},voice:null},
  {id:'bahram',ext:'svg',name:{fa:'بهرام گور',en:'Bahram Gur'},title:{fa:'شکارچی شاهی',en:'Royal Hunter'},rarity:'SR',class:'archer',
    hp:160,atk:42,def:22,spd:19,crit:24,
    skill:{fa:'تیر گورگیر — یک تیر، دو دشمن',en:'Onager Shot — One arrow, two enemies'},
    lore:{fa:'شاه ساسانی که به شکار گورخر مشهور بود و در باتلاق ناپدید شد.',en:'Sasanian king famous for hunting onagers; disappeared in a swamp.'},voice:null},
  {id:'shirin',ext:'svg',name:{fa:'شیرین',en:'Shirin'},title:{fa:'ملکه ارمنی',en:'Armenian Queen'},rarity:'SR',class:'support',
    hp:145,atk:32,def:24,spd:18,crit:16,
    skill:{fa:'عشق شیرین — افزایش کریتیکال متحدان',en:'Sweet Love — Boost ally crit rate'},
    lore:{fa:'ملکه ارمنی و همسر خسرو پرویز. عشق او و فرهاد افسانه‌ای است.',en:'Armenian queen and wife of Khosrow Parviz.'},voice:null},

  // ===== R - RARE (کمیاب) =====
  {id:'kaveh',ext:'png',name:{fa:'کاوه آهنگر',en:'Kaveh the Blacksmith'},title:{fa:'قهرمان قیام',en:'Hero of Revolt'},rarity:'R',class:'warrior',
    hp:140,atk:26,def:22,spd:13,crit:15,
    skill:{fa:'درفش کاویانی — افزایش حمله متحدان ۳۰٪',en:'Kaviani Banner — Boost ally attack 30%'},
    lore:{fa:'آهنگر ساده‌ای که با برافراشتن پیش‌بند چرمی، مردم را علیه ضحاک شوراند.',en:'Blacksmith who raised his apron and led revolt against Zahhak.'},voice:'kaveh_voice'},
];

// ---------------- ENEMIES (24 total) ----------------
const ENEMIES = [
  // Chapter 1 - Zahhak
  {id:'zahhak',ext:'png',name:{fa:'ضحاک ماردوش',en:'Zahhak the Serpent-King'},rarity:'SSR',hp:280,atk:32,def:20,spd:10,tier:1},
  {id:'kondrow',ext:'svg',name:{fa:'کندرو',en:'Kondrow'},rarity:'R',hp:80,atk:14,def:10,spd:12,tier:1},
  {id:'kaftar_div',ext:'svg',name:{fa:'کفتار دیو',en:'Hyena Demon'},rarity:'N',hp:60,atk:12,def:6,spd:15,tier:1},
  // Chapter 2 - Seven Labors
  {id:'sheer_div',ext:'svg',name:{fa:'شیر ژیان',en:'Fierce Lion'},rarity:'R',hp:120,atk:20,def:14,spd:14,tier:2},
  {id:'warg',ext:'svg',name:{fa:'گرگ سیاه',en:'Black Wolf'},rarity:'N',hp:70,atk:16,def:8,spd:18,tier:2},
  {id:'ghol',ext:'svg',name:{fa:'غول بیابانی',en:'Desert Giant'},rarity:'R',hp:160,atk:22,def:18,spd:8,tier:2},
  {id:'arjang_div',ext:'svg',name:{fa:'ارژنگ دیو',en:'Arjang Demon'},rarity:'SR',hp:180,atk:26,def:16,spd:11,tier:2},
  {id:'div_sepid',ext:'png',name:{fa:'دیو سپید',en:'The White Demon'},rarity:'SSR',hp:350,atk:38,def:25,spd:9,tier:2},
  // Chapter 3 - Iran vs Turan
  {id:'kamus',ext:'svg',name:{fa:'کاموس کشانی',en:'Kamus of Kashan'},rarity:'SR',hp:200,atk:28,def:20,spd:12,tier:3},
  {id:'sohrab_boss',ext:'svg',name:{fa:'خاقان چین',en:'Khaqan of China'},rarity:'SR',hp:220,atk:30,def:22,spd:11,tier:3},
  {id:'barman',ext:'svg',name:{fa:'بارمان',en:'Barman'},rarity:'R',hp:150,atk:24,def:16,spd:14,tier:3},
  {id:'hooman',ext:'svg',name:{fa:'هومان تورانی',en:'Human of Turan'},rarity:'R',hp:170,atk:26,def:18,spd:13,tier:3},
  // Chapter 4 - Afrasiab & Turan Kings
  {id:'piran_visa',ext:'svg',name:{fa:'پیران ویسه',en:'Piran Visa'},rarity:'SR',hp:210,atk:30,def:24,spd:12,tier:4},
  {id:'garsivaz',ext:'svg',name:{fa:'گرسیوز',en:'Garsivaz'},rarity:'SR',hp:190,atk:32,def:20,spd:13,tier:4},
  {id:'shideh',ext:'svg',name:{fa:'شیده',en:'Shideh'},rarity:'SR',hp:200,atk:31,def:22,spd:12,tier:4},
  {id:'afrasiab',ext:'svg',name:{fa:'افراسیاب',en:'Afrasiab King of Turan'},rarity:'SSR',hp:400,atk:42,def:30,spd:11,tier:4},
  // Chapter 5 - Demons of Mazandaran
  {id:'sanjeh_div',ext:'svg',name:{fa:'سنجه دیو',en:'Sanjeh Demon'},rarity:'R',hp:170,atk:28,def:18,spd:12,tier:5},
  {id:'bakhtak',ext:'svg',name:{fa:'بختک',en:'Nightmare Spirit'},rarity:'R',hp:140,atk:32,def:12,spd:16,tier:5},
  {id:'shabrang_div',ext:'svg',name:{fa:'شبرنگ دیو',en:'Shabrang Demon'},rarity:'SR',hp:230,atk:36,def:22,spd:11,tier:5},
  {id:'narsi',ext:'svg',name:{fa:'نرسی دیو',en:'Narsi Demon'},rarity:'R',hp:180,atk:30,def:20,spd:13,tier:5},
  {id:'div_pashang',ext:'svg',name:{fa:'پشنگ دیو',en:'Pashang Demon'},rarity:'R',hp:190,atk:32,def:22,spd:12,tier:5},
  {id:'bulman',ext:'svg',name:{fa:'بولمان',en:'Bulman'},rarity:'N',hp:100,atk:20,def:12,spd:14,tier:5},
  // Chapter 6 - Ancient Dragon
  {id:'akvan_div',ext:'svg',name:{fa:'اکوان دیو',en:'Akvan the Wind Demon'},rarity:'SSR',hp:380,atk:44,def:32,spd:14,tier:6},
  {id:'azhdahak',ext:'svg',name:{fa:'اژدهاک',en:'Azhi Dahaka the Dragon'},rarity:'SSR',hp:450,atk:48,def:35,spd:10,tier:6},
];

// ---------------- ITEMS (23 items) ----------------
const ITEMS = [
  // Weapons
  {id:'sword_bronze',type:'weapon',rarity:'Common',name:{fa:'شمشیر برنزی',en:'Bronze Sword'},atk:5},
  {id:'sword_iron',type:'weapon',rarity:'Common',name:{fa:'شمشیر آهنی',en:'Iron Sword'},atk:10},
  {id:'sword_steel',type:'weapon',rarity:'Rare',name:{fa:'شمشیر فولادین',en:'Steel Sword'},atk:20},
  {id:'sword_shahi',type:'weapon',rarity:'Epic',name:{fa:'شمشیر شاهی',en:'Royal Sword'},atk:35},
  {id:'shamshir_shahi',type:'weapon',rarity:'Legendary',name:{fa:'شمشیر افسانه‌ای',en:'Legendary Blade'},atk:60,crit:10},
  {id:'gorz_gavsar',type:'weapon',rarity:'Legendary',name:{fa:'گرز گاوسر',en:'Bull-Headed Mace'},atk:75,crit:5,hero:'rostam'},
  {id:'kaman_arash',type:'weapon',rarity:'Legendary',name:{fa:'کمان آرش',en:'Bow of Arash'},atk:70,crit:15,hero:'arash'},
  {id:'nezeh_pahlavi',type:'weapon',rarity:'Epic',name:{fa:'نیزه پهلوی',en:'Pahlavi Spear'},atk:40,spd:5},
  // Helms
  {id:'helm_leather',type:'helm',rarity:'Common',name:{fa:'کلاه چرمی',en:'Leather Cap'},def:3,hp:10},
  {id:'helm_bronze',type:'helm',rarity:'Common',name:{fa:'خود برنزی',en:'Bronze Helm'},def:6,hp:20},
  {id:'helm_shahi',type:'helm',rarity:'Epic',name:{fa:'تاج شاهی',en:'Royal Crown'},def:15,hp:60,atk:5},
  {id:'taj_kiani',type:'helm',rarity:'Legendary',name:{fa:'تاج کیانی',en:'Kiani Crown'},def:25,hp:100,atk:15},
  // Armor
  {id:'armor_leather',type:'armor',rarity:'Common',name:{fa:'زره چرمی',en:'Leather Armor'},def:10,hp:30},
  {id:'armor_scale',type:'armor',rarity:'Rare',name:{fa:'زره پولکی',en:'Scale Mail'},def:20,hp:60},
  {id:'babr_bayan',type:'armor',rarity:'Legendary',name:{fa:'ببر بیان',en:'Tiger-Cloak Armor'},def:45,hp:150,atk:10,hero:'rostam'},
  {id:'armor_javidan',type:'armor',rarity:'Epic',name:{fa:'زره جاویدان',en:'Immortals Armor'},def:32,hp:100},
  // Boots
  {id:'boots_leather',type:'boots',rarity:'Common',name:{fa:'چکمه چرمی',en:'Leather Boots'},def:3,spd:2},
  {id:'boots_shahi',type:'boots',rarity:'Rare',name:{fa:'چکمه شاهی',en:'Royal Boots'},def:8,spd:5},
  {id:'boots_rakhsh',type:'boots',rarity:'Legendary',name:{fa:'نعل رخش',en:'Rakhshs Horseshoes'},def:15,spd:12,hp:50},
  // Rings
  {id:'ring_bronze',type:'ring',rarity:'Common',name:{fa:'انگشتر برنزی',en:'Bronze Ring'},atk:3},
  {id:'ring_firooz',type:'ring',rarity:'Rare',name:{fa:'انگشتر فیروزه',en:'Turquoise Ring'},atk:10,crit:5},
  {id:'ring_yaghout',type:'ring',rarity:'Epic',name:{fa:'انگشتر یاقوت',en:'Ruby Ring'},atk:18,crit:8},
  {id:'mohreh_simorgh',type:'ring',rarity:'Legendary',name:{fa:'مهره سیمرغ',en:'Simorgh Amulet'},atk:25,def:15,hp:80,crit:12},
];

// ---------------- BUILDINGS ----------------
const BUILDINGS = [
  {id:'palace',name:{fa:'کاخ آپادانا',en:'Apadana Palace'},desc:{fa:'افزایش سقف تیم',en:'Increases team cap'},base:200,icon:'🏛'},
  {id:'fire_temple',name:{fa:'آتشکده',en:'Fire Temple'},desc:{fa:'افزایش درآمد طلا در ساعت',en:'Increases gold per hour'},base:150,icon:'🔥'},
  {id:'bazaar',name:{fa:'بازار پارس',en:'Persian Bazaar'},desc:{fa:'کاهش هزینه ارتقا',en:'Reduces upgrade cost'},base:180,icon:'🏺'},
  {id:'immortals',name:{fa:'پادگان جاویدان',en:'Immortals Barracks'},desc:{fa:'افزایش قدرت پهلوانان',en:'Increases hero power'},base:300,icon:'⚔'},
  {id:'library',name:{fa:'کتابخانه اوستا',en:'Avesta Library'},desc:{fa:'افزایش نرخ کریتیکال',en:'Boosts critical rate'},base:400,icon:'📜'},
  {id:'stable',name:{fa:'اصطبل رخش',en:'Rakhsh Stables'},desc:{fa:'افزایش سرعت پهلوانان',en:'Boosts hero speed'},base:250,icon:'🐎'},
];

// ---------------- STORY CAMPAIGN (7 Chapters, ~50 stages) ----------------
const CHAPTERS = [
  {
    id:1, title:{fa:'قیام کاوه', en:'Kavehs Uprising'},
    scene:'fire',
    intro:{
      fa:['هزاران سال پیش، ضحاک ماردوش با فریب اهریمن، جمشید شاه را کشت و بر تخت پارس نشست.',
          'دو مار سیاه از دوش‌هایش رویید که هر روز خوراکشان مغز جوانان ایرانی بود.',
          'مردم در وحشت زندگی می‌کردند، تا اینکه کاوه، آهنگر ساده، شانزده پسر خود را از دست داد.',
          'او پیش‌بند چرمی خود را بر سر نیزه کرد و درفش کاویانی را برافراشت.',
          'ای پهلوان! تو نیز به این قیام بپیوند و ضحاک را از تخت به زیر کش!'],
      en:['Thousands of years ago, Zahhak the Serpent-King murdered Jamshid and took the throne of Persia.',
          'Two black serpents grew from his shoulders, feeding daily on the brains of young Iranians.',
          'The people lived in terror, until Kaveh the blacksmith lost sixteen of his sons.',
          'He raised his leather apron on a spear — the Kaviani Banner was born.',
          'Hero! Join this uprising and cast Zahhak from his throne!']
    },
    stages:[
      {enemy:'kaftar_div', reward:{gold:50,exp:20}},
      {enemy:'kondrow', reward:{gold:80,exp:30}},
      {enemy:'warg', reward:{gold:100,exp:40}},
      {enemy:'kaftar_div', reward:{gold:120,exp:50}, wave:2},
      {enemy:'zahhak', boss:true, reward:{gold:500,gems:50,exp:200,item:'sword_iron'}},
    ],
    outro:{
      fa:['ضحاک شکست خورد! فریدون او را به بند کشید و در غار دماوند زندانی کرد.',
          'ایران رها شد. تو پاداش خود را دریافت کن — یک شمشیر آهنی!'],
      en:['Zahhak is defeated! Fereydun chained him inside Mount Damavand.',
          'Iran is free. Claim your reward — an Iron Sword!']
    }
  },
  {
    id:2, title:{fa:'هفت خوان رستم', en:'Seven Labors of Rostam'},
    scene:'mountain',
    intro:{
      fa:['کیکاووس شاه در مازندران به دست دیو سپید اسیر شد.',
          'رستم دستان، جهان‌پهلوان ایران، برای نجات شاه به راه افتاد.',
          'هفت خوان در برابر اوست: شیر ژیان، تشنگی مرگبار، اژدها، جادوگر، اولاد، ارژنگ، و دیو سپید.',
          'رخش پیر، اما وفادار، در کنار اوست. آماده باش!'],
      en:['King Kay Kavus was captured by the White Demon in Mazandaran.',
          'Rostam the World-Champion set out to rescue him.',
          'Seven Labors await: the Lion, deadly Thirst, the Dragon, the Sorceress, Aulad, Arjang, and the White Demon.',
          'Old but loyal Rakhsh rides with him. Be ready!']
    },
    stages:[
      {enemy:'sheer_div', reward:{gold:100,exp:60}},
      {enemy:'warg', wave:3, reward:{gold:120,exp:80}},
      {enemy:'ghol', reward:{gold:150,exp:100}},
      {enemy:'sheer_div', wave:2, reward:{gold:180,exp:120}},
      {enemy:'arjang_div', boss:true, reward:{gold:400,gems:30,exp:200,item:'helm_bronze'}},
      {enemy:'ghol', wave:2, reward:{gold:220,exp:150}},
      {enemy:'div_sepid', boss:true, reward:{gold:1000,gems:100,exp:500,item:'babr_bayan'}},
    ],
    outro:{
      fa:['رستم دیو سپید را کشت و جگرش را برای درمان کوری کیکاووس آورد.',
          'ببر بیان — زره افسانه‌ای رستم — پاداش توست!'],
      en:['Rostam slew the White Demon and used his liver to cure King Kay Kavus.',
          'The Tiger-Cloak — Rostams legendary armor — is your reward!']
    }
  },
  {
    id:3, title:{fa:'رستم و سهراب', en:'Rostam and Sohrab'},
    scene:'battle',
    intro:{
      fa:['سهراب، پسر رستم، بزرگ شده و پهلوانی چیره‌دست است. اما پدرش را نمی‌شناسد.',
          'با سپاه توران به ایران می‌تازد. گردآفرید در برابرش می‌ایستد.',
          'سرنوشتی تراژیک در انتظار است — جنگی که پدر و پسر یکدیگر را نخواهند شناخت!'],
      en:['Sohrab, son of Rostam, has grown into a mighty warrior. But he knows not his father.',
          'He marches on Iran with the Turanian army. Gordafarid stands against him.',
          'A tragic fate awaits — a battle where father and son will not recognize each other!']
    },
    stages:[
      {enemy:'barman', reward:{gold:150,exp:100}},
      {enemy:'hooman', reward:{gold:180,exp:120}},
      {enemy:'barman', wave:2, reward:{gold:200,exp:140}},
      {enemy:'kamus', boss:true, reward:{gold:500,gems:40,exp:250,item:'sword_steel'}},
      {enemy:'hooman', wave:3, reward:{gold:250,exp:180}},
      {enemy:'sohrab_boss', boss:true, reward:{gold:1200,gems:120,exp:600,item:'nezeh_pahlavi'}},
    ],
    outro:{
      fa:['رستم پس از کشتن سهراب، نوشدارو خواست، اما دیر رسید.',
          'گریست چون ابر بهار. این داغ برای همیشه در دل او ماند.'],
      en:['After slaying Sohrab, Rostam asked for the elixir — but it came too late.',
          'He wept like a spring cloud. This sorrow stayed in his heart forever.']
    }
  },
  {
    id:4, title:{fa:'انتقام سیاوش', en:'Vengeance for Siavash'},
    scene:'palace',
    intro:{
      fa:['سیاوش شاهزاده پاک به دست افراسیاب کشته شد.',
          'کیخسرو، پسر سیاوش، اکنون شاه ایران است. زمان انتقام فرا رسیده.',
          'رستم، گودرز، توس و دیگر پهلوانان به توران می‌تازند!'],
      en:['The pure prince Siavash was slain by Afrasiab.',
          'Kay Khosrow, son of Siavash, is now king of Iran. The time for vengeance has come.',
          'Rostam, Goodarz, Tous and other heroes march on Turan!']
    },
    stages:[
      {enemy:'piran_visa', reward:{gold:250,exp:200}},
      {enemy:'garsivaz', reward:{gold:280,exp:220}},
      {enemy:'shideh', reward:{gold:300,exp:250}},
      {enemy:'piran_visa', wave:2, reward:{gold:350,exp:280}},
      {enemy:'afrasiab', boss:true, reward:{gold:2000,gems:200,exp:1000,item:'armor_javidan'}},
    ],
    outro:{
      fa:['افراسیاب کشته شد و خون سیاوش پاک شد.',
          'کیخسرو پس از پیروزی، سلطنت را رها کرد و در کوهی ناپدید شد — به دنبال جاودانگی.'],
      en:['Afrasiab is slain, Siavashs blood is avenged.',
          'Kay Khosrow abandoned the throne and vanished into the mountains — seeking immortality.']
    }
  },
  {
    id:5, title:{fa:'بیژن و منیژه', en:'Bijan and Manijeh'},
    scene:'night',
    intro:{
      fa:['بیژن، پهلوان جوان ایرانی، در باغ منیژه — دختر افراسیاب — گیر افتاد.',
          'افراسیاب او را در چاهی عمیق افکند. تنها رستم می‌تواند نجاتش دهد!'],
      en:['Bijan, young Iranian hero, was caught in the garden of Manijeh, daughter of Afrasiab.',
          'He was thrown into a deep pit. Only Rostam can save him!']
    },
    stages:[
      {enemy:'sanjeh_div', reward:{gold:300,exp:250}},
      {enemy:'bakhtak', reward:{gold:320,exp:270}},
      {enemy:'narsi', reward:{gold:350,exp:300}},
      {enemy:'div_pashang', wave:2, reward:{gold:400,exp:350}},
      {enemy:'shabrang_div', boss:true, reward:{gold:1500,gems:150,exp:800,item:'ring_yaghout'}},
    ],
    outro:{
      fa:['بیژن از چاه رها شد. منیژه با او به ایران آمد.',
          'انگشتر یاقوت پاداش توست — به‌یاد این عشق جاودان!'],
      en:['Bijan was freed. Manijeh came with him to Iran.',
          'The Ruby Ring is your reward — for this eternal love!']
    }
  },
  {
    id:6, title:{fa:'اکوان دیو', en:'The Wind Demon'},
    scene:'cave',
    intro:{
      fa:['اکوان دیو، دیو باد، در دشت‌های ایران گله‌های شاه را می‌درید.',
          'رستم به شکار او رفت. اکوان او را با گورخری برد و به آسمان انداخت — به دریای مازندران!'],
      en:['Akvan the Wind Demon devoured the kings herds in Iranian plains.',
          'Rostam went to hunt him. Akvan lifted him with an onager and cast him into the sky — into the Caspian Sea!']
    },
    stages:[
      {enemy:'bulman', wave:3, reward:{gold:400,exp:400}},
      {enemy:'shabrang_div', wave:2, reward:{gold:500,exp:500}},
      {enemy:'div_pashang', wave:3, reward:{gold:600,exp:600}},
      {enemy:'akvan_div', boss:true, reward:{gold:2500,gems:250,exp:1500,item:'boots_rakhsh'}},
    ],
    outro:{
      fa:['اکوان دیو با گرز رستم کشته شد. نعل رخش پاداش توست!'],
      en:['Akvan Demon fell to Rostams mace. Rakhshs Horseshoes are your reward!']
    }
  },
  {
    id:7, title:{fa:'اژدهاک و پایان تاریکی', en:'Azhi Dahaka and the End of Darkness'},
    scene:'desert',
    intro:{
      fa:['در پایان زمان، ضحاک از بندهای دماوند رها می‌شود و به شکل اژدهاک اهریمنی سر برمی‌آورد.',
          'همه پهلوانان ایران باید متحد شوند. این آخرین نبرد است!'],
      en:['At the end of time, Zahhak breaks free from Damavand and rises as Azhi Dahaka the great dragon.',
          'All heroes of Iran must unite. This is the final battle!']
    },
    stages:[
      {enemy:'shabrang_div', wave:3, reward:{gold:600,exp:700}},
      {enemy:'akvan_div', wave:2, reward:{gold:800,exp:900}},
      {enemy:'afrasiab', wave:2, reward:{gold:1000,exp:1100}},
      {enemy:'azhdahak', boss:true, reward:{gold:5000,gems:500,exp:3000,item:'mohreh_simorgh'}},
    ],
    outro:{
      fa:['اژدهاک شکست خورد! نور بر تاریکی چیره شد. ایران‌زمین جاودان است.',
          'مهره سیمرغ — تعویذ افسانه‌ای — از آن توست. حال به مرحله بی‌نهایت وارد شو!'],
      en:['Azhi Dahaka is defeated! Light triumphs over darkness. Iran endures forever.',
          'The Simorgh Amulet — the legendary talisman — is yours. Now enter Endless Mode!']
    }
  },
];
