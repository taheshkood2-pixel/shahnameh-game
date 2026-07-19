// ============================================================
// SHAHNAMEH: RISE OF KINGS - GAME DATA v4
// Balanced economy • Pets • Talent Tree • 100+ Achievements
// ============================================================

// ---------------- BALANCE CONSTANTS ----------------
// Central place for all math — tune game feel from here.
const BALANCE = {
  // Hero
  levelXpBase: 100,
  levelXpGrowth: 1.18,
  levelStatGain: 0.09,
  upgradeGoldBase: 80,
  upgradeGoldGrowth: 1.22,
  rarityCostMult: {SSR:4.0, SR:2.5, R:1.4, N:1.0},

  // Combat
  defenseFactor: 0.28,
  critMult: 2.0,
  varianceMin: 0.90,
  varianceMax: 1.10,

  // Idle — nerfed
  idleBaseGold: 30,
  idleCapHours: 8,

  // Battle rewards
  campGoldBase: 30,
  campGoldPerChapter: 18,
  campGoldPerStage: 6,
  campExpBase: 18,
  bossGoldMult: 4,
  bossGemsChance: 1.0,
  bossGemsBase: 15,
  wavesMult: 1.5,

  // Summon — MUCH HARDER
  summonSingleGems: 180,
  summonTenGems: 1620,
  rateSSR: 0.03,
  rateSR: 0.15,
  rateR: 0.82,
  dupeGoldBase: 100,
  dupeShardsGold: 200,

  // Free summon energy — replaces "free scroll" spam
  summonEnergyMax: 3,
  summonEnergyRegenMinutes: 240,  // 1 free scroll every 4h → 6/day max

  // Pity system
  pitySSR: 50,
  pitySR: 12,

  // Building
  buildBase: {palace:200, fire_temple:150, bazaar:180, immortals:300, library:350, stable:250},
  buildGrowth: 1.60,
  buildingEffectPerLv: {
    palace: 1,
    fire_temple: 0.12,
    bazaar: 0.03,
    immortals: 0.05,
    library: 1.5,
    stable: 1,
  },

  // Endless
  endlessScalePerStage: 0.20,
  endlessGoldBase: 100,
  endlessGoldPerStage: 20,

  // Login streak
  streakGold: [200, 400, 700, 1200, 2000, 3000, 5000],
  streakGems: [15, 30, 50, 80, 120, 180, 300],

  // Talent tree
  talentPointsPerLv: 1,
  talentMaxRank: 5,

  // Currencies
  scrollFromBoss: 1,
  scrollFromStreak: 1,

  // Starting resources — much less generous
  startGold: 300,
  startGems: 100,
  startScrolls: 1,

  // Minigame chances
  minigameScrollChance: 0.15,
};

// ---------------- HEROES (26) ----------------
const HEROES = [
  // SSR
  {id:'rostam',ext:'png',name:{fa:'رستم دستان',en:'Rostam the Mighty'},title:{fa:'جهان‌پهلوان',en:'World Champion'},rarity:'SSR',class:'warrior',
    hp:320,atk:58,def:42,spd:12,crit:20,
    skill:{fa:'گرز گاوسر — ضربه ویرانگر ۲.۵ برابر',en:'Bull-Mace — 2.5× damage strike'},
    lore:{fa:'بزرگ‌ترین پهلوان شاهنامه، سوار بر رخش، هفت خوان را پیمود.',en:'Greatest hero of Shahnameh.'},
    voice:'rostam_voice'},
  {id:'esfandiar',ext:'png',name:{fa:'اسفندیار رویین‌تن',en:'Esfandiar the Invincible'},title:{fa:'شاهزاده رویین‌تن',en:'Brazen Prince'},rarity:'SSR',class:'tank',
    hp:380,atk:44,def:58,spd:8,crit:10,
    skill:{fa:'تن رویین — ۳ نوبت مصونیت',en:'Brazen Body — 3-turn immunity'},
    lore:{fa:'شاهزاده رویین‌تن که در هفت خوان اژدها را کشت.',en:'The invincible prince.'},
    voice:'esfandiar_voice'},
  {id:'fereydun',ext:'png',name:{fa:'فریدون',en:'Fereydun the King'},title:{fa:'شاه دادگر',en:'The Just King'},rarity:'SSR',class:'support',
    hp:280,atk:40,def:38,spd:14,crit:15,
    skill:{fa:'فرمان شاهانه — درمان تیم +۳۰٪',en:'Royal Command — Heal team +30%'},
    lore:{fa:'ضحاک را شکست داد و در دماوند به بند کشید.',en:'Chained Zahhak under Mt. Damavand.'},
    voice:'fereydun_voice'},
  {id:'jamshid',ext:'png',voice:'jamshid_voice',name:{fa:'جمشید',en:'Jamshid the Radiant'},title:{fa:'شاه فرمند',en:'The Radiant King'},rarity:'SSR',class:'mage',
    hp:240,atk:64,def:26,spd:13,crit:25,
    skill:{fa:'جام جهان‌نما — آسیب دوبرابر',en:'Cup of Jamshid — 2× damage'},
    lore:{fa:'مخترع آتش، فلز، پزشکی.',en:'Inventor of fire, metal, medicine.'}},
  {id:'kourosh',ext:'png',name:{fa:'کوروش بزرگ',en:'Cyrus the Great'},title:{fa:'پدر ایران',en:'Father of Iran'},rarity:'SSR',class:'support',
    hp:290,atk:48,def:44,spd:15,crit:18,
    skill:{fa:'منشور کوروش — بونس دائم تیم',en:'Cyrus Cylinder — Permanent team boost'},
    lore:{fa:'بنیانگذار هخامنشیان.',en:'Founder of Achaemenid Empire.'},
    voice:'kourosh_voice'},
  {id:'dariush',ext:'png',name:{fa:'داریوش بزرگ',en:'Darius the Great'},title:{fa:'شاهنشاه',en:'King of Kings'},rarity:'SSR',class:'warrior',
    hp:300,atk:52,def:40,spd:12,crit:16,
    skill:{fa:'راه شاهی — حمله اضافه برای همه',en:'Royal Road — Extra attack for all'},
    lore:{fa:'تخت‌جمشید را ساخت.',en:'Built Persepolis.'},
    voice:'dariush_voice'},
  {id:'siavash',ext:'png',name:{fa:'سیاوش',en:'Siavash the Pure'},title:{fa:'شاهزاده پاک',en:'The Pure Prince'},rarity:'SSR',class:'mage',
    hp:220,atk:56,def:30,spd:16,crit:22,
    skill:{fa:'گذر از آتش — پاکسازی و درمان',en:'Pass Through Fire — Cleanse and heal'},
    lore:{fa:'برای اثبات بی‌گناهی از آتش گذشت.',en:'Walked through fire.'},
    voice:'siavash_voice'},
  {id:'kaykhosrow',ext:'png',voice:'kaykhosrow_voice',name:{fa:'کیخسرو',en:'Kay Khosrow'},title:{fa:'شاه مقدس',en:'The Holy King'},rarity:'SSR',class:'support',
    hp:270,atk:46,def:38,spd:14,crit:17,
    skill:{fa:'فره ایزدی — احیای متحد',en:'Divine Glory — Revive ally'},
    lore:{fa:'انتقام پدرش سیاوش را گرفت.',en:'Avenged his father Siavash.'}},
  {id:'garshasp',ext:'png',voice:'garshasp_voice',name:{fa:'گرشاسپ',en:'Garshasp the Dragonslayer'},title:{fa:'اژدهاکش',en:'Dragon Slayer'},rarity:'SSR',class:'warrior',
    hp:310,atk:55,def:36,spd:11,crit:20,
    skill:{fa:'گرز اژدهاکش — سه ضربه پیاپی',en:'Dragon-Slayer Club — 3 strikes'},
    lore:{fa:'اژدهای گندرو را کشت.',en:'Slew Gandarva the great dragon.'}},
  {id:'babak',ext:'png',voice:'babak_voice',name:{fa:'بابک خرمدین',en:'Babak Khorramdin'},title:{fa:'قهرمان آزادی',en:'Champion of Freedom'},rarity:'SSR',class:'warrior',
    hp:280,atk:50,def:42,spd:15,crit:19,
    skill:{fa:'قیام سرخ — خشم متحدان',en:'Red Uprising — Rage'},
    lore:{fa:'۲۰ سال در برابر عباسیان مقاومت کرد.',en:'Resisted Abbasids for 20 years.'}},
  {id:'surena',ext:'png',voice:'surena_voice',name:{fa:'سورنا',en:'Surena the Parthian'},title:{fa:'فاتح روم',en:'Conqueror of Rome'},rarity:'SSR',class:'archer',
    hp:240,atk:62,def:32,spd:18,crit:25,
    skill:{fa:'رگبار پارتی — ۵ تیر',en:'Parthian Shot — 5 arrows'},
    lore:{fa:'رومیان را در حران شکست داد.',en:'Defeated Romans at Carrhae.'}},
  {id:'purandokht',ext:'png',name:{fa:'پوران‌دخت',en:'Purandokht'},title:{fa:'ملکه ساسانی',en:'Sasanian Queen'},rarity:'SSR',class:'support',
    hp:250,atk:44,def:40,spd:15,crit:16,
    skill:{fa:'فرمان ملکه — سکوت دشمن',en:'Queens Decree — Silence enemy'},
    lore:{fa:'اولین ملکه ایران در دوره ساسانی.',en:'First queen of Iran.'},
    voice:'purandokht_voice'},
  // SR
  {id:'arash',ext:'png',name:{fa:'آرش کمانگیر',en:'Arash the Archer'},title:{fa:'مرزبان جاودان',en:'Eternal Borderer'},rarity:'SR',class:'archer',
    hp:150,atk:48,def:16,spd:20,crit:30,
    skill:{fa:'تیر جانفشان — آسیب ۳ برابر',en:'Soul-Arrow — Triple damage'},
    lore:{fa:'برای مرز ایران جان خود را در تیر نهاد.',en:'Put his soul into an arrow.'},
    voice:'arash_voice'},
  {id:'gordafarid',ext:'png',name:{fa:'گردآفرید',en:'Gordafarid'},title:{fa:'دخت پهلوان',en:'Warrior Maiden'},rarity:'SR',class:'warrior',
    hp:170,atk:38,def:26,spd:17,crit:22,
    skill:{fa:'شمشیر آذرین — ضدحمله ۱۰۰٪',en:'Fiery Sword — 100% counter'},
    lore:{fa:'نخستین بانوی جنگاور شاهنامه.',en:'First female warrior in Shahnameh.'},
    voice:'gordafarid_voice'},
  {id:'sohrab',ext:'png',name:{fa:'سهراب',en:'Sohrab'},title:{fa:'شیرزاده',en:'Lion Cub'},rarity:'SR',class:'warrior',
    hp:200,atk:42,def:24,spd:16,crit:20,
    skill:{fa:'خشم جوانی — سرعت دوبرابر',en:'Youthful Fury — 2× speed'},
    lore:{fa:'پسر رستم که به دست پدر خود کشته شد.',en:'Son of Rostam, slain by his father.'},
    voice:'sohrab_voice'},
  {id:'zal',ext:'png',voice:'zal_voice',name:{fa:'زال',en:'Zal the White'},title:{fa:'پرورده سیمرغ',en:'Raised by Simorgh'},rarity:'SR',class:'mage',
    hp:180,atk:40,def:30,spd:15,crit:18,
    skill:{fa:'پر سیمرغ — احضار سیمرغ',en:'Simorgh Feather — Summon Simorgh'},
    lore:{fa:'پدر رستم که سیمرغ او را پروراند.',en:'Father of Rostam.'}},
  {id:'rudabeh',ext:'png',voice:'rudabeh_voice',name:{fa:'رودابه',en:'Rudabeh'},title:{fa:'پرنسس کابل',en:'Princess of Kabul'},rarity:'SR',class:'support',
    hp:150,atk:34,def:22,spd:16,crit:15,
    skill:{fa:'گیسوی بلند — درمان متحد',en:'Long Tresses — Heal ally'},
    lore:{fa:'مادر رستم.',en:'Mother of Rostam.'}},
  {id:'tahmineh',ext:'png',voice:'tahmineh_voice',name:{fa:'تهمینه',en:'Tahmineh'},title:{fa:'مادر سهراب',en:'Mother of Sohrab'},rarity:'SR',class:'support',
    hp:145,atk:32,def:24,spd:17,crit:14,
    skill:{fa:'مهر مادری — احیای متحد',en:'Motherly Love — Revive ally'},
    lore:{fa:'شاهدخت سمنگان.',en:'Princess of Samangan.'}},
  {id:'bijan',ext:'png',name:{fa:'بیژن',en:'Bijan'},title:{fa:'پهلوان جوان',en:'Young Champion'},rarity:'SR',class:'warrior',
    hp:170,atk:38,def:26,spd:18,crit:19,
    skill:{fa:'شمشیر عاشق — آسیب اضافه',en:'Lovers Blade — Bonus damage'},
    lore:{fa:'عاشق منیژه دختر افراسیاب.',en:'Fell in love with Manijeh.'}},
  {id:'manijeh',ext:'png',name:{fa:'منیژه',en:'Manijeh'},title:{fa:'دلداده بیژن',en:'Beloved of Bijan'},rarity:'SR',class:'support',
    hp:140,atk:30,def:22,spd:19,crit:13,
    skill:{fa:'وفاداری — کاهش آسیب',en:'Loyalty — Damage reduction'},
    lore:{fa:'دختر افراسیاب.',en:'Daughter of Afrasiab.'}},
  {id:'sam',ext:'png',name:{fa:'سام نریمان',en:'Sam Nariman'},title:{fa:'پهلوان کهن',en:'Ancient Champion'},rarity:'SR',class:'tank',
    hp:240,atk:36,def:44,spd:9,crit:12,
    skill:{fa:'دیوار سام — جذب آسیب',en:'Sams Wall — Absorb damage'},
    lore:{fa:'پدر زال و پدربزرگ رستم.',en:'Father of Zal.'}},
  {id:'hooshang',ext:'png',name:{fa:'هوشنگ',en:'Hooshang'},title:{fa:'کاشف آتش',en:'Discoverer of Fire'},rarity:'SR',class:'mage',
    hp:160,atk:46,def:22,spd:14,crit:20,
    skill:{fa:'آتش هوشنگ — سوزاندن',en:'Hooshangs Fire — Burn'},
    lore:{fa:'دومین شاه پیشدادی.',en:'Second Pishdadian king.'}},
  {id:'tahmoures',ext:'png',name:{fa:'طهمورث دیوبند',en:'Tahmoures'},title:{fa:'به‌بند کشنده دیوان',en:'Demon Binder'},rarity:'SR',class:'warrior',
    hp:190,atk:42,def:34,spd:13,crit:17,
    skill:{fa:'زنجیر دیوبند — فلج',en:'Demon-Chain — Paralyze'},
    lore:{fa:'دیوان را به بند کشید.',en:'Bound the demons.'}},
  {id:'bahram',ext:'png',voice:'bahram_voice',name:{fa:'بهرام گور',en:'Bahram Gur'},title:{fa:'شکارچی شاهی',en:'Royal Hunter'},rarity:'SR',class:'archer',
    hp:170,atk:44,def:24,spd:19,crit:24,
    skill:{fa:'تیر گورگیر — دو دشمن',en:'Onager Shot — Two targets'},
    lore:{fa:'شاه ساسانی مشهور به شکار.',en:'Sasanian king of the hunt.'}},
  {id:'shirin',ext:'png',voice:'shirin_voice',name:{fa:'شیرین',en:'Shirin'},title:{fa:'ملکه ارمنی',en:'Armenian Queen'},rarity:'SR',class:'support',
    hp:150,atk:34,def:26,spd:18,crit:16,
    skill:{fa:'عشق شیرین — کریتیکال متحدان',en:'Sweet Love — Team crit boost'},
    lore:{fa:'همسر خسرو پرویز.',en:'Wife of Khosrow Parviz.'}},
  // R
  {id:'kaveh',ext:'png',name:{fa:'کاوه آهنگر',en:'Kaveh the Blacksmith'},title:{fa:'قهرمان قیام',en:'Hero of Revolt'},rarity:'R',class:'warrior',
    hp:150,atk:28,def:24,spd:13,crit:15,
    skill:{fa:'درفش کاویانی — حمله متحدان +۳۰٪',en:'Kaviani Banner — Ally atk +30%'},
    lore:{fa:'آهنگری که مردم را علیه ضحاک شوراند.',en:'Blacksmith who led revolt.'},
    voice:'kaveh_voice'},
];

// ---------------- TALENT TREES ----------------
// Every hero has 4 talent nodes (2 stat-buff, 1 skill-power, 1 special)
// Cost per rank increases; talents unlock at Lv 5, 10, 15, 20.
const TALENT_TREE = {
  // Generic template for warriors
  warrior: [
    {id:'w_atk',name:{fa:'قدرت شمشیر',en:'Blade Might'},desc:{fa:'+۸٪ حمله در هر رنک',en:'+8% ATK per rank'},unlockLv:5,effect:'atk',valuePerRank:0.08,icon:'⚔'},
    {id:'w_def',name:{fa:'زره سنگین',en:'Heavy Armor'},desc:{fa:'+۸٪ دفاع در هر رنک',en:'+8% DEF per rank'},unlockLv:10,effect:'def',valuePerRank:0.08,icon:'🛡'},
    {id:'w_crit',name:{fa:'ضربه فتنه‌گر',en:'Deadly Strike'},desc:{fa:'+۳٪ کریتیکال در هر رنک',en:'+3% CRIT per rank'},unlockLv:15,effect:'crit',valuePerRank:3,icon:'💥'},
    {id:'w_burst',name:{fa:'مهارت آتشین',en:'Skill Fury'},desc:{fa:'+۱۵٪ قدرت مهارت',en:'+15% skill power'},unlockLv:20,effect:'skill',valuePerRank:0.15,icon:'🔥'},
  ],
  tank: [
    {id:'t_hp',name:{fa:'جان استوار',en:'Steady Vigor'},desc:{fa:'+۱۰٪ سلامتی',en:'+10% HP per rank'},unlockLv:5,effect:'hp',valuePerRank:0.10,icon:'❤'},
    {id:'t_def',name:{fa:'دژ آهنین',en:'Iron Fortress'},desc:{fa:'+۱۰٪ دفاع',en:'+10% DEF per rank'},unlockLv:10,effect:'def',valuePerRank:0.10,icon:'🛡'},
    {id:'t_thorn',name:{fa:'زره خارآگین',en:'Thorn Armor'},desc:{fa:'ضدحمله ۵٪ در هر رنک',en:'5% reflect per rank'},unlockLv:15,effect:'reflect',valuePerRank:0.05,icon:'🌵'},
    {id:'t_guard',name:{fa:'جذب آسیب',en:'Damage Absorb'},desc:{fa:'-۵٪ آسیب دریافتی',en:'-5% dmg taken per rank'},unlockLv:20,effect:'dmgReduce',valuePerRank:0.05,icon:'🔰'},
  ],
  archer: [
    {id:'a_atk',name:{fa:'زه کمان',en:'Bow Tension'},desc:{fa:'+۸٪ حمله',en:'+8% ATK per rank'},unlockLv:5,effect:'atk',valuePerRank:0.08,icon:'🏹'},
    {id:'a_spd',name:{fa:'تیزپا',en:'Swift'},desc:{fa:'+۲ سرعت در هر رنک',en:'+2 SPD per rank'},unlockLv:10,effect:'spd',valuePerRank:2,icon:'💨'},
    {id:'a_crit',name:{fa:'نشانه‌گیری',en:'Deadeye'},desc:{fa:'+۴٪ کریتیکال',en:'+4% CRIT per rank'},unlockLv:15,effect:'crit',valuePerRank:4,icon:'🎯'},
    {id:'a_pierce',name:{fa:'تیر شکافنده',en:'Piercing Shot'},desc:{fa:'+۱۰٪ نفوذ دفاع',en:'+10% pierce per rank'},unlockLv:20,effect:'pierce',valuePerRank:0.10,icon:'⚡'},
  ],
  mage: [
    {id:'m_atk',name:{fa:'انرژی جادویی',en:'Arcane Power'},desc:{fa:'+۱۰٪ حمله',en:'+10% ATK per rank'},unlockLv:5,effect:'atk',valuePerRank:0.10,icon:'✨'},
    {id:'m_crit',name:{fa:'شعله‌ور',en:'Flaming'},desc:{fa:'+۴٪ کریتیکال',en:'+4% CRIT per rank'},unlockLv:10,effect:'crit',valuePerRank:4,icon:'🔥'},
    {id:'m_burn',name:{fa:'سوزاندن',en:'Ignite'},desc:{fa:'۵٪ آسیب اضافه',en:'5% bonus dmg per rank'},unlockLv:15,effect:'bonusDmg',valuePerRank:0.05,icon:'💫'},
    {id:'m_burst',name:{fa:'ترکش انرژی',en:'Energy Burst'},desc:{fa:'+۲۰٪ قدرت مهارت',en:'+20% skill power'},unlockLv:20,effect:'skill',valuePerRank:0.20,icon:'💥'},
  ],
  support: [
    {id:'s_hp',name:{fa:'برکت شفا',en:'Healing Blessing'},desc:{fa:'+۱۰٪ سلامتی تیم',en:'+10% team HP per rank'},unlockLv:5,effect:'teamHp',valuePerRank:0.10,icon:'💚'},
    {id:'s_atk',name:{fa:'الهام',en:'Inspire'},desc:{fa:'+۵٪ حمله تیم',en:'+5% team ATK per rank'},unlockLv:10,effect:'teamAtk',valuePerRank:0.05,icon:'📯'},
    {id:'s_spd',name:{fa:'باد راستین',en:'Wind Blessing'},desc:{fa:'+۲ سرعت تیم',en:'+2 team SPD per rank'},unlockLv:15,effect:'teamSpd',valuePerRank:2,icon:'🌪'},
    {id:'s_regen',name:{fa:'رزق ایزدی',en:'Divine Regen'},desc:{fa:'۳٪ درمان در نوبت',en:'3% heal per turn'},unlockLv:20,effect:'regen',valuePerRank:0.03,icon:'💫'},
  ],
};

// ---------------- ENEMIES (24) — balanced by tier ----------------
const ENEMIES = [
  {id:'zahhak',ext:'png',name:{fa:'ضحاک ماردوش',en:'Zahhak the Serpent-King'},rarity:'SSR',hp:280,atk:30,def:20,spd:10,tier:1,voice:'zahhak_voice'},
  {id:'kondrow',ext:'svg',name:{fa:'کندرو',en:'Kondrow'},rarity:'R',hp:75,atk:13,def:8,spd:12,tier:1},
  {id:'kaftar_div',ext:'svg',name:{fa:'کفتار دیو',en:'Hyena Demon'},rarity:'N',hp:55,atk:11,def:5,spd:15,tier:1},
  {id:'sheer_div',ext:'svg',name:{fa:'شیر ژیان',en:'Fierce Lion'},rarity:'R',hp:120,atk:19,def:12,spd:14,tier:2},
  {id:'warg',ext:'svg',name:{fa:'گرگ سیاه',en:'Black Wolf'},rarity:'N',hp:68,atk:15,def:7,spd:18,tier:2},
  {id:'ghol',ext:'png',name:{fa:'غول بیابانی',en:'Desert Giant'},rarity:'R',hp:155,atk:21,def:16,spd:8,tier:2},
  {id:'arjang_div',ext:'png',name:{fa:'ارژنگ دیو',en:'Arjang Demon'},rarity:'SR',hp:185,atk:25,def:16,spd:11,tier:2},
  {id:'div_sepid',ext:'png',name:{fa:'دیو سپید',en:'The White Demon'},rarity:'SSR',hp:340,atk:36,def:24,spd:9,tier:2},
  {id:'kamus',ext:'png',name:{fa:'کاموس کشانی',en:'Kamus of Kashan'},rarity:'SR',hp:200,atk:27,def:20,spd:12,tier:3},
  {id:'sohrab_boss',ext:'png',name:{fa:'خاقان چین',en:'Khaqan of China'},rarity:'SR',hp:215,atk:29,def:22,spd:11,tier:3},
  {id:'barman',ext:'svg',name:{fa:'بارمان',en:'Barman'},rarity:'R',hp:145,atk:23,def:16,spd:14,tier:3},
  {id:'hooman',ext:'svg',name:{fa:'هومان تورانی',en:'Human of Turan'},rarity:'R',hp:165,atk:25,def:18,spd:13,tier:3},
  {id:'piran_visa',ext:'png',name:{fa:'پیران ویسه',en:'Piran Visa'},rarity:'SR',hp:210,atk:29,def:24,spd:12,tier:4},
  {id:'garsivaz',ext:'png',name:{fa:'گرسیوز',en:'Garsivaz'},rarity:'SR',hp:190,atk:31,def:20,spd:13,tier:4},
  {id:'shideh',ext:'png',name:{fa:'شیده',en:'Shideh'},rarity:'SR',hp:200,atk:30,def:22,spd:12,tier:4},
  {id:'afrasiab',ext:'png',name:{fa:'افراسیاب',en:'Afrasiab King of Turan'},rarity:'SSR',hp:400,atk:40,def:30,spd:11,tier:4,voice:'afrasiab_voice'},
  {id:'sanjeh_div',ext:'png',name:{fa:'سنجه دیو',en:'Sanjeh Demon'},rarity:'R',hp:175,atk:27,def:18,spd:12,tier:5},
  {id:'bakhtak',ext:'png',name:{fa:'بختک',en:'Nightmare Spirit'},rarity:'R',hp:140,atk:31,def:12,spd:16,tier:5},
  {id:'shabrang_div',ext:'png',name:{fa:'شبرنگ دیو',en:'Shabrang Demon'},rarity:'SR',hp:230,atk:35,def:22,spd:11,tier:5},
  {id:'narsi',ext:'svg',name:{fa:'نرسی دیو',en:'Narsi Demon'},rarity:'R',hp:185,atk:29,def:20,spd:13,tier:5},
  {id:'div_pashang',ext:'svg',name:{fa:'پشنگ دیو',en:'Pashang Demon'},rarity:'R',hp:195,atk:31,def:22,spd:12,tier:5},
  {id:'bulman',ext:'svg',name:{fa:'بولمان',en:'Bulman'},rarity:'N',hp:100,atk:20,def:12,spd:14,tier:5},
  {id:'akvan_div',ext:'png',name:{fa:'اکوان دیو',en:'Akvan the Wind Demon'},rarity:'SSR',hp:380,atk:42,def:30,spd:14,tier:6},
  {id:'azhdahak',ext:'png',name:{fa:'اژدهاک',en:'Azhi Dahaka'},rarity:'SSR',hp:480,atk:46,def:34,spd:10,tier:6},
];

// ---------------- ITEMS (23) — balanced stat curves ----------------
const ITEMS = [
  {id:'sword_bronze',type:'weapon',rarity:'Common',name:{fa:'شمشیر برنزی',en:'Bronze Sword'},atk:6},
  {id:'sword_iron',type:'weapon',rarity:'Common',name:{fa:'شمشیر آهنی',en:'Iron Sword'},atk:12},
  {id:'sword_steel',type:'weapon',rarity:'Rare',name:{fa:'شمشیر فولادین',en:'Steel Sword'},atk:24},
  {id:'sword_shahi',type:'weapon',rarity:'Epic',name:{fa:'شمشیر شاهی',en:'Royal Sword'},atk:42},
  {id:'shamshir_shahi',type:'weapon',rarity:'Legendary',name:{fa:'شمشیر افسانه‌ای',en:'Legendary Blade'},atk:72,crit:12},
  {id:'gorz_gavsar',type:'weapon',rarity:'Legendary',name:{fa:'گرز گاوسر',en:'Bull-Headed Mace'},atk:90,crit:5,hero:'rostam'},
  {id:'kaman_arash',type:'weapon',rarity:'Legendary',name:{fa:'کمان آرش',en:'Bow of Arash'},atk:80,crit:18,hero:'arash'},
  {id:'nezeh_pahlavi',type:'weapon',rarity:'Epic',name:{fa:'نیزه پهلوی',en:'Pahlavi Spear'},atk:48,spd:5},
  {id:'helm_leather',type:'helm',rarity:'Common',name:{fa:'کلاه چرمی',en:'Leather Cap'},def:4,hp:12},
  {id:'helm_bronze',type:'helm',rarity:'Common',name:{fa:'خود برنزی',en:'Bronze Helm'},def:8,hp:24},
  {id:'helm_shahi',type:'helm',rarity:'Epic',name:{fa:'تاج شاهی',en:'Royal Crown'},def:18,hp:70,atk:6},
  {id:'taj_kiani',type:'helm',rarity:'Legendary',name:{fa:'تاج کیانی',en:'Kiani Crown'},def:30,hp:120,atk:18},
  {id:'armor_leather',type:'armor',rarity:'Common',name:{fa:'زره چرمی',en:'Leather Armor'},def:12,hp:36},
  {id:'armor_scale',type:'armor',rarity:'Rare',name:{fa:'زره پولکی',en:'Scale Mail'},def:24,hp:72},
  {id:'babr_bayan',type:'armor',rarity:'Legendary',name:{fa:'ببر بیان',en:'Tiger-Cloak Armor'},def:54,hp:180,atk:12,hero:'rostam'},
  {id:'armor_javidan',type:'armor',rarity:'Epic',name:{fa:'زره جاویدان',en:'Immortals Armor'},def:38,hp:120},
  {id:'boots_leather',type:'boots',rarity:'Common',name:{fa:'چکمه چرمی',en:'Leather Boots'},def:4,spd:2},
  {id:'boots_shahi',type:'boots',rarity:'Rare',name:{fa:'چکمه شاهی',en:'Royal Boots'},def:10,spd:5},
  {id:'boots_rakhsh',type:'boots',rarity:'Legendary',name:{fa:'نعل رخش',en:'Rakhsh Horseshoes'},def:18,spd:14,hp:60},
  {id:'ring_bronze',type:'ring',rarity:'Common',name:{fa:'انگشتر برنزی',en:'Bronze Ring'},atk:4},
  {id:'ring_firooz',type:'ring',rarity:'Rare',name:{fa:'انگشتر فیروزه',en:'Turquoise Ring'},atk:12,crit:6},
  {id:'ring_yaghout',type:'ring',rarity:'Epic',name:{fa:'انگشتر یاقوت',en:'Ruby Ring'},atk:22,crit:10},
  {id:'mohreh_simorgh',type:'ring',rarity:'Legendary',name:{fa:'مهره سیمرغ',en:'Simorgh Amulet'},atk:30,def:18,hp:96,crit:14},
];

// ---------------- PETS (Upgradeable) ----------------
const PETS = [
  {id:'simorgh',name:{fa:'سیمرغ',en:'Simorgh'},rarity:'SSR',
    bonus:{fa:'HP و کریتیکال کل تیم',en:'Team HP & Crit'},
    baseStats:{hp:0.15, crit:0.08},
    perLevelStats:{hp:0.02, crit:0.01},   // +2% HP, +1% Crit per pet level
    ability:{fa:'در هر ۵ نوبت، همه متحدان را ۲۰٪ درمان می‌کند',en:'Every 5 turns, heals allies 20%'},
    abilityCd:5, abilityHeal:0.20,
    upgradeCost:{gold:2000,gems:50},
    lore:{fa:'مرغ افسانه‌ای که زال را پروراند.',en:'Legendary bird that raised Zal.'}},
  {id:'rakhsh',name:{fa:'رخش',en:'Rakhsh'},rarity:'SR',
    bonus:{fa:'سرعت و حمله',en:'Speed & Attack'},
    baseStats:{spd:0.12, atk:0.08},
    perLevelStats:{spd:0.015, atk:0.015},
    ability:{fa:'در نوبت اول، دو حمله',en:'First turn: double attack'},
    abilityCd:0, abilityBurst:true,
    upgradeCost:{gold:1500,gems:35},
    lore:{fa:'اسب افسانه‌ای رستم.',en:'Legendary warhorse of Rostam.'}},
  {id:'homa',name:{fa:'هما',en:'Homa'},rarity:'SR',
    bonus:{fa:'دفاع و شفا',en:'Defense & Regen'},
    baseStats:{def:0.12, hp:0.08},
    perLevelStats:{def:0.015, hp:0.015, regen:0.005},
    ability:{fa:'هر نوبت ۳٪ درمان',en:'3% heal each turn'},
    abilityCd:1, abilityRegen:0.03,
    upgradeCost:{gold:1500,gems:35},
    lore:{fa:'مرغ شاهی که سایه‌اش تاج می‌بخشد.',en:'Royal bird of kingship.'}},
];

// ---------------- BUILDINGS ----------------
const BUILDINGS = [
  {id:'palace',name:{fa:'کاخ آپادانا',en:'Apadana Palace'},desc:{fa:'+۱ اسلات تیم در هر سطح',en:'+1 team slot per level'},icon:'🏛'},
  {id:'fire_temple',name:{fa:'آتشکده',en:'Fire Temple'},desc:{fa:'+۱۵٪ درآمد طلا در هر سطح',en:'+15% gold rate per level'},icon:'🔥'},
  {id:'bazaar',name:{fa:'بازار پارس',en:'Persian Bazaar'},desc:{fa:'-۴٪ هزینه ارتقا در هر سطح',en:'-4% upgrade cost per level'},icon:'🏺'},
  {id:'immortals',name:{fa:'پادگان جاویدان',en:'Immortals Barracks'},desc:{fa:'+۶٪ قدرت پهلوانان',en:'+6% hero power per level'},icon:'⚔'},
  {id:'library',name:{fa:'کتابخانه اوستا',en:'Avesta Library'},desc:{fa:'+۱.۵٪ کریتیکال ریت',en:'+1.5% crit per level'},icon:'📜'},
  {id:'stable',name:{fa:'اصطبل رخش',en:'Rakhsh Stables'},desc:{fa:'+۱ سرعت پهلوانان',en:'+1 hero speed per level'},icon:'🐎'},
];

// ---------------- STORY (7 chapters) ----------------
const CHAPTERS = [
  {id:1,title:{fa:'قیام کاوه',en:'Kavehs Uprising'},scene:'fire',
    intro:{fa:['به نام خداوند جان و خرد، کزین برتر اندیشه برنگذرد.',
      'هزاران سال پیش، ضحاک ماردوش با فریب اهریمن، جمشید شاه را کشت و بر تخت پارس نشست.',
      'دو مار سیاه از دوش‌هایش رویید که هر روز خوراکشان مغز جوانان ایرانی بود.',
      'مردم در وحشت زندگی می‌کردند، تا اینکه کاوه، آهنگر ساده، شانزده پسر خود را از دست داد.',
      'او پیش‌بند چرمی خود را بر سر نیزه کرد و درفش کاویانی را برافراشت.',
      'ای پهلوان! به این قیام بپیوند و ضحاک را از تخت به زیر کش!'],
      en:['In the name of the Lord of soul and wisdom.',
      'Zahhak murdered Jamshid and took the throne of Persia.',
      'Two serpents grew from his shoulders, feeding on the brains of youth.',
      'Kaveh the blacksmith lost sixteen of his sons.',
      'He raised his apron on a spear — the Kaviani Banner was born.',
      'Hero! Cast Zahhak from his throne!']},
    stages:[
      {enemy:'kaftar_div'},
      {enemy:'kondrow'},
      {enemy:'warg'},
      {enemy:'kaftar_div',wave:2},
      {enemy:'zahhak',boss:true,reward:{item:'sword_iron'}}],
    outro:{fa:['ضحاک شکست خورد! فریدون او را به دماوند بست.','ایران رها شد. یک شمشیر آهنی پاداش توست!'],
      en:['Zahhak is defeated! An Iron Sword is your reward!']}},
  {id:2,title:{fa:'هفت خوان رستم',en:'Seven Labors of Rostam'},scene:'mountain',
    intro:{fa:['کیکاووس شاه در مازندران به دست دیو سپید اسیر شد.','رستم دستان برای نجات شاه به راه افتاد.','هفت خوان در برابر اوست.','رخش پیر اما وفادار در کنار اوست.'],
      en:['King Kay Kavus was captured by the White Demon.','Rostam set out to rescue him.','Seven Labors await.']},
    stages:[
      {enemy:'sheer_div'},
      {enemy:'warg',wave:3},
      {enemy:'ghol'},
      {enemy:'sheer_div',wave:2},
      {enemy:'arjang_div',boss:true,reward:{item:'helm_bronze'}},
      {enemy:'ghol',wave:2},
      {enemy:'div_sepid',boss:true,reward:{item:'babr_bayan'}}],
    outro:{fa:['رستم دیو سپید را کشت. ببر بیان پاداش توست!'],
      en:['Rostam slew the White Demon. The Tiger-Cloak is your reward!']}},
  {id:3,title:{fa:'رستم و سهراب',en:'Rostam and Sohrab'},scene:'battle',
    intro:{fa:['سهراب پسر رستم بزرگ شده. اما پدرش را نمی‌شناسد.','با سپاه توران به ایران می‌تازد.','گردآفرید در برابرش می‌ایستد.','سرنوشتی تراژیک در انتظار است!'],
      en:['Sohrab has grown mighty but knows not his father.','He marches on Iran.','A tragic fate awaits!']},
    stages:[
      {enemy:'barman'},
      {enemy:'hooman'},
      {enemy:'barman',wave:2},
      {enemy:'kamus',boss:true,reward:{item:'sword_steel'}},
      {enemy:'hooman',wave:3},
      {enemy:'sohrab_boss',boss:true,reward:{item:'nezeh_pahlavi'}}],
    outro:{fa:['رستم پس از کشتن سهراب، دیر نوشدارو رسید.','گریست چون ابر بهار.'],
      en:['After slaying Sohrab, elixir came too late.']}},
  {id:4,title:{fa:'انتقام سیاوش',en:'Vengeance for Siavash'},scene:'palace',
    intro:{fa:['سیاوش شاهزاده پاک به دست افراسیاب کشته شد.','کیخسرو پسر او اکنون شاه ایران است.','زمان انتقام فرا رسیده!'],
      en:['Siavash was slain by Afrasiab.','Kay Khosrow is now king.','The time for vengeance!']},
    stages:[
      {enemy:'piran_visa'},
      {enemy:'garsivaz'},
      {enemy:'shideh'},
      {enemy:'piran_visa',wave:2},
      {enemy:'afrasiab',boss:true,reward:{item:'armor_javidan'}}],
    outro:{fa:['افراسیاب کشته شد. خون سیاوش پاک شد.','کیخسرو در کوهی ناپدید شد.'],
      en:['Afrasiab slain. Siavash avenged.']}},
  {id:5,title:{fa:'بیژن و منیژه',en:'Bijan and Manijeh'},scene:'night',
    intro:{fa:['بیژن در باغ منیژه گیر افتاد.','افراسیاب او را در چاهی افکند.','تنها رستم می‌تواند نجاتش دهد!'],
      en:['Bijan trapped in Manijehs garden.','Only Rostam can save him!']},
    stages:[
      {enemy:'sanjeh_div'},
      {enemy:'bakhtak'},
      {enemy:'narsi'},
      {enemy:'div_pashang',wave:2},
      {enemy:'shabrang_div',boss:true,reward:{item:'ring_yaghout'}}],
    outro:{fa:['بیژن آزاد شد. انگشتر یاقوت پاداش توست!'],
      en:['Bijan freed. Ruby Ring is your reward!']}},
  {id:6,title:{fa:'اکوان دیو',en:'The Wind Demon'},scene:'cave',
    intro:{fa:['اکوان دیو گله‌های شاه را می‌درید.','رستم به شکار او رفت.','او را از دریا برد و به آسمان انداخت!'],
      en:['Akvan devoured the kings herds.','Rostam went to hunt him.']},
    stages:[
      {enemy:'bulman',wave:3},
      {enemy:'shabrang_div',wave:2},
      {enemy:'div_pashang',wave:3},
      {enemy:'akvan_div',boss:true,reward:{item:'boots_rakhsh'}}],
    outro:{fa:['اکوان با گرز رستم کشته شد.','نعل رخش پاداش توست!'],
      en:['Akvan slain by Rostams mace.']}},
  {id:7,title:{fa:'اژدهاک و پایان تاریکی',en:'Azhi Dahaka'},scene:'desert',
    intro:{fa:['ضحاک از دماوند رها می‌شود و به اژدهاک اهریمنی بدل می‌گردد.','این آخرین نبرد است!'],
      en:['Zahhak breaks free as Azhi Dahaka.','This is the final battle!']},
    stages:[
      {enemy:'shabrang_div',wave:3},
      {enemy:'akvan_div',wave:2},
      {enemy:'afrasiab',wave:2},
      {enemy:'azhdahak',boss:true,reward:{item:'mohreh_simorgh'}}],
    outro:{fa:['اژدهاک شکست خورد! ایران‌زمین جاودان است.','مهره سیمرغ از آن توست. حالا وارد حالت بی‌نهایت شو!'],
      en:['Azhi Dahaka defeated! Iran endures forever.']}},
];

// Auto-fill rewards from balance for stages without explicit rewards
CHAPTERS.forEach(ch => {
  ch.stages.forEach((st, i) => {
    if(!st.reward) st.reward = {};
    const waves = st.wave || 1;
    const base = BALANCE.campGoldBase + ch.id*BALANCE.campGoldPerChapter + i*BALANCE.campGoldPerStage;
    if(!st.reward.gold) st.reward.gold = Math.floor(base * waves * (st.boss?BALANCE.bossGoldMult:1));
    if(!st.reward.exp) st.reward.exp = Math.floor((BALANCE.campExpBase + ch.id*15 + i*5) * waves * (st.boss?3:1));
    if(st.boss && !st.reward.gems) st.reward.gems = BALANCE.bossGemsBase + ch.id*8;
    if(st.boss && !st.reward.scrolls) st.reward.scrolls = BALANCE.scrollFromBoss;
  });
});

// ---------------- QUESTS (30+) ----------------
const QUESTS = [
  // Daily
  {id:'d_battle3',type:'daily',name:{fa:'۳ نبرد در روز',en:'3 battles today'},goal:3,stat:'d_battles',reward:{gold:150,exp:60}},
  {id:'d_battle10',type:'daily',name:{fa:'۱۰ نبرد در روز',en:'10 battles today'},goal:10,stat:'d_battles',reward:{gold:400,gems:8}},
  {id:'d_win5',type:'daily',name:{fa:'۵ پیروزی',en:'Win 5 battles'},goal:5,stat:'d_wins',reward:{gold:300,scrolls:1}},
  {id:'d_summon1',type:'daily',name:{fa:'یک احضار',en:'1 summon'},goal:1,stat:'d_summons',reward:{gems:25}},
  {id:'d_upgrade',type:'daily',name:{fa:'یک پهلوان ارتقا بده',en:'Upgrade a hero'},goal:1,stat:'d_upgrades',reward:{gold:250}},
  {id:'d_idle',type:'daily',name:{fa:'پاداش آفلاین بگیر',en:'Claim idle'},goal:1,stat:'d_idleClaims',reward:{gold:200}},
  {id:'d_build',type:'daily',name:{fa:'یک بنا ارتقا بده',en:'Upgrade building'},goal:1,stat:'d_builds',reward:{gold:300}},
  {id:'d_equip',type:'daily',name:{fa:'آیتم تجهیز کن',en:'Equip item'},goal:1,stat:'d_equips',reward:{gold:150}},
  {id:'d_endless',type:'daily',name:{fa:'حالت بی‌نهایت',en:'Endless mode'},goal:1,stat:'d_endless',reward:{gems:15}},
  {id:'d_minigame',type:'daily',name:{fa:'یک مینی‌گیم',en:'Play minigame'},goal:1,stat:'d_minigames',reward:{gold:250,gems:8}},
  // Weekly
  {id:'w_battle50',type:'weekly',name:{fa:'۵۰ نبرد',en:'50 battles/week'},goal:50,stat:'w_battles',reward:{gold:3000,gems:80}},
  {id:'w_wins25',type:'weekly',name:{fa:'۲۵ پیروزی',en:'25 wins'},goal:25,stat:'w_wins',reward:{gold:2000,scrolls:5}},
  {id:'w_summon10',type:'weekly',name:{fa:'۱۰ احضار',en:'10 summons'},goal:10,stat:'w_summons',reward:{gems:150}},
  {id:'w_lvl20',type:'weekly',name:{fa:'یک پهلوان به لول ۲۰',en:'Hero to Lv.20'},goal:20,stat:'maxLevel',reward:{gold:5000,gems:100}},
  {id:'w_stage20',type:'weekly',name:{fa:'به مرحله ۲۰ برس',en:'Reach stage 20'},goal:20,stat:'endlessMax',reward:{gems:200,item:'sword_steel'}},
  // Story
  {id:'q_ch1',type:'story',name:{fa:'فصل ۱ را تمام کن',en:'Complete Ch.1'},goal:1,stat:'ch1',reward:{gems:50,scrolls:3}},
  {id:'q_ch2',type:'story',name:{fa:'فصل ۲',en:'Complete Ch.2'},goal:1,stat:'ch2',reward:{gems:80,scrolls:5}},
  {id:'q_ch3',type:'story',name:{fa:'فصل ۳',en:'Complete Ch.3'},goal:1,stat:'ch3',reward:{gems:120,item:'ring_firooz'}},
  {id:'q_ch4',type:'story',name:{fa:'فصل ۴',en:'Complete Ch.4'},goal:1,stat:'ch4',reward:{gems:180,item:'helm_shahi'}},
  {id:'q_ch5',type:'story',name:{fa:'فصل ۵',en:'Complete Ch.5'},goal:1,stat:'ch5',reward:{gems:240}},
  {id:'q_ch6',type:'story',name:{fa:'فصل ۶',en:'Complete Ch.6'},goal:1,stat:'ch6',reward:{gems:320}},
  {id:'q_ch7',type:'story',name:{fa:'فصل ۷',en:'Complete Ch.7'},goal:1,stat:'ch7',reward:{gems:600,item:'taj_kiani'}},
];

// ---------------- ACHIEVEMENTS (100+) ----------------
const ACHIEVEMENTS = [
  // Battle (15)
  {id:'a_firstwin',cat:'battle',name:{fa:'اولین پیروزی',en:'First Blood'},desc:{fa:'در یک نبرد پیروز شو',en:'Win first battle'},goal:1,stat:'wins',reward:{gold:100,gems:10}},
  {id:'a_win10',cat:'battle',name:{fa:'ده پیروزی',en:'Decade'},desc:{fa:'۱۰ نبرد را ببر',en:'Win 10 battles'},goal:10,stat:'wins',reward:{gold:400,gems:20}},
  {id:'a_win50',cat:'battle',name:{fa:'نیم‌قرن پیروزی',en:'Half-Century'},desc:{fa:'۵۰ پیروزی',en:'Win 50 battles'},goal:50,stat:'wins',reward:{gold:2000,gems:60}},
  {id:'a_win100',cat:'battle',name:{fa:'صد پیروزی',en:'Century'},desc:{fa:'۱۰۰ پیروزی',en:'Win 100 battles'},goal:100,stat:'wins',reward:{gold:5000,gems:120,item:'sword_steel'}},
  {id:'a_win250',cat:'battle',name:{fa:'دویست و پنجاه',en:'Veteran'},desc:{fa:'۲۵۰ پیروزی',en:'Win 250 battles'},goal:250,stat:'wins',reward:{gems:250,item:'armor_scale'}},
  {id:'a_win500',cat:'battle',name:{fa:'پنج‌صد پیروزی',en:'Warlord'},desc:{fa:'۵۰۰ پیروزی',en:'Win 500 battles'},goal:500,stat:'wins',reward:{gems:500,item:'shamshir_shahi'}},
  {id:'a_win1000',cat:'battle',name:{fa:'هزار پیروزی',en:'Legend'},desc:{fa:'۱۰۰۰ پیروزی',en:'Win 1000 battles'},goal:1000,stat:'wins',reward:{gems:1500,item:'mohreh_simorgh'}},
  {id:'a_lose1',cat:'battle',name:{fa:'اولین شکست',en:'First Fall'},desc:{fa:'یک شکست را تجربه کن',en:'Experience defeat'},goal:1,stat:'losses',reward:{gems:20}},
  {id:'a_boss1',cat:'battle',name:{fa:'اولین باس',en:'Boss Slayer'},desc:{fa:'یک باس را شکست بده',en:'Defeat a boss'},goal:1,stat:'bosses',reward:{gems:30}},
  {id:'a_boss5',cat:'battle',name:{fa:'پنج باس',en:'Boss Hunter'},desc:{fa:'۵ باس',en:'5 bosses'},goal:5,stat:'bosses',reward:{gems:100,item:'ring_yaghout'}},
  {id:'a_boss15',cat:'battle',name:{fa:'پانزده باس',en:'Boss Master'},desc:{fa:'۱۵ باس',en:'15 bosses'},goal:15,stat:'bosses',reward:{gems:300,item:'helm_shahi'}},
  {id:'a_crit100',cat:'battle',name:{fa:'صد کریتیکال',en:'Crit Master'},desc:{fa:'۱۰۰ کریتیکال',en:'100 crits'},goal:100,stat:'crits',reward:{gold:1500}},
  {id:'a_crit1000',cat:'battle',name:{fa:'هزار کریتیکال',en:'Crit Legend'},desc:{fa:'۱۰۰۰ کریتیکال',en:'1000 crits'},goal:1000,stat:'crits',reward:{gems:250,item:'ring_yaghout'}},
  {id:'a_crit5000',cat:'battle',name:{fa:'پنج‌هزار کریتیکال',en:'Crit God'},desc:{fa:'۵۰۰۰ کریتیکال',en:'5000 crits'},goal:5000,stat:'crits',reward:{gems:800}},
  {id:'a_dmg100k',cat:'battle',name:{fa:'صدهزار آسیب',en:'100K Damage'},desc:{fa:'۱۰۰,۰۰۰ آسیب کل',en:'Deal 100K total damage'},goal:100000,stat:'totalDmg',reward:{gems:150}},
  // Heroes (15)
  {id:'a_hero3',cat:'hero',name:{fa:'سه پهلوان',en:'Team of Three'},desc:{fa:'۳ پهلوان',en:'Collect 3 heroes'},goal:3,stat:'heroCount',reward:{gold:300}},
  {id:'a_hero10',cat:'hero',name:{fa:'ده پهلوان',en:'Growing Army'},desc:{fa:'۱۰ پهلوان',en:'Collect 10 heroes'},goal:10,stat:'heroCount',reward:{gems:60}},
  {id:'a_hero15',cat:'hero',name:{fa:'پانزده پهلوان',en:'Battalion'},desc:{fa:'۱۵ پهلوان',en:'15 heroes'},goal:15,stat:'heroCount',reward:{gems:120}},
  {id:'a_hero20',cat:'hero',name:{fa:'بیست پهلوان',en:'Legions'},desc:{fa:'۲۰ پهلوان',en:'20 heroes'},goal:20,stat:'heroCount',reward:{gems:250,scrolls:5}},
  {id:'a_heroAll',cat:'hero',name:{fa:'تمام پهلوانان',en:'Full Roster'},desc:{fa:'همه ۲۶ پهلوان',en:'All 26 heroes'},goal:26,stat:'heroCount',reward:{gems:1500,item:'mohreh_simorgh'}},
  {id:'a_ssr1',cat:'hero',name:{fa:'اولین SSR',en:'First Legendary'},desc:{fa:'یک قهرمان SSR',en:'Get a Legendary hero'},goal:1,stat:'ssrCount',reward:{gems:100}},
  {id:'a_ssr3',cat:'hero',name:{fa:'سه SSR',en:'Legendary Trio'},desc:{fa:'۳ قهرمان SSR',en:'3 Legendaries'},goal:3,stat:'ssrCount',reward:{gems:200}},
  {id:'a_ssr5',cat:'hero',name:{fa:'پنج SSR',en:'Legendary Collector'},desc:{fa:'۵ SSR',en:'5 Legendaries'},goal:5,stat:'ssrCount',reward:{gems:400,scrolls:10}},
  {id:'a_ssr10',cat:'hero',name:{fa:'ده SSR',en:'Legendary Master'},desc:{fa:'۱۰ SSR',en:'10 Legendaries'},goal:10,stat:'ssrCount',reward:{gems:1000}},
  {id:'a_lvl10',cat:'hero',name:{fa:'لول ۱۰',en:'Level 10'},desc:{fa:'قهرمان به لول ۱۰',en:'Hero to Lv.10'},goal:10,stat:'maxLevel',reward:{gold:800}},
  {id:'a_lvl25',cat:'hero',name:{fa:'لول ۲۵',en:'Level 25'},desc:{fa:'قهرمان به لول ۲۵',en:'Hero to Lv.25'},goal:25,stat:'maxLevel',reward:{gems:120}},
  {id:'a_lvl50',cat:'hero',name:{fa:'لول ۵۰',en:'Level 50'},desc:{fa:'قهرمان به لول ۵۰',en:'Hero to Lv.50'},goal:50,stat:'maxLevel',reward:{gems:300,item:'armor_javidan'}},
  {id:'a_lvl75',cat:'hero',name:{fa:'لول ۷۵',en:'Level 75'},desc:{fa:'قهرمان به لول ۷۵',en:'Hero to Lv.75'},goal:75,stat:'maxLevel',reward:{gems:600}},
  {id:'a_lvl100',cat:'hero',name:{fa:'لول ۱۰۰',en:'Master'},desc:{fa:'قهرمان به لول ۱۰۰',en:'Hero to Lv.100'},goal:100,stat:'maxLevel',reward:{gems:1200,item:'taj_kiani'}},
  {id:'a_talent1',cat:'hero',name:{fa:'اولین تلنت',en:'First Talent'},desc:{fa:'یک تلنت را ارتقا بده',en:'Upgrade a talent'},goal:1,stat:'talentPoints',reward:{gems:30}},
  // Story (10)
  {id:'a_ch1',cat:'story',name:{fa:'فصل ۱',en:'Chapter 1'},desc:{fa:'قیام کاوه را تمام کن',en:'Complete Kavehs revolt'},goal:1,stat:'ch1',reward:{gems:60}},
  {id:'a_ch2',cat:'story',name:{fa:'فصل ۲',en:'Chapter 2'},desc:{fa:'هفت خوان را تمام کن',en:'Complete Seven Labors'},goal:1,stat:'ch2',reward:{gems:100,item:'helm_bronze'}},
  {id:'a_ch3',cat:'story',name:{fa:'فصل ۳',en:'Chapter 3'},desc:{fa:'رستم و سهراب',en:'Rostam & Sohrab'},goal:1,stat:'ch3',reward:{gems:150}},
  {id:'a_ch4',cat:'story',name:{fa:'فصل ۴',en:'Chapter 4'},desc:{fa:'انتقام سیاوش',en:'Siavash avenged'},goal:1,stat:'ch4',reward:{gems:200}},
  {id:'a_ch5',cat:'story',name:{fa:'فصل ۵',en:'Chapter 5'},desc:{fa:'بیژن آزاد شد',en:'Bijan freed'},goal:1,stat:'ch5',reward:{gems:280}},
  {id:'a_ch6',cat:'story',name:{fa:'فصل ۶',en:'Chapter 6'},desc:{fa:'اکوان کشته شد',en:'Akvan slain'},goal:1,stat:'ch6',reward:{gems:360}},
  {id:'a_ch7',cat:'story',name:{fa:'همه فصل‌ها',en:'All Chapters'},desc:{fa:'همه ۷ فصل',en:'Complete all 7 chapters'},goal:1,stat:'ch7',reward:{gems:1200,item:'taj_kiani'}},
  {id:'a_endless5',cat:'story',name:{fa:'بی‌نهایت ۵',en:'Endless 5'},desc:{fa:'مرحله ۵ بی‌نهایت',en:'Endless stage 5'},goal:5,stat:'endlessMax',reward:{gems:50}},
  {id:'a_endless25',cat:'story',name:{fa:'بی‌نهایت ۲۵',en:'Endless 25'},desc:{fa:'مرحله ۲۵',en:'Endless stage 25'},goal:25,stat:'endlessMax',reward:{gems:250,item:'ring_firooz'}},
  {id:'a_endless50',cat:'story',name:{fa:'بی‌نهایت ۵۰',en:'Endless 50'},desc:{fa:'مرحله ۵۰',en:'Endless stage 50'},goal:50,stat:'endlessMax',reward:{gems:600,item:'ring_yaghout'}},
  {id:'a_endless100',cat:'story',name:{fa:'بی‌نهایت ۱۰۰',en:'Endless 100'},desc:{fa:'مرحله ۱۰۰',en:'Endless stage 100'},goal:100,stat:'endlessMax',reward:{gems:2500,item:'mohreh_simorgh'}},
  // Wealth (8)
  {id:'a_gold5k',cat:'wealth',name:{fa:'پنج هزار طلا',en:'5K Gold'},desc:{fa:'۵,۰۰۰ طلا',en:'Own 5K gold'},goal:5000,stat:'goldMax',reward:{gems:30}},
  {id:'a_gold25k',cat:'wealth',name:{fa:'بیست‌و‌پنج هزار',en:'25K Gold'},desc:{fa:'۲۵,۰۰۰ طلا',en:'Own 25K gold'},goal:25000,stat:'goldMax',reward:{gems:80}},
  {id:'a_gold100k',cat:'wealth',name:{fa:'صد هزار',en:'100K Gold'},desc:{fa:'۱۰۰,۰۰۰ طلا',en:'Own 100K gold'},goal:100000,stat:'goldMax',reward:{gems:200}},
  {id:'a_gold500k',cat:'wealth',name:{fa:'نیم میلیون',en:'500K Gold'},desc:{fa:'۵۰۰,۰۰۰ طلا',en:'Own 500K gold'},goal:500000,stat:'goldMax',reward:{gems:500}},
  {id:'a_gold1M',cat:'wealth',name:{fa:'میلیونر',en:'Millionaire'},desc:{fa:'۱ میلیون طلا',en:'1M gold'},goal:1000000,stat:'goldMax',reward:{gems:1500}},
  {id:'a_gems100',cat:'wealth',name:{fa:'۱۰۰ الماس',en:'100 Gems'},desc:{fa:'۱۰۰ الماس',en:'Own 100 gems'},goal:100,stat:'gemsMax',reward:{gold:500}},
  {id:'a_gems500',cat:'wealth',name:{fa:'۵۰۰ الماس',en:'500 Gems'},desc:{fa:'۵۰۰ الماس',en:'500 gems'},goal:500,stat:'gemsMax',reward:{scrolls:5}},
  {id:'a_gems2500',cat:'wealth',name:{fa:'۲۵۰۰ الماس',en:'2.5K Gems'},desc:{fa:'۲۵۰۰ الماس',en:'2500 gems'},goal:2500,stat:'gemsMax',reward:{scrolls:20}},
  // Summons (5)
  {id:'a_sum5',cat:'summon',name:{fa:'۵ احضار',en:'5 Summons'},desc:{fa:'۵ احضار',en:'5 summons'},goal:5,stat:'summons',reward:{gems:40}},
  {id:'a_sum25',cat:'summon',name:{fa:'۲۵ احضار',en:'25 Summons'},desc:{fa:'۲۵ احضار',en:'25 summons'},goal:25,stat:'summons',reward:{gems:120}},
  {id:'a_sum50',cat:'summon',name:{fa:'۵۰ احضار',en:'50 Summons'},desc:{fa:'۵۰ احضار',en:'50 summons'},goal:50,stat:'summons',reward:{gems:250}},
  {id:'a_sum100',cat:'summon',name:{fa:'۱۰۰ احضار',en:'100 Summons'},desc:{fa:'۱۰۰ احضار',en:'100 summons'},goal:100,stat:'summons',reward:{gems:600,scrolls:20}},
  {id:'a_sum250',cat:'summon',name:{fa:'۲۵۰ احضار',en:'250 Summons'},desc:{fa:'۲۵۰ احضار',en:'250 summons'},goal:250,stat:'summons',reward:{gems:1500}},
  // Buildings (5)
  {id:'a_build5',cat:'build',name:{fa:'۵ ارتقا',en:'5 Upgrades'},desc:{fa:'۵ ارتقای بنا',en:'5 building upgrades'},goal:5,stat:'builds',reward:{gold:600}},
  {id:'a_build15',cat:'build',name:{fa:'۱۵ ارتقا',en:'15 Upgrades'},desc:{fa:'۱۵ ارتقا',en:'15 upgrades'},goal:15,stat:'builds',reward:{gems:80}},
  {id:'a_build50',cat:'build',name:{fa:'۵۰ ارتقا',en:'50 Upgrades'},desc:{fa:'۵۰ ارتقا',en:'50 upgrades'},goal:50,stat:'builds',reward:{gems:200}},
  {id:'a_bldMax10',cat:'build',name:{fa:'بنای لول ۱۰',en:'Building Lv.10'},desc:{fa:'یک بنا به لول ۱۰',en:'Building to Lv.10'},goal:10,stat:'maxBuild',reward:{gems:350}},
  {id:'a_bldMax25',cat:'build',name:{fa:'بنای لول ۲۵',en:'Building Lv.25'},desc:{fa:'یک بنا به لول ۲۵',en:'Building to Lv.25'},goal:25,stat:'maxBuild',reward:{gems:1000}},
  // Items (7)
  {id:'a_item5',cat:'item',name:{fa:'۵ آیتم',en:'5 Items'},desc:{fa:'۵ آیتم',en:'Collect 5 items'},goal:5,stat:'itemCount',reward:{gold:400}},
  {id:'a_item25',cat:'item',name:{fa:'۲۵ آیتم',en:'25 Items'},desc:{fa:'۲۵ آیتم',en:'Collect 25 items'},goal:25,stat:'itemCount',reward:{gems:120}},
  {id:'a_item75',cat:'item',name:{fa:'۷۵ آیتم',en:'75 Items'},desc:{fa:'۷۵ آیتم',en:'75 items'},goal:75,stat:'itemCount',reward:{gems:400}},
  {id:'a_legItem',cat:'item',name:{fa:'اولین افسانه‌ای',en:'First Legendary Item'},desc:{fa:'یک آیتم افسانه‌ای',en:'Legendary item'},goal:1,stat:'legItems',reward:{gems:250}},
  {id:'a_legItem5',cat:'item',name:{fa:'پنج افسانه‌ای',en:'5 Legendary Items'},desc:{fa:'۵ آیتم افسانه‌ای',en:'5 Legendary items'},goal:5,stat:'legItems',reward:{gems:800}},
  {id:'a_equip5',cat:'item',name:{fa:'۵ تجهیز',en:'5 Equips'},desc:{fa:'۵ بار تجهیز',en:'Equip 5 times'},goal:5,stat:'equips',reward:{gold:600}},
  {id:'a_fullEquip',cat:'item',name:{fa:'تجهیز کامل',en:'Fully Equipped'},desc:{fa:'پهلوان با ۵ اسلات پر',en:'Hero with all 5 slots'},goal:1,stat:'fullEquipHero',reward:{gems:200}},
  // Minigames (7)
  {id:'a_mini1',cat:'mini',name:{fa:'اولین مینی‌گیم',en:'First Minigame'},desc:{fa:'یک مینی‌گیم',en:'Play a minigame'},goal:1,stat:'minigames',reward:{gems:20}},
  {id:'a_mini10',cat:'mini',name:{fa:'ده مینی‌گیم',en:'Minigame Fan'},desc:{fa:'۱۰ مینی‌گیم',en:'Play 10 minigames'},goal:10,stat:'minigames',reward:{gems:100}},
  {id:'a_mini50',cat:'mini',name:{fa:'پنجاه مینی‌گیم',en:'Minigame Master'},desc:{fa:'۵۰ مینی‌گیم',en:'50 minigames'},goal:50,stat:'minigames',reward:{gems:400}},
  {id:'a_archer100',cat:'mini',name:{fa:'استاد کمان',en:'Master Archer'},desc:{fa:'۱۰۰ امتیاز کمانگیری',en:'Score 100 in archery'},goal:100,stat:'archeryHigh',reward:{gems:200,item:'kaman_arash'}},
  {id:'a_archer300',cat:'mini',name:{fa:'کمانگیر افسانه‌ای',en:'Legendary Archer'},desc:{fa:'۳۰۰ امتیاز کمانگیری',en:'Score 300 in archery'},goal:300,stat:'archeryHigh',reward:{gems:600}},
  {id:'a_race10',cat:'mini',name:{fa:'سوارکار ماهر',en:'Skilled Rider'},desc:{fa:'۱۰ برد مسابقه رخش',en:'Win Rakhsh race 10 times'},goal:10,stat:'raceWins',reward:{gems:250}},
  {id:'a_forge25',cat:'mini',name:{fa:'آهنگر ماهر',en:'Master Blacksmith'},desc:{fa:'۲۵ ساخت',en:'Forge 25 items'},goal:25,stat:'forges',reward:{gems:350,item:'sword_shahi'}},
  // Special (12)
  {id:'a_day3',cat:'special',name:{fa:'۳ روز پیاپی',en:'3-Day Streak'},desc:{fa:'۳ روز پیاپی',en:'3-day streak'},goal:3,stat:'streak',reward:{gems:60}},
  {id:'a_day7',cat:'special',name:{fa:'۷ روز پیاپی',en:'Week Streak'},desc:{fa:'۷ روز',en:'7-day streak'},goal:7,stat:'streak',reward:{gems:180,scrolls:5}},
  {id:'a_day14',cat:'special',name:{fa:'۱۴ روز پیاپی',en:'Two-Week Streak'},desc:{fa:'۱۴ روز',en:'14-day streak'},goal:14,stat:'streak',reward:{gems:400}},
  {id:'a_day30',cat:'special',name:{fa:'۳۰ روز پیاپی',en:'Month Streak'},desc:{fa:'۳۰ روز',en:'30-day streak'},goal:30,stat:'streak',reward:{gems:1200,item:'taj_kiani'}},
  {id:'a_pet1',cat:'special',name:{fa:'اولین پت',en:'First Pet'},desc:{fa:'یک پت',en:'Get a pet'},goal:1,stat:'petCount',reward:{gems:120}},
  {id:'a_petAll',cat:'special',name:{fa:'همه پت‌ها',en:'Pet Master'},desc:{fa:'همه ۳ پت',en:'All 3 pets'},goal:3,stat:'petCount',reward:{gems:600}},
  {id:'a_petLv5',cat:'special',name:{fa:'پت لول ۵',en:'Pet Lv.5'},desc:{fa:'یک پت به لول ۵',en:'Pet to Lv.5'},goal:5,stat:'maxPetLv',reward:{gems:300}},
  {id:'a_rostam',cat:'special',name:{fa:'رستم را به دست آور',en:'Get Rostam'},desc:{fa:'رستم دستان',en:'Summon Rostam'},goal:1,stat:'hasRostam',reward:{gems:250}},
  {id:'a_lang',cat:'special',name:{fa:'دوزبانه',en:'Bilingual'},desc:{fa:'زبان را تغییر بده',en:'Change language'},goal:1,stat:'langSwitch',reward:{gems:10}},
  {id:'a_1hour',cat:'special',name:{fa:'یک ساعت',en:'1 Hour'},desc:{fa:'۱ ساعت بازی',en:'Play 1 hour'},goal:3600,stat:'playTime',reward:{gems:100}},
  {id:'a_5hour',cat:'special',name:{fa:'پنج ساعت',en:'5 Hours'},desc:{fa:'۵ ساعت بازی',en:'Play 5 hours'},goal:18000,stat:'playTime',reward:{gems:300}},
  {id:'a_10hour',cat:'special',name:{fa:'ده ساعت',en:'10 Hours'},desc:{fa:'۱۰ ساعت بازی',en:'Play 10 hours'},goal:36000,stat:'playTime',reward:{gems:600,item:'shamshir_shahi'}},
  {id:'a_50hour',cat:'special',name:{fa:'پنجاه ساعت',en:'50 Hours'},desc:{fa:'۵۰ ساعت بازی',en:'Play 50 hours'},goal:180000,stat:'playTime',reward:{gems:2000}},
];

// ---------------- MINIGAMES ----------------
const MINIGAMES = [
  {id:'archery',name:{fa:'کمانگیری آرش',en:'Arash Archery'},icon:'🏹',
    desc:{fa:'با تیراندازی به هدف امتیاز جمع کن!',en:'Hit targets to score!'}},
  {id:'race',name:{fa:'مسابقه رخش',en:'Rakhsh Race'},icon:'🐎',
    desc:{fa:'از موانع بپر و برنده شو!',en:'Race and dodge obstacles!'}},
  {id:'forge',name:{fa:'آهنگری کاوه',en:'Kavehs Forge'},icon:'🔨',
    desc:{fa:'در زمان مناسب بکوب تا آیتم بسازی!',en:'Hammer perfectly to forge items!'}},
];

// ---------------- OPENING CINEMATIC ----------------
const INTRO_STORY = [
  {img:'assets/story/scene1_jamshid_age.png', audio:'story_intro_1', 
    text:{fa:'به نام خداوند جان و خرد، کزین برتر اندیشه بر نگذرد.\n\nهزاران سال پیش، در سرزمین ایران‌زمین، جمشید شاه با فرّ ایزدی بر تخت نشسته بود.',
          en:'In the name of the Lord of soul and wisdom.\n\nThousands of years ago, King Jamshid ruled Iran with divine glory.'}},
  {img:'assets/story/scene2_zahhak_throne.png', audio:'story_intro_2',
    text:{fa:'اما اهریمن نگذاشت. ضحاک ماردوش با نیرنگ اهریمن دست به خون جمشید آلود و بر تخت پارس نشست.\n\nتاریکی بر ایران فرو افتاد.',
          en:'But Ahriman would not allow it. Zahhak the Serpent-King, deceived by evil, seized the throne of Persia.\n\nDarkness fell upon Iran.'}},
  {img:'assets/story/scene3_serpents.png', audio:'story_intro_3',
    text:{fa:'اهریمن بر دوش‌های ضحاک بوسه زد و از هر دوش، ماری سیاه رویید.\n\nآن مارها هر روز خوراکی می‌طلبیدند از مغز جوانان ایرانی.',
          en:'Ahriman kissed Zahhak\'s shoulders, and black serpents grew from each.\n\nDaily they demanded the brains of Iranian youth.'}},
  {img:'assets/story/scene4_suffering.png', audio:'story_intro_4',
    text:{fa:'مردمان در وحشت روزگار می‌گذراندند. کودکان یتیم می‌شدند، مادران شیون می‌کردند.\n\nهزار سال، ایران در بند دیو ماند.',
          en:'The people lived in terror. Children were orphaned, mothers wailed.\n\nFor a thousand years, Iran remained in bondage.'}},
  {img:'assets/story/scene5_kaveh_grief.png', audio:'story_intro_5',
    text:{fa:'تا آن روز که کاوه، آهنگری ساده از اصفهان، شانزدهمین پسرش را نیز از دست داد.\n\nغم چنان بر جانش نشست که دیگر ترس در دلش نماند.',
          en:'Until Kaveh, a humble blacksmith from Isfahan, lost his sixteenth son.\n\nGrief filled him so deeply that fear left his heart.'}},
  {img:'assets/story/scene6_kaveh_banner.png', audio:'story_intro_6',
    text:{fa:'کاوه پیش‌بند چرمین آهنگری‌اش را بر نیزه‌ای بست.\n\nصدایش در پارس پیچید: ای مردم ایران، بس است! درفش کاویانی برافراشته شد!',
          en:'Kaveh raised his leather apron high on a spear.\n\nHis voice thundered across Persia: "People of Iran, enough! The Kaviani Banner is raised!"'}},
  {img:'assets/story/scene7_hero_call.png', audio:'story_intro_7',
    text:{fa:'و اکنون ای پهلوان، سرنوشت ایران در دستان توست.\n\nپهلوانان دیگر در گوشه‌گوشه سرزمین منتظرند تا تو آن‌ها را گرد آوری.\n\nبرخیز! ایران فرا می‌خواند تو را.',
          en:'And now, hero, the fate of Iran is in your hands.\n\nOther champions await across the land for you to unite them.\n\nRise! Iran calls you!'}},
];
