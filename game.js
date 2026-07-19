// ============================================================
// SHAHNAMEH: RISE OF KINGS - GAME ENGINE
// ============================================================

// ---------------- STATE ----------------
const DEFAULT_STATE = {
  gold: 500, gems: 200, scrolls: 3, exp: 0,
  heroes: {},              // id -> {level, owned, exp, equipment:{weapon,helm,armor,boots,ring}}
  team: [],                // [heroId...]
  inventory: [],           // [{id, uid}]
  lang: 'fa',
  buildings: {},           // id -> level
  lastIdle: Date.now(),
  goldRate: 100,
  progress: {chapter:1, stage:0, storyRead:{}},
  endlessStage: 0,
  vipLevel: 0,
  totalSpent: 0,
  achievements: {},
  settings: {sound:true, autoSave:true},
};
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let UID = 0;

// ---------------- STORAGE ----------------
function save(){ try{ localStorage.setItem('shahnameh_v2', JSON.stringify(state)) }catch(e){} }
function load(){
  try{
    const s = localStorage.getItem('shahnameh_v2');
    if(s){
      const parsed = JSON.parse(s);
      state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    }
  }catch(e){}
  // Ensure defaults
  if(!state.heroes.kaveh) state.heroes.kaveh = {level:1,owned:true,exp:0,equipment:{}};
  if(state.team.length===0) state.team = ['kaveh'];
  BUILDINGS.forEach(b=>{ if(!state.buildings[b.id]) state.buildings[b.id]=1 });
  // Give starting items on first load
  if(state.inventory.length===0){
    ['sword_bronze','helm_leather','armor_leather','boots_leather'].forEach(id=>addItem(id));
  }
}

// ---------------- HELPERS ----------------
function _(str){ return typeof str==='object'? (str[state.lang]||str.fa) : str }
function heroData(id){ return HEROES.find(h=>h.id===id) }
function enemyData(id){ return ENEMIES.find(e=>e.id===id) }
function itemData(id){ return ITEMS.find(i=>i.id===id) }
function chapterData(id){ return CHAPTERS.find(c=>c.id===id) }

function toast(msg, type='info'){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 2500);
}

function assetPath(kind, id){
  const list = kind==='hero'? HEROES : (kind==='enemy'? ENEMIES : ITEMS);
  const obj = list.find(x=>x.id===id);
  if(kind==='item') return `assets/items/${id}.svg`;
  const ext = obj && obj.ext ? obj.ext : 'svg';
  const folder = kind==='hero'? 'heroes' : 'enemies';
  return `assets/${folder}/${id}.${ext}`;
}

function playVoice(voiceId){
  if(!voiceId || !state.settings.sound) return;
  const a = document.getElementById('voiceAudio');
  a.src = `assets/audio/${voiceId}.mp3`;
  a.play().catch(()=>{});
}

// ---------------- HERO STATS (with equipment) ----------------
function heroStats(id){
  const h = heroData(id);
  if(!h) return null;
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
  // Add equipment bonuses
  const eq = s.equipment || {};
  for(const slot in eq){
    const uid = eq[slot];
    if(!uid) continue;
    const invItem = state.inventory.find(x=>x.uid===uid);
    if(!invItem) continue;
    const it = itemData(invItem.id);
    if(!it) continue;
    hp += it.hp || 0;
    atk += it.atk || 0;
    def += it.def || 0;
    spd += it.spd || 0;
    crit += it.crit || 0;
    // signature bonus if item is meant for this hero
    if(it.hero === id){
      atk = Math.floor(atk * 1.2);
      hp = Math.floor(hp * 1.2);
    }
  }
  return {hp,atk,def,spd,crit,power: Math.floor(hp/2 + atk*3 + def*2 + spd*4)};
}

function teamPower(){
  return state.team.reduce((s,id)=> s + (heroStats(id)?.power||0), 0);
}

// ---------------- INVENTORY ----------------
function addItem(itemId){
  const uid = ++UID;
  state.inventory.push({id:itemId, uid});
  return uid;
}
function removeItem(uid){
  const i = state.inventory.findIndex(x=>x.uid===uid);
  if(i>=0){
    // unequip from any hero first
    for(const hid in state.heroes){
      const eq = state.heroes[hid].equipment||{};
      for(const slot in eq){
        if(eq[slot]===uid) delete eq[slot];
      }
    }
    state.inventory.splice(i,1);
  }
}
function equipItem(heroId, uid){
  const invItem = state.inventory.find(x=>x.uid===uid);
  if(!invItem) return;
  const it = itemData(invItem.id);
  if(!it) return;
  if(!state.heroes[heroId].equipment) state.heroes[heroId].equipment = {};
  // Remove same slot from any other hero
  for(const hid in state.heroes){
    const eq = state.heroes[hid].equipment||{};
    if(eq[it.type]===uid) delete eq[it.type];
  }
  state.heroes[heroId].equipment[it.type] = uid;
  save();
}
function unequipItem(heroId, slot){
  if(state.heroes[heroId].equipment){
    delete state.heroes[heroId].equipment[slot];
    save();
  }
}

// ---------------- SUMMON (GACHA) ----------------
function summon(type){
  let count = 1, useScroll = false;
  if(type==='scroll'){
    if(state.scrolls<1){toast(_(D.no_scroll), 'error'); return}
    state.scrolls--; useScroll = true;
  } else if(type===1){
    if(state.gems<100){toast(_(D.no_gems), 'error'); return}
    state.gems -= 100;
  } else if(type===10){
    if(state.gems<900){toast(_(D.no_gems), 'error'); return}
    state.gems -= 900; count = 10;
  }
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
        // Duplicate → convert to shards + item
        state.gold += 200;
        state.heroes[h.id].exp = (state.heroes[h.id].exp||0) + 50;
        results.push({hero:h, dupe:true});
      } else {
        state.heroes[h.id] = {level:1, owned:true, exp:0, equipment:{}};
        results.push({hero:h, dupe:false});
      }
    }
    showSummonResults(results);
    save(); refreshUI();
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
      ${r.dupe? `<div class="dupe">${_(D.dupe)} +200💰</div>` : `<div class="new">${_(D.new_hero)}!</div>`}
    `;
    grid.appendChild(card);
  });
  body.appendChild(grid);
  modal.classList.add('show');
}

// ---------------- CAMPAIGN / STORY ----------------
function currentStageInfo(){
  const c = chapterData(state.progress.chapter);
  if(!c) return null;
  return {chapter:c, stage:c.stages[state.progress.stage]};
}

function startCampaign(){
  const info = currentStageInfo();
  if(!info){
    // finished all chapters → endless
    startEndless(); return;
  }
  const key = `ch${state.progress.chapter}_intro`;
  if(!state.progress.storyRead[key] && state.progress.stage===0){
    state.progress.storyRead[key] = true; save();
    showStory(info.chapter, 'intro', ()=>startBattle(info.stage, 'campaign'));
  } else {
    startBattle(info.stage, 'campaign');
  }
}

function startEndless(){
  const eStage = state.endlessStage;
  // Enemy scales up
  const tier = Math.min(6, Math.floor(eStage/10)+1);
  const enemyPool = ENEMIES.filter(e=>e.tier===tier);
  const enemy = enemyPool[eStage % enemyPool.length];
  const scale = 1 + eStage * 0.2;
  const stage = {
    enemy: enemy.id,
    reward: {gold: 200 + eStage*50, exp: 100 + eStage*20, gems: eStage%5===0? 10:0},
    endlessScale: scale,
  };
  startBattle(stage, 'endless');
}

// ---------------- STORY MODAL ----------------
function showStory(chapter, phase, onDone){
  const modal = document.getElementById('storyModal');
  const lines = chapter[phase][state.lang] || chapter[phase].fa;
  const bg = `assets/story/${chapter.scene}.svg`;
  document.getElementById('storyBg').style.backgroundImage = `url('${bg}')`;
  document.getElementById('storyTitle').textContent = _(chapter.title);
  const txt = document.getElementById('storyText');
  let idx = 0;
  function next(){
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

function startBattle(stage, mode){
  if(state.team.length===0){
    toast(_(D.no_team), 'error');
    showScreen('heroes'); renderHeroes(); return;
  }
  // Build player team
  const players = state.team.map(id=>{
    const h = heroData(id);
    const s = heroStats(id);
    return {
      id, kind:'hero', name:_(h.name), img:assetPath('hero',id),
      hp:s.hp, maxHp:s.hp, atk:s.atk, def:s.def, spd:s.spd, crit:s.crit,
      class:h.class, alive:true, effects:[]
    };
  });
  const enemyBase = enemyData(stage.enemy);
  const waves = stage.wave || 1;
  const scale = stage.endlessScale || (1 + (state.progress.chapter-1)*0.3);
  const enemies = [];
  for(let w=0; w<waves; w++){
    const bossMult = stage.boss ? 2.5 : 1;
    enemies.push({
      id: stage.enemy, kind:'enemy',
      name: _(enemyBase.name),
      img: assetPath('enemy', stage.enemy),
      hp: Math.floor(enemyBase.hp*scale*bossMult),
      maxHp: Math.floor(enemyBase.hp*scale*bossMult),
      atk: Math.floor(enemyBase.atk*scale),
      def: Math.floor(enemyBase.def*scale),
      spd: enemyBase.spd,
      crit: 10,
      alive: true, effects:[], isBoss: !!stage.boss
    });
  }
  battle = {players, enemies, stage, mode, over:false, turn:0, log:[], activeEnemyIdx:0};
  showScreen('battle');
  renderBattleScene();
  logBattle(_(D.battle_start) + ' — ' + enemies[0].name);
  if(autoBattle) setTimeout(battleTick, 800/battleSpeed);
}

function renderBattleScene(){
  const pRow = document.getElementById('playerRow');
  const eRow = document.getElementById('enemyRow');
  pRow.innerHTML = ''; eRow.innerHTML = '';
  battle.players.forEach((p,i)=>{
    const el = document.createElement('div');
    el.className = 'combatant player'+(p.alive?'':' dead');
    el.id = 'p'+i;
    el.innerHTML = `
      <div class="name-plate">${p.name}</div>
      <img src="${p.img}">
      <div class="hp-bar"><div class="fill" style="width:${p.hp/p.maxHp*100}%"></div>
        <div class="txt">${p.hp|0}/${p.maxHp}</div></div>
    `;
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
        <div class="txt">${e.hp|0}/${e.maxHp}</div></div>
    `;
    eRow.appendChild(el);
  });
}

function updateHPBars(){
  battle.players.forEach((p,i)=>{
    const el = document.getElementById('p'+i);
    if(!el) return;
    const fill = el.querySelector('.fill');
    const txt = el.querySelector('.txt');
    const bar = el.querySelector('.hp-bar');
    const pct = Math.max(0,p.hp)/p.maxHp*100;
    fill.style.width = pct+'%';
    txt.textContent = `${Math.max(0,p.hp)|0}/${p.maxHp}`;
    bar.classList.toggle('low', pct<30);
    el.classList.toggle('dead', !p.alive);
  });
  battle.enemies.forEach((e,i)=>{
    const el = document.getElementById('e'+i);
    if(!el) return;
    const fill = el.querySelector('.fill');
    const txt = el.querySelector('.txt');
    const bar = el.querySelector('.hp-bar');
    const pct = Math.max(0,e.hp)/e.maxHp*100;
    fill.style.width = pct+'%';
    txt.textContent = `${Math.max(0,e.hp)|0}/${e.maxHp}`;
    bar.classList.toggle('low', pct<30);
    el.classList.toggle('dead', !e.alive);
  });
}

function dmgPopup(sel, amt, crit){
  const el = document.querySelector(sel);
  if(!el) return;
  const p = document.createElement('div');
  p.className = 'dmg-popup';
  p.textContent = crit? `💥 ${amt}` : amt;
  if(crit) p.style.color='#ffd700';
  el.appendChild(p);
  setTimeout(()=>p.remove(), 1000);
}

function logBattle(msg){
  const el = document.getElementById('combatLog');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('show'), 1400/battleSpeed);
}

let turnQueue = [];
function buildTurnQueue(){
  const all = [...battle.players.filter(p=>p.alive).map((p,i)=>({side:'p',idx:battle.players.indexOf(p),unit:p})),
               ...battle.enemies.filter(e=>e.alive).map((e,i)=>({side:'e',idx:battle.enemies.indexOf(e),unit:e}))];
  all.sort((a,b)=> b.unit.spd - a.unit.spd);
  turnQueue = all;
}

function battleTick(){
  if(!battle || battle.over) return;
  if(turnQueue.length===0) buildTurnQueue();
  const turn = turnQueue.shift();
  if(!turn || !turn.unit.alive){
    if(autoBattle) setTimeout(battleTick, 100);
    return;
  }
  const attacker = turn.unit;
  const targets = turn.side==='p'? battle.enemies.filter(e=>e.alive) : battle.players.filter(p=>p.alive);
  if(targets.length===0){ endBattle(turn.side==='p'); return; }
  const target = targets[Math.floor(Math.random()*targets.length)];
  const crit = Math.random() < (attacker.crit/100);
  let dmg = Math.max(1, Math.floor((attacker.atk * (crit?2:1) - target.def*0.3) * (0.85+Math.random()*0.3)));
  target.hp -= dmg;
  const atkSel = turn.side==='p'? '#p'+turn.idx : '#e'+turn.idx;
  const tgtIdx = turn.side==='p'? battle.enemies.indexOf(target) : battle.players.indexOf(target);
  const tgtSel = turn.side==='p'? '#e'+tgtIdx : '#p'+tgtIdx;
  const atkEl = document.querySelector(atkSel);
  const tgtEl = document.querySelector(tgtSel);
  if(atkEl) atkEl.classList.add('attacking');
  if(tgtEl) tgtEl.classList.add('hurt');
  dmgPopup(tgtSel, dmg, crit);
  setTimeout(()=>{
    if(atkEl) atkEl.classList.remove('attacking');
    if(tgtEl) tgtEl.classList.remove('hurt');
  }, 400);
  if(target.hp<=0){
    target.hp=0; target.alive=false;
  }
  updateHPBars();
  // check end
  if(battle.enemies.every(e=>!e.alive)){ return endBattle(true); }
  if(battle.players.every(p=>!p.alive)){ return endBattle(false); }
  if(autoBattle) setTimeout(battleTick, 600/battleSpeed);
}

function endBattle(win){
  if(!battle || battle.over) return;
  battle.over = true;
  playVoice(win?'victory':'defeat');
  if(win){
    const r = battle.stage.reward || {};
    if(r.gold) state.gold += r.gold;
    if(r.gems) state.gems += r.gems;
    if(r.exp) state.exp += r.exp;
    if(r.item){ addItem(r.item); }
    // Award XP to team
    state.team.forEach(id=>{
      state.heroes[id].exp = (state.heroes[id].exp||0) + (r.exp||30);
      checkLevelUp(id);
    });
    logBattle('🏆 ' + _(D.victory) + `  +${r.gold||0}💰 +${r.gems||0}💎` + (r.item?` +${_(itemData(r.item).name)}`:''));
    // advance
    if(battle.mode==='campaign'){
      state.progress.stage++;
      const ch = chapterData(state.progress.chapter);
      if(state.progress.stage >= ch.stages.length){
        // chapter complete
        setTimeout(()=>{
          showStory(ch, 'outro', ()=>{
            state.progress.chapter++;
            state.progress.stage = 0;
            save();
            showScreen('home'); refreshUI();
          });
        }, 1500);
      } else {
        save();
        setTimeout(()=>{ if(autoBattle) startCampaign(); else { showScreen('home'); refreshUI(); } }, 1500);
      }
    } else if(battle.mode==='endless'){
      state.endlessStage++;
      save();
      setTimeout(()=>{ if(autoBattle) startEndless(); else { showScreen('home'); refreshUI(); } }, 1500);
    }
  } else {
    logBattle('💀 ' + _(D.defeat));
    save();
    setTimeout(()=>{ showScreen('home'); refreshUI(); }, 2000);
  }
}

function toggleAuto(){
  autoBattle = !autoBattle;
  document.getElementById('autoBtn').classList.toggle('on', autoBattle);
  if(autoBattle && battle && !battle.over) battleTick();
}
function toggleSpeed(){
  battleSpeed = battleSpeed===1?2:battleSpeed===2?3:1;
  document.getElementById('speedBtn').querySelector('span').textContent = battleSpeed+'×';
}

// ---------------- LEVEL UP ----------------
function checkLevelUp(id){
  const s = state.heroes[id];
  const need = 100 * s.level;
  while(s.exp >= need){
    s.exp -= need;
    s.level++;
    toast(`⬆ ${_(heroData(id).name)} → Lv.${s.level}`, 'success');
  }
}
function upgradeHero(id){
  const h = heroData(id);
  const s = state.heroes[id];
  const bazaar = state.buildings.bazaar || 1;
  const cost = Math.floor(100 * s.level * (h.rarity==='SSR'?3:h.rarity==='SR'?2:1) * (1-(bazaar-1)*0.05));
  if(state.gold<cost){ toast(_(D.no_gold), 'error'); return; }
  state.gold -= cost;
  s.level++;
  save(); refreshUI();
  toast(`⬆ Lv.${s.level}!`, 'success');
  if(document.getElementById('heroModal').classList.contains('show')) openHero(id);
}

// ---------------- RENDERING ----------------
function renderHeroes(){
  const g = document.getElementById('heroGrid');
  g.innerHTML = '';
  // sort: owned first, then rarity SSR>SR>R
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
      <div class="power">${owned?`⚡ ${stats.power}`:_(D.locked)}</div>
    `;
    card.onclick = ()=>openHero(h.id);
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
  document.getElementById('dLevel').textContent = owned? s.level : '-';
  document.getElementById('dHp').textContent = stats.hp;
  document.getElementById('dAtk').textContent = stats.atk;
  document.getElementById('dDef').textContent = stats.def;
  document.getElementById('dSpd').textContent = stats.spd;
  document.getElementById('dCrit').textContent = stats.crit+'%';
  document.getElementById('dSkill').textContent = _(h.skill);
  document.getElementById('dLore').textContent = _(h.lore);
  document.getElementById('dPower').textContent = stats.power || '-';
  // equipment slots
  const eqBox = document.getElementById('equipSlots');
  eqBox.innerHTML = '';
  ['weapon','helm','armor','boots','ring'].forEach(slot=>{
    const eq = (s && s.equipment && s.equipment[slot]) || null;
    const invItem = eq ? state.inventory.find(x=>x.uid===eq) : null;
    const it = invItem ? itemData(invItem.id) : null;
    const div = document.createElement('div');
    div.className = 'equip-slot' + (it?' filled rarity-'+it.rarity:'');
    div.innerHTML = it? `<img src="${assetPath('item',invItem.id)}">` : `<span class="slot-icon">${slot==='weapon'?'⚔':slot==='helm'?'👑':slot==='armor'?'🛡':slot==='boots'?'👢':'💍'}</span>`;
    div.onclick = ()=>openEquipPicker(slot);
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
function closeModal(id){ document.getElementById(id||'heroModal').classList.remove('show'); }

function toggleDeploy(id){
  const cap = 3 + (state.buildings.palace||1); // starts at 4
  const i = state.team.indexOf(id);
  if(i>=0){ state.team.splice(i,1) }
  else{
    if(state.team.length >= cap){ toast(_(D.team_full)+` (${cap})`,'error'); return; }
    state.team.push(id);
  }
  save(); refreshUI(); renderHeroes(); openHero(id);
}

// ---------------- INVENTORY ----------------
function renderInventory(){
  const g = document.getElementById('invGrid');
  g.innerHTML = '';
  if(state.inventory.length===0){
    g.innerHTML = `<div class="empty">${_(D.empty_inv)}</div>`;
    return;
  }
  // group by type
  const filter = document.querySelector('.inv-filter.on')?.dataset.filter || 'all';
  const items = filter==='all'? state.inventory : state.inventory.filter(x=> itemData(x.id)?.type===filter);
  items.forEach(inv=>{
    const it = itemData(inv.id);
    if(!it) return;
    const card = document.createElement('div');
    card.className = `item-card rarity-${it.rarity}`;
    // find who equipped it
    let equippedBy = null;
    for(const hid in state.heroes){
      const eq = state.heroes[hid].equipment||{};
      for(const s in eq){ if(eq[s]===inv.uid) equippedBy = hid; }
    }
    card.innerHTML = `
      <img src="${assetPath('item',inv.id)}">
      <div class="i-name">${_(it.name)}</div>
      <div class="i-stats">${it.atk?`⚔+${it.atk} `:''}${it.def?`🛡+${it.def} `:''}${it.hp?`❤+${it.hp}`:''}${it.spd?`💨+${it.spd} `:''}${it.crit?`💥+${it.crit}%`:''}</div>
      ${equippedBy?`<div class="equipped">✓ ${_(heroData(equippedBy).name)}</div>`:''}
    `;
    card.onclick = ()=>openItemDetail(inv);
    g.appendChild(card);
  });
}

function openItemDetail(inv){
  const it = itemData(inv.id);
  if(!it) return;
  const modal = document.getElementById('itemModal');
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
  document.getElementById('iSig').textContent = it.hero? _(D.signature)+': '+_(heroData(it.hero).name)+' (+20% bonus)' : '';
  // hero picker
  const box = document.getElementById('iHeroPicker');
  box.innerHTML = `<div style="text-align:center;color:var(--muted);margin-bottom:6px;font-size:12px">${_(D.equip_to)}</div>`;
  const owned = HEROES.filter(h=>state.heroes[h.id]?.owned);
  const row = document.createElement('div');
  row.className='mini-hero-row';
  owned.forEach(h=>{
    const isEq = state.heroes[h.id].equipment && state.heroes[h.id].equipment[it.type]===inv.uid;
    const b = document.createElement('div');
    b.className = 'mini-hero'+(isEq?' active':'');
    b.innerHTML = `<img src="${assetPath('hero',h.id)}"><span>${_(h.name).split(' ')[0]}</span>`;
    b.onclick = ()=>{
      if(isEq) unequipItem(h.id, it.type);
      else equipItem(h.id, inv.uid);
      openItemDetail(inv);
      refreshUI();
    };
    row.appendChild(b);
  });
  box.appendChild(row);
  modal.classList.add('show');
}

function openEquipPicker(slot){
  if(!currentHeroId) return;
  const modal = document.getElementById('itemModal');
  document.getElementById('iImg').src = '';
  document.getElementById('iName').textContent = _(D['type_'+slot]);
  document.getElementById('iRarity').textContent = '';
  document.getElementById('iType').textContent = '';
  document.getElementById('iStats').innerHTML = '';
  document.getElementById('iSig').textContent = '';
  const box = document.getElementById('iHeroPicker');
  box.innerHTML = `<div style="text-align:center;color:var(--gold);margin-bottom:8px">${_(D.pick_item)}</div>`;
  const compat = state.inventory.filter(inv=> itemData(inv.id)?.type===slot);
  if(compat.length===0){
    box.innerHTML += `<div style="text-align:center;color:var(--muted);padding:20px">${_(D.no_items)}</div>`;
  } else {
    const grid = document.createElement('div');
    grid.className = 'mini-item-grid';
    compat.forEach(inv=>{
      const it = itemData(inv.id);
      const b = document.createElement('div');
      b.className = 'mini-item rarity-'+it.rarity;
      b.innerHTML = `<img src="${assetPath('item',inv.id)}"><span>${_(it.name)}</span>`;
      b.onclick = ()=>{
        equipItem(currentHeroId, inv.uid);
        closeModal('itemModal');
        openHero(currentHeroId);
        refreshUI();
      };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    // add unequip option
    if(state.heroes[currentHeroId].equipment && state.heroes[currentHeroId].equipment[slot]){
      const un = document.createElement('button');
      un.className = 'big-btn secondary';
      un.style.marginTop='10px'; un.style.width='100%';
      un.innerHTML = `<span>${_(D.unequip)}</span>`;
      un.onclick = ()=>{ unequipItem(currentHeroId, slot); closeModal('itemModal'); openHero(currentHeroId); refreshUI(); };
      box.appendChild(un);
    }
  }
  modal.classList.add('show');
}

// ---------------- KINGDOM ----------------
function renderKingdom(){
  const c = document.getElementById('buildings');
  c.innerHTML = '';
  BUILDINGS.forEach(b=>{
    const lvl = state.buildings[b.id];
    const cost = Math.floor(b.base * Math.pow(1.5, lvl-1));
    const div = document.createElement('div');
    div.className = 'building';
    div.innerHTML = `
      <div class="b-icon">${b.icon}</div>
      <div class="info">
        <div class="name">${_(b.name)} <span class="lvl-badge">Lv.${lvl}</span></div>
        <div class="desc">${_(b.desc)}</div>
      </div>
      <button class="up-btn" ${state.gold<cost?'disabled':''} onclick="upgradeBuilding('${b.id}')">
        ↑ ${cost}💰
      </button>
    `;
    c.appendChild(div);
  });
}
function upgradeBuilding(id){
  const b = BUILDINGS.find(x=>x.id===id);
  const cost = Math.floor(b.base * Math.pow(1.5, state.buildings[id]-1));
  if(state.gold<cost) return;
  state.gold -= cost;
  state.buildings[id]++;
  save(); refreshUI(); renderKingdom();
  toast(`⬆ ${_(b.name)}!`, 'success');
}

// ---------------- IDLE ----------------
function calcGoldRate(){
  state.goldRate = 100 * (state.buildings.fire_temple||1) * (1 + (state.progress.chapter-1)*0.2 + state.endlessStage*0.05);
}
function updateIdle(){
  calcGoldRate();
  const diff = (Date.now() - state.lastIdle)/1000/3600;
  const cap = state.goldRate * 8; // max 8h
  const earned = Math.min(cap, Math.floor(diff * state.goldRate));
  document.getElementById('idleGold').textContent = earned + ' 💰';
  document.getElementById('goldRate').textContent = Math.floor(state.goldRate) + ' 💰/h';
  document.getElementById('teamPower').textContent = Math.floor(teamPower());
  return earned;
}
function claimIdle(){
  const e = updateIdle();
  state.gold += e;
  state.lastIdle = Date.now();
  toast(`+${e} 💰`, 'success');
  save(); refreshUI();
}

// ---------------- UI ----------------
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.screen===id));
  if(id==='heroes') renderHeroes();
  if(id==='inventory') renderInventory();
  if(id==='kingdom') renderKingdom();
  if(id==='home') refreshHome();
}
function refreshHome(){
  const c = chapterData(state.progress.chapter);
  if(c){
    document.getElementById('chapterName').textContent = _(c.title);
    document.getElementById('stageNum').textContent = `${state.progress.stage+1}/${c.stages.length}`;
    const next = c.stages[state.progress.stage];
    if(next){
      const e = enemyData(next.enemy);
      document.getElementById('nextEnemy').textContent = _(e.name) + (next.boss?' 👑':'');
      document.getElementById('nextEnemyImg').src = assetPath('enemy', next.enemy);
    }
  } else {
    document.getElementById('chapterName').textContent = _(D.endless_mode);
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
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang==='fa'?'rtl':'ltr';
  save(); refreshUI();
  if(document.getElementById('heroes').classList.contains('active')) renderHeroes();
  if(document.getElementById('inventory').classList.contains('active')) renderInventory();
  if(document.getElementById('kingdom').classList.contains('active')) renderKingdom();
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
  deploy:{fa:'اعزام به تیم',en:'Deploy to Team'},
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
};

// ---------------- INIT ----------------
window.addEventListener('DOMContentLoaded', ()=>{
  load();
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang==='fa'?'rtl':'ltr';
  refreshUI();
  renderHeroes();
  // passive gold
  setInterval(()=>{
    calcGoldRate();
    state.gold += state.goldRate/3600;
    document.getElementById('gold').textContent = Math.floor(state.gold);
    if(state.settings.autoSave) save();
  }, 1000);
  // intro voice on first load
  if(!localStorage.getItem('shahnameh_intro_v2')){
    setTimeout(()=>{
      playVoice('intro');
      // show opening story
      const first = CHAPTERS[0];
      showStory(first, 'intro', ()=>{
        state.progress.storyRead['ch1_intro'] = true; save();
      });
      localStorage.setItem('shahnameh_intro_v2','1');
    }, 800);
  }
  // PWA
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

// expose
window.showScreen = showScreen;
window.summon = summon;
window.startCampaign = startCampaign;
window.startEndless = startEndless;
window.toggleAuto = toggleAuto;
window.toggleSpeed = toggleSpeed;
window.claimIdle = claimIdle;
window.toggleLang = toggleLang;
window.openHero = openHero;
window.closeModal = closeModal;
window.upgradeHero = upgradeHero;
window.upgradeBuilding = upgradeBuilding;
window.toggleDeploy = toggleDeploy;
