// ============================================================
// SHAHNAMEH: RISE OF KINGS - GAME ENGINE v4
// Balanced • Pets (upgradeable) • Talent Tree • Pity system
// Responsive • No PvP/Guild (offline)
// ============================================================

const DEFAULT_STATE = {
  gold: 300, gems: 100, scrolls: 1, exp: 0,
  summonEnergy: 3, lastEnergyRegen: 0,
  heroes: {},                // {id: {level, owned, exp, equipment, talents:{id:rank}, talentPoints}}
  team: [],
  inventory: [],
  pets: {},                  // {id: {level, owned, exp}}
  activePets: [],            // multiple active pets supported
  lang: 'fa',
  buildings: {},
  lastIdle: Date.now(),
  goldRate: 100,
  progress: {chapter:1, stage:0, storyRead:{}},
  endlessStage: 0, endlessMax: 0,
  vipLevel: 0, totalSpent: 0,
  achievements: {}, achievementsClaimed: {},
  quests: {}, questsClaimed: {},
  dailyReset: 0, weeklyReset: 0,
  summonCounter: {sinceSSR:0, sinceSR:0, total:0},
  stats: {
    battles:0, wins:0, losses:0, bosses:0, crits:0, totalDmg:0,
    summons:0, upgrades:0, idleClaims:0, builds:0, equips:0,
    endless:0, minigames:0, archeryHigh:0, raceWins:0, forges:0,
    heroCount:1, ssrCount:0, maxLevel:1, maxBuild:1, endlessMax:0,
    ch1:0, ch2:0, ch3:0, ch4:0, ch5:0, ch6:0, ch7:0,
    goldMax:500, gemsMax:300, itemCount:0, legItems:0, fullEquipHero:0,
    streak:1, lastLogin:0, petCount:0, maxPetLv:0,
    hasRostam:0, langSwitch:0, talentPoints:0,
    playTime:0, startedAt:Date.now(),
    // daily/weekly (reset with time)
    d_battles:0, d_wins:0, d_summons:0, d_upgrades:0, d_idleClaims:0,
    d_builds:0, d_equips:0, d_endless:0, d_minigames:0,
    w_battles:0, w_wins:0, w_summons:0,
  },
  settings: {sound:true, sfx:true, music:true, autoSave:true, hapticFeedback:true, particleEffects:true, battleSpeed:1, autoBattle:true, cinematicShown:false},
  tutorialStep: 0,
  onboardingDone: false,
  playerName: 'پهلوان',
};
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let UID = 0;

// ---------------- STORAGE ----------------
function save(){ try{ localStorage.setItem('shahnameh_v4', JSON.stringify(state)) }catch(e){} }
function load(){
  try{
    // Try v4 first, then migrate from v3
    let s = localStorage.getItem('shahnameh_v4') || localStorage.getItem('shahnameh_v3');
    if(s){
      const parsed = JSON.parse(s);
      state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    }
  }catch(e){ console.warn('Load failed', e) }
  if(!state.heroes.kaveh) state.heroes.kaveh = {level:1,owned:true,exp:0,equipment:{},talents:{},talentPoints:0};
  // ensure talents/talentPoints exist on all owned heroes
  for(const hid in state.heroes){
    if(!state.heroes[hid].talents) state.heroes[hid].talents = {};
    if(state.heroes[hid].talentPoints === undefined) state.heroes[hid].talentPoints = 0;
  }
  if(state.team.length===0) state.team = ['kaveh'];
  BUILDINGS.forEach(b=>{ if(!state.buildings[b.id]) state.buildings[b.id]=1 });
  if(state.inventory.length===0){
    ['sword_bronze','helm_leather','armor_leather','boots_leather'].forEach(id=>addItem(id));
  }
  UID = state.inventory.reduce((m,x)=>Math.max(m,x.uid||0),0) + 1;
}
function deepMerge(target, source){
  for(const k in source){
    if(source[k]!==null && typeof source[k]==='object' && !Array.isArray(source[k])){
      target[k] = deepMerge(target[k]||{}, source[k]);
    } else { target[k] = source[k] }
  }
  return target;
}

// ---------------- HELPERS ----------------
function _(str){ return typeof str==='object'? (str[state.lang]||str.fa) : str }
function heroData(id){ return HEROES.find(h=>h.id===id) }
function enemyData(id){ return ENEMIES.find(e=>e.id===id) }
function itemData(id){ return ITEMS.find(i=>i.id===id) }
function petData(id){ return PETS.find(p=>p.id===id) }
function chapterData(id){ return CHAPTERS.find(c=>c.id===id) }

function toast(msg, type='info', duration=2500){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), duration);
}
function haptic(pattern){ if(state.settings.hapticFeedback && navigator.vibrate) navigator.vibrate(pattern) }
function assetPath(kind, id){
  if(kind==='item') return `assets/items/${id}.svg`;
  if(kind==='pet') return `assets/pets/${id}.png`;
  const list = kind==='hero'? HEROES : ENEMIES;
  const obj = list.find(x=>x.id===id);
  const ext = obj && obj.ext ? obj.ext : 'svg';
  const folder = kind==='hero'? 'heroes' : 'enemies';
  return `assets/${folder}/${id}.${ext}`;
}
// transparent battle sprite path — falls back to regular portrait
function spritePath(kind, id){
  const list = kind==='hero'? HEROES : ENEMIES;
  const obj = list.find(x=>x.id===id);
  if(!obj) return assetPath(kind, id);
  const folder = kind==='hero'? 'heroes' : 'enemies';
  if(obj.ext === 'png') return `assets/sprites/${folder}/${id}.png`;
  return `assets/sprites/${folder}/${id}.svg`;
}
function playVoice(voiceId){
  if(!voiceId || !state.settings.sound) return;
  const a = document.getElementById('voiceAudio');
  try{ a.src = `assets/audio/${voiceId}.mp3`; a.play().catch(()=>{}) }catch(e){}
}

// ---------------- SFX ----------------
let audioCtx;
function sfx(name){
  if(!state.settings.sfx) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const ctx = audioCtx, now = ctx.currentTime;
    const p = ({
      click:{f:[800,600],t:0.05,type:'square',v:0.05},
      hit:{f:[200,80],t:0.12,type:'sawtooth',v:0.15},
      crit:{f:[880,440,220],t:0.2,type:'triangle',v:0.18},
      heal:{f:[440,660,880],t:0.25,type:'sine',v:0.12},
      levelup:{f:[523,659,784,1047],t:0.4,type:'triangle',v:0.15},
      coin:{f:[988,1319],t:0.1,type:'square',v:0.1},
      whoosh:{f:[400,100],t:0.15,type:'sawtooth',v:0.1},
      fanfare:{f:[523,659,784,1047,1319],t:0.6,type:'triangle',v:0.18},
      defeat:{f:[200,150,100,60],t:0.6,type:'sawtooth',v:0.15},
      achieve:{f:[1047,1319,1568,2093],t:0.5,type:'triangle',v:0.2},
    })[name] || {f:[800],t:0.05,type:'square',v:0.05};
    const step = p.t/p.f.length;
    p.f.forEach((freq,i)=>{
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = p.type; o.frequency.setValueAtTime(freq, now+i*step);
      g.gain.setValueAtTime(p.v, now+i*step);
      g.gain.exponentialRampToValueAtTime(0.001, now+(i+1)*step);
      o.connect(g); g.connect(ctx.destination);
      o.start(now+i*step); o.stop(now+(i+1)*step);
    });
  }catch(e){}
}

// ---------------- HERO STATS (equip + pet + talent) ----------------
function heroStats(id){
  const h = heroData(id); if(!h) return null;
  const s = state.heroes[id] || {level:1, equipment:{}, talents:{}};
  const lvl = s.level || 1;
  const imm = state.buildings.immortals || 1;
  const lib = state.buildings.library || 1;
  const stable = state.buildings.stable || 1;
  // Base scaling
  const lvlMult = 1 + (lvl-1)*BALANCE.levelStatGain;
  const bldMult = 1 + (imm-1)*BALANCE.buildingEffectPerLv.immortals;
  const mult = lvlMult * bldMult;
  let hp = Math.floor(h.hp * mult);
  let atk = Math.floor(h.atk * mult);
  let def = Math.floor(h.def * mult);
  let spd = h.spd + (stable-1)*BALANCE.buildingEffectPerLv.stable;
  let crit = h.crit + (lib-1)*BALANCE.buildingEffectPerLv.library;

  // Equipment
  const eq = s.equipment || {};
  for(const slot in eq){
    const uid = eq[slot]; if(!uid) continue;
    const inv = state.inventory.find(x=>x.uid===uid); if(!inv) continue;
    const it = itemData(inv.id); if(!it) continue;
    hp += it.hp||0; atk += it.atk||0; def += it.def||0; spd += it.spd||0; crit += it.crit||0;
    if(it.hero === id){ atk = Math.floor(atk*1.2); hp = Math.floor(hp*1.2) }
  }
  // Talents
  const talents = s.talents || {};
  const tree = TALENT_TREE[h.class] || [];
  tree.forEach(node=>{
    const rank = talents[node.id] || 0;
    if(rank===0) return;
    const v = node.valuePerRank * rank;
    switch(node.effect){
      case 'atk': atk = Math.floor(atk*(1+v)); break;
      case 'def': def = Math.floor(def*(1+v)); break;
      case 'hp':  hp  = Math.floor(hp*(1+v));  break;
      case 'spd': spd += v; break;
      case 'crit': crit += v; break;
    }
  });
  // Active pet stats
  state.activePets.forEach(pid=>{
    const p = petData(pid); if(!p) return;
    const pLv = (state.pets[pid]?.level)||1;
    const bonusHp = (p.baseStats.hp||0) + (p.perLevelStats.hp||0)*(pLv-1);
    const bonusAtk = (p.baseStats.atk||0) + (p.perLevelStats.atk||0)*(pLv-1);
    const bonusDef = (p.baseStats.def||0) + (p.perLevelStats.def||0)*(pLv-1);
    const bonusSpd = (p.baseStats.spd||0) + (p.perLevelStats.spd||0)*(pLv-1);
    const bonusCrit = (p.baseStats.crit||0) + (p.perLevelStats.crit||0)*(pLv-1);
    hp = Math.floor(hp*(1+bonusHp));
    atk = Math.floor(atk*(1+bonusAtk));
    def = Math.floor(def*(1+bonusDef));
    spd = Math.floor(spd*(1+bonusSpd));
    crit += Math.floor(crit*bonusCrit);
  });
  return {hp,atk,def,spd,crit,power: Math.floor(hp/2 + atk*3 + def*2 + spd*4)};
}
function teamPower(){ return state.team.reduce((s,id)=> s + (heroStats(id)?.power||0), 0) }

// ---------------- INVENTORY ----------------
function addItem(itemId){
  const uid = ++UID;
  state.inventory.push({id:itemId, uid});
  const it = itemData(itemId);
  state.stats.itemCount++;
  if(it && it.rarity==='Legendary') state.stats.legItems++;
  return uid;
}
function equipItem(heroId, uid){
  const inv = state.inventory.find(x=>x.uid===uid); if(!inv) return;
  const it = itemData(inv.id); if(!it) return;
  if(!state.heroes[heroId].equipment) state.heroes[heroId].equipment = {};
  for(const hid in state.heroes){
    const eq = state.heroes[hid].equipment||{};
    if(eq[it.type]===uid) delete eq[it.type];
  }
  state.heroes[heroId].equipment[it.type] = uid;
  state.stats.equips++; state.stats.d_equips++;
  const eq = state.heroes[heroId].equipment;
  if(eq.weapon && eq.helm && eq.armor && eq.boots && eq.ring) state.stats.fullEquipHero = 1;
  save(); checkAchievements(); checkQuests();
}
function unequipItem(heroId, slot){
  if(state.heroes[heroId].equipment) delete state.heroes[heroId].equipment[slot];
  save();
}


// ---------------- ENERGY (free summon) ----------------
function regenEnergy(){
  if(!state.lastEnergyRegen) state.lastEnergyRegen = Date.now();
  const elapsedMin = (Date.now() - state.lastEnergyRegen) / 60000;
  const regenPerMin = BALANCE.summonEnergyRegenMinutes;
  const gained = Math.floor(elapsedMin / regenPerMin);
  if(gained > 0){
    state.summonEnergy = Math.min(BALANCE.summonEnergyMax, (state.summonEnergy||0) + gained);
    state.lastEnergyRegen = Date.now() - (elapsedMin - gained*regenPerMin)*60000;
  }
}
function energyTimeToNext(){
  regenEnergy();
  if(state.summonEnergy >= BALANCE.summonEnergyMax) return _({fa:'کامل!',en:'Full!'});
  const elapsedMin = (Date.now() - state.lastEnergyRegen) / 60000;
  const remainMin = BALANCE.summonEnergyRegenMinutes - elapsedMin;
  const h = Math.floor(remainMin/60), m = Math.floor(remainMin%60);
  return (h>0?h+'h ':'')+m+'m';
}

// ---------------- SUMMON with Pity ----------------
function summon(type){
  let count = 1;
  if(type==='energy'){
    regenEnergy();
    if(state.summonEnergy<1){toast(_(D.no_energy)+' — '+energyTimeToNext(),'error',4000);return}
    state.summonEnergy--;
    state.lastEnergyRegen = Date.now();
  } else if(type==='scroll'){
    if(state.scrolls<1){toast(_(D.no_scroll),'error');return}
    state.scrolls--;
  } else if(type===1){
    if(state.gems<BALANCE.summonSingleGems){toast(_(D.no_gems),'error');return}
    state.gems -= BALANCE.summonSingleGems;
  } else if(type===10){
    if(state.gems<BALANCE.summonTenGems){toast(_(D.no_gems),'error');return}
    state.gems -= BALANCE.summonTenGems; count = 10;
  }
  sfx('whoosh');
  showSummonAnimation();
  playVoice('summon');
  setTimeout(()=>{
    const results = [];
    for(let i=0;i<count;i++){
      state.summonCounter.total++;
      state.summonCounter.sinceSSR++;
      state.summonCounter.sinceSR++;
      let pool, forced = null;
      // Pity SSR
      if(state.summonCounter.sinceSSR >= BALANCE.pitySSR){
        pool = HEROES.filter(h=>h.rarity==='SSR');
        forced = 'SSR';
      } else if(state.summonCounter.sinceSR >= BALANCE.pitySR){
        pool = HEROES.filter(h=>h.rarity==='SR' || h.rarity==='SSR');
        forced = 'SR+';
      } else {
        const r = Math.random();
        if(r < BALANCE.rateSSR) pool = HEROES.filter(h=>h.rarity==='SSR');
        else if(r < BALANCE.rateSSR + BALANCE.rateSR) pool = HEROES.filter(h=>h.rarity==='SR');
        else pool = HEROES.filter(h=>h.rarity==='R');
      }
      if(pool.length===0) pool = HEROES;
      const h = pool[Math.floor(Math.random()*pool.length)];
      if(h.rarity==='SSR') state.summonCounter.sinceSSR = 0;
      if(h.rarity==='SR' || h.rarity==='SSR') state.summonCounter.sinceSR = 0;
      const already = state.heroes[h.id] && state.heroes[h.id].owned;
      if(already){
        // Dupe → gold + XP + shards
        const dupeGold = BALANCE.dupeGoldBase + (h.rarity==='SSR'?BALANCE.dupeShardsGold*2:(h.rarity==='SR'?BALANCE.dupeShardsGold:0));
        state.gold += dupeGold;
        state.heroes[h.id].exp = (state.heroes[h.id].exp||0) + 80;
        checkLevelUp(h.id);
        results.push({hero:h, dupe:true, gold:dupeGold, forced});
      } else {
        state.heroes[h.id] = {level:1, owned:true, exp:0, equipment:{}, talents:{}, talentPoints:1};
        state.stats.heroCount = Object.values(state.heroes).filter(x=>x.owned).length;
        if(h.rarity==='SSR') state.stats.ssrCount++;
        if(h.id==='rostam') state.stats.hasRostam = 1;
        results.push({hero:h, dupe:false, forced});
        sfx('fanfare');
      }
    }
    state.stats.summons += count;
    state.stats.d_summons += count;
    state.stats.w_summons += count;
    showSummonResults(results);
    save(); refreshUI(); checkAchievements(); checkQuests();
  }, 1500);
}
function showSummonAnimation(){
  const a = document.getElementById('summonAnim');
  a.classList.add('show');
  setTimeout(()=>a.classList.remove('show'), 1400);
}
function showSummonResults(results){
  const body = document.getElementById('summonResultBody');
  body.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'summon-result-grid';
  results.forEach(r=>{
    const card = document.createElement('div');
    card.className = `summon-card rarity-${r.hero.rarity}`;
    card.innerHTML = `
      <img src="${assetPath('hero',r.hero.id)}">
      <div class="rarity">${r.hero.rarity}${r.forced?' 🎁':''}</div>
      <div class="name">${_(r.hero.name)}</div>
      ${r.dupe? `<div class="dupe">${_(D.dupe)} +${r.gold}💰</div>` : `<div class="new">✨ ${_(D.new_hero)} ✨</div>`}`;
    grid.appendChild(card);
  });
  body.appendChild(grid);
  document.getElementById('summonResultModal').classList.add('show');
}

// ---------------- CAMPAIGN & ENDLESS ----------------
function currentStageInfo(){
  const c = chapterData(state.progress.chapter);
  if(!c) return null;
  return {chapter:c, stage:c.stages[state.progress.stage]};
}
function startCampaign(){
  const info = currentStageInfo();
  if(!info){ startEndless(); return }
  const key = `ch${state.progress.chapter}_intro`;
  if(!state.progress.storyRead[key] && state.progress.stage===0){
    state.progress.storyRead[key] = true; save();
    showStory(info.chapter, 'intro', ()=>startBattle(info.stage,'campaign'));
  } else {
    startBattle(info.stage,'campaign');
  }
}
function startEndless(){
  state.stats.endless++; state.stats.d_endless++;
  const eStage = state.endlessStage;
  const tier = Math.min(6, Math.floor(eStage/8)+1);
  const enemyPool = ENEMIES.filter(e=>e.tier===tier);
  const enemy = enemyPool[eStage % enemyPool.length];
  const scale = 1 + eStage * BALANCE.endlessScalePerStage;
  const stage = {
    enemy: enemy.id,
    reward: {
      gold: BALANCE.endlessGoldBase + eStage*BALANCE.endlessGoldPerStage,
      exp: 60 + eStage*15,
      gems: eStage%5===0?15:0
    },
    endlessScale: scale,
  };
  startBattle(stage,'endless');
}


// ---------------- INTRO CINEMATIC ----------------
let cinematicState = null;
function playIntroCinematic(onDone){
  const modal = document.getElementById('cinematicModal');
  const img = document.getElementById('cineImg');
  const txt = document.getElementById('cineText');
  const audio = document.getElementById('voiceAudio');
  cinematicState = {idx:0, done:onDone, audio};
  modal.classList.add('show');
  if(state.settings.music){ playMusic('cinematic') }
  // stop any prior audio when skipped
  try{ audio.pause(); }catch(e){}
  nextCinematicScene();
}
function nextCinematicScene(){
  if(!cinematicState) return;
  const scene = INTRO_STORY[cinematicState.idx];
  if(!scene){ endCinematic(); return }
  const img = document.getElementById('cineImg');
  const txt = document.getElementById('cineText');
  const audio = document.getElementById('voiceAudio');
  const cnt = document.getElementById('cineCounter');
  // fade transition
  img.style.opacity = 0; txt.style.opacity = 0;
  setTimeout(()=>{
    img.src = scene.img;
    txt.textContent = scene.text[state.lang] || scene.text.fa;
    cnt.textContent = (cinematicState.idx+1) + ' / ' + INTRO_STORY.length;
    img.style.opacity = 1; txt.style.opacity = 1;
    if(state.settings.sound){
      try{ audio.src = 'assets/audio/'+scene.audio+'.mp3'; audio.play().catch(()=>{}); }catch(e){}
    }
    // Ken Burns pan effect
    img.style.animation = 'none'; void img.offsetWidth;
    img.style.animation = 'kenBurns 8s ease-out forwards';
  }, 400);
  cinematicState.idx++;
}
function skipCinematic(){
  if(!cinematicState) return;
  if(confirm(_({fa:'صحنه‌های داستان را رد کنی؟',en:'Skip the intro cinematic?'}))){
    endCinematic();
  }
}
function endCinematic(){
  const modal = document.getElementById('cinematicModal');
  const audio = document.getElementById('voiceAudio');
  try{ audio.pause(); audio.currentTime = 0; }catch(e){}
  modal.classList.remove('show');
  if(state.settings.music) playMusic('menu');
  const cb = cinematicState?.done;
  cinematicState = null;
  if(cb) cb();
  // welcome message + gift Kaveh reminder
  setTimeout(()=>{
    toast(_({fa:'🎁 کاوه به تیم تو پیوست!',en:'🎁 Kaveh joined your team!'}),'success',3500);
  }, 300);
}

// ---------------- STORY ----------------
function showStory(chapter, phase, onDone){
  const modal = document.getElementById('storyModal');
  const lines = chapter[phase][state.lang] || chapter[phase].fa;
  document.getElementById('storyBg').style.backgroundImage = `url('assets/story/${chapter.scene}.svg')`;
  document.getElementById('storyTitle').textContent = _(chapter.title);
  const txt = document.getElementById('storyText');
  let idx = 0;
  function next(){
    sfx('click');
    if(idx >= lines.length){
      modal.classList.remove('show');
      if(onDone) onDone();
      return;
    }
    txt.textContent = lines[idx++];
    txt.classList.remove('animate'); void txt.offsetWidth; txt.classList.add('animate');
  }
  modal.classList.add('show');
  document.getElementById('storyNextBtn').onclick = next;
  next();
}

// ---------------- BATTLE ----------------
let battle = null;
let turnQueue = [];

function startBattle(stage, mode){
  if(state.team.length===0){
    toast(_(D.no_team),'error');
    showScreen('heroes'); return;
  }
  const players = state.team.map(id=>{
    const h = heroData(id);
    const s = heroStats(id);
    return {id, kind:'hero', name:_(h.name), img:spritePath('hero',id),
      hp:s.hp, maxHp:s.hp, atk:s.atk, def:s.def, spd:s.spd, crit:s.crit,
      class:h.class, alive:true, effects:[], voice:h.voice};
  });
  const enemyBase = enemyData(stage.enemy);
  const waves = stage.wave || 1;
  const scale = stage.endlessScale || (1 + (state.progress.chapter-1)*0.25);
  const enemies = [];
  for(let w=0; w<waves; w++){
    const bossMult = stage.boss ? 2.2 : 1;
    enemies.push({id:stage.enemy, kind:'enemy', name:_(enemyBase.name),
      img:spritePath('enemy', stage.enemy),
      hp:Math.floor(enemyBase.hp*scale*bossMult),
      maxHp:Math.floor(enemyBase.hp*scale*bossMult),
      atk:Math.floor(enemyBase.atk*scale),
      def:Math.floor(enemyBase.def*scale),
      spd:enemyBase.spd, crit:10, alive:true, effects:[],
      isBoss:!!stage.boss, voice:enemyBase.voice});
  }
  battle = {players, enemies, stage, mode, over:false, turn:0, log:[]};
  showScreen('battle');
  renderBattleScene();
  logBattle('⚔ ' + _(D.battle_start) + ' — ' + enemies[0].name);
  if(state.settings.music){ playMusic(stage.boss?'boss':'battle'); currentMusicTrack = stage.boss?'boss':'battle' }
  state.stats.battles++; state.stats.d_battles++; state.stats.w_battles++;
  if(stage.boss && enemyBase.voice){ setTimeout(()=>playVoice(enemyBase.voice), 500) }
  if(state.settings.autoBattle) setTimeout(battleTick, 800/state.settings.battleSpeed);
}

function renderBattleScene(){
  const pRow = document.getElementById('playerRow');
  const eRow = document.getElementById('enemyRow');
  pRow.innerHTML=''; eRow.innerHTML='';
  battle.players.forEach((p,i)=>{
    const el = document.createElement('div');
    el.className = 'combatant player'+(p.alive?'':' dead');
    el.id = 'p'+i;
    el.innerHTML = `<div class="name-plate">${p.name}</div>
      <img src="${p.img}">
      <div class="hp-bar"><div class="fill" style="width:${p.hp/p.maxHp*100}%"></div>
        <div class="txt">${p.hp|0}/${p.maxHp}</div></div>`;
    pRow.appendChild(el);
  });
  battle.enemies.forEach((e,i)=>{
    const el = document.createElement('div');
    el.className = 'combatant enemy'+(e.alive?'':' dead')+(e.isBoss?' boss':'');
    el.id = 'e'+i;
    el.innerHTML = `<div class="name-plate">${e.name}${e.isBoss?' 👑':''}</div>
      <img src="${e.img}">
      <div class="hp-bar"><div class="fill" style="width:${e.hp/e.maxHp*100}%"></div>
        <div class="txt">${e.hp|0}/${e.maxHp}</div></div>`;
    eRow.appendChild(el);
  });
}

function updateHPBars(){
  [...battle.players.map((p,i)=>({u:p,sel:'#p'+i})), ...battle.enemies.map((e,i)=>({u:e,sel:'#e'+i}))].forEach(({u,sel})=>{
    const el = document.querySelector(sel); if(!el) return;
    const pct = Math.max(0,u.hp)/u.maxHp*100;
    el.querySelector('.fill').style.width = pct+'%';
    el.querySelector('.txt').textContent = `${Math.max(0,u.hp)|0}/${u.maxHp}`;
    el.querySelector('.hp-bar').classList.toggle('low', pct<30);
    el.classList.toggle('dead', !u.alive);
  });
}

function dmgPopup(sel, amt, crit){
  const el = document.querySelector(sel); if(!el) return;
  const p = document.createElement('div');
  p.className = 'dmg-popup';
  p.textContent = crit? `💥 ${amt}` : amt;
  if(crit) p.style.color = '#ffd700';
  el.appendChild(p);
  setTimeout(()=>p.remove(), 1000);
  if(state.settings.particleEffects) spawnParticles(el, crit?'#ffd700':'#ff4444');
}
function spawnParticles(el, color){
  for(let i=0;i<6;i++){
    const p = document.createElement('div');
    p.className='particle'; p.style.background = color;
    p.style.left = (Math.random()*80+10)+'%';
    p.style.top = (Math.random()*60+20)+'%';
    const a = Math.random()*Math.PI*2;
    p.style.setProperty('--dx', Math.cos(a)*40+'px');
    p.style.setProperty('--dy', Math.sin(a)*40+'px');
    el.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
}
function logBattle(msg){
  const el = document.getElementById('combatLog');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 1400/state.settings.battleSpeed);
}
function buildTurnQueue(){
  const all = [
    ...battle.players.filter(p=>p.alive).map(p=>({side:'p',idx:battle.players.indexOf(p),unit:p})),
    ...battle.enemies.filter(e=>e.alive).map(e=>({side:'e',idx:battle.enemies.indexOf(e),unit:e})),
  ];
  all.sort((a,b)=> b.unit.spd - a.unit.spd);
  turnQueue = all;
}

function battleTick(){
  if(!battle || battle.over) return;
  if(turnQueue.length===0) buildTurnQueue();
  const turn = turnQueue.shift();
  if(!turn || !turn.unit.alive){
    if(state.settings.autoBattle) setTimeout(battleTick, 60);
    return;
  }
  const attacker = turn.unit;
  const targets = turn.side==='p'? battle.enemies.filter(e=>e.alive) : battle.players.filter(p=>p.alive);
  if(targets.length===0){ endBattle(turn.side==='p'); return }
  const target = Math.random()<0.3
    ? targets.sort((a,b)=>a.hp-b.hp)[0]
    : targets[Math.floor(Math.random()*targets.length)];
  const crit = Math.random() < (attacker.crit/100);
  if(crit) state.stats.crits++;
  const variance = BALANCE.varianceMin + Math.random()*(BALANCE.varianceMax-BALANCE.varianceMin);
  let dmg = Math.max(1, Math.floor((attacker.atk*(crit?BALANCE.critMult:1) - target.def*BALANCE.defenseFactor) * variance));
  target.hp -= dmg;
  state.stats.totalDmg += dmg;
  const atkSel = turn.side==='p'?'#p'+turn.idx:'#e'+turn.idx;
  const tgtIdx = turn.side==='p'? battle.enemies.indexOf(target) : battle.players.indexOf(target);
  const tgtSel = turn.side==='p'?'#e'+tgtIdx:'#p'+tgtIdx;
  const atkEl = document.querySelector(atkSel);
  const tgtEl = document.querySelector(tgtSel);
  if(atkEl) atkEl.classList.add('attacking');
  if(tgtEl) tgtEl.classList.add('hurt');
  // Skill: every 4th attack, boost dmg 50% + play visual skill burst
  if(!battle.skillCounter) battle.skillCounter = {};
  const key = turn.side + turn.idx;
  battle.skillCounter[key] = (battle.skillCounter[key]||0) + 1;
  if(battle.skillCounter[key] % 4 === 0){
    dmg = Math.floor(dmg * 1.6);
    target.hp -= Math.floor(dmg * 0.6); // extra 60% on top
    state.stats.totalDmg += Math.floor(dmg * 0.6);
    playSkillAnimation(atkEl, turn.side==='p');
    // second popup for skill dmg
    setTimeout(()=>dmgPopup(tgtSel, '✦'+Math.floor(dmg*0.6), true), 250);
    logBattle('✨ '+attacker.name+' — '+_({fa:'مهارت ویژه!',en:'Special Skill!'}));
  }
  dmgPopup(tgtSel, dmg, crit);
  sfx(crit?'crit':'hit');
  haptic(crit?[30,30,30]:20);
  setTimeout(()=>{
    if(atkEl) atkEl.classList.remove('attacking');
    if(tgtEl) tgtEl.classList.remove('hurt');
  }, 400);
  if(target.hp<=0){ target.hp=0; target.alive=false; sfx('whoosh') }
  updateHPBars();
  if(battle.enemies.every(e=>!e.alive)){ return endBattle(true) }
  if(battle.players.every(p=>!p.alive)){ return endBattle(false) }
  if(state.settings.autoBattle) setTimeout(battleTick, 600/state.settings.battleSpeed);
}

function endBattle(win){
  if(!battle || battle.over) return;
  battle.over = true;
  playVoice(win?'victory':'defeat');
  sfx(win?'fanfare':'defeat');
  haptic(win?[100,50,100,50,200]:[300]);
  if(win){
    state.stats.wins++; state.stats.d_wins++; state.stats.w_wins++;
    if(battle.stage.boss) state.stats.bosses++;
    const r = battle.stage.reward || {};
    if(r.gold) state.gold += r.gold;
    if(r.gems) state.gems += r.gems;
    if(r.exp) state.exp += r.exp;
    if(r.scrolls) state.scrolls += r.scrolls;
    if(r.item){ addItem(r.item) }
    // team XP
    state.team.forEach(id=>{
      state.heroes[id].exp = (state.heroes[id].exp||0) + Math.floor((r.exp||30)/state.team.length + (r.exp||30)*0.5);
      checkLevelUp(id);
    });
    if(state.settings.music){ playMusic('victory') }
    logBattle('🏆 ' + _(D.victory) + `  +${r.gold||0}💰 +${r.gems||0}💎` + (r.item?` +${_(itemData(r.item).name)}`:''));
    if(battle.mode==='campaign'){
      state.progress.stage++;
      const ch = chapterData(state.progress.chapter);
      if(state.progress.stage >= ch.stages.length){
        state.stats['ch'+state.progress.chapter] = 1;
        setTimeout(()=>showStory(ch,'outro',()=>{
          state.progress.chapter++;
          state.progress.stage = 0;
          save(); showScreen('home');
        }), 1500);
      } else {
        save();
        setTimeout(()=>{ if(state.settings.autoBattle) startCampaign(); else showScreen('home') }, 1500);
      }
    } else if(battle.mode==='endless'){
      state.endlessStage++;
      if(state.endlessStage > state.endlessMax) state.endlessMax = state.endlessStage;
      state.stats.endlessMax = state.endlessMax;
      save();
      setTimeout(()=>{ if(state.settings.autoBattle) startEndless(); else showScreen('home') }, 1500);
    }
  } else {
    state.stats.losses++;
    logBattle('💀 ' + _(D.defeat));
    save();
    setTimeout(()=>showScreen('home'), 2000);
  }
  state.stats.goldMax = Math.max(state.stats.goldMax, state.gold);
  state.stats.gemsMax = Math.max(state.stats.gemsMax, state.gems);
  checkAchievements(); checkQuests();
}

function toggleAuto(){
  state.settings.autoBattle = !state.settings.autoBattle;
  document.getElementById('autoBtn').classList.toggle('on', state.settings.autoBattle);
  if(state.settings.autoBattle && battle && !battle.over) battleTick();
  sfx('click'); save();
}
function toggleSpeed(){
  state.settings.battleSpeed = state.settings.battleSpeed===1?2:state.settings.battleSpeed===2?3:1;
  document.getElementById('speedBtn').querySelector('span').textContent = state.settings.battleSpeed+'×';
  sfx('click'); save();
}

// ---------------- LEVEL / UPGRADE ----------------
function xpNeeded(lvl){ return Math.floor(BALANCE.levelXpBase * Math.pow(BALANCE.levelXpGrowth, lvl-1)) }
function checkLevelUp(id){
  const s = state.heroes[id]; if(!s) return;
  while(s.exp >= xpNeeded(s.level)){
    s.exp -= xpNeeded(s.level);
    s.level++;
    s.talentPoints = (s.talentPoints||0) + BALANCE.talentPointsPerLv;
    state.stats.maxLevel = Math.max(state.stats.maxLevel, s.level);
    toast(`⬆ ${_(heroData(id).name)} → Lv.${s.level}`,'success');
    sfx('levelup'); playVoice('level_up');
  }
}
function upgradeHero(id){
  const h = heroData(id);
  const s = state.heroes[id];
  const bazaar = state.buildings.bazaar || 1;
  const rarityMult = BALANCE.rarityCostMult[h.rarity]||1;
  const bazaarDiscount = Math.min(0.5, (bazaar-1)*BALANCE.buildingEffectPerLv.bazaar);
  const cost = Math.floor(BALANCE.upgradeGoldBase * Math.pow(BALANCE.upgradeGoldGrowth, s.level-1) * rarityMult * (1-bazaarDiscount));
  if(state.gold<cost){ toast(_(D.no_gold),'error'); sfx('defeat'); return }
  state.gold -= cost;
  s.level++;
  s.talentPoints = (s.talentPoints||0) + BALANCE.talentPointsPerLv;
  state.stats.upgrades++; state.stats.d_upgrades++;
  state.stats.maxLevel = Math.max(state.stats.maxLevel, s.level);
  sfx('levelup'); haptic([50,30,50]);
  save(); refreshUI();
  toast(`⬆ Lv.${s.level}!`,'success');
  if(document.getElementById('heroModal').classList.contains('show')) openHero(id);
  checkAchievements(); checkQuests();
}

// ---------------- TALENT TREE ----------------
function talentCost(rank){ return rank+1 } // rank 1 costs 2 pts, rank 5 costs 6
function upgradeTalent(heroId, talentId){
  const h = heroData(heroId);
  const s = state.heroes[heroId];
  if(!s || !s.owned) return;
  const tree = TALENT_TREE[h.class] || [];
  const node = tree.find(n=>n.id===talentId);
  if(!node) return;
  if(s.level < node.unlockLv){ toast(_({fa:'به سطح '+node.unlockLv+' نیاز داری',en:'Requires Lv.'+node.unlockLv}),'error'); return }
  const currentRank = s.talents[talentId] || 0;
  if(currentRank >= BALANCE.talentMaxRank){ toast(_(D.maxRank),'error'); return }
  const cost = talentCost(currentRank);
  if((s.talentPoints||0) < cost){ toast(_({fa:'امتیاز کافی نداری (نیاز: '+cost+')',en:'Need '+cost+' points'}),'error'); return }
  s.talentPoints -= cost;
  s.talents[talentId] = currentRank + 1;
  state.stats.talentPoints++;
  sfx('levelup'); haptic(50);
  toast(`⭐ ${_(node.name)} → ${s.talents[talentId]}`,'success');
  save(); refreshUI();
  renderTalentTree(heroId);
  checkAchievements();
}
function resetTalents(heroId){
  if(!confirm(_({fa:'مطمئنی می‌خوای همه تلنت‌ها رو ریست کنی؟ (۵۰ الماس)',en:'Reset all talents? (50 gems)'}))) return;
  if(state.gems < 50){ toast(_(D.no_gems),'error'); return }
  state.gems -= 50;
  const s = state.heroes[heroId];
  // Refund all spent points
  let refund = 0;
  for(const tid in s.talents){
    const r = s.talents[tid];
    for(let i=0;i<r;i++) refund += talentCost(i);
  }
  s.talents = {};
  s.talentPoints = (s.talentPoints||0) + refund;
  toast(`↺ ${refund} ${_(D.pointsRefunded)}`,'success');
  save(); refreshUI(); renderTalentTree(heroId);
}
function renderTalentTree(heroId){
  const h = heroData(heroId);
  const s = state.heroes[heroId];
  const tree = TALENT_TREE[h.class] || [];
  const box = document.getElementById('talentTreeBox');
  if(!box) return;
  box.innerHTML = `
    <div style="text-align:center;margin-bottom:8px">
      <span style="color:var(--gold);font-weight:900">${_(D.talentPoints)}: ${s.talentPoints||0}</span>
      <button class="mini-btn" style="margin:0 8px" onclick="resetTalents('${heroId}')">↺ ${_(D.reset)} (50💎)</button>
    </div>`;
  const grid = document.createElement('div');
  grid.className = 'talent-grid';
  tree.forEach(node=>{
    const rank = s.talents[node.id] || 0;
    const locked = s.level < node.unlockLv;
    const maxed = rank >= BALANCE.talentMaxRank;
    const cost = talentCost(rank);
    const canAfford = (s.talentPoints||0) >= cost;
    const div = document.createElement('div');
    div.className = 'talent-node'+(locked?' locked':'')+(maxed?' maxed':'')+(rank>0?' active':'');
    div.innerHTML = `
      <div class="tn-icon">${node.icon}</div>
      <div class="tn-info">
        <div class="tn-name">${_(node.name)}</div>
        <div class="tn-desc">${_(node.desc)}</div>
        <div class="tn-rank">
          ${[1,2,3,4,5].map(r=>`<span class="tn-dot ${r<=rank?'on':''}"></span>`).join('')}
        </div>
        ${locked?`<div class="tn-lock">🔒 Lv.${node.unlockLv}</div>`:
          maxed?`<div class="tn-max">MAX</div>`:
          `<button class="tn-btn ${canAfford?'':'disabled'}" onclick="upgradeTalent('${heroId}','${node.id}')">↑ ${cost}⭐</button>`}
      </div>`;
    grid.appendChild(div);
  });
  box.appendChild(grid);
}

// ---------------- PETS (Upgradeable, multi-active) ----------------
function grantPet(id){
  if(!state.pets[id]){
    state.pets[id] = {level:1, owned:true, exp:0};
    state.stats.petCount = Object.keys(state.pets).filter(k=>state.pets[k].owned).length;
    toast(`🎁 ${_(petData(id).name)}!`,'success');
    sfx('fanfare');
  }
}
function togglePet(id){
  if(!state.pets[id] || !state.pets[id].owned) return;
  const i = state.activePets.indexOf(id);
  if(i>=0) state.activePets.splice(i,1);
  else {
    const maxActive = 1 + Math.floor((state.buildings.palace||1)/3); // 1 pet + 1 more every 3 palace lvls
    if(state.activePets.length >= maxActive){
      toast(_({fa:'حداکثر '+maxActive+' پت فعال',en:'Max '+maxActive+' active pets'}),'error'); return;
    }
    state.activePets.push(id);
  }
  sfx('click'); save(); renderPets(); refreshUI();
}
function upgradePet(id){
  const p = petData(id);
  const s = state.pets[id];
  if(!s || !s.owned) return;
  const gold = p.upgradeCost.gold * s.level;
  const gems = p.upgradeCost.gems * s.level;
  if(state.gold < gold){ toast(_(D.no_gold),'error'); return }
  if(state.gems < gems){ toast(_(D.no_gems),'error'); return }
  state.gold -= gold; state.gems -= gems;
  s.level++;
  state.stats.maxPetLv = Math.max(state.stats.maxPetLv, s.level);
  sfx('levelup'); haptic(50);
  toast(`⬆ ${_(p.name)} → Lv.${s.level}`,'success');
  save(); refreshUI(); renderPets(); checkAchievements();
}

// ---------------- BUILDING ----------------
function buildingCost(id, lv){
  const b = BUILDINGS.find(x=>x.id===id);
  const base = BALANCE.buildBase[id] || 200;
  return Math.floor(base * Math.pow(BALANCE.buildGrowth, lv-1));
}
function upgradeBuilding(id){
  const cost = buildingCost(id, state.buildings[id]);
  if(state.gold<cost) return;
  state.gold -= cost;
  state.buildings[id]++;
  state.stats.builds++; state.stats.d_builds++;
  state.stats.maxBuild = Math.max(state.stats.maxBuild, state.buildings[id]);
  sfx('coin'); haptic(30);
  save(); refreshUI(); renderKingdom();
  toast(`⬆ ${_(BUILDINGS.find(b=>b.id===id).name)}!`,'success');
  checkAchievements(); checkQuests();
}
function renderKingdom(){
  const c = document.getElementById('buildings'); c.innerHTML='';
  BUILDINGS.forEach(b=>{
    const lvl = state.buildings[b.id];
    const cost = buildingCost(b.id, lvl);
    const div = document.createElement('div'); div.className='building';
    div.innerHTML = `
      <div class="b-icon">${b.icon}</div>
      <div class="info">
        <div class="name">${_(b.name)} <span class="lvl-badge">Lv.${lvl}</span></div>
        <div class="desc">${_(b.desc)}</div>
      </div>
      <button class="up-btn" ${state.gold<cost?'disabled':''} onclick="upgradeBuilding('${b.id}')">↑ ${formatNum(cost)}💰</button>`;
    c.appendChild(div);
  });
}
function formatNum(n){
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return Math.floor(n).toString();
}

// ---------------- ACHIEVEMENTS ----------------
function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(state.achievements[a.id]) return;
    const val = state.stats[a.stat] || 0;
    if(val >= a.goal){
      state.achievements[a.id] = true;
      toast(`🏆 ${_(a.name)}`,'success',3000);
      sfx('achieve'); haptic([50,30,50,30,100]);
    }
  });
  save();
}
function claimAchievement(id){
  const a = ACHIEVEMENTS.find(x=>x.id===id); if(!a) return;
  if(!state.achievements[id] || state.achievementsClaimed[id]) return;
  state.achievementsClaimed[id] = true;
  const r = a.reward;
  if(r.gold) state.gold += r.gold;
  if(r.gems) state.gems += r.gems;
  if(r.scrolls) state.scrolls += r.scrolls;
  if(r.item) addItem(r.item);
  sfx('coin'); haptic(50);
  toast(`+${r.gold||0}💰 +${r.gems||0}💎`,'success');
  save(); refreshUI(); renderAchievements();
}

// ---------------- QUESTS ----------------
function checkQuestReset(){
  const now = Date.now();
  const day = 24*3600*1000;
  const week = 7*day;
  if(now - state.dailyReset > day){
    QUESTS.filter(q=>q.type==='daily').forEach(q=>{
      delete state.quests[q.id]; delete state.questsClaimed[q.id];
    });
    // reset daily stats
    ['d_battles','d_wins','d_summons','d_upgrades','d_idleClaims','d_builds','d_equips','d_endless','d_minigames'].forEach(k=>state.stats[k]=0);
    state.dailyReset = now;
  }
  if(now - state.weeklyReset > week){
    QUESTS.filter(q=>q.type==='weekly').forEach(q=>{
      delete state.quests[q.id]; delete state.questsClaimed[q.id];
    });
    ['w_battles','w_wins','w_summons'].forEach(k=>state.stats[k]=0);
    state.weeklyReset = now;
  }
}
function checkQuests(){
  checkQuestReset();
  QUESTS.forEach(q=>{
    if(state.quests[q.id]) return;
    const val = state.stats[q.stat] || 0;
    if(val >= q.goal){
      state.quests[q.id] = true;
      toast(`📜 ${_(q.name)}`,'success');
      sfx('achieve');
    }
  });
  save();
}
function claimQuest(id){
  const q = QUESTS.find(x=>x.id===id); if(!q) return;
  if(!state.quests[id] || state.questsClaimed[id]) return;
  state.questsClaimed[id] = true;
  const r = q.reward;
  if(r.gold) state.gold += r.gold;
  if(r.gems) state.gems += r.gems;
  if(r.scrolls) state.scrolls += r.scrolls;
  if(r.item) addItem(r.item);
  sfx('coin');
  toast(`+${r.gold||0}💰 +${r.gems||0}💎`,'success');
  save(); refreshUI(); renderQuests();
}

// ---------------- IDLE ----------------
function calcGoldRate(){
  const templeMult = 1 + (state.buildings.fire_temple-1)*BALANCE.buildingEffectPerLv.fire_temple;
  const chapterBoost = 1 + (state.progress.chapter-1)*0.15 + state.endlessStage*0.03;
  state.goldRate = BALANCE.idleBaseGold * templeMult * chapterBoost;
}
function updateIdle(){
  calcGoldRate();
  const diff = (Date.now() - state.lastIdle)/1000/3600;
  const cap = state.goldRate * BALANCE.idleCapHours;
  const earned = Math.min(cap, Math.floor(diff * state.goldRate));
  const el = document.getElementById('idleGold'); if(el) el.textContent = formatNum(earned) + ' 💰';
  const rateEl = document.getElementById('goldRate'); if(rateEl) rateEl.textContent = formatNum(state.goldRate) + ' 💰/h';
  const tpEl = document.getElementById('teamPower'); if(tpEl) tpEl.textContent = formatNum(teamPower());
  return earned;
}
function claimIdle(){
  const e = updateIdle();
  state.gold += e;
  state.lastIdle = Date.now();
  state.stats.idleClaims++; state.stats.d_idleClaims++;
  sfx('coin'); haptic(30);
  toast(`+${formatNum(e)} 💰`,'success');
  save(); refreshUI(); checkQuests();
}

// ---------------- MINIGAMES ----------------
function openMinigame(id){
  state.stats.minigames++; state.stats.d_minigames++;
  if(id==='archery') startArchery();
  else if(id==='race') startRace();
  else if(id==='forge') startForge();
  checkQuests();
}
let archery = null;
function startArchery(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🏹 ${_({fa:'کمانگیری آرش',en:'Arash Archery'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0">${_({fa:'روی هدف کلیک کن! ۳۰ ثانیه',en:'Click targets! 30 seconds'})}</div>
    <div style="display:flex;justify-content:space-around;margin:10px 0">
      <div>⏱ <span id="arTime">30</span>s</div>
      <div>🎯 <span id="arScore">0</span></div>
    </div>
    <div id="arField" style="position:relative;width:100%;height:280px;background:linear-gradient(180deg,#4b1d7a,#0f0620);border-radius:12px;overflow:hidden;border:2px solid var(--gold);cursor:crosshair"></div>
    <button class="big-btn secondary" style="width:100%;margin-top:10px" onclick="closeMini()">${_(D.close)}</button>`;
  modal.classList.add('show');
  archery = {score:0, time:30, active:true};
  const field = document.getElementById('arField');
  function spawn(){
    if(!archery.active) return;
    const t = document.createElement('div');
    t.style.cssText = `position:absolute;width:44px;height:44px;border-radius:50%;
      background:radial-gradient(circle,#c1272d,#f5c542,#c1272d);
      left:${Math.random()*80+5}%;top:${Math.random()*70+10}%;
      cursor:pointer;box-shadow:0 0 10px #f5c542;animation:targetPop 0.3s`;
    t.onclick = e=>{
      e.stopPropagation();
      archery.score += 10;
      document.getElementById('arScore').textContent = archery.score;
      sfx('crit'); haptic(20);
      t.remove();
    };
    field.appendChild(t);
    setTimeout(()=>t.remove(), 1500);
    setTimeout(spawn, 400+Math.random()*400);
  }
  spawn();
  const timer = setInterval(()=>{
    if(!archery.active){ clearInterval(timer); return }
    archery.time--;
    document.getElementById('arTime').textContent = archery.time;
    if(archery.time<=0){
      clearInterval(timer); archery.active = false;
      if(archery.score > state.stats.archeryHigh) state.stats.archeryHigh = archery.score;
      const gems = Math.floor(archery.score/8);
      const gold = archery.score * 6;
      state.gems += gems; state.gold += gold;
      toast(`🎯 ${_(D.score)}: ${archery.score}! +${gold}💰 +${gems}💎`,'success');
      sfx('fanfare'); save(); refreshUI(); checkAchievements();
      if(archery.score >= 200 && !state.pets.simorgh) grantPet('simorgh');
      setTimeout(closeMini, 2000);
    }
  },1000);
}
function startRace(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🐎 ${_({fa:'مسابقه رخش',en:'Rakhsh Race'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0">${_({fa:'روی صفحه بزن تا رخش بپرد!',en:'Tap to jump!'})}</div>
    <canvas id="raceCanvas" width="340" height="220" style="width:100%;background:linear-gradient(180deg,#4b1d7a,#c1272d);border-radius:12px;border:2px solid var(--gold);touch-action:none"></canvas>
    <button class="big-btn secondary" style="width:100%;margin-top:10px" onclick="closeMini()">${_(D.close)}</button>`;
  modal.classList.add('show');
  const canvas = document.getElementById('raceCanvas');
  const ctx = canvas.getContext('2d');
  let horse = {x:60, y:170, vy:0, jumping:false};
  let obstacles = []; let score = 0, gameOver = false, spawnTimer = 0;
  const GROUND = 180;
  function jump(){ if(!horse.jumping && !gameOver){ horse.vy = -8; horse.jumping = true; sfx('whoosh'); haptic(20) } }
  canvas.ontouchstart = e=>{ e.preventDefault(); jump() };
  canvas.onmousedown = jump;
  function loop(){
    if(gameOver) return;
    ctx.fillStyle = '#4b1d7a'; ctx.fillRect(0,0,340,220);
    ctx.fillStyle = '#3e2723'; ctx.fillRect(0,GROUND+20,340,20);
    horse.vy += 0.4;
    horse.y += horse.vy;
    if(horse.y >= 170){ horse.y = 170; horse.vy = 0; horse.jumping = false }
    ctx.font = '40px serif'; ctx.fillText('🐎', horse.x, horse.y+10);
    spawnTimer++;
    if(spawnTimer > 60+Math.random()*40){
      spawnTimer = 0;
      obstacles.push({x:340, y:GROUND-10, type:Math.random()<0.5?'🌵':'🗿'});
    }
    obstacles.forEach(o=>{
      o.x -= 4 + score*0.02;
      ctx.font = '30px serif'; ctx.fillText(o.type, o.x, o.y+10);
      if(o.x < horse.x+30 && o.x > horse.x-20 && horse.y > GROUND-40){
        gameOver = true;
        if(score >= 20){ state.stats.raceWins++ }
        const gems = Math.floor(score/4);
        const gold = score * 12;
        state.gems += gems; state.gold += gold;
        toast(`🏁 ${_(D.score)}: ${score}! +${gold}💰 +${gems}💎`,'success');
        sfx('defeat'); save(); refreshUI(); checkAchievements();
        if(score >= 50 && !state.pets.rakhsh) grantPet('rakhsh');
        setTimeout(closeMini, 2000);
      }
    });
    obstacles = obstacles.filter(o=>o.x > -40);
    score++;
    ctx.fillStyle = '#f5c542'; ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🏆 '+score, 10, 30);
    requestAnimationFrame(loop);
  }
  loop();
}
function startForge(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🔨 ${_({fa:'آهنگری کاوه',en:'Kavehs Forge'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0">${_({fa:'وقتی نوار به مرکز رسید بزن!',en:'Tap when bar hits center!'})}</div>
    <div style="text-align:center;font-size:60px;margin:10px 0">🔨</div>
    <div style="position:relative;width:100%;height:40px;background:#0f0620;border-radius:20px;border:2px solid var(--gold);overflow:hidden;margin:12px 0">
      <div id="fgBar" style="position:absolute;left:0;top:0;width:20px;height:100%;background:linear-gradient(180deg,#c1272d,#f5c542);border-radius:10px"></div>
      <div style="position:absolute;left:50%;top:0;width:2px;height:100%;background:var(--gold);transform:translateX(-50%)"></div>
      <div style="position:absolute;left:45%;right:45%;top:0;height:100%;background:#4caf5044;border-left:1px solid #4caf50;border-right:1px solid #4caf50"></div>
    </div>
    <div style="display:flex;justify-content:space-around">
      <div>${_(D.hits)}: <span id="fgHits" style="color:var(--gold);font-weight:900">0</span>/5</div>
      <div>${_(D.tries)}: <span id="fgTries" style="color:var(--red);font-weight:900">8</span></div>
    </div>
    <button class="big-btn epic" style="width:100%;margin:12px 0" onclick="forgeHit()">🔨 ${_({fa:'بکوب!',en:'HIT!'})}</button>
    <button class="big-btn secondary" style="width:100%" onclick="closeMini()">${_(D.close)}</button>`;
  modal.classList.add('show');
  window._forge = {hits:0, tries:8, dir:1, pos:0, active:true};
  function loop(){
    if(!window._forge.active) return;
    window._forge.pos += window._forge.dir*2.5;
    if(window._forge.pos >= 340){ window._forge.dir = -1; window._forge.pos = 340 }
    if(window._forge.pos <= 0){ window._forge.dir = 1; window._forge.pos = 0 }
    const bar = document.getElementById('fgBar');
    if(bar){ bar.style.left = (window._forge.pos/340*100)+'%'; requestAnimationFrame(loop) }
  }
  loop();
}
function forgeHit(){
  if(!window._forge || !window._forge.active) return;
  const p = window._forge.pos;
  window._forge.tries--;
  if(p >= 136 && p <= 204){
    window._forge.hits++;
    sfx('coin'); haptic(30);
    document.getElementById('fgHits').textContent = window._forge.hits;
    if(window._forge.hits >= 5){
      window._forge.active = false;
      const rarities = ['Common','Common','Rare','Rare','Epic','Legendary'];
      const targetRarity = rarities[Math.floor(Math.random()*rarities.length)];
      const pool = ITEMS.filter(i=>i.rarity===targetRarity);
      const item = pool[Math.floor(Math.random()*pool.length)];
      addItem(item.id);
      state.stats.forges++;
      toast(`🔨 ${_(D.forged)}: ${_(item.name)}!`,'success');
      sfx('fanfare'); save(); refreshUI(); checkAchievements();
      if(state.stats.forges >= 25 && !state.pets.homa) grantPet('homa');
      setTimeout(closeMini, 2000);
      return;
    }
  } else {
    sfx('hit'); haptic(50);
  }
  document.getElementById('fgTries').textContent = window._forge.tries;
  if(window._forge.tries <= 0){
    window._forge.active = false;
    toast(_({fa:'شانس تمام!',en:'Out of tries!'}),'error');
    setTimeout(closeMini, 1500);
  }
}
function closeMini(){
  if(window._forge) window._forge.active = false;
  if(archery) archery.active = false;
  sfx('click');
  document.getElementById('miniModal').classList.remove('show');
}

// ---------------- RENDER: HEROES / PETS / QUESTS / ACH / SETTINGS ----------------
function renderHeroes(){
  const g = document.getElementById('heroGrid'); g.innerHTML='';
  const rankR = {SSR:3,SR:2,R:1};
  const sorted = [...HEROES].sort((a,b)=>{
    const oa = state.heroes[a.id]?.owned?1:0;
    const ob = state.heroes[b.id]?.owned?1:0;
    if(oa!==ob) return ob-oa;
    return rankR[b.rarity]-rankR[a.rarity];
  });
  sorted.forEach(h=>{
    const s = state.heroes[h.id];
    const owned = s && s.owned;
    const inTeam = state.team.includes(h.id);
    const stats = owned ? heroStats(h.id) : null;
    const card = document.createElement('div');
    card.className = `hero-card rarity-${h.rarity} ${owned?'owned':'locked'} ${inTeam?'in-team':''}`;
    card.innerHTML = `
      <div class="rarity">${h.rarity}</div>
      ${owned?`<div class="lvl">Lv.${s.level}</div>`:''}
      ${inTeam?`<div class="team-badge">✓</div>`:''}
      ${owned && (s.talentPoints||0)>0?`<div class="tp-badge">⭐${s.talentPoints}</div>`:''}
      <img src="${assetPath('hero',h.id)}">
      ${!owned?'<div class="lock">🔒</div>':''}
      <div class="name">${_(h.name)}</div>
      <div class="power">${owned?`⚡ ${formatNum(stats.power)}`:_(D.locked)}</div>`;
    card.onclick = ()=>{ sfx('click'); openHero(h.id) };
    g.appendChild(card);
  });
}

let currentHeroId = null;
let currentHeroTab = 'stats';
function openHero(id){
  currentHeroId = id;
  currentHeroTab = 'stats';
  document.getElementById('heroModal').classList.add('show');
  renderHeroDetail();
}
function switchHeroTab(tab){
  currentHeroTab = tab;
  sfx('click');
  renderHeroDetail();
}
function renderHeroDetail(){
  const id = currentHeroId; if(!id) return;
  const h = heroData(id);
  const s = state.heroes[id];
  const owned = s && s.owned;
  const stats = owned ? heroStats(id) : {hp:h.hp,atk:h.atk,def:h.def,spd:h.spd,crit:h.crit,power:0};
  const body = document.getElementById('heroModalBody');
  body.innerHTML = `
    <button class="close-btn" onclick="closeModal()">✕</button>
    <img class="detail-img" src="${assetPath('hero',id)}">
    <h3 style="text-align:center;color:var(--gold);margin:6px 0">${_(h.name)}</h3>
    <div style="text-align:center;color:var(--muted);font-size:11px;margin-bottom:6px">${_(h.title)} • ${h.rarity}</div>
    <div class="hero-tabs">
      <button class="ht ${currentHeroTab==='stats'?'on':''}" onclick="switchHeroTab('stats')">📊 ${_(D.stats)}</button>
      <button class="ht ${currentHeroTab==='talent'?'on':''}" onclick="switchHeroTab('talent')" ${!owned?'disabled':''}>⭐ ${_(D.talents)}</button>
      <button class="ht ${currentHeroTab==='lore'?'on':''}" onclick="switchHeroTab('lore')">📖 ${_(D.lore)}</button>
    </div>
    <div id="heroTabContent"></div>`;
  const c = document.getElementById('heroTabContent');
  if(currentHeroTab==='stats'){
    let html = '';
    const eqBox = document.createElement('div');
    eqBox.className = 'equip-slots';
    ['weapon','helm','armor','boots','ring'].forEach(slot=>{
      const eq = (s && s.equipment && s.equipment[slot]) || null;
      const invItem = eq ? state.inventory.find(x=>x.uid===eq) : null;
      const it = invItem ? itemData(invItem.id) : null;
      const icon = slot==='weapon'?'⚔':slot==='helm'?'👑':slot==='armor'?'🛡':slot==='boots'?'👢':'💍';
      html += `<div class="equip-slot ${it?'filled rarity-'+it.rarity:''}" onclick="openEquipPicker('${slot}')">
        ${it? `<img src="${assetPath('item',invItem.id)}">` : `<span class="slot-icon">${icon}</span>`}
      </div>`;
    });
    c.innerHTML = `<div class="equip-slots">${html}</div>
      <div class="stat-row"><span class="lbl">${_(D.level)}</span><span class="val">${owned?s.level:'-'}</span></div>
      <div class="stat-row"><span class="lbl">${_(D.power)}</span><span class="val" style="color:var(--ssr)">${formatNum(stats.power)||'-'}</span></div>
      ${owned?`<div class="stat-row"><span class="lbl">XP</span><span class="val">${s.exp||0} / ${xpNeeded(s.level)}</span></div>`:''}
      <div class="stat-row"><span class="lbl">❤ HP</span><span class="val">${formatNum(stats.hp)}</span></div>
      <div class="stat-row"><span class="lbl">⚔ ATK</span><span class="val">${formatNum(stats.atk)}</span></div>
      <div class="stat-row"><span class="lbl">🛡 DEF</span><span class="val">${formatNum(stats.def)}</span></div>
      <div class="stat-row"><span class="lbl">💨 SPD</span><span class="val">${stats.spd}</span></div>
      <div class="stat-row"><span class="lbl">💥 CRIT</span><span class="val">${stats.crit}%</span></div>
      <div class="stat-row"><span class="lbl">${_(D.skill)}</span><span class="val" style="font-size:11px;text-align:left;max-width:60%">${_(h.skill)}</span></div>
      <button class="big-btn" style="width:100%;margin-top:8px" ${!owned?'disabled':''} onclick="upgradeHero('${id}')">
        <span>${_(D.upgrade)} (${owned?formatNum(Math.floor(BALANCE.upgradeGoldBase*Math.pow(BALANCE.upgradeGoldGrowth,s.level-1)*(BALANCE.rarityCostMult[h.rarity]||1)*(1-Math.min(0.5,(state.buildings.bazaar-1)*BALANCE.buildingEffectPerLv.bazaar)))):0}💰)</span>
      </button>
      <button class="big-btn secondary" style="width:100%;margin-top:5px" ${!owned?'disabled':''} onclick="toggleDeploy('${id}')">
        <span>${state.team.includes(id)?'✓ '+_(D.in_team):_(D.deploy)}</span>
      </button>`;
    if(owned && h.voice) playVoice(h.voice);
  } else if(currentHeroTab==='talent'){
    c.innerHTML = `<div id="talentTreeBox"></div>`;
    renderTalentTree(id);
  } else if(currentHeroTab==='lore'){
    c.innerHTML = `<div class="detail-lore">${_(h.lore)}</div>
      <div style="text-align:center;color:var(--muted);font-size:11px;margin-top:8px">${_(D.class)}: ${_(D['cls_'+h.class])}</div>`;
  }
}
function closeModal(id){
  sfx('click');
  document.getElementById(id||'heroModal').classList.remove('show');
}
function toggleDeploy(id){
  const cap = 3 + (state.buildings.palace||1)*BALANCE.buildingEffectPerLv.palace;
  const i = state.team.indexOf(id);
  if(i>=0) state.team.splice(i,1);
  else {
    if(state.team.length >= cap){ toast(_(D.team_full)+` (${cap})`,'error'); return }
    state.team.push(id);
  }
  sfx('click'); save(); refreshUI(); renderHeroes(); renderHeroDetail();
}

// ---------------- INVENTORY ----------------
let invFilter = 'all';
function renderInventory(){
  const g = document.getElementById('invGrid'); g.innerHTML='';
  if(state.inventory.length===0){ g.innerHTML = `<div class="empty">${_(D.empty_inv)}</div>`; return }
  const items = invFilter==='all'? state.inventory : state.inventory.filter(x=>itemData(x.id)?.type===invFilter);
  items.forEach(inv=>{
    const it = itemData(inv.id); if(!it) return;
    const card = document.createElement('div');
    card.className = `item-card rarity-${it.rarity}`;
    let equippedBy = null;
    for(const hid in state.heroes){
      const eq = state.heroes[hid].equipment||{};
      for(const s in eq){ if(eq[s]===inv.uid) equippedBy = hid }
    }
    card.innerHTML = `
      <img src="${assetPath('item',inv.id)}">
      <div class="i-name">${_(it.name)}</div>
      <div class="i-stats">${it.atk?`⚔+${it.atk} `:''}${it.def?`🛡+${it.def} `:''}${it.hp?`❤+${it.hp} `:''}${it.spd?`💨+${it.spd} `:''}${it.crit?`💥+${it.crit}%`:''}</div>
      ${equippedBy?`<div class="equipped">✓ ${_(heroData(equippedBy).name)}</div>`:''}`;
    card.onclick = ()=>{ sfx('click'); openItemDetail(inv) };
    g.appendChild(card);
  });
}
function openItemDetail(inv){
  const it = itemData(inv.id); if(!it) return;
  document.getElementById('iImg').src = assetPath('item',inv.id);
  document.getElementById('iName').textContent = _(it.name);
  document.getElementById('iRarity').textContent = it.rarity;
  document.getElementById('iType').textContent = _(D['type_'+it.type]);
  const stats = [];
  if(it.atk) stats.push(`⚔ +${it.atk}`);
  if(it.def) stats.push(`🛡 +${it.def}`);
  if(it.hp) stats.push(`❤ +${it.hp}`);
  if(it.spd) stats.push(`💨 +${it.spd}`);
  if(it.crit) stats.push(`💥 +${it.crit}%`);
  document.getElementById('iStats').innerHTML = stats.join(' &nbsp; ');
  document.getElementById('iSig').textContent = it.hero? _(D.signature)+': '+_(heroData(it.hero).name)+' (+20%)' : '';
  const box = document.getElementById('iHeroPicker');
  box.innerHTML = `<div style="text-align:center;color:var(--muted);margin-bottom:6px;font-size:12px">${_(D.equip_to)}</div>`;
  const owned = HEROES.filter(h=>state.heroes[h.id]?.owned);
  const row = document.createElement('div'); row.className='mini-hero-row';
  owned.forEach(h=>{
    const isEq = state.heroes[h.id].equipment && state.heroes[h.id].equipment[it.type]===inv.uid;
    const b = document.createElement('div');
    b.className='mini-hero'+(isEq?' active':'');
    b.innerHTML = `<img src="${assetPath('hero',h.id)}"><span>${_(h.name).split(' ')[0]}</span>`;
    b.onclick = ()=>{ if(isEq) unequipItem(h.id, it.type); else equipItem(h.id, inv.uid); openItemDetail(inv); refreshUI() };
    row.appendChild(b);
  });
  box.appendChild(row);
  document.getElementById('itemModal').classList.add('show');
}
function openEquipPicker(slot){
  if(!currentHeroId) return;
  document.getElementById('iImg').src = '';
  document.getElementById('iName').textContent = _(D['type_'+slot]);
  document.getElementById('iRarity').textContent = '';
  document.getElementById('iType').textContent = '';
  document.getElementById('iStats').innerHTML = '';
  document.getElementById('iSig').textContent = '';
  const box = document.getElementById('iHeroPicker');
  box.innerHTML = `<div style="text-align:center;color:var(--gold);margin-bottom:8px">${_(D.pick_item)}</div>`;
  const compat = state.inventory.filter(inv=>itemData(inv.id)?.type===slot);
  if(compat.length===0){
    box.innerHTML += `<div style="text-align:center;color:var(--muted);padding:20px">${_(D.no_items)}</div>`;
  } else {
    const grid = document.createElement('div'); grid.className='mini-item-grid';
    compat.forEach(inv=>{
      const it = itemData(inv.id);
      const b = document.createElement('div'); b.className='mini-item rarity-'+it.rarity;
      b.innerHTML = `<img src="${assetPath('item',inv.id)}"><span>${_(it.name)}</span>`;
      b.onclick = ()=>{ equipItem(currentHeroId, inv.uid); closeModal('itemModal'); renderHeroDetail(); refreshUI() };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    if(state.heroes[currentHeroId].equipment && state.heroes[currentHeroId].equipment[slot]){
      const un = document.createElement('button');
      un.className='big-btn secondary'; un.style.marginTop='10px'; un.style.width='100%';
      un.innerHTML = `<span>${_(D.unequip)}</span>`;
      un.onclick = ()=>{ unequipItem(currentHeroId, slot); closeModal('itemModal'); renderHeroDetail(); refreshUI() };
      box.appendChild(un);
    }
  }
  document.getElementById('itemModal').classList.add('show');
}

// ---------------- QUESTS UI ----------------
function renderQuests(){
  checkQuestReset();
  const c = document.getElementById('questList'); c.innerHTML='';
  const type = document.querySelector('.q-tab.on')?.dataset.type || 'daily';
  const filtered = QUESTS.filter(q=>q.type===type);
  filtered.forEach(q=>{
    const done = state.quests[q.id];
    const claimed = state.questsClaimed[q.id];
    const val = Math.min(q.goal, state.stats[q.stat]||0);
    const pct = val/q.goal*100;
    const div = document.createElement('div');
    div.className = 'quest-row'+(done?' done':'')+(claimed?' claimed':'');
    const rewardStr = [];
    if(q.reward.gold) rewardStr.push(`${q.reward.gold}💰`);
    if(q.reward.gems) rewardStr.push(`${q.reward.gems}💎`);
    if(q.reward.scrolls) rewardStr.push(`${q.reward.scrolls}📜`);
    if(q.reward.item) rewardStr.push(_(itemData(q.reward.item).name));
    div.innerHTML = `
      <div class="q-name">${_(q.name)}</div>
      <div class="q-progress"><div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
        <span class="q-val">${val}/${q.goal}</span></div>
      <div class="q-reward">${rewardStr.join(' ')}</div>
      <button class="q-claim" ${!done||claimed?'disabled':''} onclick="claimQuest('${q.id}')">${claimed?'✓':(done?_(D.claim):_(D.progress))}</button>`;
    c.appendChild(div);
  });
}
function renderAchievements(){
  const c = document.getElementById('achList'); c.innerHTML='';
  const cat = document.querySelector('.a-tab.on')?.dataset.cat || 'all';
  const filtered = cat==='all'? ACHIEVEMENTS : ACHIEVEMENTS.filter(a=>a.cat===cat);
  const stats = document.createElement('div');
  const done = filtered.filter(a=>state.achievements[a.id]).length;
  stats.style.cssText='text-align:center;color:var(--muted);font-size:11px;margin-bottom:8px';
  stats.textContent = `${done} / ${filtered.length} ${_(D.completed)}`;
  c.appendChild(stats);
  filtered.forEach(a=>{
    const done = state.achievements[a.id];
    const claimed = state.achievementsClaimed[a.id];
    const val = Math.min(a.goal, state.stats[a.stat]||0);
    const pct = val/a.goal*100;
    const div = document.createElement('div');
    div.className = 'ach-row'+(done?' done':'')+(claimed?' claimed':'');
    const rewardStr = [];
    if(a.reward.gold) rewardStr.push(`${a.reward.gold}💰`);
    if(a.reward.gems) rewardStr.push(`${a.reward.gems}💎`);
    if(a.reward.scrolls) rewardStr.push(`${a.reward.scrolls}📜`);
    if(a.reward.item) rewardStr.push(_(itemData(a.reward.item).name));
    div.innerHTML = `
      <div class="a-icon">${done?'🏆':'🔒'}</div>
      <div class="a-info">
        <div class="a-name">${_(a.name)}</div>
        <div class="a-desc">${_(a.desc)}</div>
        <div class="q-progress"><div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
          <span class="q-val">${formatNum(val)}/${formatNum(a.goal)}</span></div>
      </div>
      <div class="a-right">
        <div class="a-reward">${rewardStr.join(' ')}</div>
        <button class="a-claim" ${!done||claimed?'disabled':''} onclick="claimAchievement('${a.id}')">${claimed?'✓':(done?_(D.claim):'')}</button>
      </div>`;
    c.appendChild(div);
  });
}
function renderPets(){
  const c = document.getElementById('petList'); c.innerHTML='';
  const maxActive = 1 + Math.floor((state.buildings.palace||1)/3);
  const info = document.createElement('div');
  info.style.cssText='text-align:center;color:var(--muted);font-size:11px;margin-bottom:8px';
  info.innerHTML = `${_(D.activePets)}: ${state.activePets.length}/${maxActive} <br><span style="font-size:10px">${_({fa:'با ارتقای کاخ آپادانا، پت بیشتری فعال کن',en:'Upgrade Apadana Palace for more'})}</span>`;
  c.appendChild(info);
  PETS.forEach(p=>{
    const s = state.pets[p.id];
    const owned = s && s.owned;
    const active = state.activePets.includes(p.id);
    const lv = s?.level || 0;
    const div = document.createElement('div');
    div.className = `pet-card rarity-${p.rarity} ${owned?'owned':'locked'} ${active?'active':''}`;
    const upCost = owned? {gold:p.upgradeCost.gold*lv, gems:p.upgradeCost.gems*lv} : null;
    div.innerHTML = `
      <img src="${assetPath('pet',p.id)}" ${!owned?'style="filter:grayscale(1) brightness(0.4)"':''}>
      <div class="p-name">${_(p.name)}${owned?` Lv.${lv}`:''}</div>
      <div class="p-bonus">${_(p.bonus)}</div>
      <div class="p-ability">✨ ${_(p.ability)}</div>
      ${owned?`
        <button class="mini-btn ${active?'on':''}" style="width:100%" onclick="togglePet('${p.id}')">${active?'✓ '+_(D.active):_(D.activate)}</button>
        <button class="mini-btn" style="width:100%;margin-top:4px" onclick="upgradePet('${p.id}')">↑ ${formatNum(upCost.gold)}💰 ${upCost.gems}💎</button>
      `:`<div class="p-locked">🔒 ${_(D.locked)}</div>`}`;
    c.appendChild(div);
  });
}
function renderMinigames(){
  const c = document.getElementById('miniList'); c.innerHTML='';
  MINIGAMES.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'minigame-card';
    div.innerHTML = `
      <div class="mg-icon">${m.icon}</div>
      <div class="mg-info">
        <div class="mg-name">${_(m.name)}</div>
        <div class="mg-desc">${_(m.desc)}</div>
      </div>
      <button class="big-btn" style="min-width:70px" onclick="openMinigame('${m.id}')">▶</button>`;
    c.appendChild(div);
  });
}

// ---------------- SETTINGS ----------------
function renderSettings(){
  const box = document.getElementById('settingsBody');
  box.innerHTML = `
    <h3 style="color:var(--gold);text-align:center;margin-bottom:14px">⚙ ${_(D.settings)}</h3>
    <div class="setting-row"><label>${_(D.sound)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.sound?'checked':''} onchange="toggleSetting('sound',this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.sfx)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.sfx?'checked':''} onchange="toggleSetting('sfx',this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.music)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.music?'checked':''} onchange="toggleMusicSetting(this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.haptic)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.hapticFeedback?'checked':''} onchange="toggleSetting('hapticFeedback',this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.particles)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.particleEffects?'checked':''} onchange="toggleSetting('particleEffects',this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.autoSave)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.autoSave?'checked':''} onchange="toggleSetting('autoSave',this.checked)"><span class="slider"></span></label></div>
    <div class="setting-row"><label>${_(D.language)}</label>
      <button class="mini-btn" onclick="toggleLang()">${state.lang==='fa'?'English':'فارسی'}</button></div>
    <hr style="border-color:#f5c54233;margin:14px 0">
    <div class="setting-info">
      <div>👤 ${_(D.player)}: <b>${state.playerName}</b></div>
      <div>⏱ ${_(D.playTime)}: <b>${Math.floor(state.stats.playTime/60)}m</b></div>
      <div>🏆 ${_(D.achievs)}: <b>${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</b></div>
      <div>👥 ${_(D.heroes)}: <b>${state.stats.heroCount}/${HEROES.length}</b></div>
      <div>🔥 ${_(D.streak)}: <b>${state.stats.streak}</b></div>
      <div>♾ ${_(D.endlessBest)}: <b>${state.endlessMax}</b></div>
    </div>
    <button class="big-btn secondary" style="width:100%;margin-top:14px" onclick="exportSave()">💾 ${_(D.exportSave)}</button>
    <button class="big-btn secondary" style="width:100%;margin-top:5px" onclick="importSave()">📥 ${_(D.importSave)}</button>
    <button class="big-btn" style="background:linear-gradient(180deg,#c1272d,#7b0000);width:100%;margin-top:5px" onclick="resetGame()">🗑 ${_(D.resetGame)}</button>`;
}
function toggleSetting(k,v){ state.settings[k]=v; sfx('click'); save() }
function toggleMusicSetting(v){
  state.settings.music = v;
  sfx('click'); save();
  if(v){ playMusic(currentMusicTrack||'menu') } else { stopMusic() }
}
let currentMusicTrack = 'menu';
function setMusicForScreen(id){
  const map = {home:'menu', battle:'battle', summon:'menu', kingdom:'menu', heroes:'menu', inventory:'menu', quests:'menu', achievements:'menu', pets:'menu', minigames:'menu', settings:'menu'};
  const t = map[id] || 'menu';
  currentMusicTrack = t;
  if(state.settings.music) playMusic(t);
}
function exportSave(){
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  navigator.clipboard.writeText(b).then(()=>toast(_(D.copied),'success')).catch(()=>{ prompt(_(D.copySave), b) });
}
function importSave(){
  const b = prompt(_(D.pasteSave));
  if(!b) return;
  try{
    const s = JSON.parse(decodeURIComponent(escape(atob(b))));
    state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), s);
    save(); refreshUI(); renderSettings();
    toast(_(D.imported),'success');
  }catch(e){ toast(_(D.importFail),'error') }
}
function resetGame(){
  if(!confirm(_(D.confirmReset))) return;
  localStorage.removeItem('shahnameh_v4');
  localStorage.removeItem('shahnameh_v3');
  location.reload();
}

// ---------------- SCREENS ----------------
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===id));
  sfx('click');
  setMusicForScreen(id);
  if(id==='heroes') renderHeroes();
  if(id==='inventory') renderInventory();
  if(id==='kingdom') renderKingdom();
  if(id==='home') refreshHome();
  if(id==='quests') renderQuests();
  if(id==='achievements') renderAchievements();
  if(id==='pets') renderPets();
  if(id==='minigames') renderMinigames();
  if(id==='settings') renderSettings();
}
function refreshHome(){
  const c = chapterData(state.progress.chapter);
  const nameEl = document.getElementById('chapterName');
  if(c && nameEl){
    nameEl.textContent = _(c.title);
    document.getElementById('stageNum').textContent = `${state.progress.stage+1}/${c.stages.length}`;
    const next = c.stages[state.progress.stage];
    if(next){
      const e = enemyData(next.enemy);
      document.getElementById('nextEnemy').textContent = _(e.name) + (next.boss?' 👑':'');
      document.getElementById('nextEnemyImg').src = assetPath('enemy', next.enemy);
    }
  } else if(nameEl){
    nameEl.textContent = _(D.endless_mode);
    document.getElementById('stageNum').textContent = state.endlessStage+1;
    const tier = Math.min(6, Math.floor(state.endlessStage/8)+1);
    const pool = ENEMIES.filter(e=>e.tier===tier);
    const en = pool[state.endlessStage % pool.length];
    document.getElementById('nextEnemy').textContent = _(en.name);
    document.getElementById('nextEnemyImg').src = assetPath('enemy', en.id);
  }
  updateIdle();
}
function refreshUI(){
  document.getElementById('gold').textContent = formatNum(Math.floor(state.gold));
  document.getElementById('gems').textContent = formatNum(state.gems);
  document.getElementById('scrolls').textContent = state.scrolls;
  regenEnergy();
  const ec = document.getElementById('energyCount');
  if(ec) ec.textContent = state.summonEnergy;
  const et = document.getElementById('energyTimer');
  if(et) et.textContent = state.summonEnergy < BALANCE.summonEnergyMax ? '('+energyTimeToNext()+')' : '';
  document.querySelectorAll('[data-fa]').forEach(el=>{
    const v = el.getAttribute('data-'+state.lang);
    if(v) el.textContent = v;
  });
  refreshHome();
}
function toggleLang(){
  state.lang = state.lang==='fa'?'en':'fa';
  state.stats.langSwitch = 1;
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang==='fa'?'rtl':'ltr';
  sfx('click'); save(); refreshUI();
  const active = document.querySelector('.screen.active');
  if(active) showScreen(active.id);
  checkAchievements();
}
function filterInv(btn){
  document.querySelectorAll('.inv-filter').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  invFilter = btn.dataset.filter;
  sfx('click'); renderInventory();
}
function switchTab(cls, btn){
  document.querySelectorAll('.'+cls).forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  sfx('click');
  if(cls==='q-tab') renderQuests();
  if(cls==='a-tab') renderAchievements();
}

// ---------------- DICTIONARY ----------------
const D = {
  no_gold:{fa:'طلای کافی نداری!',en:'Not enough gold!'},
  no_gems:{fa:'الماس کافی نداری!',en:'Not enough gems!'},
  no_scroll:{fa:'طوماری نداری!',en:'No scrolls!'},
  music:{fa:'🎵 موسیقی حماسی',en:'🎵 Epic music'},
  no_energy:{fa:'انرژی احضار نداری!',en:'No summon energy!'},
  energy:{fa:'انرژی',en:'Energy'},
  free_summon:{fa:'احضار رایگان',en:'Free Summon'},
  skip:{fa:'رد کردن',en:'Skip'},
  no_team:{fa:'ابتدا پهلوانی به تیم اعزام کن!',en:'Deploy a hero first!'},
  team_full:{fa:'تیم پر است',en:'Team full'},
  locked:{fa:'قفل',en:'Locked'},
  battle_start:{fa:'نبرد آغاز شد',en:'Battle begins'},
  victory:{fa:'پیروزی!',en:'Victory!'},
  defeat:{fa:'شکست!',en:'Defeat!'},
  upgrade:{fa:'ارتقا',en:'Upgrade'},
  deploy:{fa:'اعزام',en:'Deploy'},
  in_team:{fa:'در تیم',en:'In Team'},
  dupe:{fa:'تکراری',en:'Dupe'},
  new_hero:{fa:'جدید',en:'NEW'},
  empty_inv:{fa:'اینونتوری خالی است.',en:'Empty inventory.'},
  type_weapon:{fa:'سلاح',en:'Weapon'},
  type_helm:{fa:'کلاه‌خود',en:'Helm'},
  type_armor:{fa:'زره',en:'Armor'},
  type_boots:{fa:'چکمه',en:'Boots'},
  type_ring:{fa:'انگشتر',en:'Ring'},
  equip_to:{fa:'اعزام به:',en:'Equip to:'},
  pick_item:{fa:'یک آیتم انتخاب کن',en:'Pick an item'},
  no_items:{fa:'آیتمی برای این جایگاه نداری',en:'No items for this slot'},
  unequip:{fa:'برداشتن',en:'Unequip'},
  signature:{fa:'مخصوص',en:'Signature'},
  endless_mode:{fa:'حالت بی‌نهایت',en:'Endless Mode'},
  settings:{fa:'تنظیمات',en:'Settings'},
  sound:{fa:'🔊 صدای شخصیت',en:'🔊 Voices'},
  sfx:{fa:'🎵 افکت‌های صوتی',en:'🎵 Sound effects'},
  haptic:{fa:'📳 لرزش',en:'📳 Haptic feedback'},
  particles:{fa:'✨ ذرات و افکت‌ها',en:'✨ Particles'},
  autoSave:{fa:'💾 ذخیره خودکار',en:'💾 Auto save'},
  language:{fa:'🌐 زبان',en:'🌐 Language'},
  player:{fa:'بازیکن',en:'Player'},
  playTime:{fa:'مدت بازی',en:'Play time'},
  achievs:{fa:'اچیومنت‌ها',en:'Achievements'},
  heroes:{fa:'پهلوانان',en:'Heroes'},
  streak:{fa:'روز پیاپی',en:'Streak'},
  endlessBest:{fa:'بهترین بی‌نهایت',en:'Endless best'},
  exportSave:{fa:'صادرات ذخیره',en:'Export save'},
  importSave:{fa:'وارد کردن ذخیره',en:'Import save'},
  resetGame:{fa:'شروع دوباره',en:'Reset game'},
  copied:{fa:'کپی شد!',en:'Copied!'},
  copySave:{fa:'کد ذخیره:',en:'Save code:'},
  pasteSave:{fa:'کد ذخیره را وارد کن:',en:'Paste save code:'},
  imported:{fa:'وارد شد!',en:'Imported!'},
  importFail:{fa:'کد نامعتبر!',en:'Invalid code!'},
  confirmReset:{fa:'مطمئنی؟ همه اطلاعات پاک می‌شود!',en:'Sure? All data will be erased!'},
  claim:{fa:'دریافت',en:'Claim'},
  progress:{fa:'در حال',en:'Progress'},
  active:{fa:'فعال',en:'Active'},
  activate:{fa:'فعال کن',en:'Activate'},
  activePets:{fa:'پت‌های فعال',en:'Active pets'},
  close:{fa:'بستن',en:'Close'},
  score:{fa:'امتیاز',en:'Score'},
  hits:{fa:'ضربه',en:'Hits'},
  tries:{fa:'شانس',en:'Tries'},
  forged:{fa:'ساخته شد',en:'Forged'},
  stats:{fa:'آمار',en:'Stats'},
  talents:{fa:'تلنت‌ها',en:'Talents'},
  lore:{fa:'داستان',en:'Lore'},
  level:{fa:'سطح',en:'Level'},
  power:{fa:'قدرت کل',en:'Total Power'},
  skill:{fa:'مهارت',en:'Skill'},
  talentPoints:{fa:'امتیاز تلنت',en:'Talent Points'},
  pointsRefunded:{fa:'امتیاز بازگشت داده شد',en:'points refunded'},
  reset:{fa:'ریست',en:'Reset'},
  maxRank:{fa:'حداکثر رنک',en:'Max rank'},
  completed:{fa:'تکمیل شده',en:'completed'},
  class:{fa:'کلاس',en:'Class'},
  cls_warrior:{fa:'جنگجو',en:'Warrior'},
  cls_tank:{fa:'تانک',en:'Tank'},
  cls_archer:{fa:'تیرانداز',en:'Archer'},
  cls_mage:{fa:'جادوگر',en:'Mage'},
  cls_support:{fa:'پشتیبان',en:'Support'},
};


// ---------------- SKILL ANIMATION (special ability visual burst) ----------------
function playSkillAnimation(unitEl, isPlayer){
  if(!unitEl || !state.settings.particleEffects) return;
  // Golden explosion + shockwave
  const burst = document.createElement('div');
  burst.className = 'skill-burst';
  unitEl.appendChild(burst);
  setTimeout(()=>burst.remove(), 900);
  // rings
  for(let i=0;i<3;i++){
    const r = document.createElement('div');
    r.className = 'skill-ring';
    r.style.animationDelay = (i*0.15)+'s';
    unitEl.appendChild(r);
    setTimeout(()=>r.remove(), 1000+i*150);
  }
  // spawn 20 particles
  for(let i=0;i<20;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = ['#ffd700','#ff8c00','#ff4444','#f5c542'][Math.floor(Math.random()*4)];
    p.style.left = '50%'; p.style.top = '50%';
    const a = Math.random()*Math.PI*2;
    const d = 40 + Math.random()*40;
    p.style.setProperty('--dx', Math.cos(a)*d+'px');
    p.style.setProperty('--dy', Math.sin(a)*d+'px');
    p.style.animationDuration = '0.9s';
    unitEl.appendChild(p);
    setTimeout(()=>p.remove(),900);
  }
  sfx('crit');
  haptic([50,30,50,30,80]);
}

// Skill chance: every 4th attack triggers "special skill" burst
function maybeTriggerSkill(turn, atkSel){
  if(!turn._skillCounter) turn._skillCounter = 0;
  turn._skillCounter = (turn._skillCounter||0) + 1;
  return false; // per-turn state, unused; we track globally instead
}

// ---------------- TUTORIAL (interactive) ----------------
const TUTORIAL_STEPS = [
  {target:'#navbar .nav-btn[data-screen="home"]', 
    text:{fa:'به خانه‌ی خودت خوش آمدی! اینجا کمپین رو ادامه می‌دی.', en:'Welcome home! Continue the campaign here.'},
    action:null},
  {target:'.chapter-box', 
    text:{fa:'این فصل داستان کنونی و باس بعدی توست.', en:'This shows your current chapter and next boss.'},
    action:null},
  {target:'.big-btn.epic', 
    text:{fa:'برای شروع نبرد کمپین، این دکمه رو بزن!', en:'Tap this to start your campaign battle!'},
    action:'pulse'},
  {target:'.idle-panel', 
    text:{fa:'حتی وقتی بازی نمی‌کنی، طلا برات جمع می‌شه!', en:'Gold accumulates even when offline!'},
    action:null},
  {target:'.nav-btn[data-screen="summon"]', 
    text:{fa:'برای احضار پهلوانان جدید، به بخش احضار برو.', en:'Go here to summon new heroes!'},
    action:'pulse'},
  {target:'.nav-btn[data-screen="heroes"]', 
    text:{fa:'اینجا پهلوانانت رو ارتقا بده و تجهیز کن.', en:'Upgrade and equip your heroes here.'},
    action:null},
  {target:'.nav-btn[data-screen="kingdom"]', 
    text:{fa:'پایتخت پارسه رو بساز تا قدرتت افزایش پیدا کنه.', en:'Build Persepolis to boost your power.'},
    action:null},
  {target:'.settings-btn', 
    text:{fa:'در تنظیمات می‌تونی زبان، صدا و بیشتر رو تغییر بدی. آماده‌ای؟ برخیز پهلوان!', en:'Change language, sound and more in settings. Ready? Rise, hero!'},
    action:null},
];

function startTutorial(){
  if(state.tutorialStep >= TUTORIAL_STEPS.length){ 
    state.tutorialStep = TUTORIAL_STEPS.length; save(); return;
  }
  showTutorialStep();
}
function showTutorialStep(){
  const step = TUTORIAL_STEPS[state.tutorialStep];
  if(!step){ endTutorial(); return }
  const modal = document.getElementById('tutorialModal');
  const bubble = document.getElementById('tutorialBubble');
  const highlight = document.getElementById('tutorialHighlight');
  const targetEl = document.querySelector(step.target);
  if(!targetEl){ state.tutorialStep++; showTutorialStep(); return }
  modal.classList.add('show');
  // highlight target
  const rect = targetEl.getBoundingClientRect();
  highlight.style.left = (rect.left-6)+'px';
  highlight.style.top = (rect.top-6)+'px';
  highlight.style.width = (rect.width+12)+'px';
  highlight.style.height = (rect.height+12)+'px';
  highlight.className = 'tutorial-highlight'+(step.action==='pulse'?' pulse':'');
  // position bubble smart (above/below)
  const isTop = rect.top > window.innerHeight/2;
  bubble.style.left = '50%';
  bubble.style.transform = 'translateX(-50%)';
  if(isTop){
    bubble.style.top = 'auto';
    bubble.style.bottom = (window.innerHeight - rect.top + 20)+'px';
  } else {
    bubble.style.bottom = 'auto';
    bubble.style.top = (rect.bottom + 20)+'px';
  }
  bubble.querySelector('.tut-text').textContent = _(step.text);
  bubble.querySelector('.tut-count').textContent = (state.tutorialStep+1)+'/'+TUTORIAL_STEPS.length;
  sfx('click');
}
function tutorialNext(){
  state.tutorialStep++;
  save();
  if(state.tutorialStep >= TUTORIAL_STEPS.length){ endTutorial() }
  else showTutorialStep();
}
function tutorialSkip(){
  if(!confirm(_({fa:'راهنما را رد کنی؟',en:'Skip tutorial?'}))) return;
  state.tutorialStep = TUTORIAL_STEPS.length;
  save();
  endTutorial();
}
function endTutorial(){
  document.getElementById('tutorialModal').classList.remove('show');
  toast(_({fa:'🎉 آماده‌ای! خوش بگذره پهلوان!',en:'🎉 Ready! Have fun, hero!'}),'success',3500);
}

// ---------------- INIT ----------------
window.addEventListener('DOMContentLoaded', ()=>{
  load();
  if(typeof state.tutorialStep !== 'number') state.tutorialStep = 0;
  if(!state.summonEnergy && state.summonEnergy !== 0) state.summonEnergy = BALANCE.summonEnergyMax;
  if(!state.lastEnergyRegen) state.lastEnergyRegen = Date.now();
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang==='fa'?'rtl':'ltr';
  refreshUI();

  // Login streak
  const now = Date.now();
  const day = 24*3600*1000;
  const lastLoginDay = Math.floor(state.stats.lastLogin/day);
  const todayDay = Math.floor(now/day);
  if(state.stats.lastLogin && todayDay - lastLoginDay === 1){
    state.stats.streak++;
    const s = Math.min(state.stats.streak-1, BALANCE.streakGold.length-1);
    const gold = BALANCE.streakGold[s], gems = BALANCE.streakGems[s];
    state.gold += gold; state.gems += gems; state.scrolls += BALANCE.scrollFromStreak;
    toast(`🔥 ${state.stats.streak} ${_({fa:'روز پیاپی! +'+gold+'💰 +'+gems+'💎',en:'day streak! +'+gold+'💰 +'+gems+'💎'})}`,'success',4000);
  } else if(state.stats.lastLogin && todayDay - lastLoginDay > 1){
    state.stats.streak = 1;
  } else if(!state.stats.lastLogin){
    state.stats.streak = 1;
  }
  state.stats.lastLogin = now;
  checkQuestReset();
  checkAchievements(); checkQuests();

  setInterval(()=>{
    calcGoldRate();
    state.gold += state.goldRate/3600;
    const el = document.getElementById('gold'); if(el) el.textContent = formatNum(Math.floor(state.gold));
    state.stats.playTime++;
    state.stats.goldMax = Math.max(state.stats.goldMax, state.gold);
    if(state.stats.playTime%30===0){
      regenEnergy();
      const ec = document.getElementById('energyCount'); if(ec) ec.textContent = state.summonEnergy;
      const et = document.getElementById('energyTimer');
      if(et) et.textContent = state.summonEnergy < BALANCE.summonEnergyMax ? '('+energyTimeToNext()+')' : '';
      checkAchievements();
      if(state.settings.autoSave) save();
    }
  },1000);

  // start ambient music
  setTimeout(()=>{ if(state.settings.music) playMusic('menu') }, 1200);

  if(!state.onboardingDone){
    setTimeout(()=>playIntroCinematic(()=>{
      state.onboardingDone = true;
      state.progress.storyRead['ch1_intro'] = true;
      save();
      setTimeout(startTutorial, 800);
    }), 400);
  }
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

Object.assign(window, {
  showScreen, summon, startCampaign, startEndless, toggleAuto, toggleSpeed,
  claimIdle, toggleLang, openHero, closeModal, upgradeHero, upgradeBuilding,
  toggleDeploy, filterInv, switchTab, claimQuest, claimAchievement,
  togglePet, upgradePet, openMinigame, closeMini, forgeHit, toggleSetting,
  exportSave, importSave, resetGame, upgradeTalent, resetTalents, switchHeroTab,
  openEquipPicker, unequipItem, nextCinematicScene, skipCinematic, tutorialNext, tutorialSkip, playMusic, stopMusic, toggleMusicSetting, startTutorial,
});
