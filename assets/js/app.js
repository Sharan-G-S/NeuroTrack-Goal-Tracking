(function(){
  document.getElementById('year').textContent = new Date().getFullYear();

  const listEl = document.getElementById('taskList');
  const emptyEl = document.getElementById('emptyState');
  const addBtn = document.getElementById('addTaskBtn');
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  // Goals UI
  const goalList = document.getElementById('goalList');
  const addGoalBtn = document.getElementById('addGoal');
  const goalModal = document.getElementById('goalModal');
  const gName = document.getElementById('gName');
  const gCadence = document.getElementById('gCadence');
  const gDaysRow = document.getElementById('gDaysRow');
  const gTime = document.getElementById('gTime');
  const gNotes = document.getElementById('gNotes');
  const saveGoal = document.getElementById('saveGoal');
  const cancelGoal = document.getElementById('cancelGoal');
  let editingGoalIndex = null;

  const state = window.appState;
  state.tasks = state.tasks || { daily: [], weekly: [], long: [] };
  state.goals = state.goals || [];
  let currentTab = 'daily';

  function render(){
    const items = state.tasks[currentTab] || [];
    listEl.innerHTML = items.map((t,i)=>`
      <li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed var(--border)">
        <input type="checkbox" ${t.done?'checked':''} data-i="${i}">
        <div style=\"flex:1\" data-edit="${i}">${t.text}</div>
        <button class="btn secondary" data-del="${i}">Delete</button>
      </li>`).join('');
    emptyEl.style.display = items.length? 'none':'block';
    // Update XP today from completed tasks in daily
    const xpToday = (state.tasks.daily||[]).filter(t=>t.done).length * 10;
    window.updateState({ xpToday });
    renderGoals();
  }

  tabs.forEach(b=> b.addEventListener('click', ()=>{
    currentTab = b.dataset.tab; tabs.forEach(x=> x.classList.remove('active')); b.classList.add('active'); render();
  }));
  tabs[0].classList.add('active');

  addBtn.addEventListener('click', ()=>{
    const text = prompt('Task name');
    if(!text) return;
    state.tasks[currentTab].push({ text, done:false });
    window.updateState({ tasks: state.tasks });
    render();
  });

  listEl.addEventListener('change', (e)=>{
    if(e.target.matches('input[type="checkbox"]')){
      const i = +e.target.dataset.i;
      state.tasks[currentTab][i].done = e.target.checked;
      window.updateState({ tasks: state.tasks });
      render();
    }
  });
  listEl.addEventListener('click', (e)=>{
    const d = e.target.closest('button[data-del]');
    if(d){ const i = +d.dataset.del; state.tasks[currentTab].splice(i,1); window.updateState({ tasks: state.tasks }); render(); }
    const editTarget = e.target.closest('[data-edit]');
    if(editTarget){
      const i = +editTarget.dataset.edit;
      const newText = prompt('Rename task', state.tasks[currentTab][i].text);
      if(newText){ state.tasks[currentTab][i].text = newText; window.updateState({ tasks: state.tasks }); render(); }
    }
  });

  // Simple on-device companion that breaks goal into steps (heuristic)
  const chat = document.getElementById('chat');
  const input = document.getElementById('chatInput');
  const stepTarget = document.getElementById('stepTarget');
  function sendChat(){
    const msg = input.value.trim(); if(!msg) return; input.value='';
    // persist user message
    state.companion = state.companion || [];
    const userEntry = { who: 'user', text: msg, ts: Date.now() };
    state.companion.push(userEntry);
    window.updateState({ companion: state.companion });
    renderChat();

    const steps = suggestSteps(msg);
    const botEntry = { who: 'zenith', text: steps.map((s,i)=> `${i+1}. ${s}`).join(' '), steps, ts: Date.now() };
    state.companion.push(botEntry);
    window.updateState({ companion: state.companion });
    renderChat();
  }
  function renderChat(){
    chat.innerHTML = '';
    (state.companion||[]).forEach((m,i)=>{
      const cls = m.who==='user' ? 'chat-bubble user' : 'chat-bubble zenith';
      const el = document.createElement('div'); el.className = 'chat-row';
      const bubble = document.createElement('div'); bubble.className = cls; bubble.innerHTML = m.text;
      el.appendChild(bubble);
      if(m.who==='zenith'){
        const addBtn = document.createElement('button'); addBtn.className = 'btn secondary'; addBtn.style.marginLeft='8px'; addBtn.textContent = 'Add to '+(stepTarget?.value||'daily');
        addBtn.addEventListener('click', ()=>{
          const target = stepTarget?.value || 'daily';
          (m.steps||[]).forEach(s=> state.tasks[target].push({ text: s, done:false }));
          window.updateState({ tasks: state.tasks });
          render();
        });
        const wrapper = document.createElement('div'); wrapper.style.marginTop='6px'; wrapper.appendChild(addBtn);
        el.appendChild(wrapper);
      }
      chat.appendChild(el);
    });
    chat.scrollTop = chat.scrollHeight;
  }
  document.getElementById('sendChat').addEventListener('click', sendChat);
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendChat(); }});
  // render persisted companion history on load
  renderChat();
  function suggestSteps(goal){
    if(!goal) return ["Define outcome","Pick a deadline","Set first action"];
    const g = goal.toLowerCase();
    const out = ["Define success metric for '"+goal+"'","Schedule 3 short sessions","Create a checklist"];
    if(g.includes('learn')||g.includes('study')) out.unshift("Choose a course and outline lessons");
    if(g.includes('workout')||g.includes('fitness')) out.unshift("Pick 3 exercises and times");
    if(g.includes('job')||g.includes('resume')) out.unshift("Update resume and portfolio");
    return out;
  }

  // ---------- Goals & Schedules ----------
  function openGoalModal(goal, index){
    editingGoalIndex = (typeof index === 'number') ? index : null;
    document.getElementById('goalModalTitle').textContent = editingGoalIndex===null? 'New Goal' : 'Edit Goal';
    gName.value = goal?.name || '';
    gCadence.value = goal?.cadence || 'daily';
    gTime.value = goal?.time || '';
    gNotes.value = goal?.notes || '';
    const daysSet = new Set(goal?.days||[]);
    gDaysRow.querySelectorAll('input[type="checkbox"]').forEach(cb=> cb.checked = daysSet.has(+cb.value));
    gDaysRow.style.display = gCadence.value==='custom' ? 'flex':'none';
    goalModal.classList.add('show');
  }
  function closeGoalModal(){ goalModal.classList.remove('show'); }
  gCadence.addEventListener('change', ()=>{ gDaysRow.style.display = gCadence.value==='custom' ? 'flex':'none'; });
  addGoalBtn?.addEventListener('click', ()=> openGoalModal());
  cancelGoal?.addEventListener('click', closeGoalModal);
  saveGoal?.addEventListener('click', ()=>{
    const name = gName.value.trim(); if(!name) return alert('Please name your goal.');
    const cadence = gCadence.value;
    const days = Array.from(gDaysRow.querySelectorAll('input:checked')).map(cb=> +cb.value);
    const goal = { name, cadence, days, time: gTime.value, notes: gNotes.value };
    if(editingGoalIndex===null) state.goals.push(goal); else state.goals[editingGoalIndex] = goal;
    window.updateState({ goals: state.goals });
    closeGoalModal(); renderGoals(); ensureTodayTasksFromGoals(); render();
  });
  function renderGoals(){
    if(!goalList) return;
    if(state.goals.length===0){ goalList.innerHTML = '<li style="color:var(--muted)">No goals yet. Add one to start a schedule.</li>'; return; }
    const today = new Date().getDay();
    goalList.innerHTML = state.goals.map((g,i)=>{
      const due = g.cadence==='daily' || (g.cadence==='weekly' && today===1) || (g.cadence==='custom' && g.days.includes(today));
      const tag = due? '<span style="color:#9ff59f">Due today</span>' : '<span style="color:#9fb3ff">Scheduled</span>';
      return `<li style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed var(--border)">
        <div style="flex:1"><b>${g.name}</b> · ${g.cadence}${g.time? ' @ '+g.time:''} ${tag}</div>
        <button class="btn secondary" data-gedit="${i}">Edit</button>
        <button class="btn secondary" data-gdel="${i}">Delete</button>
      </li>`;
    }).join('');
  }
  goalList?.addEventListener('click', (e)=>{
    const ed = e.target.closest('button[data-gedit]');
    const del = e.target.closest('button[data-gdel]');
    if(ed){ const i = +ed.dataset.gedit; openGoalModal(state.goals[i], i); }
    if(del){ const i = +del.dataset.gdel; state.goals.splice(i,1); window.updateState({ goals: state.goals }); renderGoals(); }
  });

  // Create today's tasks from goals if they don't exist
  function ensureTodayTasksFromGoals(){
    const today = new Date().getDay();
    const todayKey = new Date().toISOString().slice(0,10);
    state.goalGen = state.goalGen || {}; // map date->true to avoid duplicate generation
    if(state.goalGen[todayKey]) return; // already generated today
    (state.goals||[]).forEach(g=>{
      const due = g.cadence==='daily' || (g.cadence==='weekly' && today===1) || (g.cadence==='custom' && g.days.includes(today));
      if(!due) return;
      const target = 'daily'; // could expand based on cadence, but daily keeps momentum
      const text = `Goal: ${g.name}` + (g.time? ` @ ${g.time}`:'');
      const exists = (state.tasks[target]||[]).some(t=> t.text===text);
      if(!exists) state.tasks[target].push({ text, done:false });
    });
    state.goalGen[todayKey] = true; window.updateState({ tasks: state.tasks, goalGen: state.goalGen });
  }
  ensureTodayTasksFromGoals();

  renderGoals();
  render();
  // Show a small welcome toast after onboarding (one-time)
  try{
    if(state.onboarded && state.user && !state._welcomeShown){
      const toast = document.getElementById('welcomeToast');
      const wt = document.getElementById('welcomeText');
      if(toast && wt){ wt.textContent = `Welcome, ${state.user.name || 'Friend'} — let’s begin!`; toast.classList.add('show'); setTimeout(()=> toast.classList.remove('show'), 4200); }
      state._welcomeShown = true; window.updateState({ _welcomeShown: true });
    }
  }catch(e){ /* ignore */ }

})();