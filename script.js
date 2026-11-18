(() => {
'use strict';
const W = 896, H = 448, GY = 410, S = 1.5, C = 128, $ = id => document.getElementById(id);
const cv = $('c'), ctx = cv.getContext('2d');

/* ---------- Mostrar errores en la pantalla de inicio (diagnóstico) ---------- */
window.addEventListener('error', e => {
  const el = $('err');
  if (el) el.textContent = 'ERROR: ' + e.message + ' (línea ' + e.lineno + ')';
});

/* ---------- POSES (sprite sheet generado en un canvas) ----------
   [caderaY, inclinación, manoDelante, manoAtrás, pieDelante, pieAtrás] en celda 128x128 */
const P = {
  idle0:[84,2,[88,62],[80,68],[76,124],[52,124]], idle1:[86,2,[88,66],[80,72],[78,124],[50,124]],
  walk0:[84,3,[84,66],[74,70],[90,124],[42,124]], walk1:[84,3,[78,68],[84,64],[74,112],[58,124]],
  jump:[60,2,[84,40],[76,46],[84,96],[50,92]], duck:[106,6,[88,88],[80,92],[90,124],[44,124]],
  hit:[86,-10,[50,70],[44,76],[76,124],[52,124]], block:[86,0,[84,52],[78,58],[76,124],[52,124]],
  lp:[84,6,[118,56],[78,66],[80,124],[48,124]], mp:[86,10,[124,60],[74,70],[88,124],[44,124]],
  lk:[84,-2,[80,60],[70,66],[112,90],[52,124]], mk:[84,-6,[78,60],[68,66],[120,74],[52,124]],
  had:[94,8,[112,62],[104,66],[92,124],[40,124]], tat:[56,0,[84,36],[44,36],[114,60],[16,64]],
  sho:[62,4,[86,12],[70,40],[80,96],[52,100]], ko:[114,-44,[30,102],[14,98],[104,124],[92,120]]
};
const NAMES = Object.keys(P);
const CH = [
  {gi:'#f4f4f4',hair:'#1c1c1c',band:'#d62828',skin:'#e2a877',glove:'#d62828'},
  {gi:'#c1272d',hair:'#e8c04a',band:null,skin:'#e8b98a',glove:'#f4f4f4'}
];
function limb(g,a,b,w,c){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
function dot(g,p,r,c){g.fillStyle=c;g.beginPath();g.arc(p[0],p[1],r,0,7);g.fill();}
function sprite(g,p,c){
  const [hy,ln,hF,hB,fF,fB]=p, hip=[64,hy], sh=[64+ln,hy-34], hd=[sh[0]+ln/4+3,sh[1]-15];
  limb(g,[sh[0],sh[1]+3],hB,8,c.skin); dot(g,hB,5.5,c.glove);
  limb(g,hip,fB,14,c.gi); dot(g,fB,6,'#222');
  limb(g,hip,sh,24,c.gi); limb(g,[hip[0]-11,hip[1]-3],[hip[0]+11,hip[1]-3],6,'#222');
  limb(g,hip,fF,14,c.gi); dot(g,fF,6.5,'#222');
  dot(g,hd,11,c.skin);
  g.fillStyle=c.hair; g.beginPath(); g.arc(hd[0]-1,hd[1]-2,11.5,Math.PI*1.05,Math.PI*2.05); g.fill();
  if(c.band){g.fillStyle=c.band;g.fillRect(hd[0]-11,hd[1]-6,23,4);g.fillRect(hd[0]-16,hd[1]-5,6,3);}
  dot(g,[hd[0]+5,hd[1]-1],1.6,'#111');
  limb(g,[sh[0],sh[1]+3],hF,9,c.skin); dot(g,hF,6,c.glove);
}
const SHEETS = CH.map(c => {
  const k = document.createElement('canvas'); k.width = C*8; k.height = C*Math.ceil(NAMES.length/8);
  const g = k.getContext('2d');
  NAMES.forEach((n,i) => { g.save(); g.translate((i%8)*C, Math.floor(i/8)*C); g.beginPath(); g.rect(0,0,C,C); g.clip(); sprite(g,P[n],c); g.restore(); });
  return k;
});

/* ---------- ESCENARIO (castillo japonés) ---------- */
const bg = document.createElement('canvas');
bg.width = W; bg.height = H;
(function(){
  const g = bg.getContext('2d');
  let s = g.createLinearGradient(0,0,0,366); s.addColorStop(0,'#27346b'); s.addColorStop(.55,'#d9684f'); s.addColorStop(1,'#f7c873');
  g.fillStyle = s; g.fillRect(0,0,W,H);
  g.fillStyle = '#ffe3a0'; g.beginPath(); g.arc(690,215,58,0,7); g.fill();
  g.fillStyle = '#4a3562'; g.beginPath(); g.moveTo(0,335);
  for(let x=0;x<=W;x+=64) g.lineTo(x,250+Math.sin(x*.013)*40+(x%128?10:-20));
  g.lineTo(W,335); g.fill();
  g.fillStyle = '#d8d0c0'; g.beginPath(); g.moveTo(290,340); g.lineTo(310,262); g.lineTo(590,262); g.lineTo(610,340); g.fill();
  for(let i=0;i<4;i++){
    const w=250-i*52, y=262-i*50, x0=450-w/2, x1=450+w/2;
    g.fillStyle='#f5f0e6'; g.fillRect(x0,y-34,w,34);
    g.fillStyle='#3b2f2f'; for(let k=0;k<w/40;k++) g.fillRect(x0+14+k*40,y-24,14,14);
    g.fillStyle='#2f4256'; g.beginPath(); g.moveTo(x0-22,y-30); g.lineTo(x1+22,y-30); g.lineTo(x1-6,y-56); g.lineTo(x0+6,y-56); g.fill();
  }
  g.fillStyle='#e8b923'; g.fillRect(446,48,8,16);
  for(const tx of [110,800]){
    g.fillStyle='#4a2f22'; g.fillRect(tx-5,268,10,70);
    for(let k=0;k<14;k++){g.fillStyle=k%2?'#f4a6c0':'#f9c6d8';g.beginPath();g.arc(tx+Math.sin(k*2.1)*38,250+Math.cos(k*1.7)*26,22,0,7);g.fill();}
  }
  g.fillStyle='#6b5a4a'; g.fillRect(0,332,W,34);
  g.fillStyle='#4e4033'; for(let x=0;x<W;x+=48) g.fillRect(x,332,3,34);
  s = g.createLinearGradient(0,366,0,H); s.addColorStop(0,'#9a7650'); s.addColorStop(1,'#5b4230');
  g.fillStyle=s; g.fillRect(0,366,W,H-366);
  g.strokeStyle='rgba(40,25,15,.45)'; g.lineWidth=2;
  for(let i=1;i<6;i++){const y=366+i*i*2.2;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  for(let x=-400;x<=1300;x+=90){g.beginPath();g.moveTo(450+(x-450)*.25,366);g.lineTo(x,H);g.stroke();}
})();

/* ---------- AUDIO ---------- */
const BGM_FILE = 'audio/ryu_stage.mp3'; // opcional: pon aquí tu BGM; si no existe se usa música sintetizada
let AC = null, master = null, synthOn = false;
function initAudio(){
  AC = new (window.AudioContext||window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
  if(AC.state === 'suspended') AC.resume();
  const a = new Audio(BGM_FILE); a.loop = true; a.volume = .4; a.onerror = synthBgm;
  const p = a.play(); if(p && p.catch) p.catch(synthBgm);
}
function tone(f0,f1,d,type='square',v=.2,t0=0){
  const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime+t0;
  o.type=type; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+d);
}
function noise(d,v){
  const n=Math.floor(AC.sampleRate*d), buf=AC.createBuffer(1,n,AC.sampleRate), a=buf.getChannelData(0);
  for(let i=0;i<n;i++) a[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(), g=AC.createGain(); g.gain.value=v; s.buffer=buf; s.connect(g); g.connect(master); s.start();
}
function sfx(n){
  if(!AC) return;
  try{
    if(n==='hit'){noise(.15,.5);tone(180,50,.12,'square',.25);}
    else if(n==='block'){tone(900,400,.07,'square',.15);noise(.05,.2);}
    else if(n==='fire'){tone(300,900,.35,'sawtooth',.12);}
    else if(n==='whoosh'){noise(.1,.15);}
  }catch(e){}
}
function voice(t){
  if(!AC||!('speechSynthesis' in window)) return;
  try{
    const u=new SpeechSynthesisUtterance(t); u.lang='ja-JP'; u.pitch=.5; u.rate=1.1;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}
function synthBgm(){
  if(synthOn||!AC) return; synthOn = true;
  const sc=[293.66,329.63,392,440,493.88,587.33], pat=[0,2,3,2,4,3,2,1,0,2,3,5,4,3,2,1]; let i=0;
  setInterval(()=>{
    try{
      const f=sc[pat[i%16]]; tone(f,f*.99,.35,'triangle',.14);
      if(i%4===0) tone(73.4,73.4,.5,'sine',.25);
      if(i%8===0) noise(.12,.25);
    }catch(e){}
    i++;
  },230);
}

/* ---------- INPUT ---------- */
const KEYS = [
  {u:'KeyW',l:'KeyA',d:'KeyS',r:'KeyD',lp:'KeyU',mp:'KeyI',lk:'KeyJ',mk:'KeyK'},
  {u:'ArrowUp',l:'ArrowLeft',d:'ArrowDown',r:'ArrowRight',lp:'Numpad4',mp:'Numpad5',lk:'Numpad1',mk:'Numpad2'}
];
const down = new Set(), BTN = ['lp','mp','lk','mk'];
const mapped = new Set(KEYS.flatMap(k => Object.values(k)).concat(['Enter','KeyH']));

/* ---------- LUCHADORES ---------- */
// b = [offsetX, alturaSuperior, ancho, alto] respecto al suelo; a = frames activos
const MV = {
  lp:{d:18,a:[4,9],dmg:4,b:[25,128,62,24],pose:'lp',hs:16},
  mp:{d:26,a:[6,13],dmg:7,b:[25,130,78,26],pose:'mp',hs:20},
  lk:{d:22,a:[5,11],dmg:5,b:[25,78,78,30],pose:'lk',hs:17},
  mk:{d:30,a:[7,15],dmg:8,b:[25,95,92,34],pose:'mk',hs:22},
  had:{d:44,fire:16,pose:'had'},
  tat:{d:54,a:[6,50],dmg:5,sc:2,b:[-60,130,120,100],pose:'tat',hs:22},
  sho:{d:50,a:[3,22],dmg:11,sc:3,b:[10,210,70,150],pose:'sho',hs:40,inv:9,g:.65,heavy:true}
};
const mkF = (i,x) => ({i,x,y:GY,vx:0,vy:0,face:i?-1:1,hp:100,move:null,mt:0,hit:false,hs:0,bs:0,duck:false,block:false,ko:false,inv:false,str:0,t:0,buf:[],wins:0,k:KEYS[i]});
const players = [mkF(0,260), mkF(1,636)];
const op = f => players[1-f.i];
let state='idle', sT=0, round=1, fb=[], sp=[], T=0, debug=false, running=false, lastBanner='';

addEventListener('keydown', e => {
  if(mapped.has(e.code)) e.preventDefault();
  if(e.repeat) return;
  if(e.code==='Enter' && !running){ startGame(); return; }
  down.add(e.code);
  if(e.code==='KeyH') debug = !debug;
  if(e.code==='Enter' && state==='end') reset(true);
  if(!running) return;
  players.forEach(f => BTN.forEach(b => { if(e.code===f.k[b]) press(f,b); }));
});
addEventListener('keyup', e => down.delete(e.code));
addEventListener('blur', () => down.clear());

function banner(t){ if(t!==lastBanner){ $('banner').innerHTML=t; lastBanner=t; } }
function reset(full){
  if(full){ players.forEach(p=>p.wins=0); round=1; }
  players.forEach((p,i)=>Object.assign(p,{x:i?636:260,y:GY,vx:0,vy:0,face:i?-1:1,hp:100,move:null,mt:0,hit:false,hs:0,bs:0,duck:false,block:false,ko:false,inv:false,buf:[]}));
  fb=[]; sp=[]; state='intro'; sT=110;
}
function match(buf,seq){ let i=0; for(const e of buf){ if(seq[i].includes(e.t)) i++; if(i===seq.length) return true; } return false; }
function ready(f){ return state==='fight' && !f.ko && f.hs<=0 && f.bs<=0 && !f.move; }
function press(f,b){
  if(!ready(f)) return;
  const last = f.buf.length ? f.buf[f.buf.length-1].t : 'N', punch = b[1]==='p';
  f.str = (b==='mp'||b==='mk') ? 1 : 0;
  let m = b;
  if(f.y>=GY){
    if(punch){
      if(last==='DF' && match(f.buf,[['F'],['D'],['DF']])) m='sho';
      else if((last==='F'||last==='DF') && match(f.buf,[['D'],['DF','F']])) m='had';
    } else if((last==='B'||last==='DB') && match(f.buf,[['D'],['DB','B']])) m='tat';
  }
  if(m!==b) f.buf.length = 0;
  start(f,m);
}
function start(f,n){
  const m = MV[n]; f.move=m; f.mt=0; f.hit=false;
  if(f.y>=GY) f.vx=0;
  if(n==='sho'){ f.vy=-13; f.vx=3*f.face; voice('Shoryuken!'); sfx('whoosh'); }
  else if(n==='had'){ voice('Hadouken!'); }
  else if(n==='tat'){ voice('Tatsumaki!'); sfx('whoosh'); }
  else sfx('whoosh');
}
function upd(f,o){
  f.t++;
  const k=f.k, L=down.has(k.l), R=down.has(k.r), U=down.has(k.u), D=down.has(k.d), gr=f.y>=GY, m=f.move;
  const can = state==='fight' && !f.ko && f.hs<=0 && f.bs<=0 && !m;
  if(gr && !m && f.hs<=0 && !f.ko) f.face = o.x>=f.x ? 1 : -1;
  const fw = f.face===1?R:L, bk = f.face===1?L:R;
  const tok = D ? (fw?'DF':bk?'DB':'D') : fw?'F' : bk?'B' : 'N';
  const now = performance.now(), b = f.buf;
  if(!b.length || b[b.length-1].t!==tok) b.push({t:tok,ms:now}); else b[b.length-1].ms=now;
  while(b.length && now-b[0].ms>500) b.shift();      // buffer de 500 ms
  const free = !m && f.hs<=0 && !f.ko;
  f.duck = gr && D && free;
  f.block = gr && bk && free;
  if(can && gr){
    f.vx = f.duck ? 0 : ((fw?3.4:0)-(bk?2.6:0))*f.face;
    if(U) f.vy = -15;
  } else if(gr && !m) f.vx *= .85;
  if(m){
    f.mt++; f.inv = !!m.inv && f.mt<m.inv;
    if(m===MV.had && f.mt===m.fire){ fb.push({x:f.x+f.face*55,y:f.y-95,vx:(6+2*f.str)*f.face,o:f,dm:9+3*f.str}); sfx('fire'); }
    if(m===MV.tat){ if(gr) f.vx=f.face*(4+1.5*f.str); if(f.mt%13===0) f.hit=false; }
    if(f.mt>=m.d){ f.move=null; f.inv=false; if(gr) f.vx=0; }
  } else f.inv=false;
  if(f.hs>0) f.hs--;
  if(f.bs>0) f.bs--;
  f.x += f.vx; f.vy += (m&&m.g)||.8; f.y += f.vy;
  if(f.y>=GY){ f.y=GY; if(f.vy>0){ f.vy=0; if(f.move===MV.sho){ f.move=null; f.inv=false; f.vx=0; } } }
  f.x = Math.max(50,Math.min(W-50,f.x));
}
const overlap = (a,b) => a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
function hurt(f){ const h = f.y<GY ? 130 : f.duck ? 95 : 150; return {x:f.x-30,y:f.y-h,w:60,h}; }
function hitbox(f){ const b=f.move.b; return {x:f.face===1?f.x+b[0]:f.x-b[0]-b[2], y:f.y-b[1], w:b[2], h:b[3]}; }
function strike(d,dmg,hs,dir,heavy,px,py){
  if(d.inv || d.ko) return false;
  if(d.block){ d.hp -= Math.max(1,Math.round(dmg*.2)); d.bs=12; d.vx=dir*3; sfx('block'); sp.push({x:px,y:py,l:10,c:'#8cf'}); }
  else { d.hp -= dmg; d.hs=hs; d.vx=dir*(heavy?5:3); d.move=null; d.mt=0; d.inv=false; if(heavy) d.vy=-9; sfx('hit'); sp.push({x:px,y:py,l:12,c:'#ff6'}); }
  if(d.hp<=0){ d.hp=0; d.ko=true; d.move=null; d.vy=-8; d.vx=dir*4; }
  return true;
}
function update(){
  T++;
  if(state==='intro'){ sT--; banner(sT>45 ? 'ROUND '+round : '¡FIGHT!'); if(sT<=0){ state='fight'; banner(''); } }
  players.forEach(p => upd(p,op(p)));
  const [a,b] = players;                                  // empuje entre personajes
  if(a.y>=GY-5 && b.y>=GY-5 && Math.abs(a.x-b.x)<56){
    const ov=(56-Math.abs(a.x-b.x))/2, s=a.x<=b.x?1:-1;
    a.x -= s*ov; b.x += s*ov;
  }
  for(const f of players){                                // golpes cuerpo a cuerpo
    const m=f.move; if(!m||!m.a||f.hit||f.mt<m.a[0]||f.mt>m.a[1]) continue;
    const hb=hitbox(f), d=op(f);
    if(overlap(hb,hurt(d))){
      f.hit = true;
      strike(d, m.dmg+f.str*(m.sc||0), m.hs, f.face, !!m.heavy, hb.x+hb.w/2, hb.y+hb.h/2);
    }
  }
  for(const p of fb){                                     // proyectiles
    p.x += p.vx; const d=op(p.o);
    if(overlap({x:p.x-22,y:p.y-22,w:44,h:44},hurt(d)) && strike(d,p.dm,26,Math.sign(p.vx),false,p.x,p.y)) p.dead=true;
    if(p.x<-60||p.x>W+60) p.dead=true;
  }
  if(fb.length>1) for(let i=0;i<fb.length;i++) for(let j=i+1;j<fb.length;j++)
    if(fb[i].o!==fb[j].o && Math.abs(fb[i].x-fb[j].x)<44 && Math.abs(fb[i].y-fb[j].y)<44){ fb[i].dead=fb[j].dead=true; sp.push({x:fb[i].x,y:fb[i].y,l:12,c:'#fff'}); }
  fb = fb.filter(p=>!p.dead);
  sp.forEach(s=>s.l--); sp = sp.filter(s=>s.l>0);
  if(state==='fight' && (a.ko||b.ko)){
    state='ko'; sT=170; players.forEach(p=>{ if(op(p).ko) p.wins++; }); banner('K.O.');
  } else if(state==='ko' && --sT<=0){
    if(players.some(p=>p.wins>=2)){
      const t = (a.wins>=2&&b.wins>=2) ? 'EMPATE' : a.wins>=2 ? 'RYU GANA' : 'KEN GANA';
      state='end'; banner(t+'<small>PULSA ENTER</small>');
    } else { round++; reset(false); }
  }
  players.forEach((p,i)=>{
    $('h'+(i+1)).style.width = p.hp+'%';
    [...$('d'+(i+1)).children].forEach((el,j)=>el.classList.toggle('on',p.wins>j));
  });
}

/* ---------- RENDER ---------- */
function poseOf(f){
  if(f.ko) return 'ko';
  if(f.hs>0) return 'hit';
  if(f.move) return f.move.pose;
  if(f.y<GY) return 'jump';
  if(f.duck) return 'duck';
  if(f.bs>0||f.block) return 'block';
  if(Math.abs(f.vx)>.5) return ((f.t>>3)&1) ? 'walk1' : 'walk0';
  return ((f.t>>4)&1) ? 'idle1' : 'idle0';
}
function stage(){
  ctx.drawImage(bg,0,0);
  ctx.fillStyle='rgba(255,255,255,.35)';
  for(let i=0;i<3;i++){ const x=((T*.15+i*330)%(W+300))-150; ctx.beginPath(); ctx.ellipse(x,70+i*30,90,16,0,0,7); ctx.fill(); }
  for(const px of [150,746]){                              // banderas animadas
    ctx.fillStyle='#3a2a1f'; ctx.fillRect(px,200,4,140);
    ctx.fillStyle='#c1121f'; ctx.beginPath(); ctx.moveTo(px+4,205);
    for(let y=0;y<=40;y+=8) ctx.lineTo(px+4+46+Math.sin(T*.12+y*.2)*8,205+y*.9);
    ctx.lineTo(px+4,245); ctx.fill();
  }
  const cols=['#2d6a4f','#e07a5f','#3d5a80','#f2cc8f','#6d597a'];
  for(let i=0;i<42;i++){                                   // público animado
    const x=10+i*22, bob=Math.abs(Math.sin(T*.12+i*1.7))*(state==='ko'?9:4);
    ctx.fillStyle=cols[i%5]; ctx.fillRect(x-7,350-bob,14,16);
    ctx.fillStyle='#e8b98a'; ctx.beginPath(); ctx.arc(x,344-bob,6,0,7); ctx.fill();
  }
}
function render(){
  stage();
  for(const f of players){
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(f.x,GY+2,45-(GY-f.y)*.1,10,0,0,7); ctx.fill();
    const idx = NAMES.indexOf(poseOf(f));
    ctx.save(); ctx.translate(f.x,f.y);
    if(f.face===-1) ctx.scale(-1,1);
    if(f.move===MV.tat){ ctx.translate(0,-70); ctx.rotate(f.mt*.5); ctx.translate(0,70); }
    ctx.drawImage(SHEETS[f.i],(idx%8)*C,Math.floor(idx/8)*C,C,C,-64*S,-124*S,C*S,C*S);
    ctx.restore();
  }
  for(const p of fb){
    const g=ctx.createRadialGradient(p.x,p.y,2,p.x,p.y,30);
    g.addColorStop(0,'#fff'); g.addColorStop(.4,'#7cf'); g.addColorStop(1,'rgba(40,100,255,0)');
    ctx.globalAlpha=.5; ctx.fillStyle='#4af'; ctx.beginPath(); ctx.ellipse(p.x-p.vx*3,p.y,32,12,0,0,7); ctx.fill();
    ctx.globalAlpha=1; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,28+Math.sin(T*.6)*3,0,7); ctx.fill();
  }
  for(const s of sp){
    const r=(12-s.l)*3+6; ctx.strokeStyle=s.c; ctx.lineWidth=3;
    for(let a=0;a<8;a++){ ctx.beginPath(); ctx.moveTo(s.x+Math.cos(a*.785)*r*.4,s.y+Math.sin(a*.785)*r*.4); ctx.lineTo(s.x+Math.cos(a*.785)*r,s.y+Math.sin(a*.785)*r); ctx.stroke(); }
  }
  if(debug) for(const f of players){
    const h=hurt(f); ctx.lineWidth=2; ctx.strokeStyle='#0f0'; ctx.strokeRect(h.x,h.y,h.w,h.h);
    if(f.move&&f.move.a&&f.mt>=f.move.a[0]&&f.mt<=f.move.a[1]){ const x=hitbox(f); ctx.strokeStyle='#f00'; ctx.strokeRect(x.x,x.y,x.w,x.h); }
  }
}

/* ---------- BUCLE PRINCIPAL ---------- */
let last = performance.now(), acc = 0;
function loop(now){
  requestAnimationFrame(loop);                 // se reprograma primero: un error no detiene el juego
  acc += Math.min(now-last,100); last = now;
  while(acc>=16.667){ if(running) update(); acc-=16.667; }
  render();
}

/* ---------- INICIO ---------- */
function startGame(){
  if(running) return;
  try{ initAudio(); }catch(e){ console.warn('Audio no disponible:', e); }
  $('start').style.display = 'none';
  running = true;
  reset(true);
}
$('btn').addEventListener('click', startGame);
requestAnimationFrame(loop);
})();
