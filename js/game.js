(function(){
  "use strict";

  var bounceCanvas = document.getElementById("bounceBoard");
  var bctx = bounceCanvas.getContext("2d");
  var jumpsEl = document.getElementById("jumps");
  var moneyEl = document.getElementById("money");
  var bRestart = document.getElementById("bounceRestart");
  var status2El = document.getElementById("status2");
  var upgradeBallBtn = document.getElementById("upgradeBall");
  var upgradeCostEl = document.getElementById("upgradeCost");
  var upgradeCountEl = document.getElementById("upgradeCount");
  var upgradePowerBtn = document.getElementById("upgradePower");
  var upgradePowerCostEl = document.getElementById("upgradePowerCost");
  var upgradePowerCountEl = document.getElementById("upgradePowerCount");
  var upgradeSizeBtn = document.getElementById("upgradeSize");
  var upgradeSizeCostEl = document.getElementById("upgradeSizeCost");
  var upgradeSizeCountEl = document.getElementById("upgradeSizeCount");

  var BW, BH, CX, CY, arenaR, bRaf = null, jumps, money = 0;
  var balls = [], trails = [];
  var ballCount = 1, ballUpgradeCost = 50;
  var jumpPowerLvl = 0, jumpPowerCost = 30, jumpPowerMax = 10;
  var sizeUpgradeCount = 0, sizeUpgradeCost = 250;
  var sizeMul = 1.0, forceMul = 1.0;
  var MAX_VEL = 7;
  var effects = [];

  // --- particles & rings ---
  function spawnParticles(x, y, nx, ny){
    for(var i=0; i<8; i++){
      var ang = Math.atan2(ny, nx) + (Math.random()-0.5)*1.8;
      var sp = 1.5 + Math.random()*3;
      effects.push({
        type:"p", x:x, y:y,
        vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp,
        life: 1.0, decay: 0.03 + Math.random()*0.03,
        r: 2 + Math.random()*3, color: Math.random()>0.5 ? "#a6e3a1" : "#f9e2af"
      });
    }
  }
  function spawnRing(x, y){
    effects.push({ type:"ring", x:x, y:y, r:5, maxR:30+Math.random()*15, life:1.0, decay:0.06 });
  }

  // --- sounds ---
  var audioCtx = null;
  function playCoinSound(){
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(1200, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime+0.06);
      o.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime+0.12);
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.15);
      o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime+0.15);
    } catch(e){}
  }
  function playUpgradeSound(){
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(600, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime+0.15);
      g.gain.setValueAtTime(0.2, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime+0.25);
      o.start(audioCtx.currentTime); o.stop(audioCtx.currentTime+0.25);
    } catch(e){}
  }
  function playSuperSound(){
    try {
      if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var t = audioCtx.currentTime;
      [800,1200,1600,2200].forEach(function(f,i){
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(f, t+i*0.06);
        g.gain.setValueAtTime(0.18, t+i*0.06);
        g.gain.exponentialRampToValueAtTime(0.01, t+i*0.06+0.15);
        o.start(t+i*0.06); o.stop(t+i*0.06+0.15);
      });
    } catch(e){}
  }

  // --- UI ---
  function updateUpgradeUI(){
    upgradeBallBtn.disabled = money < ballUpgradeCost;
    upgradeCostEl.textContent = "$" + ballUpgradeCost;
    upgradeCountEl.textContent = "x" + ballCount;
    upgradePowerBtn.disabled = money < jumpPowerCost || jumpPowerLvl >= jumpPowerMax;
    upgradePowerCostEl.textContent = jumpPowerLvl >= jumpPowerMax ? "МАКС" : "$" + jumpPowerCost;
    upgradePowerCountEl.textContent = "Ур. " + jumpPowerLvl + "/" + jumpPowerMax;
    upgradeSizeBtn.disabled = money < sizeUpgradeCost;
    upgradeSizeCostEl.textContent = "$" + sizeUpgradeCost;
    upgradeSizeCountEl.textContent = "x" + sizeUpgradeCount;
  }

  // --- resize ---
  var gameInited = false;
  function bounceResize(){
    var size = bounceCanvas.clientWidth;
    if(size <= 0){ setTimeout(function(){ if(bounceCanvas.clientWidth>0) bounceResize(); }, 50); return; }
    var dpr = window.devicePixelRatio || 1;
    bounceCanvas.width = size*dpr; bounceCanvas.height = size*dpr;
    BW = size; BH = size; CX = BW/2; CY = BH/2;
    arenaR = Math.min(BW,BH)*0.46;
    bctx.setTransform(dpr,0,0,dpr,0,0);
    if(!gameInited){ gameInited = true; jumpCount(); }
    else { for(var i=0;i<balls.length;i++) balls[i].r = baseRadius()*sizeMul; }
  }

  // --- reset ---
  function jumpCount(){
    jumps = 20; money = 0; ballCount = 1; ballUpgradeCost = 50;
    jumpPowerLvl = 0; jumpPowerCost = 30;
    sizeUpgradeCount = 0; sizeMul = 1.0; forceMul = 1.0;
    effects = [];
    jumpsEl.textContent = String(jumps);
    moneyEl.textContent = "$0";
    resetBalls();
    updateUpgradeUI();
    status2El.textContent = "Базовый прыжок: 20. Каждый удар о круг +$1.";
  }

  // --- ball factory ---
  var ballColors = [
    {c1:"#e8d2ff",c2:"#a855f7",c3:"#581c87"},
    {c1:"#a6e3a1",c2:"#22c55e",c3:"#166534"},
    {c1:"#fde68a",c2:"#f59e0b",c3:"#92400e"},
    {c1:"#93c5fd",c2:"#3b82f6",c3:"#1e3a5f"},
    {c1:"#fca5a5",c2:"#ef4444",c3:"#7f1d1d"},
    {c1:"#c4b5fd",c2:"#8b5cf6",c3:"#4c1d95"},
    {c1:"#fdba74",c2:"#f97316",c3:"#7c2d12"},
    {c1:"#67e8f9",c2:"#06b6d4",c3:"#164e63"}
  ];
  function baseRadius(){ return Math.max(8, Math.min(BW,BH)*0.04); }
  function newBall(idx){
    var ang = Math.random()*Math.PI*2, sp = 1+Math.random()*1.5;
    var col = ballColors[idx%ballColors.length];
    return {
      x:CX+(Math.random()-0.5)*arenaR*0.4, y:CY+(Math.random()-0.5)*arenaR*0.4,
      vx:Math.cos(ang)*sp, vy:-(1+Math.random()*1.5),
      r:baseRadius()*sizeMul, c1:col.c1, c2:col.c2, c3:col.c3
    };
  }
  function resetBalls(){
    balls=[]; trails=[];
    for(var i=0;i<ballCount;i++){ balls.push(newBall(i)); trails.push([]); }
  }

  // --- physics ---
  function clampVel(ball){
    var spd = Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
    if(spd>MAX_VEL){ ball.vx=(ball.vx/spd)*MAX_VEL; ball.vy=(ball.vy/spd)*MAX_VEL; }
  }

  var grav = 0.03;
  function bounceStep(){
    // effects
    for(var e=effects.length-1;e>=0;e--){
      var ef=effects[e];
      ef.life-=ef.decay;
      if(ef.life<=0){ effects.splice(e,1); continue; }
      if(ef.type==="p"){ ef.x+=ef.vx; ef.y+=ef.vy; ef.vx*=0.94; ef.vy*=0.94; }
      else { ef.r+=(ef.maxR-ef.r)*0.2; }
    }

    for(var b=0;b<balls.length;b++){
      var ball=balls[b];
      ball.vy+=grav; ball.x+=ball.vx; ball.y+=ball.vy;

      var dx=ball.x-CX, dy=ball.y-CY;
      var dist=Math.sqrt(dx*dx+dy*dy);
      var maxDist=arenaR-ball.r;

      if(dist>maxDist){
        var nx=dx/dist, ny=dy/dist;
        ball.x=CX+nx*maxDist; ball.y=CY+ny*maxDist;
        var dot=ball.vx*nx+ball.vy*ny;
        if(dot>0){ ball.vx-=2*dot*nx; ball.vy-=2*dot*ny; }
        clampVel(ball);

        if(dot>0.3){
          if(jumps<25) jumps+=1;
          money+=1;
          playCoinSound();
          jumpsEl.textContent=String(jumps);
          moneyEl.textContent="$"+money;
          status2El.textContent="Удар! Прыжков: "+jumps+" | $"+money;

          var hx=CX+nx*arenaR, hy=CY+ny*arenaR;
          spawnParticles(hx,hy,nx,ny);
          spawnRing(hx,hy);

          // 10% super jump
          if(Math.random()<0.1){
            var tAng=Math.random()*Math.PI*2, tR=Math.random()*arenaR*0.5;
            var tx=CX+Math.cos(tAng)*tR, ty=CY+Math.sin(tAng)*tR;
            var sdx=tx-hx, sdy=ty-hy, sdist=Math.sqrt(sdx*sdx+sdy*sdy);
            var sup=5+Math.random()*3;
            ball.vx=(sdx/sdist)*sup; ball.vy=(sdy/sdist)*sup;
            clampVel(ball);
            money+=5;
            moneyEl.textContent="$"+money;
            status2El.textContent="SUPER JUMP! +$5 | Прыжков: "+jumps+" | $"+money;
            playSuperSound();
            for(var p=0;p<20;p++){
              var ang2=Math.atan2(ny,nx)+(Math.random()-0.5)*3;
              var sp2=3+Math.random()*5;
              effects.push({type:"p",x:hx,y:hy,vx:Math.cos(ang2)*sp2,vy:Math.sin(ang2)*sp2,
                life:1.0,decay:0.02+Math.random()*0.02,r:3+Math.random()*5,
                color:Math.random()>0.5?"#f9e2af":"#fde68a"});
            }
            effects.push({type:"ring",x:hx,y:hy,r:10,maxR:60+Math.random()*20,life:1.0,decay:0.04});
            effects.push({type:"ring",x:hx,y:hy,r:5,maxR:40+Math.random()*15,life:1.0,decay:0.05});
          }
        }
        trails[b]=[];
      }

      clampVel(ball);
      trails[b].push({x:ball.x,y:ball.y});
      if(trails[b].length>14) trails[b].shift();
    }
    updateUpgradeUI();
  }

  // --- draw ---
  function bounceDraw(){
    bctx.clearRect(0,0,BW,BH);
    bctx.strokeStyle="rgba(109,40,217,0.75)"; bctx.lineWidth=3;
    bctx.beginPath(); bctx.arc(CX,CY,arenaR,0,Math.PI*2); bctx.stroke();
    bctx.strokeStyle="rgba(147,51,234,0.18)"; bctx.lineWidth=1;
    bctx.beginPath(); bctx.arc(CX,CY,arenaR*0.96,0,Math.PI*2); bctx.stroke();

    for(var e=0;e<effects.length;e++){
      var ef=effects[e];
      if(ef.type==="ring"){
        bctx.globalAlpha=ef.life*0.6; bctx.strokeStyle="#a6e3a1"; bctx.lineWidth=2;
        bctx.beginPath(); bctx.arc(ef.x,ef.y,ef.r,0,Math.PI*2); bctx.stroke();
        bctx.globalAlpha=1;
      } else {
        bctx.globalAlpha=ef.life; bctx.fillStyle=ef.color;
        bctx.beginPath(); bctx.arc(ef.x,ef.y,ef.r*ef.life,0,Math.PI*2); bctx.fill();
        bctx.globalAlpha=1;
      }
    }

    for(var b=0;b<balls.length;b++){
      var ball=balls[b], trail=trails[b];
      for(var i=0;i<trail.length;i++){
        var al=(i+1)/trail.length*0.35;
        bctx.fillStyle="rgba(168,85,247,"+al+")";
        bctx.beginPath(); bctx.arc(trail[i].x,trail[i].y,ball.r*(i/trail.length)*0.8,0,Math.PI*2); bctx.fill();
      }
      if(trail.length>0){
        bctx.globalAlpha=Math.min(1,trail.length/14)*0.3;
        bctx.fillStyle="#a6e3a1";
        bctx.beginPath(); bctx.arc(ball.x,ball.y,ball.r*1.4,0,Math.PI*2); bctx.fill();
        bctx.globalAlpha=1;
      }
      var g=bctx.createRadialGradient(ball.x-ball.r*0.4,ball.y-ball.r*0.4,ball.r*0.2,ball.x,ball.y,ball.r);
      g.addColorStop(0,ball.c1); g.addColorStop(0.4,ball.c2); g.addColorStop(1,ball.c3);
      bctx.fillStyle=g;
      bctx.beginPath(); bctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); bctx.fill();
    }
  }

  function bounceLoop(){
    if(!gameInited){ bRaf=requestAnimationFrame(bounceLoop); return; }
    bounceStep();
    bounceDraw();
    bRaf=requestAnimationFrame(bounceLoop);
  }

  // --- upgrades ---
  upgradeBallBtn.addEventListener("click", function(){
    if(money<ballUpgradeCost) return;
    money-=ballUpgradeCost; moneyEl.textContent="$"+money;
    ballCount++; ballUpgradeCost+=25;
    playUpgradeSound();
    balls.push(newBall(balls.length)); trails.push([]);
  });
  upgradePowerBtn.addEventListener("click", function(){
    if(money<jumpPowerCost||jumpPowerLvl>=jumpPowerMax) return;
    money-=jumpPowerCost; moneyEl.textContent="$"+money;
    jumpPowerLvl++; jumpPowerCost+=20; forceMul+=0.1; MAX_VEL+=0.5;
    playUpgradeSound();
  });
  upgradeSizeBtn.addEventListener("click", function(){
    if(money<sizeUpgradeCost) return;
    money-=sizeUpgradeCost; moneyEl.textContent="$"+money;
    sizeUpgradeCount++; sizeMul+=0.05; forceMul+=0.07;
    playUpgradeSound();
    for(var i=0;i<balls.length;i++) balls[i].r=baseRadius()*sizeMul;
  });

  bRestart.addEventListener("click", function(){ jumpCount(); });
  window.addEventListener("resize", bounceResize);
  bounceResize();
  if(bRaf) cancelAnimationFrame(bRaf);
  bounceLoop();

  // --- screen navigation ---
  function show(id){
    var screens=document.querySelectorAll(".screen");
    for(var i=0;i<screens.length;i++) screens[i].classList.remove("active");
    document.getElementById(id).classList.add("active");
    window.scrollTo(0,0);
  }
  document.getElementById("btnPlay").addEventListener("click", function(){
    show("screen-game");
    requestAnimationFrame(function(){ bounceResize(); });
  });
  document.getElementById("btnCredits").addEventListener("click", function(){ show("screen-credits"); });
  document.getElementById("backFromGame").addEventListener("click", function(){ show("screen-menu"); });
  document.getElementById("backFromCredits").addEventListener("click", function(){ show("screen-menu"); });

  // --- music ---
  var musicBtn=document.getElementById("musicBtn");
  var bgMusic=document.getElementById("bgMusic");
  var musicErr=document.getElementById("musicErr");
  var musicOn=false;
  musicBtn.addEventListener("click", function(){
    if(!musicOn){
      bgMusic.play().then(function(){
        musicOn=true; musicBtn.textContent="\uD83D\uDD0A Музыка: ВКЛ (нажми ещё раз \u2014 выкл)";
        musicErr.style.display="none";
      }).catch(function(e){
        musicErr.textContent="Не удалось включить музыку: "+(e&&e.message?e.message:e);
        musicErr.style.display="block"; musicOn=true; musicBtn.textContent="\uD83D\uDD0A Музыка";
      });
    } else {
      bgMusic.pause(); musicOn=false; musicBtn.textContent="\uD83C\uDFB5 Включить музыку";
    }
  });
})();
