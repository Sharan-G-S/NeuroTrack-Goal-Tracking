(function(){
  document.getElementById('year').textContent = new Date().getFullYear();
  const state = window.appState;
  const xpToday = state.xpToday||0;
  state.xpHistory = state.xpHistory || [];
  // push today's value if last entry was from a different date (simple demo)
  try{
    const todayStr = new Date().toISOString().slice(0,10);
    const last = state.xpHistory[state.xpHistory.length-1];
    if(!last || last.date !== todayStr){ state.xpHistory.push({ date: todayStr, xp: xpToday }); }
    else { last.xp = xpToday; }
    window.updateState({ xpHistory: state.xpHistory });
  }catch{}

  const total = state.xpHistory.reduce((a,b)=> a+b.xp, 0);
  const last7 = state.xpHistory.slice(-7);
  const avg = last7.length ? Math.round(last7.reduce((a,b)=> a+b.xp,0)/last7.length) : 0;

  document.getElementById('xpToday').textContent = xpToday;
  document.getElementById('xpAvg').textContent = avg;
  document.getElementById('xpTotal').textContent = total;

  const rank = total>1000? 'Legend' : total>500? 'Master' : total>200? 'Pro' : total>50? 'Rookie' : 'Seed';
  document.getElementById('rank').textContent = rank;

  // Inactivity detector and glitch mode
  const energy = document.getElementById('energy');
  const fill = document.getElementById('energyFill');
  let level = 100; let glitching = false;

  function setLevel(v){ level = Math.max(0, Math.min(100, v)); fill.style.width = level+'%'; if(level<35) energy.classList.add('low'); else energy.classList.remove('low'); }
  setLevel(100);

  const cancelIdle = window.onIdle(30000, ()=>{ // 30s idle
    glitching = true; document.body.classList.add('glitch-mode');
    document.querySelector('h1.glitchy')?.classList.add('active');
    document.getElementById('stabilityHint').textContent = 'Inactive… stability dropping';
  });

  // Drain or recharge energy every second
  setInterval(()=>{
    if(glitching){ setLevel(level - 3); document.body.style.filter = `contrast(1.05) hue-rotate(${(Math.random()*10-5).toFixed(0)}deg)`; }
    else { setLevel(level + 1.2); document.body.style.filter = 'none'; }
  }, 1000);

  // Any activity cancels glitch
  ['mousemove','keydown','touchstart','scroll'].forEach(evt=> window.addEventListener(evt, ()=>{
    if(glitching){ glitching = false; document.body.classList.remove('glitch-mode'); document.getElementById('stabilityHint').textContent = 'Active'; }
  }, {passive:true}));
})();