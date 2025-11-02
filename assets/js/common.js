// Common behaviors shared across pages
(function(){
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  window.$ = $; window.$$ = $$;

  // Enable pixel cursor sparkle effect
  document.body.classList.add('custom-cursor');
  window.addEventListener('pointermove', (e)=>{
    const sp = document.createElement('span');
    sp.className = 'sparkle';
    sp.style.left = (e.clientX - 5) + 'px';
    sp.style.top = (e.clientY - 5) + 'px';
    document.body.appendChild(sp);
    setTimeout(()=> sp.remove(), 600);
  });

  // Intersection reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent => {
      if(ent.isIntersecting){ ent.target.classList.add('visible'); io.unobserve(ent.target); }
    })
  }, { threshold: .2 });
  $$('.reveal').forEach(el=> io.observe(el));

  // Mark active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if(href && href.endsWith(path)) a.classList.add('active');
  });

  // Simple state layer using localStorage
  const storeKey = 'goaltrack.v1';
  function readState(){
    try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch { return {}; }
  }
  function writeState(s){ localStorage.setItem(storeKey, JSON.stringify(s)); }

  const state = readState();
  window.appState = state;
  window.updateState = (patch)=>{ Object.assign(state, patch); writeState(state); };

  // Avatar render helper (tiny SVG based avatar)
  window.renderAvatar = (size=48) => {
    const skin = state.avatarSkin || '#ffd1a9';
    const hair = state.avatarHair || '#3b2f2f';
    const color = state.avatarColor || '#7dd3fc';
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="10" fill="${color}"/>
        <circle cx="32" cy="34" r="18" fill="${skin}" stroke="#222"/>
        <path d="M12 28 q20 -22 40 0 v8 h-40z" fill="${hair}"/>
        <circle cx="25" cy="34" r="2" fill="#111"/>
        <circle cx="39" cy="34" r="2" fill="#111"/>
        <rect x="26" y="40" width="12" height="3" rx="1.5" fill="#111"/>
      </svg>`;
  };

  // Inject avatar into elements with [data-avatar]
  $$('.avatar-slot').forEach(el=> el.innerHTML = renderAvatar(parseInt(el.dataset.size||'48',10)));

  // Shared parallax on elements having data-parallax
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    $$('.parallax').forEach(el => {
      const speed = parseFloat(el.dataset.speed || '0.2');
      el.style.transform = `translateY(${y*speed}px)`;
    });
  }, { passive: true });

  // Export minimal pub/sub for cross-page snippets if needed
  window.onIdle = function(timeoutMs, onIdle){
    let t = null;
    const reset = ()=>{ if(t) clearTimeout(t); t = setTimeout(()=> onIdle(), timeoutMs); };
    ['mousemove','keydown','touchstart','scroll'].forEach(evt => window.addEventListener(evt, reset, {passive:true}));
    reset();
    return ()=> t && clearTimeout(t);
  };

})();
