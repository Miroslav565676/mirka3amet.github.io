(function(){
  "use strict";
  var canvas = document.getElementById("starfield");
  var ctx = canvas.getContext("2d");
  var W, H, stars, raf = null;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    var count = Math.min(1500, Math.floor(W * H / 450));
    stars = [];
    for(var i=0;i<count;i++){
      stars.push({
        x: Math.random()*W, y: Math.random()*H,
        r: 0.4 + Math.random()*1.3,
        phase: Math.random()*Math.PI*2,
        speed: 0.6 + Math.random()*2.2
      });
    }
  }

  function frame(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<stars.length;i++){
      var s = stars[i];
      s.phase += s.speed * 0.02;
      ctx.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5*Math.sin(s.phase));
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawHole();
    raf = requestAnimationFrame(frame);
  }

  var holeAngle1 = 0;
  function drawHole(){
    var cx = W*0.82, cy = H*0.5;
    var R = Math.min(W, H) * 0.85;

    var haze = ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.05);
    haze.addColorStop(0, "rgba(88,28,135,0)");
    haze.addColorStop(0.55, "rgba(88,28,135,0.06)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.beginPath(); ctx.arc(cx,cy,R*1.05,0,Math.PI*2); ctx.fill();

    holeAngle1 += 0.012;
    var tilt = 0.30;
    var diskCX = cx, diskCY = cy;
    var radX = R*0.58, radY = radX*tilt;

    var halo = ctx.createLinearGradient(cx-radX, cy-radY, cx+radX, cy+radY);
    halo.addColorStop(0, "rgba(168,85,247,0)");
    halo.addColorStop(0.15, "rgba(147,51,234,0.16)");
    halo.addColorStop(0.3, "rgba(192,132,252,0.32)");
    halo.addColorStop(0.5, "rgba(232,210,255,0.5)");
    halo.addColorStop(0.55, "rgba(255,255,255,0.4)");
    halo.addColorStop(0.6, "rgba(216,180,254,0.5)");
    halo.addColorStop(0.75, "rgba(147,51,234,0.26)");
    halo.addColorStop(1, "rgba(88,28,135,0)");
    ctx.save();
    ctx.filter = "blur("+(R*0.04)+"px)";
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.ellipse(diskCX, diskCY, radX, radY, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    var ringGrad = ctx.createLinearGradient(cx-radX, cy-radY, cx+radX, cy+radY);
    ringGrad.addColorStop(0, "rgba(168,85,247,0)");
    ringGrad.addColorStop(0.18, "rgba(147,51,234,0.5)");
    ringGrad.addColorStop(0.3, "rgba(192,132,252,0.85)");
    ringGrad.addColorStop(0.42, "rgba(238,210,255,1)");
    ringGrad.addColorStop(0.5, "rgba(255,255,255,1)");
    ringGrad.addColorStop(0.58, "rgba(238,210,255,0.95)");
    ringGrad.addColorStop(0.7, "rgba(192,132,252,0.7)");
    ringGrad.addColorStop(0.85, "rgba(147,51,234,0.35)");
    ringGrad.addColorStop(1, "rgba(88,28,135,0)");

    ctx.save();
    ctx.filter = "blur("+(R*0.035)+"px)";
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = R*0.09;
    ctx.beginPath(); ctx.ellipse(diskCX,diskCY,radX*0.985,radY*0.985,0,0,Math.PI*2); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.filter = "blur("+(R*0.008)+"px)";
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = R*0.045;
    ctx.beginPath(); ctx.ellipse(diskCX,diskCY,radX*0.97,radY*0.97,0,0,Math.PI*2); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.filter = "blur("+(R*0.012)+"px)";
    var inner = ctx.createLinearGradient(cx-radX*0.55,cy,cx+radX*0.55,cy);
    inner.addColorStop(0, "rgba(0,0,0,0)");
    inner.addColorStop(0.2, "rgba(147,51,234,0.6)");
    inner.addColorStop(0.35, "rgba(220,190,255,0.9)");
    inner.addColorStop(0.5, "rgba(255,255,255,1)");
    inner.addColorStop(0.65, "rgba(220,190,255,0.9)");
    inner.addColorStop(0.85, "rgba(147,51,234,0.5)");
    inner.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = inner;
    ctx.lineWidth = R*0.012;
    ctx.beginPath(); ctx.ellipse(diskCX,diskCY,radX*0.42,radY*0.42,0,0,Math.PI*2); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.filter = "blur("+(R*0.02)+"px)";
    var shadow = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.20);
    shadow.addColorStop(0, "#000");
    shadow.addColorStop(0.72, "#000");
    shadow.addColorStop(0.95, "rgba(4,2,12,0.9)");
    shadow.addColorStop(1, "rgba(10,5,20,0)");
    ctx.fillStyle = shadow;
    ctx.beginPath(); ctx.arc(cx,cy,R*0.20,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  window.addEventListener("resize", resize);
  resize();
  frame();
})();
