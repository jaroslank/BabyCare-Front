/* =============================
   BabyCare — js/script.js
   Interações básicas conforme o wireframe
   (sem dependências externas)
============================= */
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // 1) Habilita JS
  document.documentElement.classList.remove('no-js');

  // 2) Scroll reveal (suave)
  try {
    const observer = new IntersectionObserver((entries)=>{
      for (const e of entries){
        if(e.isIntersecting){
          e.target.classList.add('in');
          observer.unobserve(e.target);
        }
      }
    }, { threshold: .15 });
    $$('.reveal').forEach(el=>observer.observe(el));
  } catch(err){ /* OK sem observer */ }

  // 3) Mini sistema de eventos de ação (data-action="...")
  document.addEventListener('click', (ev)=>{
    const btn = ev.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    switch(action){
      case 'open-drawer': return openDrawer(btn);
      case 'open-settings': return openSettings(btn);
      case 'add-medicine': return addMedicine(btn);
      case 'add-child': return addChild(btn);
      case 'quick-add': return quickAdd(btn);
    }
  });

  // 4) Drawer/Config (placeholder não intrusivo — pronto para evoluir)
  function openDrawer(btn){
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    toast(expanded ? 'Menu fechado' : 'Menu aberto');
  }
  function openSettings(btn){
    toast('Abrindo configurações…');
  }

  // 5) Remédios diários — adiciona novo ícone e persiste em localStorage
  function addMedicine(btn){
    const card = btn.closest('.bc-child__card');
    if(!card) return;
    const pills = $('.bc-child__pills', card);
    if(!pills) return;
    const img = document.createElement('img');
    img.alt = 'Remédio';
    img.src = 'img/icons/pill.svg';
    pills.appendChild(img);

    // persistência simples
    const key = 'bc_meds_child_0';
    const count = $$('.bc-child__pills img', card).length;
    try { localStorage.setItem(key, String(count)); } catch(err){}
  }

  // 6) Adicionar novo cartão de criança (clone simples)
  function addChild(btn){
    const card = btn.closest('.bc-child__card');
    if(!card) return;
    const clone = card.cloneNode(true);
    // zera pílulas extra do clone (mantém 0)
    const pills = $$('.bc-child__pills img', clone);
    if(pills.length > 2){
      pills.slice(2).forEach(n=>n.remove());
    }
    // altera nome temporariamente
    const name = $('.bc-child__name', clone);
    if(name){ name.textContent = 'Nova criança'; }
    // insere após a seção bc-child
    const section = card.closest('.bc-child');
    section.appendChild(document.createElement('div')).appendChild(clone);
    toast('Novo cartão adicionado');
  }

  // 7) Ação rápida do FAB
  function quickAdd(){
    toast('Ação rápida');
  }

  // 8) Toast leve (aria-live)
  const live = document.createElement('div');
  live.setAttribute('aria-live','polite');
  live.style.position='fixed';
  live.style.inset='auto 10px 76px auto';
  live.style.background='rgba(0,0,0,.8)';
  live.style.color='#fff';
  live.style.padding='8px 12px';
  live.style.borderRadius='12px';
  live.style.fontSize='.9rem';
  live.style.opacity='0';
  live.style.transition='opacity .2s ease';
  live.style.pointerEvents='none';
  live.style.zIndex='9999';
  document.body.appendChild(live);

  let liveTimer=null;
  function toast(msg){
    live.textContent = msg;
    live.style.opacity='1';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(()=>{ live.style.opacity='0'; }, 1300);
  }

  // Código para exibir o nome e avatar do usuário no header
  document.addEventListener('DOMContentLoaded', () => {
    const userNameHeader = document.getElementById('user-name-header');
    const userAvatar = document.getElementById('user-avatar');
    
    // Função para atualizar o header do usuário
    const updateUserHeader = (user) => {
      if (userNameHeader && user && user.nome) {
        userNameHeader.textContent = user.nome;
      }
      if (userAvatar && user && user.avatar_url) {
        userAvatar.src = user.avatar_url;
      } else if (userAvatar) {
        // Fallback para um avatar padrão caso não tenha foto
        userAvatar.src = 'assets/img/avatar.png';
      }
    };
    
    // Tenta pegar o usuário do sessionStorage primeiro
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (user && user.nome) {
      updateUserHeader(user);
    } else {
      // Se não encontrar, busca na API
      fetch('https://babycare-api.onrender.com/auth/user', { credentials: 'include' })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.nome) {
            sessionStorage.setItem('user', JSON.stringify(userData));
            updateUserHeader(userData);
          } else if (userNameHeader) {
            userNameHeader.textContent = 'Visitante';
          }
        })
        .catch(() => {
          if (userNameHeader) {
            userNameHeader.textContent = 'Visitante';
          }
        });
    }
});
})();
