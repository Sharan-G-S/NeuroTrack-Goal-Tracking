// Starfield + section timeline progress + cloud drift
(function(){
  // STARFIELD
  const canvas = document.getElementById('starfield');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let w=0,h=0,ratio=window.devicePixelRatio||1;
    const stars = []; const STAR_COUNT = 140;
    function resize(){
      w = canvas.clientWidth = canvas.offsetWidth;
      h = canvas.clientHeight = canvas.offsetHeight;
      canvas.width = Math.floor(w*ratio); canvas.height = Math.floor(h*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
    }
    function spawn(){
      stars.length = 0;
      for(let i=0;i<STAR_COUNT;i++){
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          z: Math.random()*1+0.2,
          tw: Math.random()*0.5+0.5,
        });
      }
    }
    let t=0; resize(); spawn();
    window.addEventListener('resize', ()=>{ resize(); spawn(); });
    function draw(){
      t += 0.016;
      ctx.clearRect(0,0,w,h);
      for(const s of stars){
        s.x -= s.z * 0.15; if(s.x< -2) s.x = w+2;
        const a = 0.6 + Math.sin(t*s.tw)*0.4;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // TIMELINE PROGRESS FOR SCENES
  const scenes = Array.from(document.querySelectorAll('.timeline .scene'));
  if(scenes.length){
    const update = ()=>{
      const vh = window.innerHeight;
      for(const el of scenes){
        const r = el.getBoundingClientRect();
        const start = vh*0.85; const end = vh*0.2; // tune
        let p = (start - r.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        el.querySelectorAll('.choreo').forEach(c=> c.style.setProperty('--p', p.toFixed(3)));
      }
    };
    document.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  }

  // Cloud effects removed — pointer-driven bob disabled.
})();
