
/* V15 patch: keep the UI usable with Android's soft keyboard and add intuitive horizontal swipes. */
(function(){
  const MOBILE=()=>window.matchMedia('(max-width:700px)').matches;
  const mainTabs=()=>{
    const tabs=document.querySelector('.kt-tabs');
    if(!tabs) return [];
    const btns=[...tabs.querySelectorAll('.kt-tab')];
    return btns.slice(0,4); // Trening, Povijest, Progres, Vježbe. "Više" remains a menu.
  };
  const goTo=(index)=>{
    const b=mainTabs()[index];
    if(b){b.click(); const nav=document.getElementById('zdv9-more'); if(nav)nav.classList.remove('open');}
  };

  // Horizontal swipe between the four main sections.
  let sx=0,sy=0,tracking=false,swiping=false;
  document.addEventListener('touchstart',e=>{
    if(!MOBILE()||e.touches.length!==1) return;
    const t=e.target;
    if(t.closest('#zdv9-bottom-nav,#zdv9-more,input,textarea,select,button,[contenteditable="true"]')) return;
    sx=e.touches[0].clientX; sy=e.touches[0].clientY; tracking=true; swiping=false;
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!tracking||e.touches.length!==1) return;
    const dx=e.touches[0].clientX-sx, dy=e.touches[0].clientY-sy;
    if(Math.abs(dx)>18 && Math.abs(dx)>Math.abs(dy)*1.25){swiping=true; if(Math.abs(dx)>45)e.preventDefault();}
  },{passive:false});
  document.addEventListener('touchend',e=>{
    if(!tracking) return;
    tracking=false;
    if(!swiping) return;
    const dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)<50) return;
    const tabs=mainTabs();
    if(tabs.length<4) return;
    let active=tabs.findIndex(b=>b.classList.contains('active'));
    if(active<0) active=0;
    if(dx<0) goTo((active+1)%4); else goTo((active+3)%4);
  },{passive:true});

  // Android keyboard handling. visualViewport reports the actually visible area.
  const updateKeyboard=()=>{
    if(!window.visualViewport) return;
    const vv=window.visualViewport;
    const gap=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);
    const open=gap>140;
    document.documentElement.style.setProperty('--zd-keyboard-offset',(open?gap:0)+'px');
    document.body.classList.toggle('zd-keyboard-open',open);
    if(open){
      const active=document.activeElement;
      if(active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)){
        setTimeout(()=>active.scrollIntoView({block:'center',inline:'nearest'}),80);
      }
    }
  };
  if(window.visualViewport){
    visualViewport.addEventListener('resize',updateKeyboard,{passive:true});
    visualViewport.addEventListener('scroll',updateKeyboard,{passive:true});
  }
  document.addEventListener('focusin',()=>setTimeout(updateKeyboard,120),{passive:true});
  document.addEventListener('focusout',()=>setTimeout(updateKeyboard,180),{passive:true});
  window.addEventListener('resize',updateKeyboard,{passive:true});
  setTimeout(updateKeyboard,300);
})();
