(()=>{
  if(window.__FAW_HAND_MOBILE__) return;
  window.__FAW_HAND_MOBILE__=true;

  const css=document.createElement('style');
  css.textContent=`
    #fawHandPanel{transition:width .18s ease,padding .18s ease,bottom .18s ease,right .18s ease}
    #fawHandMiniBar{display:flex;align-items:center;gap:7px;margin-bottom:8px}
    #fawHandMiniTitle{font:800 11px/1 Inter,Segoe UI,sans-serif;color:#f5eee0;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #fawHandMiniBtn,#fawHandQuickStop{min-width:42px;min-height:38px;border-radius:10px;border:1px solid #374b68;background:#111d2e;color:#fff;font-weight:900}
    #fawHandQuickStop{border-color:#5a3140;background:#361822}
    #fawHandPanel.hc-minimized{width:auto!important;max-width:calc(100vw - 20px)!important;padding:7px 8px!important;right:10px!important;bottom:62px!important;border-radius:999px!important}
    #fawHandPanel.hc-minimized #fawHandVideoWrap,
    #fawHandPanel.hc-minimized #fawHandHud,
    #fawHandPanel.hc-minimized #fawScrollMeter,
    #fawHandPanel.hc-minimized #fawGestureGuide,
    #fawHandPanel.hc-minimized #fawHandControls,
    #fawHandPanel.hc-minimized #fawHandLog{display:none!important}
    #fawHandPanel.hc-minimized #fawHandMiniBar{margin:0}
    #fawHandPanel.hc-minimized #fawHandMiniTitle{max-width:150px}
    #fawHandPanel.hc-minimized #fawHandMiniBtn{border-radius:999px;min-width:44px;padding:0 12px}
    #fawHandPanel.hc-minimized #fawHandQuickStop{border-radius:999px;min-width:44px;padding:0 12px}
    @media(max-width:700px){
      #fawHandPanel{left:10px!important;right:10px!important;bottom:64px!important;width:auto!important;max-height:72vh;overflow:auto;-webkit-overflow-scrolling:touch}
      #fawHandPanel.hc-minimized{left:auto!important;right:10px!important;width:auto!important;max-height:none!important;overflow:visible!important}
      #fawHandVideo{aspect-ratio:16/11!important;max-height:34vh!important}
      #fawGestureGuide{font-size:9.5px!important;line-height:1.4!important}
      #fawHandLog{max-height:64px!important}
      #fawHandControls button{min-height:42px}
    }
    @media(max-width:420px){
      #fawHandPanel{left:8px!important;right:8px!important;bottom:60px!important;padding:9px!important}
      #fawHandPanel.hc-minimized{left:auto!important;right:8px!important;padding:6px 7px!important}
      #fawHandMiniTitle{font-size:10px}
      #fawHandPanel.hc-minimized #fawHandMiniTitle{max-width:112px}
    }
  `;
  document.head.appendChild(css);

  function init(){
    const panel=document.querySelector('#fawHandPanel');
    if(!panel||document.querySelector('#fawHandMiniBar')) return false;
    const bar=document.createElement('div');
    bar.id='fawHandMiniBar';
    bar.innerHTML=`<span id="fawHandMiniTitle">✋ Hand tracking active</span><button id="fawHandMiniBtn" type="button" aria-label="Minimize hand camera">—</button><button id="fawHandQuickStop" type="button" aria-label="Stop hand camera">■</button>`;
    panel.prepend(bar);
    const mini=bar.querySelector('#fawHandMiniBtn'),quickStop=bar.querySelector('#fawHandQuickStop'),title=bar.querySelector('#fawHandMiniTitle');
    const originalStop=document.querySelector('#fawHandStop');

    function setMinimized(on){
      panel.classList.toggle('hc-minimized',on);
      mini.textContent=on?'↗':'—';
      mini.setAttribute('aria-label',on?'Expand hand camera':'Minimize hand camera');
      title.textContent=on?'✋ Hand control ON':'✋ Hand tracking active';
      try{localStorage.setItem('fawHandPanelMinimized',on?'1':'0')}catch(e){}
    }
    mini.addEventListener('click',()=>setMinimized(!panel.classList.contains('hc-minimized')));
    title.addEventListener('click',()=>{if(panel.classList.contains('hc-minimized'))setMinimized(false)});
    title.style.cursor='pointer';
    quickStop.addEventListener('click',()=>{if(originalStop)originalStop.click();panel.classList.remove('hc-minimized')});

    let startY=0,startX=0,dragging=false;
    bar.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;startY=e.clientY;startX=e.clientX;dragging=true;bar.setPointerCapture?.(e.pointerId)});
    bar.addEventListener('pointermove',e=>{if(!dragging)return;const dy=e.clientY-startY,dx=e.clientX-startX;if(Math.abs(dy)>18||Math.abs(dx)>18){if(dy>28)setMinimized(true);if(dy<-28)setMinimized(false);dragging=false}});
    bar.addEventListener('pointerup',()=>{dragging=false});

    try{if(localStorage.getItem('fawHandPanelMinimized')==='1')setMinimized(true)}catch(e){}
    return true;
  }

  if(!init()){
    const obs=new MutationObserver(()=>{if(init())obs.disconnect()});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>{init();obs.disconnect()},8000);
  }
})();