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
})();