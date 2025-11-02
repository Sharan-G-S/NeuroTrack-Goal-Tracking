(function(){
  document.getElementById('year').textContent = new Date().getFullYear();
  const st = window.appState;
  const skin = document.getElementById('skin');
  const hair = document.getElementById('hair');
  const color = document.getElementById('color');
  const preview = document.getElementById('preview');

  function syncInputs(){
    skin.value = st.avatarSkin || '#ffd1a9';
    hair.value = st.avatarHair || '#3b2f2f';
    color.value = st.avatarColor || '#7dd3fc';
  }
  function render(){ preview.innerHTML = window.renderAvatar(220); }

  syncInputs(); render();
  ;[skin,hair,color].forEach(inp=> inp.addEventListener('input', ()=>{
    window.updateState({ avatarSkin: skin.value, avatarHair: hair.value, avatarColor: color.value });
    render();
  }));

  document.getElementById('save').addEventListener('click', ()=>{
    alert('Avatar saved!');
    render();
  });
  document.getElementById('random').addEventListener('click', ()=>{
    const rand = ()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
    window.updateState({ avatarSkin: rand(), avatarHair: rand(), avatarColor: rand() });
    syncInputs(); render();
  });
})();