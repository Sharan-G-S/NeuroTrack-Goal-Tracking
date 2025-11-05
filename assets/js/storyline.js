(function(){
  const st = window.appState;
  const chaptersEl = document.getElementById('chapters');
  const modal = document.getElementById('chapterModal');
  const chTitle = document.getElementById('chTitle');
  const chBody = document.getElementById('chBody');
  const closeBtn = document.getElementById('closeChapter');
  const nextBtn = document.getElementById('nextChapter');

  // Define unlocking thresholds using overall XP
  const totalXP = (st.xpHistory||[]).reduce((a,b)=> a+b.xp, 0) + (st.xpToday||0);
  st.story = st.story || { unlocked: {1:true, 2:false, 3:false}, read: {} };
  if(totalXP>=50) st.story.unlocked[2] = true;
  if(totalXP>=200) st.story.unlocked[3] = true;
  window.updateState({ story: st.story });

  const CONTENT = {
    1: {
      title: 'Chapter 1: Awakening',
      text: `You awaken in the Valley of Focus, where every action hums with potential.
A flicker reveals your neural core—weak but responsive.

Mentor: "Feed it daily. Small wins create Sync Points. Each checkmark is a spark." 

Quest:
- Create 1 Daily task tied to a simple, repeatable behavior.
- Complete it today to sync your first energy wave.`
    },
    2: {
      title: 'Chapter 2: Momentum',
      text: `Your core stabilizes. The sky forms weekly constellations that pulse when patterns repeat.

Mentor: "Consistency is a rhythm. Group efforts into weekly beats."

Quest:
- Create a Weekly goal (e.g., 3 workouts).
- Use Schedules so tasks appear on the right days automatically.`
    },
    3: {
      title: 'Chapter 3: Mastery',
      text: `The horizon bends around your long‑term arc. You are no longer chasing goals—you're guided by them.

Mentor: "Define arcs that matter. Break them into chapters. Protect your focus."

Quest:
- Add a Long‑term goal (e.g., ship a portfolio).
- Split it into steps via the Companion and level up to Pro.`
    }
  };

  let currentChapter = null;

  function renderLockState(){
    Array.from(chaptersEl.querySelectorAll('[data-chapter]')).forEach(card=>{
      const id = +card.dataset.chapter;
      if(!st.story.unlocked[id]){
        card.style.opacity = .55; card.style.filter = 'grayscale(1)';
        card.querySelector('.arrow').textContent = 'Locked';
      } else {
        card.style.opacity = 1; card.style.filter = 'none';
      }
    });
  }

  function openChapter(id){
    if(!st.story.unlocked[id]){ alert('Chapter locked. Earn more Sync Points to unlock.'); return; }
    const c = CONTENT[id]; if(!c) return;
    currentChapter = id;
    chTitle.textContent = c.title; chBody.textContent = c.text; modal.classList.add('show');
    
    // Update Next button label
    if(id === 3) {
      nextBtn.textContent = 'Go to Main →';
    } else {
      nextBtn.textContent = 'Next Chapter →';
    }
    
    st.story.read[id] = true; window.updateState({ story: st.story });
  }

  function closeModal(){
    modal.classList.remove('show');
    currentChapter = null;
  }

  function goNext(){
    if(!currentChapter) return;
    closeModal();
    
    if(currentChapter === 1) {
      // Chapter 1 -> Chapter 2
      if(st.story.unlocked[2]) {
        openChapter(2);
      } else {
        alert('Chapter 2 locked. Earn 50 XP to unlock.');
      }
    } else if(currentChapter === 2) {
      // Chapter 2 -> Chapter 3
      if(st.story.unlocked[3]) {
        openChapter(3);
      } else {
        alert('Chapter 3 locked. Earn 200 XP to unlock.');
      }
    } else if(currentChapter === 3) {
      // Chapter 3 -> Main
      location.href = 'app.html';
    }
  }

  chaptersEl?.addEventListener('click', (e)=>{
    const card = e.target.closest('[data-chapter]'); if(!card) return;
    openChapter(+card.dataset.chapter);
  });

  closeBtn?.addEventListener('click', closeModal);
  nextBtn?.addEventListener('click', goNext);

  renderLockState();

  // --- Onboarding flow when arriving from Get Started (storyline.html?onboard=1) ---
  function queryParam(name){ return new URLSearchParams(location.search).get(name); }
  const onboard = queryParam('onboard') === '1';
  const onboardModal = document.getElementById('onboardModal');
  const onNext = document.getElementById('onNext');
  const onCancel = document.getElementById('onCancel');
  const onName = document.getElementById('onName');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const optShort = document.getElementById('optShort');
  const optLong = document.getElementById('optLong');
  const onGoal = document.getElementById('onGoal');

  function showOnboardModal(){
    onboardModal.classList.add('show');
    document.body.classList.add('no-scroll');
    // set initial step
    step1.style.display = 'block'; step2.style.display = 'none';
    document.getElementById('progStep1')?.classList.add('active');
    document.getElementById('progStep2')?.classList.remove('active');
    onName.focus();
    // attach keyboard handler
    window.addEventListener('keydown', onboardKeyHandler);
  }
  function hideOnboardModal(){
    onboardModal.classList.remove('show');
    document.body.classList.remove('no-scroll');
    window.removeEventListener('keydown', onboardKeyHandler);
  }
  function onboardKeyHandler(e){
    if(e.key === 'Escape'){ e.preventDefault(); hideOnboardModal(); history.replaceState({}, '', location.pathname); }
    if(e.key === 'Enter'){
      // if on step1 and focused input, move next; if step2, submit
      if(step1.style.display !== 'none'){
        e.preventDefault(); onNext?.click();
      } else if(step2.style.display !== 'none'){
        // avoid capturing Enter pressed inside textarea when user wants newline
        if(document.activeElement && document.activeElement.tagName.toLowerCase() === 'textarea') return;
        e.preventDefault(); onNext?.click();
      }
    }
  }

  if(onboard){ showOnboardModal(); }

  let chosenCadence = 'daily';
  optShort?.addEventListener('click', ()=>{ chosenCadence='daily'; optShort.classList.add('active'); optLong.classList.remove('active'); });
  optLong?.addEventListener('click', ()=>{ chosenCadence='long'; optLong.classList.add('active'); optShort.classList.remove('active'); });

  onNext?.addEventListener('click', ()=>{
    if(step1.style.display !== 'none'){
      const name = onName.value.trim();
      if(!name){ alert('Please enter your name to continue.'); onName.focus(); return; }
      st.user = st.user || {};
      st.user.name = name;
      window.updateState({ user: st.user });
      // proceed to step 2
      step1.style.display = 'none'; step2.style.display = 'block';
      document.getElementById('progStep1')?.classList.remove('active');
      document.getElementById('progStep2')?.classList.add('active');
      onGoal.focus();
      return;
    }
    // Step 2 -> finish
    const goalText = onGoal.value.trim();
    if(!goalText){ alert('Please add a brief goal description.'); onGoal.focus(); return; }
    st.goals = st.goals || [];
    const newGoal = { name: goalText, cadence: chosenCadence, days: [], time: '', notes: 'Added via onboarding' };
    st.goals.push(newGoal);
    // Also add a starter task into appropriate list
    st.tasks = st.tasks || { daily: [], weekly: [], long: [] };
    const target = (chosenCadence === 'daily') ? 'daily' : 'long';
    st.tasks[target] = st.tasks[target] || [];
    st.tasks[target].push({ text: 'Starter: ' + goalText, done: false });
    window.updateState({ goals: st.goals, tasks: st.tasks });
    // mark onboarding complete and navigate to app
    st.onboarded = true; window.updateState({ onboarded: true });
    hideOnboardModal();
    // remove query param to avoid re-triggering
    history.replaceState({}, '', location.pathname);
    // go to main hub
    location.href = 'app.html';
  });

  onCancel?.addEventListener('click', ()=>{ hideOnboardModal(); history.replaceState({}, '', location.pathname); });

  // Quick demo helper: fills sample name and goal and advances the flow
  const onDemo = document.getElementById('onDemo');
  onDemo?.addEventListener('click', ()=>{
    try{
      // Step 1: fill name and trigger next
      onName.value = 'Player';
      onNext.click();
      // small timeout to allow step transition
      setTimeout(()=>{
        chosenCadence = 'daily';
        optShort?.classList.add('active'); optLong?.classList.remove('active');
        onGoal.value = 'Read 10 pages daily';
        onNext.click();
      }, 160);
    }catch(e){ console.warn('Demo failed', e); }
  });
})();