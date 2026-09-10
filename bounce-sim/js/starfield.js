(function(){
  var canvas = document.getElementById('stars');
  var ctx = canvas.getContext('2d');
  var W, H, DPR, stars = [], hole = {cx:0,cy:0};
  var COUNT = 160;

  function size(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    hole.cx = W * 0.82; hole.cy = H * 0.5;
  }

  function makeStar(){
    return {
      x: Math.random() * (W + 300) - 150,
      y: Math.random() * (H + 300) - 150,
      r: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 2.2
    };
  }

  function init(){
    stars = [];
    for (var i = 0; i < COUNT; i++) stars.push(makeStar());
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    // deep space base
    ctx.fillStyle = '#050008';
    ctx.fillRect(0, 0, W, H);

    // stars
    for (var i = 0; i < stars.length; i++){
      var s = stars[i];
      s.phase += s.speed * 0.02;
      var tw = 0.5 + 0.5 * Math.sin(s.phase);
      var a = 0.25 + 0.75 * tw;
      var sx = s.x % W; if (sx < 0) sx += W;
      var sy = s.y % H; if (sy < 0) sy += H;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // black hole with rotating accretion rings
    var t = Date.now() / 1000;
    var cx = hole.cx, cy = hole.cy;

    for (var layer = 0; layer < 3; layer++){
      var rx = (60 + layer * 34) * (0.9 + 0.1 * Math.sin(t * (1.2 + layer * 0.3)));
      var ry = rx * 0.32;
      var rot = t * (0.35 + layer * 0.22) * (layer % 2 === 0 ? 1 : -1);
      ctx.globalAlpha = 0.5 - layer * 0.12;
      ctx.strokeStyle = layer === 2 ? '#e8d2ff' : '#c084fc';
      ctx.lineWidth = 2.5 - layer * 0.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // event horizon
    var hr = 26 + 4 * Math.sin(t * 2);
    var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, hr);
    g.addColorStop(0, '#000');
    g.addColorStop(0.7, '#0a001a');
    g.addColorStop(1, 'rgba(88,28,135,.25)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, hr, 0, Math.PI * 2);
    ctx.fill();

    // orbiting specks
    for (var i = 0; i < 14; i++){
      var ang = (Math.PI * 2 * i / 14) + t * (0.6 + (i % 3) * 0.2);
      var wob = 70 + 30 * Math.sin(i * 2.7 + t);
      var px = cx + Math.cos(ang) * wob;
      var py = cy + Math.sin(ang) * wob * 0.33;
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3 + i);
      ctx.fillStyle = '#d8b4fe';
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + Math.sin(t * 5 + i) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function(){ size(); init(); });
  size();
  init();
  draw();
})();