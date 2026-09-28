import { randomUUID } from 'crypto'

const LUDO_HTML = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;min-height:100%}
body{background:radial-gradient(circle at 50% -10%,#1e2a4a 0%,#0a1220 50%,#050810 100%);padding:8px;color:#eef4ff;overflow-y:auto}
#app{max-width:420px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:2px 2px 8px;gap:8px}
.tt{font:900 18px 'Arial Black';color:#ffd966;text-shadow:0 0 14px #ffd96655;letter-spacing:1px}
.tt small{display:block;font:700 6.5px Arial;letter-spacing:2px;color:#93a6c9;text-shadow:none}
.mbtn{width:34px;height:34px;border:2px solid rgba(255,217,102,.28);border-radius:9px;background:rgba(0,0,0,.34);color:#fff;font-size:15px;cursor:pointer;touch-action:none}
.mbtn:active{filter:brightness(1.45);transform:scale(.96)}
.players{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;margin-bottom:8px}
.pcard{background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.1);border-radius:9px;padding:5px 4px;text-align:center;transition:all .25s}
.pcard.active{transform:scale(1.05)}
.pcard .pname{font:800 8px Arial;letter-spacing:.5px;margin-bottom:2px}
.pcard .phome{font:900 12px 'Arial Black';color:#fff}
.pcard.red{border-color:#ef4444}.pcard.green{border-color:#22c55e}
.pcard.yellow{border-color:#eab308}.pcard.blue{border-color:#3b82f6}
.pcard.red.active{background:rgba(239,68,68,.35);box-shadow:0 0 12px #ef444488}
.pcard.green.active{background:rgba(34,197,94,.35);box-shadow:0 0 12px #22c55e88}
.pcard.yellow.active{background:rgba(234,179,8,.35);box-shadow:0 0 12px #eab30888}
.pcard.blue.active{background:rgba(59,130,246,.35);box-shadow:0 0 12px #3b82f688}
.pcard .pname.red{color:#ff6b6b}.pcard .pname.green{color:#4ade80}
.pcard .pname.yellow{color:#facc15}.pcard .pname.blue{color:#60a5fa}
.gw{position:relative;border:2px solid rgba(255,255,255,.15);border-radius:14px;overflow:hidden;background:#050810;box-shadow:0 0 22px rgba(0,0,0,.5);margin-bottom:8px}
canvas{width:100%;display:block;touch-action:none;aspect-ratio:1/1}
.diceRow{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}
.btn{height:48px;border:2px solid rgba(255,255,255,.16);border-radius:12px;font:900 13px Arial;color:#fff;cursor:pointer;touch-action:none;box-shadow:0 4px 0 rgba(0,0,0,.45);background:linear-gradient(#344466,#18223a);transition:transform .1s}
.btn:active{transform:translateY(3px);box-shadow:none;filter:brightness(1.35)}
.btn:disabled{opacity:.4;filter:grayscale(1)}
.btn.roll{background:linear-gradient(#f59e0b,#b45309);font-size:15px}
.btn.new{background:linear-gradient(#7c3aed,#4c1d95)}
.dice{display:flex;align-items:center;justify-content:center;height:48px;background:rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.2);border-radius:12px;font:900 26px 'Arial Black';color:#ffd966}
.dice.rolling{animation:roll .4s infinite}
@keyframes roll{0%{transform:rotate(0) scale(1)}25%{transform:rotate(90deg) scale(.9)}50%{transform:rotate(180deg) scale(1.1)}75%{transform:rotate(270deg) scale(.9)}100%{transform:rotate(360deg) scale(1)}}
.hint{text-align:center;font:600 11px Arial;color:#a0b3d0;margin-top:4px;line-height:1.5;min-height:32px;padding:0 4px}
.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-80px);background:rgba(0,0,0,.85);border:2px solid #ffd966;color:#ffd966;font:800 13px Arial;padding:10px 20px;border-radius:10px;z-index:100;opacity:0;transition:all .3s;pointer-events:none;box-shadow:0 8px 32px rgba(0,0,0,.5);max-width:90%}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
</style>
<div id="app">
  <div class="hdr">
    <div class="tt">🎲 LUDO 4 PLAYER<small>CLASSIC BOARD · MOBILE EDITION</small></div>
    <button class="mbtn" id="muteB">🔊</button>
  </div>
  <div class="players" id="playersEl"></div>
  <div class="gw"><canvas id="cv"></canvas></div>
  <div class="diceRow">
    <div class="dice" id="diceEl">-</div>
    <button class="btn roll" id="rollB">🎲 ROLL</button>
  </div>
  <button class="btn new" id="newB" style="width:100%">♻ NEW GAME</button>
  <div class="hint" id="hintEl">Tekan ROLL untuk melempar dadu. Tap token untuk memilih, tap tujuan untuk bergerak.</div>
  <div class="toast" id="toastEl"></div>
</div>
<script>
(function(){
'use strict';
window.onerror=function(m,s,l){var e=document.getElementById('hintEl');if(e){e.textContent='⚠ '+m+' @'+l;e.style.color='#ff7a8a'}};

var CELL=26,N=15,BOARD_PX=CELL*N;

var RING=[
  [6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0],
  [6,0]
];

var SAFE={0:1,8:1,13:1,21:1,26:1,34:1,39:1,47:1};

var PLAYERS=[
  {name:'RED',color:'#ef4444',dark:'#7f1d1d',light:'#fca5a5',start:0,
    homeCol:[[7,1],[7,2],[7,3],[7,4],[7,5]],
    base:[[1.5,1.5],[1.5,3.5],[3.5,1.5],[3.5,3.5]],
    baseArea:[0,0,6,6]},
  {name:'GREEN',color:'#22c55e',dark:'#14532d',light:'#86efac',start:13,
    homeCol:[[1,7],[2,7],[3,7],[4,7],[5,7]],
    base:[[1.5,10.5],[1.5,12.5],[3.5,10.5],[3.5,12.5]],
    baseArea:[0,9,6,15]},
  {name:'YELLOW',color:'#eab308',dark:'#713f12',light:'#fde047',start:26,
    homeCol:[[7,13],[7,12],[7,11],[7,10],[7,9]],
    base:[[10.5,10.5],[10.5,12.5],[12.5,10.5],[12.5,12.5]],
    baseArea:[9,9,15,15]},
  {name:'BLUE',color:'#3b82f6',dark:'#1e3a8a',light:'#93c5fd',start:39,
    homeCol:[[13,7],[12,7],[11,7],[10,7],[9,7]],
    base:[[10.5,1.5],[10.5,3.5],[12.5,1.5],[12.5,3.5]],
    baseArea:[9,0,15,6]}
];

var FINISH_PROGRESS=56;
var cv,ctx,DPR=1,state=null,anim=0,muted=false,AC=null;

function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}try{if(AC.state==='suspended')AC.resume()}catch(e){}return AC}
function tone(f,d,type,v,delay){var a=audio();if(!a||muted)return;try{var t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(v||.07,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function sMove(){tone(580,.08,'triangle',.08)}
function sCapture(){tone(220,.1,'square',.09);tone(130,.16,'triangle',.06,.05)}
function sRoll(){tone(880,.05,'square',.06)}
function sHome(){tone(660,.1,'sine',.08);tone(880,.12,'sine',.07,.08);tone(1320,.2,'sine',.06,.18)}
function sWin(){[523,659,784,1047].forEach(function(f,i){tone(f,.2,'triangle',.08,i*.15)})}

function newGame(){
  state={turn:0,tokens:[[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]],
    dice:0,diceRolled:false,selected:null,validMoves:[],gameOver:false,winner:null,
    sixCount:0,finished:[0,0,0,0]};
  updateHUD();
  hint('Giliran RED · Tekan ROLL untuk melempar dadu');
}

function getRingIdx(player,progress){return (PLAYERS[player].start+progress)%52}

function validMovesFor(player,dice){
  var moves=[],tokens=state.tokens[player];
  for(var i=0;i<4;i++){
    var p=tokens[i];
    if(p===FINISH_PROGRESS)continue;
    if(p===-1){
      if(dice===6){
        var startRing=PLAYERS[player].start;
        var ownBlock=false;
        for(var j=0;j<4;j++){
          if(j===i)continue;
          var t=tokens[j];
          if(t>=0&&t<=50&&getRingIdx(player,t)===startRing){ownBlock=true;break}
        }
        if(!ownBlock)moves.push({idx:i,newProgress:0});
      }
    }else{
      var np=p+dice;
      if(np>FINISH_PROGRESS)continue;
      var ok=true;
      if(np<=50){
        var destRing=getRingIdx(player,np);
        for(var k=0;k<4;k++){
          if(k===i)continue;
          var t2=tokens[k];
          if(t2>=0&&t2<=50&&getRingIdx(player,t2)===destRing){ok=false;break}
        }
      }
      if(ok)moves.push({idx:i,newProgress:np});
    }
  }
  return moves;
}

function rollDice(){
  if(state.gameOver||state.diceRolled)return;
  sRoll();
  document.getElementById('diceEl').classList.add('rolling');
  setTimeout(function(){
    document.getElementById('diceEl').classList.remove('rolling');
    var d=1+Math.floor(Math.random()*6);
    state.dice=d;state.diceRolled=true;
    document.getElementById('diceEl').textContent='⚀⚁⚂⚃⚄⚅'.charAt(d-1);
    if(d===6){state.sixCount++}else{state.sixCount=0}
    var moves=validMovesFor(state.turn,d);
    state.validMoves=moves;
    if(moves.length===0){
      hint('🎲 '+d+' · Tidak ada langkah valid. Turn dilewatkan.');
      setTimeout(nextTurn,1200);
      return;
    }
    if(moves.length===1){
      setTimeout(function(){doMove(moves[0])},400);
      return;
    }
    hint('🎲 '+d+' · Tap token untuk memindahkan ('+moves.length+' pilihan)');
    draw();
  },400);
}

function doMove(move){
  var player=state.turn;
  var toProgress=move.newProgress;
  var diceWas=state.dice;
  state.tokens[player][move.idx]=toProgress;
  var captured=false;
  if(toProgress>=0&&toProgress<=50){
    var destRing=getRingIdx(player,toProgress);
    if(!SAFE[destRing]){
      for(var op=0;op<4;op++){
        if(op===player)continue;
        for(var oi=0;oi<4;oi++){
          var op2=state.tokens[op][oi];
          if(op2>=0&&op2<=50&&getRingIdx(op,op2)===destRing){
            state.tokens[op][oi]=-1;captured=true;
          }
        }
      }
    }
  }
  var reachedHome=toProgress===FINISH_PROGRESS;
  if(reachedHome){state.finished[player]++;sHome();toast('🎯 '+PLAYERS[player].name+' mencetak token ke-'+state.finished[player]+'!')}
  else if(captured){sCapture();toast('💥 CAPTURE!')}
  else{sMove()}
  state.selected=null;state.validMoves=[];state.diceRolled=false;state.dice=0;
  document.getElementById('diceEl').textContent='-';
  updateHUD();draw();
  if(state.finished[player]===4){
    state.gameOver=true;state.winner=player;sWin();
    toast('🏆 '+PLAYERS[player].name+' MENANG!');
    hint('🏆 '+PLAYERS[player].name+' MENANG! Tekan NEW GAME untuk main lagi.');
    return;
  }
  var extraTurn=diceWas===6||captured||reachedHome;
  if(extraTurn){
    hint('Giliran '+PLAYERS[player].name+' lagi (bonus). Tekan ROLL.');
  }else{
    setTimeout(nextTurn,400);
  }
}

function nextTurn(){
  state.turn=(state.turn+1)%4;
  state.dice=0;state.diceRolled=false;state.selected=null;
  state.validMoves=[];state.sixCount=0;
  document.getElementById('diceEl').textContent='-';
  updateHUD();draw();
  hint('Giliran '+PLAYERS[state.turn].name+' · Tekan ROLL');
}

function updateHUD(){
  var el=document.getElementById('playersEl');
  var html='';
  for(var i=0;i<4;i++){
    var p=PLAYERS[i];
    var active=(i===state.turn&&!state.gameOver)?'active':'';
    var cls=p.name.toLowerCase();
    html+='<div class="pcard '+cls+' '+active+'">';
    html+='<div class="pname '+cls+'">'+p.name+'</div>';
    html+='<div class="phome">'+state.finished[i]+'/4</div>';
    html+='</div>';
  }
  el.innerHTML=html;
  document.getElementById('rollB').disabled=state.diceRolled||state.gameOver;
}

function hint(msg){document.getElementById('hintEl').textContent=msg}
var toastTO;
function toast(msg){
  var el=document.getElementById('toastEl');
  el.textContent=msg;el.classList.add('show');
  clearTimeout(toastTO);
  toastTO=setTimeout(function(){el.classList.remove('show')},1800);
}

function cellCenter(r,c){return [c*CELL+CELL/2,r*CELL+CELL/2]}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}

function drawBoard(){
  var bg=ctx.createLinearGradient(0,0,0,BOARD_PX);
  bg.addColorStop(0,'#1a2338');bg.addColorStop(1,'#0a1020');
  ctx.fillStyle=bg;ctx.fillRect(0,0,BOARD_PX,BOARD_PX);

  for(var pi=0;pi<4;pi++){
    var p=PLAYERS[pi];
    var a=p.baseArea;
    var x=a[1]*CELL,y=a[0]*CELL,w=(a[3]-a[1])*CELL,h=(a[2]-a[0])*CELL;
    ctx.fillStyle=p.dark;ctx.fillRect(x,y,w,h);
    var pad=CELL*0.55;
    ctx.fillStyle=p.color;
    roundRect(x+pad,y+pad,w-2*pad,h-2*pad,10);ctx.fill();
    ctx.fillStyle='#f8f4e8';
    roundRect(x+pad+5,y+pad+5,w-2*pad-10,h-2*pad-10,7);ctx.fill();
    for(var si=0;si<4;si++){
      var b=p.base[si];
      var cx=b[1]*CELL+CELL/2,cy=b[0]*CELL+CELL/2;
      ctx.beginPath();ctx.arc(cx,cy,CELL*0.36,0,Math.PI*2);
      ctx.fillStyle=p.color;ctx.fill();
      ctx.strokeStyle=p.dark;ctx.lineWidth=1.5;ctx.stroke();
    }
  }

  ctx.fillStyle='#f5ecd7';
  ctx.fillRect(6*CELL,0,3*CELL,6*CELL);
  ctx.fillRect(6*CELL,9*CELL,3*CELL,6*CELL);
  ctx.fillRect(0,6*CELL,6*CELL,3*CELL);
  ctx.fillRect(9*CELL,6*CELL,6*CELL,3*CELL);
  ctx.fillRect(6*CELL,6*CELL,3*CELL,3*CELL);

  ctx.strokeStyle='rgba(80,60,30,.35)';ctx.lineWidth=.5;
  for(var i=0;i<RING.length;i++){
    var rc=RING[i];
    ctx.strokeRect(rc[1]*CELL+.5,rc[0]*CELL+.5,CELL-1,CELL-1);
  }

  for(var pj=0;pj<4;pj++){
    var pl=PLAYERS[pj];
    for(var hj=0;hj<pl.homeCol.length;hj++){
      var hc=pl.homeCol[hj];
      ctx.fillStyle=pl.color;ctx.fillRect(hc[1]*CELL,hc[0]*CELL,CELL,CELL);
      ctx.strokeStyle=pl.dark;ctx.lineWidth=1;
      ctx.strokeRect(hc[1]*CELL+.5,hc[0]*CELL+.5,CELL-1,CELL-1);
    }
  }

  var cx0=7.5*CELL,cy0=7.5*CELL,hs=1.5*CELL;
  var tris=[
    {col:PLAYERS[0].color,pts:[[cx0-hs,cy0-hs],[cx0+hs,cy0-hs],[cx0,cy0]]},
    {col:PLAYERS[1].color,pts:[[cx0+hs,cy0-hs],[cx0+hs,cy0+hs],[cx0,cy0]]},
    {col:PLAYERS[2].color,pts:[[cx0-hs,cy0+hs],[cx0+hs,cy0+hs],[cx0,cy0]]},
    {col:PLAYERS[3].color,pts:[[cx0-hs,cy0-hs],[cx0-hs,cy0+hs],[cx0,cy0]]}
  ];
  for(var ti=0;ti<4;ti++){
    var t=tris[ti];
    ctx.beginPath();ctx.moveTo(t.pts[0][0],t.pts[0][1]);
    ctx.lineTo(t.pts[1][0],t.pts[1][1]);ctx.lineTo(t.pts[2][0],t.pts[2][1]);
    ctx.closePath();ctx.fillStyle=t.col;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.5;ctx.stroke();
  }

  ctx.font=(CELL*0.72)+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='rgba(255,200,50,.55)';
  for(var sk in SAFE){
    var sIdx=parseInt(sk,10),sr=RING[sIdx];
    var sc=cellCenter(sr[0],sr[1]);
    ctx.fillText('★',sc[0],sc[1]+1);
  }

  ctx.strokeStyle='rgba(255,220,150,.5)';ctx.lineWidth=2;
  ctx.strokeRect(1,1,BOARD_PX-2,BOARD_PX-2);
}

function drawToken(cx,cy,player,radius,selected){
  var p=PLAYERS[player];
  ctx.beginPath();ctx.arc(cx+1,cy+2,radius,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
  var g=ctx.createRadialGradient(cx-radius*.3,cy-radius*.3,radius*.1,cx,cy,radius);
  g.addColorStop(0,p.light);g.addColorStop(.7,p.color);g.addColorStop(1,p.dark);
  ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();ctx.arc(cx-radius*.3,cy-radius*.35,radius*.35,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
  ctx.strokeStyle=selected?'#ffd966':p.dark;ctx.lineWidth=selected?3:1.5;ctx.stroke();
  if(selected){
    ctx.beginPath();ctx.arc(cx,cy,radius+4,0,Math.PI*2);
    ctx.strokeStyle='#ffd966';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawTokens(){
  var cellMap={},baseTokens=[[],[],[],[]];
  for(var p=0;p<4;p++){
    for(var i=0;i<4;i++){
      var prog=state.tokens[p][i];
      if(prog===-1){baseTokens[p].push(i);continue}
      var cell;
      if(prog===FINISH_PROGRESS)cell=[7,7];
      else if(prog<=50)cell=RING[getRingIdx(p,prog)];
      else cell=PLAYERS[p].homeCol[prog-51];
      var key=cell[0]+','+cell[1];
      if(!cellMap[key])cellMap[key]=[];
      cellMap[key].push({p:p,i:i,cell:cell});
    }
  }
  for(var bp=0;bp<4;bp++){
    for(var bi=0;bi<baseTokens[bp].length;bi++){
      var bIdx=baseTokens[bp][bi];
      var bpos=PLAYERS[bp].base[bIdx];
      var bcx=bpos[1]*CELL+CELL/2,bcy=bpos[0]*CELL+CELL/2;
      drawToken(bcx,bcy,bp,CELL*0.34,false);
    }
  }
  for(var key2 in cellMap){
    var list=cellMap[key2],cc=list[0].cell,cCtr=cellCenter(cc[0],cc[1]);
    for(var li=0;li<list.length;li++){
      var tk=list[li],dx=0,dy=0;
      if(list.length>1){
        var ang=(li/list.length)*Math.PI*2-Math.PI/2;
        var rad=CELL*0.18;
        dx=Math.cos(ang)*rad;dy=Math.sin(ang)*rad;
      }
      var isSel=state.selected&&state.selected.p===tk.p&&state.selected.i===tk.i;
      drawToken(cCtr[0]+dx,cCtr[1]+dy,tk.p,list.length>1?CELL*0.22:CELL*0.32,isSel);
    }
  }
}

function drawValidMoves(){
  if(!state.validMoves.length||state.selected===null)return;
  var p=state.turn;
  for(var mi=0;mi<state.validMoves.length;mi++){
    var mv=state.validMoves[mi];
    if(mv.idx!==state.selected.i)continue;
    var np=mv.newProgress,cell;
    if(np===FINISH_PROGRESS)cell=[7,7];
    else if(np<=50)cell=RING[getRingIdx(p,np)];
    else cell=PLAYERS[p].homeCol[np-51];
    var cc=cellCenter(cell[0],cell[1]);
    var pulse=.5+.5*Math.sin(anim*.15);
    ctx.beginPath();ctx.arc(cc[0],cc[1],CELL*0.45,0,Math.PI*2);
    ctx.fillStyle='rgba(255,217,102,'+(0.2+pulse*0.3)+')';ctx.fill();
    ctx.strokeStyle='rgba(255,217,102,'+(0.7+pulse*0.3)+')';ctx.lineWidth=2;ctx.stroke();
  }
}

function draw(){
  anim++;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,BOARD_PX,BOARD_PX);
  drawBoard();
  drawValidMoves();
  drawTokens();
  if(state.gameOver&&state.winner!==null){
    ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,BOARD_PX,BOARD_PX);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='900 40px "Arial Black"';ctx.fillStyle=PLAYERS[state.winner].color;
    ctx.shadowColor=PLAYERS[state.winner].color;ctx.shadowBlur=24;
    ctx.fillText('🏆',BOARD_PX/2,BOARD_PX/2-50);
    ctx.font='900 26px "Arial Black"';
    ctx.fillText(PLAYERS[state.winner].name,BOARD_PX/2,BOARD_PX/2+10);
    ctx.font='900 16px Arial';ctx.fillStyle='#fff';
    ctx.fillText('MENANG!',BOARD_PX/2,BOARD_PX/2+48);
    ctx.shadowBlur=0;
  }
}

function loop(){draw();requestAnimationFrame(loop)}

function handleTap(clientX,clientY){
  if(state.gameOver)return;
  if(!state.diceRolled||!state.validMoves.length)return;
  var rect=cv.getBoundingClientRect();
  var sx=BOARD_PX/rect.width,sy=BOARD_PX/rect.height;
  var mx=(clientX-rect.left)*sx,my=(clientY-rect.top)*sy;
  var c=Math.floor(mx/CELL),r=Math.floor(my/CELL);
  var player=state.turn,tokens=state.tokens[player];
  if(state.selected){
    var mv=null;
    for(var mvi=0;mvi<state.validMoves.length;mvi++){
      if(state.validMoves[mvi].idx===state.selected.i){mv=state.validMoves[mvi];break}
    }
    if(mv){
      var np=mv.newProgress,destCell;
      if(np===FINISH_PROGRESS)destCell=[7,7];
      else if(np<=50)destCell=RING[getRingIdx(player,np)];
      else destCell=PLAYERS[player].homeCol[np-51];
      if(destCell[0]===r&&destCell[1]===c){doMove(mv);return}
    }
  }
  var clickedIdx=-1;
  for(var i=0;i<4;i++){
    var prog=tokens[i];
    if(prog===-1){
      var bpos=PLAYERS[player].base[i];
      var bcx=bpos[1]*CELL+CELL/2,bcy=bpos[0]*CELL+CELL/2;
      var dist=Math.hypot(mx-bcx,my-bcy);
      if(dist<CELL*0.55){clickedIdx=i;break}
    }else{
      var cell;
      if(prog===FINISH_PROGRESS)cell=[7,7];
      else if(prog<=50)cell=RING[getRingIdx(player,prog)];
      else cell=PLAYERS[player].homeCol[prog-51];
      if(cell[0]===r&&cell[1]===c){clickedIdx=i;break}
    }
  }
  if(clickedIdx>=0){
    var hasMove=false;
    for(var hmi=0;hmi<state.validMoves.length;hmi++){
      if(state.validMoves[hmi].idx===clickedIdx){hasMove=true;break}
    }
    if(hasMove){
      state.selected={p:player,i:clickedIdx};
      tone(430,.05,'triangle',.05);draw();return;
    }
  }
  state.selected=null;draw();
}

function init(){
  cv=document.getElementById('cv');
  DPR=Math.max(1,Math.min(2,window.devicePixelRatio||1));
  cv.width=BOARD_PX*DPR;cv.height=BOARD_PX*DPR;
  ctx=cv.getContext('2d');
  cv.addEventListener('pointerdown',function(e){e.preventDefault();audio();handleTap(e.clientX,e.clientY)});
  document.getElementById('rollB').addEventListener('pointerdown',function(e){e.preventDefault();audio();rollDice()});
  document.getElementById('newB').addEventListener('pointerdown',function(e){e.preventDefault();audio();newGame();draw()});
  document.getElementById('muteB').addEventListener('pointerdown',function(e){
    e.preventDefault();e.stopPropagation();audio();muted=!muted;
    this.textContent=muted?'🔇':'🔊';
  });
  window.addEventListener('keydown',function(e){
    if(e.key==='r'||e.key==='R')rollDice();
    if(e.key==='n'||e.key==='N'){newGame();draw()}
  });
  newGame();loop();
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}

})();
</script>`

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

async function kirimForwardSigned(conn, chatId, html, judul) {
  const data = Buffer.from(JSON.stringify({
    __typename: 'GenAIUnifiedResponse',
    response_id: randomUUID(),
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: {
          __typename: 'GenAIaeacdsnwHtmlPrimitive',
          payload: html,
          trusted_sources: []
        }
      }
    }]
  })).toString('base64')

  return conn.relayMessage(chatId, {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: "",
        botResponseId: randomUUID(),
        verificationMetadata: {
          proofs: [{
            version: 1,
            useCase: 1,
            signature: SIG,
            certificateChain: [CERT1, CERT2]
          }]
        }
      }
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: judul }],
          unifiedResponse: { data },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
            forwardOrigin: 4
          }
        }
      }
    }
  }, {})
}

const pluginConfig = {
  name: "ludo",
  alias: ['ludogame', 'ludo4', 'rludo', 'mainludo'],
  category: "game",
  description: "Ludo 4 Player - board game interaktif di WhatsApp",
  usage: ".ludo",
  example: ".ludo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

async function handler(m, { sock }) {
  try {
    await kirimForwardSigned(sock, m.chat, LUDO_HTML, '🎲 LUDO 4 PLAYER v1')
  } catch (e) {
    console.error('[LUDO]', e?.message || e)
    await m.reply('❌ Gagal mengirim game: ' + (e?.message || e))
  }
}

export { pluginConfig as config, handler }
export default { config: pluginConfig, handler }