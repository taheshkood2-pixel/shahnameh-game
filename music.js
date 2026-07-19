// ============================================================
// SHAHNAMEH - PROCEDURAL EPIC PERSIAN BGM (WebAudio)
// Sounds like tar/santoor/daf with drone bass. No file needed.
// ============================================================

let musicCtx = null;
let musicNodes = [];
let musicPlaying = false;
let currentTrack = null;

// Persian scale (Shur / Homayoun influenced): D-Eb-F-G-A-Bb-C
const PERSIAN_SCALE = [146.83, 155.56, 174.61, 196.00, 220.00, 233.08, 261.63]; // D3 to C4
const DRONE_NOTE = 73.42; // D2 - drum drone
const TRACKS = {
  menu:     {tempo: 60, mood: 'peaceful',  bass: true, arpSpeed: 2.0},
  battle:   {tempo: 100, mood: 'epic',     bass: true, arpSpeed: 0.5},
  boss:     {tempo: 130, mood: 'dark',     bass: true, arpSpeed: 0.3},
  victory:  {tempo: 90, mood: 'triumphant', bass: true, arpSpeed: 0.6},
  cinematic:{tempo: 55, mood: 'epic_slow', bass: true, arpSpeed: 2.5},
};

function stopMusic(){
  musicPlaying = false;
  currentTrack = null;
  musicNodes.forEach(n => {
    try{ n.stop(0) }catch(e){}
    try{ n.disconnect() }catch(e){}
  });
  musicNodes = [];
}

function playMusic(trackName){
  if(!state || !state.settings || !state.settings.music) return;
  if(currentTrack === trackName && musicPlaying) return;
  stopMusic();
  currentTrack = trackName;
  musicPlaying = true;
  try{
    musicCtx = musicCtx || new (window.AudioContext||window.webkitAudioContext)();
    if(musicCtx.state === 'suspended') musicCtx.resume();
  }catch(e){ return }
  const track = TRACKS[trackName] || TRACKS.menu;
  scheduleMusic(track);
}

function scheduleMusic(track){
  if(!musicPlaying) return;
  const ctx = musicCtx;
  const now = ctx.currentTime;
  const beat = 60 / track.tempo;
  const barLen = beat * 4;

  // Master gain
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.12, now + 0.5);
  master.connect(ctx.destination);
  musicNodes.push(master);

  // Drone bass (like daf/tabla)
  if(track.bass){
    for(let b = 0; b < 4; b++){
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = DRONE_NOTE;
      g.gain.setValueAtTime(0, now + b*beat);
      g.gain.linearRampToValueAtTime(0.15, now + b*beat + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + b*beat + beat*0.7);
      osc.connect(g); g.connect(master);
      osc.start(now + b*beat);
      osc.stop(now + b*beat + beat);
      musicNodes.push(osc);
    }
  }

  // Melody arpeggios (like tar/santoor)
  const noteInterval = beat * track.arpSpeed;
  const numNotes = Math.floor(barLen / noteInterval);
  let melody = [];
  if(track.mood === 'peaceful' || track.mood === 'epic_slow'){
    melody = [0, 2, 4, 3, 4, 2, 1, 0]; // gentle
  } else if(track.mood === 'epic'){
    melody = [0, 3, 5, 3, 6, 4, 3, 0];
  } else if(track.mood === 'dark'){
    melody = [0, 1, 3, 1, 5, 3, 1, 0]; // menacing
  } else if(track.mood === 'triumphant'){
    melody = [0, 4, 6, 4, 6, 4, 3, 0];
  }

  for(let i = 0; i < numNotes; i++){
    const noteIdx = melody[i % melody.length];
    const freq = PERSIAN_SCALE[noteIdx];
    if(!freq) continue;
    const t = now + i * noteInterval;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // pluck envelope
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.10, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + noteInterval*0.9);
    osc.connect(g); g.connect(master);
    osc.start(t);
    osc.stop(t + noteInterval);
    musicNodes.push(osc);

    // Add harmony octave up (santoor character)
    if(i % 2 === 0){
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.04, t + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.001, t + noteInterval*0.6);
      osc2.connect(g2); g2.connect(master);
      osc2.start(t);
      osc2.stop(t + noteInterval);
      musicNodes.push(osc2);
    }
  }

  // Loop next bar
  setTimeout(()=> {
    if(musicPlaying && currentTrack) scheduleMusic(track);
  }, barLen * 1000 - 50);
}

// Expose
window.playMusic = playMusic;
window.stopMusic = stopMusic;
