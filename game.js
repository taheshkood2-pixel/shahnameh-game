// ============================================================
// SHAHNAMEH: RISE OF KINGS - GAME ENGINE v3
// Full featured: quests, achievements, minigames, pets, settings, SFX
// ============================================================

// ---------------- STATE ----------------
const DEFAULT_STATE = {
  gold: 500, gems: 200, scrolls: 3, exp: 0,
  heroes: {}, team: [], inventory: [],
  pets: {}, activePet: null,
  lang: 'fa',
  buildings: {},
  lastIdle: Date.now(),
  goldRate: 100,
  progress: {chapter:1, stage:0, storyRead:{}},
  endlessStage: 0, endlessMax: 0,
  vipLevel: 0, totalSpent: 0,
  achievements: {}, achievementsClaimed: {},
  quests: {}, questsClaimed: {}, dailyReset: 0, weeklyReset: 0,
  stats: {
    battles:0, wins:0, losses:0, bosses:0, crits:0,
    summons:0, upgrades:0, idleClaims:0, builds:0, equips:0,
    endless:0, minigames:0, archeryHigh:0, raceWins:0, forges:0,
    heroCount:0, ssrCount:0, maxLevel:1, maxBuild:1,
    goldMax:500, gemsMax:200, itemCount:0, legItems:0, fullEquipHero:0,
    streak:0, lastLogin:0, petCount:0, hasRostam:0, langSwitch:0,
    playTime:0, startedAt:Date.now(),
  },
  settings: {sound:true, music:true, sfx:true, autoSave:true, hapticFeedback:true, particleEffects:true},
  onboardingDone: false,
  playerName: 'پهلوان',
};
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let UID = 0;

// ---------------- STORAGE ----------------
function save(){ try{ localStorage.setItem('shahnameh_v3', JSON.stringify(state)) }catch(e){} }
function load(){
  try{
    const s = localStorage.getItem('shahnameh_v3');
    if(s){
      const parsed = JSON.parse(s);
      state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    }
  }catch(e){ console.warn('Load failed', e); }
  if(!state.heroes.kaveh) state.heroes.kaveh = {level:1,owned:true,exp:0,equipment:{}};
  if(state.team.length===0) state.team = ['kaveh'];
  BUILDINGS.forEach(b=>{ if(!state.buildings[b.id]) state.buildings[b.id]=1 });
  if(state.inventory.length===0){
    ['sword_bronze','helm_leather','armor_leather','boots_leather'].forEach(id=>addItem(id));
  }
  // ensure UID is beyond max
  UID = state.inventory.reduce((m,x)=>Math.max(m,x.uid||0),0) + 1;
}
function deepMerge(target, source){
  for(const k in source){
    if(source[k]!==null && typeof source[k]==='object' && !Array.isArray(source[k])){
      target[k] = deepMerge(target[k]||{}, source[k]);
    } else {
      target[k] = source[k];
    }
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

function haptic(pattern){
  if(!state.settings.hapticFeedback) return;
  if(navigator.vibrate) navigator.vibrate(pattern);
}

function assetPath(kind, id){
  if(kind==='item') return `assets/items/${id}.svg`;
  if(kind==='pet') return `assets/pets/${id}.png`;
  const list = kind==='hero'? HEROES : ENEMIES;
  const obj = list.find(x=>x.id===id);
  const ext = obj && obj.ext ? obj.ext : 'svg';
  const folder = kind==='hero'? 'heroes' : 'enemies';
  return `assets/${folder}/${id}.${ext}`;
}

function playVoice(voiceId){
  if(!voiceId || !state.settings.sound) return;
  const a = document.getElementById('voiceAudio');
  try{ a.src = `assets/audio/${voiceId}.mp3`; a.play().catch(()=>{}); }catch(e){}
}

// ---------------- SFX (WebAudio synthesized) ----------------
let audioCtx;
function sfx(name){
  if(!state.settings.sfx) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const patterns = {
      click:  {f:[800,600], t:0.05, type:'square', v:0.05},
      hit:    {f:[200,80],  t:0.12, type:'sawtooth', v:0.15},
      crit:   {f:[880,440,220], t:0.2, type:'triangle', v:0.18},
      heal:   {f:[440,660,880], t:0.25, type:'sine', v:0.12},
      levelup:{f:[523,659,784,1047], t:0.4, type:'triangle', v:0.15},
      coin:   {f:[988,1319], t:0.1, type:'square', v:0.1},
      whoosh: {f:[400,100], t:0.15, type:'sawtooth', v:0.1},
      fanfare:{f:[523,659,784,1047,1319], t:0.6, type:'triangle', v:0.18},
      defeat: {f:[200,150,100,60], t:0.6, type:'sawtooth', v:0.15},
      achieve:{f:[1047,1319,1568,2093], t:0.5, type:'triangle', v:0.2},
    };
    const p = patterns[name] || patterns.click;
    const step = p.t / p.f.length;
    p.f.forEach((freq, i)=>{
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = p.type;
      o.frequency.setValueAtTime(freq, now + i*step);
      g.gain.setValueAtTime(p.v, now + i*step);
      g.gain.exponentialRampToValueAtTime(0.001, now + (i+1)*step);
      o.connect(g); g.connect(ctx.destination);
      o.start(now + i*step);
      o.stop(now + (i+1)*step);
    });
  }catch(e){}
}

// ---------------- HERO STATS (with equipment + pet) ----------------
function heroStats(id){
  const h = heroData(id); if(!h) return null;
  const s = state.heroes[id] || {level:1, equipment:{}};
  const lvl = s.level || 1;
  const imm = state.buildings.immortals || 1;
  const lib = state.buildings.library || 1;
  const stable = state.buildings.stable || 1;
  const mult = 1 + (lvl-1)*0.12 + (imm-1)*0.08;
  let hp = Math.floor(h.hp * mult);
  let atk = Math.floor(h.atk * mult);
  let def = Math.floor(h.def * mult);
  let spd = h.spd + (stable-1);
  let crit = h.crit + (lib-1)*2;
  const eq = s.equipment || {};
  for(const slot in eq){
    const uid = eq[slot]; if(!uid) continue;
    const invItem = state.inventory.find(x=>x.uid===uid); if(!invItem) continue;
    const it = itemData(invItem.id); if(!it) continue;
    hp += it.hp || 0; atk += it.atk || 0; def += it.def || 0;
    spd += it.spd || 0; crit += it.crit || 0;
    if(it.hero === id){ atk = Math.floor(atk*1.2); hp = Math.floor(hp*1.2); }
  }
  // pet bonus
  if(state.activePet){
    const p = petData(state.activePet);
    if(p){
      hp = Math.floor(hp * (1 + (p.stats.hp||0)));
      atk = Math.floor(atk * (1 + (p.stats.atk||0)));
      def = Math.floor(def * (1 + (p.stats.def||0)));
      spd = Math.floor(spd * (1 + (p.stats.spd||0)));
      crit += Math.floor(crit * (p.stats.crit||0));
    }
  }
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
  const invItem = state.inventory.find(x=>x.uid===uid); if(!invItem) return;
  const it = itemData(invItem.id); if(!it) return;
  if(!state.heroes[heroId].equipment) state.heroes[heroId].equipment = {};
  for(const hid in state.heroes){
    const eq = state.heroes[hid].equipment||{};
    if(eq[it.type]===uid) delete eq[it.type];
  }
  state.heroes[heroId].equipment[it.type] = uid;
  state.stats.equips++;
  // check full equip
  const eq = state.heroes[heroId].equipment;
  if(eq.weapon && eq.helm && eq.armor && eq.boots && eq.ring){
    state.stats.fullEquipHero = 1;
  }
  save(); checkAchievements();
}
function unequipItem(heroId, slot){
  if(state.heroes[heroId].equipment) delete state.heroes[heroId].equipment[slot];
  save();
}

// ---------------- SUMMON ----------------
function summon(type){
  let count = 1, useScroll = false;
  if(type==='scroll'){
    if(state.scrolls<1){toast(_(D.no_scroll),'error');return}
    state.scrolls--; useScroll = true;
  } else if(type===1){
    if(state.gems<100){toast(_(D.no_gems),'error');return}
    state.gems -= 100;
  } else if(type===10){
    if(state.gems<900){toast(_(D.no_gems),'error');return}
    state.gems -= 900; count = 10;
  }
  sfx('whoosh');
  showSummonAnimation();
  playVoice('summon');
  setTimeout(()=>{
    const results = [];
    for(let i=0;i<count;i++){
      const r = Math.random();
      let pool;
      if(r < 0.05) pool = HEROES.filter(h=>h.rarity==='SSR');
      else if(r < 0.25) pool = HEROES.filter(h=>h.rarity==='SR');
      else pool = HEROES.filter(h=>h.rarity==='R');
      if(pool.length===0) pool = HEROES;
      const h = pool[Math.floor(Math.random()*pool.length)];
      const already = state.heroes[h.id] && state.heroes[h.id].owned;
      if(already){
        state.gold += 200;
        state.heroes[h.id].exp = (state.heroes[h.id].exp||0) + 50;
        results.push({hero:h, dupe:true});
      } else {
        state.heroes[h.id] = {level:1, owned:true, exp:0, equipment:{}};
        state.stats.heroCount++;
        if(h.rarity==='SSR') state.stats.ssrCount++;
        if(h.id==='rostam') state.stats.hasRostam = 1;
        results.push({hero:h, dupe:false});
        sfx('fanfare');
      }
    }
    state.stats.summons++;
    showSummonResults(results);
    save(); refreshUI(); checkAchievements(); checkQuests();
  }, 1500);
}
function showSummonAnimation(){
  document.getElementById('summonAnim').classList.add('show');
  setTimeout(()=>document.getElementById('summonAnim').classList.remove('show'), 1400);
}
function showSummonResults(results){
  const modal = document.getElementById('summonResultModal');
  const body = document.getElementById('summonResultBody');
  body.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'summon-result-grid';
  results.forEach(r=>{
    const card = document.createElement('div');
    card.className = `summon-card rarity-${r.hero.rarity}`;
    card.innerHTML = `
      <img src="${assetPath('hero',r.hero.id)}">
      <div class="rarity">${r.hero.rarity}</div>
      <div class="name">${_(r.hero.name)}</div>
      ${r.dupe? `<div class="dupe">${_(D.dupe)} +200💰</div>` : `<div class="new">✨ ${_(D.new_hero)} ✨</div>`}
    `;
    grid.appendChild(card);
  });
  body.appendChild(grid);
  modal.classList.add('show');
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
  state.stats.endless++;
  const eStage = state.endlessStage;
  const tier = Math.min(6, Math.floor(eStage/10)+1);
  const enemyPool = ENEMIES.filter(e=>e.tier===tier);
  const enemy = enemyPool[eStage % enemyPool.length];
  const scale = 1 + eStage * 0.2;
  const stage = {
    enemy: enemy.id,
    reward: {gold:200+eStage*50, exp:100+eStage*20, gems:eStage%5===0?10:0},
    endlessScale: scale,
  };
  startBattle(stage,'endless');
}

// ---------------- STORY ----------------
function showStory(chapter, phase, onDone){
  const modal = document.getElementById('storyModal');
  const lines = chapter[phase][state.lang] || chapter[phase].fa;
  const bg = `assets/story/${chapter.scene}.svg`;
  document.getElementById('storyBg').style.backgroundImage = `url('${bg}')`;
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
let autoBattle = true;
let battleSpeed = 1;
let turnQueue = [];

function startBattle(stage, mode){
  if(state.team.length===0){
    toast(_(D.no_team),'error');
    showScreen('heroes'); return;
  }
  const players = state.team.map(id=>{
    const h = heroData(id);
    const s = heroStats(id);
    return {id, kind:'hero', name:_(h.name), img:assetPath('hero',id),
      hp:s.hp, maxHp:s.hp, atk:s.atk, def:s.def, spd:s.spd, crit:s.crit,
      class:h.class, alive:true, effects:[], voice:h.voice};
  });
  const enemyBase = enemyData(stage.enemy);
  const waves = stage.wave || 1;
  const scale = stage.endlessScale || (1 + (state.progress.chapter-1)*0.3);
  const enemies = [];
  for(let w=0; w<waves; w++){
    const bossMult = stage.boss ? 2.5 : 1;
    enemies.push({id:stage.enemy, kind:'enemy', name:_(enemyBase.name),
      img:assetPath('enemy', stage.enemy),
      hp:Math.floor(enemyBase.hp*scale*bossMult),
      maxHp:Math.floor(enemyBase.hp*scale*bossMult),
      atk:Math.floor(enemyBase.atk*scale),
      def:Math.floor(enemyBase.def*scale),
      spd:enemyBase.spd, crit:10, alive:true, effects:[],
      isBoss:!!stage.boss, voice:enemyBase.voice});
  }
  battle = {players, enemies, stage, mode, over:false, turn:0, log:[], activeEnemyIdx:0};
  showScreen('battle');
  renderBattleScene();
  logBattle('⚔ ' + _(D.battle_start) + ' — ' + enemies[0].name);
  state.stats.battles++;
  // play enemy voice if available
  if(stage.boss && enemyBase.voice){ setTimeout(()=>playVoice(enemyBase.voice), 500); }
  if(autoBattle) setTimeout(battleTick, 800/battleSpeed);
}

function spriteFor(unit){
  // try sprite version first
  const spritePath = `assets/sprites/${unit.id}_battle.png`;
  if(unit._sprite === undefined){
    // synchronously we can't check; just try main img
    unit._sprite = spritePath;
  }
  return unit.img;
}

function renderBattleScene(){
  const pRow = document.getElementById('playerRow');
  const eRow = document.getElementById('enemyRow');
  pRow.innerHTML=''; eRow.innerHTML='';
  battle.players.forEach((p,i)=>{
    const el = document.createElement('div');
    el.className = 'combatant player'+(p.alive?'':' dead');
    el.id = 'p'+i;
    el.innerHTML = `
      <div class="name-plate">${p.name}</div>
      <img src="${p.img}" onerror="this.onerror=null;this.src='${p.img}'">
      <div class="hp-bar"><div class="fill" style="width:${p.hp/p.maxHp*100}%"></div>
        <div class="txt">${p.hp|0}/${p.maxHp}</div></div>`;
    pRow.appendChild(el);
  });
  battle.enemies.forEach((e,i)=>{
    const el = document.createElement('div');
    el.className = 'combatant enemy'+(e.alive?'':' dead')+(e.isBoss?' boss':'');
    el.id = 'e'+i;
    el.innerHTML = `
      <div class="name-plate">${e.name}${e.isBoss?' 👑':''}</div>
      <img src="${e.img}">
      <div class="hp-bar"><div class="fill" style="width:${e.hp/e.maxHp*100}%"></div>
        <div class="txt">${e.hp|0}/${e.maxHp}</div></div>`;
    eRow.appendChild(el);
  });
}

function updateHPBars(){
  battle.players.forEach((p,i)=>{
    const el = document.getElementById('p'+i); if(!el) return;
    const pct = Math.max(0,p.hp)/p.maxHp*100;
    el.querySelector('.fill').style.width = pct+'%';
    el.querySelector('.txt').textContent = `${Math.max(0,p.hp)|0}/${p.maxHp}`;
    el.querySelector('.hp-bar').classList.toggle('low', pct<30);
    el.classList.toggle('dead', !p.alive);
  });
  battle.enemies.forEach((e,i)=>{
    const el = document.getElementById('e'+i); if(!el) return;
    const pct = Math.max(0,e.hp)/e.maxHp*100;
    el.querySelector('.fill').style.width = pct+'%';
    el.querySelector('.txt').textContent = `${Math.max(0,e.hp)|0}/${e.maxHp}`;
    el.querySelector('.hp-bar').classList.toggle('low', pct<30);
    el.classList.toggle('dead', !e.alive);
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
    p.className='particle';
    p.style.background = color;
    p.style.left = (Math.random()*80+10)+'%';
    p.style.top = (Math.random()*60+20)+'%';
    const angle = Math.random()*Math.PI*2;
    p.style.setProperty('--dx', Math.cos(angle)*40+'px');
    p.style.setProperty('--dy', Math.sin(angle)*40+'px');
    el.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }
}

function logBattle(msg){
  const el = document.getElementById('combatLog');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 1400/battleSpeed);
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
    if(autoBattle) setTimeout(battleTick, 60);
    return;
  }
  const attacker = turn.unit;
  const targets = turn.side==='p'? battle.enemies.filter(e=>e.alive) : battle.players.filter(p=>p.alive);
  if(targets.length===0){ endBattle(turn.side==='p'); return }
  // pick lowest HP or random
  const target = Math.random()<0.3
    ? targets.sort((a,b)=>a.hp-b.hp)[0]
    : targets[Math.floor(Math.random()*targets.length)];
  const crit = Math.random() < (attacker.crit/100);
  if(crit) state.stats.crits++;
  let dmg = Math.max(1, Math.floor((attacker.atk*(crit?2:1) - target.def*0.3) * (0.85+Math.random()*0.3)));
  target.hp -= dmg;
  const atkSel = turn.side==='p'?'#p'+turn.idx:'#e'+turn.idx;
  const tgtIdx = turn.side==='p'? battle.enemies.indexOf(target) : battle.players.indexOf(target);
  const tgtSel = turn.side==='p'?'#e'+tgtIdx:'#p'+tgtIdx;
  const atkEl = document.querySelector(atkSel);
  const tgtEl = document.querySelector(tgtSel);
  if(atkEl) atkEl.classList.add('attacking');
  if(tgtEl) tgtEl.classList.add('hurt');
  dmgPopup(tgtSel, dmg, crit);
  sfx(crit?'crit':'hit');
  haptic(crit?[30,30,30]:20);
  setTimeout(()=>{
    if(atkEl) atkEl.classList.remove('attacking');
    if(tgtEl) tgtEl.classList.remove('hurt');
  }, 400);
  if(target.hp<=0){ target.hp=0; target.alive=false; sfx('whoosh'); }
  updateHPBars();
  if(battle.enemies.every(e=>!e.alive)){ return endBattle(true) }
  if(battle.players.every(p=>!p.alive)){ return endBattle(false) }
  if(autoBattle) setTimeout(battleTick, 600/battleSpeed);
}

function endBattle(win){
  if(!battle || battle.over) return;
  battle.over = true;
  playVoice(win?'victory':'defeat');
  sfx(win?'fanfare':'defeat');
  haptic(win?[100,50,100,50,200]:[300]);
  if(win){
    state.stats.wins++;
    if(battle.stage.boss) state.stats.bosses++;
    const r = battle.stage.reward || {};
    if(r.gold) state.gold += r.gold;
    if(r.gems) state.gems += r.gems;
    if(r.exp) state.exp += r.exp;
    if(r.item){ addItem(r.item); }
    state.team.forEach(id=>{
      state.heroes[id].exp = (state.heroes[id].exp||0) + (r.exp||30);
      checkLevelUp(id);
    });
    logBattle('🏆 ' + _(D.victory) + `  +${r.gold||0}💰 +${r.gems||0}💎` + (r.item?` +${_(itemData(r.item).name)}`:''));
    if(battle.mode==='campaign'){
      state.progress.stage++;
      const ch = chapterData(state.progress.chapter);
      if(state.progress.stage >= ch.stages.length){
        state.stats['ch'+state.progress.chapter] = 1;
        setTimeout(()=>showStory(ch,'outro',()=>{
          state.progress.chapter++; state.progress.stage = 0;
          save(); showScreen('home');
        }), 1500);
      } else {
        save();
        setTimeout(()=>{ if(autoBattle) startCampaign(); else showScreen('home') }, 1500);
      }
    } else if(battle.mode==='endless'){
      state.endlessStage++;
      if(state.endlessStage > state.endlessMax) state.endlessMax = state.endlessStage;
      state.stats.endlessMax = state.endlessMax;
      save();
      setTimeout(()=>{ if(autoBattle) startEndless(); else showScreen('home') }, 1500);
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
  autoBattle = !autoBattle;
  document.getElementById('autoBtn').classList.toggle('on', autoBattle);
  if(autoBattle && battle && !battle.over) battleTick();
  sfx('click');
}
function toggleSpeed(){
  battleSpeed = battleSpeed===1?2:battleSpeed===2?3:1;
  document.getElementById('speedBtn').querySelector('span').textContent = battleSpeed+'×';
  sfx('click');
}

// ---------------- HERO LEVEL & UPGRADE ----------------
function checkLevelUp(id){
  const s = state.heroes[id];
  const need = 100 * s.level;
  while(s.exp >= need){
    s.exp -= need;
    s.level++;
    state.stats.maxLevel = Math.max(state.stats.maxLevel, s.level);
    toast(`⬆ ${_(heroData(id).name)} → Lv.${s.level}`,'success');
    sfx('levelup');
    playVoice('level_up');
  }
}
function upgradeHero(id){
  const h = heroData(id);
  const s = state.heroes[id];
  const bazaar = state.buildings.bazaar || 1;
  const cost = Math.floor(100 * s.level * (h.rarity==='SSR'?3:h.rarity==='SR'?2:1) * (1-(bazaar-1)*0.05));
  if(state.gold<cost){ toast(_(D.no_gold),'error'); sfx('defeat'); return }
  state.gold -= cost;
  s.level++;
  state.stats.upgrades++;
  state.stats.maxLevel = Math.max(state.stats.maxLevel, s.level);
  sfx('levelup'); haptic([50,30,50]);
  save(); refreshUI();
  toast(`⬆ Lv.${s.level}!`,'success');
  if(document.getElementById('heroModal').classList.contains('show')) openHero(id);
  checkAchievements();
}

// ---------------- ACHIEVEMENTS ----------------
function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(state.achievements[a.id]) return;
    let val = state.stats[a.stat] || 0;
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
  if(!state.achievements[id]) return;
  if(state.achievementsClaimed[id]) return;
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

// ---------------- QUESTS (Daily + Weekly + Story) ----------------
function checkQuestReset(){
  const now = Date.now();
  const day = 24*3600*1000;
  const week = 7*day;
  if(now - state.dailyReset > day){
    QUESTS.filter(q=>q.type==='daily').forEach(q=>{
      delete state.quests[q.id]; delete state.questsClaimed[q.id];
    });
    state.dailyReset = now;
    // reset stats used for daily
    ['battles','wins','summons','upgrades','idleClaims','builds','equips','endless','minigames'].forEach(k=>{
      // don't reset lifetime; but we track daily separately? For simplicity, we compare from a baseline
    });
  }
  if(now - state.weeklyReset > week){
    QUESTS.filter(q=>q.type==='weekly').forEach(q=>{
      delete state.quests[q.id]; delete state.questsClaimed[q.id];
    });
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
  if(!state.quests[id]) return;
  if(state.questsClaimed[id]) return;
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

// ---------------- RENDERING ----------------
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
      <img src="${assetPath('hero',h.id)}">
      ${!owned?'<div class="lock">🔒</div>':''}
      <div class="name">${_(h.name)}</div>
      <div class="power">${owned?`⚡ ${stats.power}`:_(D.locked)}</div>`;
    card.onclick = ()=>{ sfx('click'); openHero(h.id) };
    g.appendChild(card);
  });
}

let currentHeroId = null;
function openHero(id){
  currentHeroId = id;
  const h = heroData(id);
  const s = state.heroes[id];
  const owned = s && s.owned;
  const stats = owned ? heroStats(id) : {hp:h.hp,atk:h.atk,def:h.def,spd:h.spd,crit:h.crit,power:0};
  document.getElementById('dImg').src = assetPath('hero',id);
  document.getElementById('dName').textContent = _(h.name);
  document.getElementById('dTitle').textContent = _(h.title);
  document.getElementById('dRarity').textContent = h.rarity;
  document.getElementById('dLevel').textContent = owned?s.level:'-';
  document.getElementById('dHp').textContent = stats.hp;
  document.getElementById('dAtk').textContent = stats.atk;
  document.getElementById('dDef').textContent = stats.def;
  document.getElementById('dSpd').textContent = stats.spd;
  document.getElementById('dCrit').textContent = stats.crit+'%';
  document.getElementById('dSkill').textContent = _(h.skill);
  document.getElementById('dLore').textContent = _(h.lore);
  document.getElementById('dPower').textContent = stats.power || '-';
  const eqBox = document.getElementById('equipSlots'); eqBox.innerHTML='';
  ['weapon','helm','armor','boots','ring'].forEach(slot=>{
    const eq = (s && s.equipment && s.equipment[slot]) || null;
    const invItem = eq ? state.inventory.find(x=>x.uid===eq) : null;
    const it = invItem ? itemData(invItem.id) : null;
    const div = document.createElement('div');
    div.className = 'equip-slot'+(it?' filled rarity-'+it.rarity:'');
    div.innerHTML = it? `<img src="${assetPath('item',invItem.id)}">` :
      `<span class="slot-icon">${slot==='weapon'?'⚔':slot==='helm'?'👑':slot==='armor'?'🛡':slot==='boots'?'👢':'💍'}</span>`;
    div.onclick = ()=>{ sfx('click'); openEquipPicker(slot) };
    eqBox.appendChild(div);
  });
  const upBtn = document.getElementById('upgradeBtn');
  const bazaar = state.buildings.bazaar || 1;
  const cost = owned? Math.floor(100 * s.level * (h.rarity==='SSR'?3:h.rarity==='SR'?2:1) * (1-(bazaar-1)*0.05)) : 0;
  upBtn.querySelector('span').textContent = _(D.upgrade) + ` (${cost} 💰)`;
  upBtn.disabled = !owned;
  upBtn.onclick = ()=>upgradeHero(id);
  const dep = document.getElementById('deployBtn');
  dep.style.display = owned?'block':'none';
  const inTeam = state.team.includes(id);
  dep.querySelector('span').textContent = inTeam? '✓ '+_(D.in_team) : _(D.deploy);
  dep.onclick = ()=>toggleDeploy(id);
  document.getElementById('heroModal').classList.add('show');
  if(owned && h.voice) playVoice(h.voice);
}
function closeModal(id){
  sfx('click');
  document.getElementById(id||'heroModal').classList.remove('show');
}
function toggleDeploy(id){
  const cap = 3 + (state.buildings.palace||1);
  const i = state.team.indexOf(id);
  if(i>=0){ state.team.splice(i,1) }
  else {
    if(state.team.length >= cap){ toast(_(D.team_full)+` (${cap})`,'error'); return }
    state.team.push(id);
  }
  sfx('click');
  save(); refreshUI(); renderHeroes(); openHero(id);
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
      b.onclick = ()=>{ equipItem(currentHeroId, inv.uid); closeModal('itemModal'); openHero(currentHeroId); refreshUI() };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    if(state.heroes[currentHeroId].equipment && state.heroes[currentHeroId].equipment[slot]){
      const un = document.createElement('button');
      un.className='big-btn secondary'; un.style.marginTop='10px'; un.style.width='100%';
      un.innerHTML = `<span>${_(D.unequip)}</span>`;
      un.onclick = ()=>{ unequipItem(currentHeroId, slot); closeModal('itemModal'); openHero(currentHeroId); refreshUI() };
      box.appendChild(un);
    }
  }
  document.getElementById('itemModal').classList.add('show');
}

// ---------------- KINGDOM ----------------
function renderKingdom(){
  const c = document.getElementById('buildings'); c.innerHTML='';
  BUILDINGS.forEach(b=>{
    const lvl = state.buildings[b.id];
    const cost = Math.floor(b.base * Math.pow(1.5, lvl-1));
    const div = document.createElement('div'); div.className='building';
    div.innerHTML = `
      <div class="b-icon">${b.icon}</div>
      <div class="info">
        <div class="name">${_(b.name)} <span class="lvl-badge">Lv.${lvl}</span></div>
        <div class="desc">${_(b.desc)}</div>
      </div>
      <button class="up-btn" ${state.gold<cost?'disabled':''} onclick="upgradeBuilding('${b.id}')">↑ ${cost}💰</button>`;
    c.appendChild(div);
  });
}
function upgradeBuilding(id){
  const b = BUILDINGS.find(x=>x.id===id);
  const cost = Math.floor(b.base * Math.pow(1.5, state.buildings[id]-1));
  if(state.gold<cost) return;
  state.gold -= cost;
  state.buildings[id]++;
  state.stats.builds++;
  state.stats.maxBuild = Math.max(state.stats.maxBuild, state.buildings[id]);
  sfx('coin'); haptic(30);
  save(); refreshUI(); renderKingdom();
  toast(`⬆ ${_(b.name)}!`,'success');
  checkAchievements(); checkQuests();
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

// ---------------- ACHIEVEMENTS UI ----------------
function renderAchievements(){
  const c = document.getElementById('achList'); c.innerHTML='';
  const cat = document.querySelector('.a-tab.on')?.dataset.cat || 'all';
  const filtered = cat==='all'? ACHIEVEMENTS : ACHIEVEMENTS.filter(a=>a.cat===cat);
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
          <span class="q-val">${val}/${a.goal}</span></div>
      </div>
      <div class="a-right">
        <div class="a-reward">${rewardStr.join(' ')}</div>
        <button class="a-claim" ${!done||claimed?'disabled':''} onclick="claimAchievement('${a.id}')">${claimed?'✓':(done?_(D.claim):'')}</button>
      </div>`;
    c.appendChild(div);
  });
}

// ---------------- PETS ----------------
function renderPets(){
  const c = document.getElementById('petList'); c.innerHTML='';
  PETS.forEach(p=>{
    const owned = state.pets[p.id];
    const active = state.activePet===p.id;
    const div = document.createElement('div');
    div.className = `pet-card rarity-${p.rarity} ${owned?'owned':'locked'} ${active?'active':''}`;
    div.innerHTML = `
      <img src="${assetPath('pet',p.id)}" ${!owned?'style="filter:grayscale(1) brightness(0.4)"':''}>
      <div class="p-name">${_(p.name)}</div>
      <div class="p-bonus">${_(p.bonus)}</div>
      ${owned? `<button class="mini-btn ${active?'on':''}" onclick="togglePet('${p.id}')">${active?'✓ '+_(D.active):_(D.activate)}</button>`
             : `<div class="p-locked">🔒 ${_(D.locked)}</div>`}`;
    c.appendChild(div);
  });
}
function togglePet(id){
  state.activePet = state.activePet===id? null : id;
  sfx('click'); save(); renderPets(); refreshUI();
}
function grantPet(id){
  if(!state.pets[id]){
    state.pets[id] = true;
    state.stats.petCount = Object.keys(state.pets).length;
    toast(`🎁 ${_(petData(id).name)}!`,'success');
    sfx('fanfare');
  }
}

// ---------------- IDLE ----------------
function calcGoldRate(){
  state.goldRate = 100 * (state.buildings.fire_temple||1) * (1 + (state.progress.chapter-1)*0.2 + state.endlessStage*0.05);
}
function updateIdle(){
  calcGoldRate();
  const diff = (Date.now() - state.lastIdle)/1000/3600;
  const cap = state.goldRate * 8;
  const earned = Math.min(cap, Math.floor(diff * state.goldRate));
  const el = document.getElementById('idleGold'); if(el) el.textContent = earned + ' 💰';
  const rateEl = document.getElementById('goldRate'); if(rateEl) rateEl.textContent = Math.floor(state.goldRate) + ' 💰/h';
  const tpEl = document.getElementById('teamPower'); if(tpEl) tpEl.textContent = Math.floor(teamPower());
  return earned;
}
function claimIdle(){
  const e = updateIdle();
  state.gold += e;
  state.lastIdle = Date.now();
  state.stats.idleClaims++;
  sfx('coin'); haptic(30);
  toast(`+${e} 💰`,'success');
  save(); refreshUI(); checkQuests();
}

// ---------------- MINIGAMES ----------------
function openMinigame(id){
  state.stats.minigames++;
  if(id==='archery') startArchery();
  else if(id==='race') startRace();
  else if(id==='forge') startForge();
  checkQuests();
}

// ===== Archery =====
let archery = null;
function startArchery(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🏹 ${_({fa:'کمانگیری آرش',en:'Arash Archery'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0" data-fa="روی هدف کلیک کن! ۳۰ ثانیه" data-en="Click targets! 30 seconds"></div>
    <div style="display:flex;justify-content:space-around;margin:10px 0">
      <div>⏱ <span id="arTime">30</span>s</div>
      <div>🎯 <span id="arScore">0</span></div>
    </div>
    <div id="arField" style="position:relative;width:100%;height:280px;background:linear-gradient(180deg,#4b1d7a,#0f0620);border-radius:12px;overflow:hidden;border:2px solid var(--gold);cursor:crosshair"></div>
    <button class="big-btn" style="width:100%;margin-top:10px" onclick="closeMini()">${_(D.close)}</button>`;
  modal.classList.add('show');
  document.querySelectorAll('#miniBody [data-fa]').forEach(el=>{
    const v = el.getAttribute('data-'+state.lang); if(v) el.textContent=v;
  });
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
    archery.time--;
    document.getElementById('arTime').textContent = archery.time;
    if(archery.time<=0){
      clearInterval(timer); archery.active = false;
      if(archery.score > state.stats.archeryHigh) state.stats.archeryHigh = archery.score;
      const gems = Math.floor(archery.score/10);
      const gold = archery.score * 5;
      state.gems += gems; state.gold += gold;
      toast(`🎯 ${_(D.score)}: ${archery.score}! +${gold}💰 +${gems}💎`,'success');
      sfx('fanfare'); save(); refreshUI(); checkAchievements();
      // grant Simorgh pet at high scores
      if(archery.score >= 200 && !state.pets.simorgh){ grantPet('simorgh') }
      setTimeout(closeMini, 2000);
    }
  },1000);
}

// ===== Race =====
function startRace(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🐎 ${_({fa:'مسابقه رخش',en:'Rakhsh Race'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0" data-fa="روی صفحه بزن تا رخش بپرد!" data-en="Tap to jump!"></div>
    <canvas id="raceCanvas" width="340" height="220" style="width:100%;background:linear-gradient(180deg,#4b1d7a,#c1272d);border-radius:12px;border:2px solid var(--gold);touch-action:none"></canvas>
    <button class="big-btn" style="width:100%;margin-top:10px" onclick="closeMini()">${_(D.close)}</button>`;
  modal.classList.add('show');
  document.querySelectorAll('#miniBody [data-fa]').forEach(el=>{
    const v = el.getAttribute('data-'+state.lang); if(v) el.textContent=v;
  });
  const canvas = document.getElementById('raceCanvas');
  const ctx = canvas.getContext('2d');
  let horse = {x:60, y:170, vy:0, jumping:false};
  let obstacles = [];
  let score = 0, gameOver = false, spawnTimer = 0;
  const GROUND = 180;
  function jump(){
    if(!horse.jumping){ horse.vy = -8; horse.jumping = true; sfx('whoosh'); haptic(20); }
  }
  canvas.ontouchstart = e=>{ e.preventDefault(); jump() };
  canvas.onmousedown = jump;
  function loop(){
    if(gameOver) return;
    ctx.fillStyle = '#4b1d7a'; ctx.fillRect(0,0,340,220);
    // ground
    ctx.fillStyle = '#3e2723'; ctx.fillRect(0,GROUND+20,340,20);
    // horse (simple)
    horse.vy += 0.4;
    horse.y += horse.vy;
    if(horse.y >= 170){ horse.y = 170; horse.vy = 0; horse.jumping = false }
    ctx.font = '40px serif'; ctx.fillText('🐎', horse.x, horse.y+10);
    // obstacles
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
        if(score >= 20){ state.stats.raceWins++; }
        const gems = Math.floor(score/5);
        const gold = score * 10;
        state.gems += gems; state.gold += gold;
        toast(`🏁 ${_(D.score)}: ${score}! +${gold}💰 +${gems}💎`, 'success');
        sfx('defeat'); save(); refreshUI(); checkAchievements();
        // grant Rakhsh at high scores
        if(score >= 50 && !state.pets.rakhsh){ grantPet('rakhsh') }
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

// ===== Forge =====
function startForge(){
  const modal = document.getElementById('miniModal');
  const b = document.getElementById('miniBody');
  b.innerHTML = `
    <h3 style="color:var(--gold);text-align:center">🔨 ${_({fa:'آهنگری کاوه',en:'Kavehs Forge'})}</h3>
    <div style="text-align:center;color:var(--muted);margin:6px 0" data-fa="وقتی نوار قرمز به میانه رسید بزن! ۵ ضربه موفق = آیتم" data-en="Tap when the bar hits center! 5 perfect = item"></div>
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
  document.querySelectorAll('#miniBody [data-fa]').forEach(el=>{
    const v = el.getAttribute('data-'+state.lang); if(v) el.textContent=v;
  });
  window._forge = {hits:0, tries:8, dir:1, pos:0, active:true};
  function loop(){
    if(!window._forge.active) return;
    window._forge.pos += window._forge.dir*2;
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
  // sweet spot 40-60% (of 340 = 136-204)
  window._forge.tries--;
  if(p >= 136 && p <= 204){
    window._forge.hits++;
    sfx('coin'); haptic(30);
    document.getElementById('fgHits').textContent = window._forge.hits;
    if(window._forge.hits >= 5){
      window._forge.active = false;
      // grant a random item
      const rarities = ['Common','Common','Rare','Rare','Epic','Legendary'];
      const targetRarity = rarities[Math.floor(Math.random()*rarities.length)];
      const pool = ITEMS.filter(i=>i.rarity===targetRarity);
      const item = pool[Math.floor(Math.random()*pool.length)];
      addItem(item.id);
      state.stats.forges++;
      toast(`🔨 ${_(D.forged)}: ${_(item.name)}!`,'success');
      sfx('fanfare'); save(); refreshUI(); checkAchievements();
      // grant Homa pet at 25 forges
      if(state.stats.forges >= 25 && !state.pets.homa){ grantPet('homa') }
      setTimeout(closeMini, 2000);
      return;
    }
  } else {
    sfx('hit'); haptic(50);
  }
  document.getElementById('fgTries').textContent = window._forge.tries;
  if(window._forge.tries <= 0){
    window._forge.active = false;
    toast(_({fa:'زمان تمام! دوباره تلاش کن.',en:'Out of tries!'}),'error');
    setTimeout(closeMini, 1500);
  }
}
function closeMini(){
  if(window._forge) window._forge.active = false;
  if(archery) archery.active = false;
  sfx('click');
  document.getElementById('miniModal').classList.remove('show');
}

// ---------------- SETTINGS ----------------
function renderSettings(){
  const box = document.getElementById('settingsBody');
  box.innerHTML = `
    <h3 style="color:var(--gold);text-align:center;margin-bottom:14px">⚙ ${_(D.settings)}</h3>
    <div class="setting-row">
      <label>${_(D.sound)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.sound?'checked':''} onchange="toggleSetting('sound',this.checked)"><span class="slider"></span></label>
    </div>
    <div class="setting-row">
      <label>${_(D.sfx)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.sfx?'checked':''} onchange="toggleSetting('sfx',this.checked)"><span class="slider"></span></label>
    </div>
    <div class="setting-row">
      <label>${_(D.haptic)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.hapticFeedback?'checked':''} onchange="toggleSetting('hapticFeedback',this.checked)"><span class="slider"></span></label>
    </div>
    <div class="setting-row">
      <label>${_(D.particles)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.particleEffects?'checked':''} onchange="toggleSetting('particleEffects',this.checked)"><span class="slider"></span></label>
    </div>
    <div class="setting-row">
      <label>${_(D.autoSave)}</label>
      <label class="switch"><input type="checkbox" ${state.settings.autoSave?'checked':''} onchange="toggleSetting('autoSave',this.checked)"><span class="slider"></span></label>
    </div>
    <div class="setting-row">
      <label>${_(D.language)}</label>
      <button class="mini-btn" onclick="toggleLang()">${state.lang==='fa'?'English':'فارسی'}</button>
    </div>
    <hr style="border-color:#f5c54233;margin:16px 0">
    <div class="setting-info">
      <div>👤 ${_(D.player)}: <b>${state.playerName}</b></div>
      <div>⏱ ${_(D.playTime)}: <b>${Math.floor(state.stats.playTime/60)}m</b></div>
      <div>🏆 ${_(D.achievs)}: <b>${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</b></div>
    </div>
    <button class="big-btn secondary" style="width:100%;margin-top:16px" onclick="exportSave()">💾 ${_(D.exportSave)}</button>
    <button class="big-btn secondary" style="width:100%;margin-top:6px" onclick="importSave()">📥 ${_(D.importSave)}</button>
    <button class="big-btn" style="background:linear-gradient(180deg,#c1272d,#7b0000);width:100%;margin-top:6px" onclick="resetGame()">🗑 ${_(D.resetGame)}</button>`;
}
function toggleSetting(k,v){ state.settings[k]=v; sfx('click'); save() }
function exportSave(){
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  navigator.clipboard.writeText(b).then(()=>toast(_(D.copied),'success')).catch(()=>{
    prompt(_(D.copySave), b);
  });
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
  localStorage.removeItem('shahnameh_v3');
  location.reload();
}

// ---------------- MENU / HOME ----------------
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===id));
  sfx('click');
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
    const tier = Math.min(6, Math.floor(state.endlessStage/10)+1);
    const pool = ENEMIES.filter(e=>e.tier===tier);
    const en = pool[state.endlessStage % pool.length];
    document.getElementById('nextEnemy').textContent = _(en.name);
    document.getElementById('nextEnemyImg').src = assetPath('enemy', en.id);
  }
  updateIdle();
}
function refreshUI(){
  document.getElementById('gold').textContent = Math.floor(state.gold);
  document.getElementById('gems').textContent = state.gems;
  document.getElementById('scrolls').textContent = state.scrolls;
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
      <button class="big-btn" style="min-width:80px" onclick="openMinigame('${m.id}')">▶</button>`;
    c.appendChild(div);
  });
}

function filterInv(btn){
  document.querySelectorAll('.inv-filter').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  invFilter = btn.dataset.filter;
  sfx('click');
  renderInventory();
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
  no_team:{fa:'ابتدا پهلوانی به تیم اعزام کن!',en:'Deploy a hero first!'},
  team_full:{fa:'تیم پر است',en:'Team full'},
  locked:{fa:'قفل',en:'Locked'},
  battle_start:{fa:'نبرد آغاز شد',en:'Battle begins'},
  victory:{fa:'پیروزی!',en:'Victory!'},
  defeat:{fa:'شکست!',en:'Defeat!'},
  upgrade:{fa:'ارتقا',en:'Upgrade'},
  deploy:{fa:'اعزام به تیم',en:'Deploy'},
  in_team:{fa:'در تیم',en:'In Team'},
  dupe:{fa:'تکراری',en:'Duplicate'},
  new_hero:{fa:'جدید',en:'NEW'},
  empty_inv:{fa:'اینونتوری خالی است. با پیروزی در نبردها آیتم به دست بیاور.',en:'Empty inventory. Win battles to earn items.'},
  type_weapon:{fa:'سلاح',en:'Weapon'},
  type_helm:{fa:'کلاه‌خود',en:'Helm'},
  type_armor:{fa:'زره',en:'Armor'},
  type_boots:{fa:'چکمه',en:'Boots'},
  type_ring:{fa:'انگشتر',en:'Ring/Amulet'},
  equip_to:{fa:'اعزام به:',en:'Equip to:'},
  pick_item:{fa:'یک آیتم انتخاب کن',en:'Pick an item'},
  no_items:{fa:'آیتمی برای این جایگاه نداری',en:'No items for this slot'},
  unequip:{fa:'برداشتن',en:'Unequip'},
  signature:{fa:'مخصوص',en:'Signature'},
  endless_mode:{fa:'حالت بی‌نهایت',en:'Endless Mode'},
  settings:{fa:'تنظیمات',en:'Settings'},
  sound:{fa:'🔊 صدای پس‌زمینه و شخصیت',en:'🔊 Sound & voices'},
  sfx:{fa:'🎵 افکت‌های صوتی',en:'🎵 Sound effects'},
  haptic:{fa:'📳 لرزش',en:'📳 Haptic feedback'},
  particles:{fa:'✨ ذرات و افکت‌ها',en:'✨ Particles & effects'},
  autoSave:{fa:'💾 ذخیره خودکار',en:'💾 Auto save'},
  language:{fa:'🌐 زبان',en:'🌐 Language'},
  player:{fa:'بازیکن',en:'Player'},
  playTime:{fa:'مدت بازی',en:'Play time'},
  achievs:{fa:'اچیومنت‌ها',en:'Achievements'},
  exportSave:{fa:'صادرات ذخیره',en:'Export save'},
  importSave:{fa:'وارد کردن ذخیره',en:'Import save'},
  resetGame:{fa:'شروع دوباره (پاک کردن)',en:'Reset game (erase all)'},
  copied:{fa:'در کلیپ‌بورد کپی شد!',en:'Copied to clipboard!'},
  copySave:{fa:'ذخیره را کپی کن',en:'Copy this save'},
  pasteSave:{fa:'کد ذخیره را وارد کن:',en:'Paste your save code:'},
  imported:{fa:'وارد شد!',en:'Imported!'},
  importFail:{fa:'کد نامعتبر!',en:'Invalid code!'},
  confirmReset:{fa:'مطمئنی؟ تمام اطلاعات پاک می‌شود!',en:'Are you sure? All data will be erased!'},
  claim:{fa:'دریافت',en:'Claim'},
  progress:{fa:'در حال انجام',en:'In progress'},
  active:{fa:'فعال',en:'Active'},
  activate:{fa:'فعال کن',en:'Activate'},
  close:{fa:'بستن',en:'Close'},
  score:{fa:'امتیاز',en:'Score'},
  hits:{fa:'ضربه‌ها',en:'Hits'},
  tries:{fa:'شانس',en:'Tries'},
  forged:{fa:'ساخته شد',en:'Forged'},
  welcome:{fa:'به شاهنامه خوش آمدی!',en:'Welcome to Shahnameh!'},
};

// ---------------- INIT ----------------
window.addEventListener('DOMContentLoaded', ()=>{
  load();
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang==='fa'?'rtl':'ltr';
  refreshUI();

  // Streak
  const now = Date.now();
  const day = 24*3600*1000;
  const lastLoginDay = Math.floor(state.stats.lastLogin/day);
  const todayDay = Math.floor(now/day);
  if(state.stats.lastLogin && todayDay - lastLoginDay === 1){
    state.stats.streak++;
    toast(`🔥 ${state.stats.streak} ${_({fa:'روز پیاپی!',en:'day streak!'})}`,'success');
  } else if(state.stats.lastLogin && todayDay - lastLoginDay > 1){
    state.stats.streak = 1;
  } else if(!state.stats.lastLogin){
    state.stats.streak = 1;
  }
  state.stats.lastLogin = now;

  checkAchievements(); checkQuests();

  // Game loop
  setInterval(()=>{
    calcGoldRate();
    state.gold += state.goldRate/3600;
    const el = document.getElementById('gold'); if(el) el.textContent = Math.floor(state.gold);
    state.stats.playTime++;
    state.stats.goldMax = Math.max(state.stats.goldMax, state.gold);
    if(state.stats.playTime%30===0){ checkAchievements(); if(state.settings.autoSave) save() }
  },1000);

  // Intro
  if(!state.onboardingDone){
    setTimeout(()=>{
      playVoice('intro');
      showStory(CHAPTERS[0], 'intro', ()=>{
        state.onboardingDone = true;
        state.progress.storyRead['ch1_intro'] = true;
        save();
      });
    }, 800);
  }

  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

// expose everything to global
Object.assign(window, {
  showScreen, summon, startCampaign, startEndless, toggleAuto, toggleSpeed,
  claimIdle, toggleLang, openHero, closeModal, upgradeHero, upgradeBuilding,
  toggleDeploy, filterInv, switchTab, claimQuest, claimAchievement,
  togglePet, openMinigame, closeMini, forgeHit, toggleSetting,
  exportSave, importSave, resetGame,
});
