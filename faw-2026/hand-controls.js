(()=>{
  if(window.__FAW_HAND_CONTROL_V3__) return;
  window.__FAW_HAND_CONTROL_V3__=true;

  const MP_VERSION='0.4.1675469240';
  const CDN=`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}`;
  const LOG_KEY='fawHandGestureLogV3';
  const state={running:false,loading:false,stream:null,hands:null,raf:0,logs:[],activePair:null,pairStart:0,startY:0,lastY:0,startX:0,lastX:0,dragged:false,lastAction:0,hover:null};

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const labelOf=el=>el?((el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.value||el.tagName||'control').trim().replace(/\s+/g,' ').slice(0,80)):'';
  function loadLogs(){try{const x=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');state.logs=Array.isArray(x)?x.slice(-300):[]}catch(e){state.logs=[]}}
  function saveLogs(){try{localStorage.setItem(LOG_KEY,JSON.stringify(state.logs.slice(-300)))}catch(e){}}
  function logEvent(type,detail={}){const e={at:new Date().toISOString(),type,...detail};state.logs.push(e);saveLogs();renderLog();try{if(typeof db!=='undefined'&&db?.campaigns?.[2026]&&['click','drag-scroll','close','section'].includes(type)){db.campaigns[2026].activity.unshift({at:e.at,summary:`Hand control: ${type}${detail.label?` — ${detail.label}`:''}`,source:'Camera hand tracking'});if(typeof save==='function')save()}}catch(err){}}
  loadLogs();

  const css=document.createElement('style');css.textContent=`
  #fawHandButton{position:fixed;right:16px;bottom:16px;z-index:10010;border:1px solid rgba(215,182,109,.6);background:linear-gradient(135deg,#e2c47d,#ae7f32);color:#171006;border-radius:999px;padding:12px 16px;font:900 13px/1 Inter,Segoe UI,sans-serif;box-shadow:0 14px 42px rgba(0,0,0,.35)}
  #fawHandPanel{position:fixed;right:16px;bottom:68px;z-index:10009;width:min(370px,calc(100vw - 24px));padding:12px;border:1px solid #374b68;border-radius:16px;background:rgba(7,14,25,.97);color:#f6f3eb;box-shadow:0 20px 70px rgba(0,0,0,.5);display:none}#fawHandPanel.on{display:block}
  #fawHandVideoWrap{position:relative}#fawHandVideo{width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);border-radius:12px;background:#02060c}#fawFingerLayer{position:absolute;inset:0;pointer-events:none}
  .hc-finger{position:absolute;width:24px;height:24px;border-radius:50%;transform:translate(-50%,-50%);display:grid;place-items:center;font:900 9px/1 Inter;background:rgba(7,14,25,.78);border:2px solid #d8e2f0;color:#fff;box-shadow:0 0 0 5px rgba(255,255,255,.06)}.hc-finger.snap{border-color:#f1d99e;box-shadow:0 0 0 7px rgba(241,217,158,.15),0 0 20px rgba(241,217,158,.35)}.hc-finger.active{border-color:#68d3a0;box-shadow:0 0 0 9px rgba(104,211,160,.15),0 0 24px rgba(104,211,160,.5)}
  .faw-hand-target{outline:3px solid rgba(241,217,158,.96)!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(241,217,158,.1)!important}
  #fawHandHud{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;margin-top:9px;font:700 11px/1.35 Inter}.hc-key{color:#93a5bc}.hc-value{color:#f5eee0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #fawGestureGuide{margin-top:9px;padding:9px;border-radius:10px;background:#0d1828;font:650 10px/1.5 Inter;color:#cbd5e2}#fawGestureGuide b{color:#f1d99e}
  #fawHandControls{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}#fawHandControls button{border:1px solid #374b68;background:#111d2e;color:#fff;border-radius:10px;padding:9px;font-weight:800}#fawHandControls .danger{background:#361822;border-color:#5a3140}
  #fawHandLog{margin-top:8px;border-top:1px solid #28384f;padding-top:7px;max-height:90px;overflow:auto;font:600 9px/1.4 ui-monospace,monospace;color:#aeb9c8}
  @media(max-width:700px){#fawHandButton{right:10px;bottom:10px}#fawHandPanel{right:10px;bottom:62px}}
  `;document.head.appendChild(css);

  const button=document.createElement('button');button.id='fawHandButton';button.type='button';button.textContent='✋ Hand Control';
  const panel=document.createElement('div');panel.id='fawHandPanel';panel.innerHTML=`
    <div id="fawHandVideoWrap"><video id="fawHandVideo" autoplay muted playsinline></video><div id="fawFingerLayer"></div></div>
    <div id="fawHandHud"><span class="hc-key">Gesture</span><span id="hcGesture" class="hc-value">Camera off</span><span class="hc-key">Target</span><span id="hcTarget" class="hc-value">None</span><span class="hc-key">Action</span><span id="hcAction" class="hc-value">None</span></div>
    <div id="fawGestureGuide"><b>Easy controls</b><br>🤏 Thumb + index = grab page; drag up/down. Hold still + release = click.<br>🖕 Thumb + middle = fine scroll.<br>💍 Thumb + ring = close/back.<br>🤙 Thumb + pinky = next section.<br>✌️ Index + middle = 3D move.</div>
    <div id="fawHandControls"><button id="fawHandCenter" type="button">Reset view</button><button id="fawHandStop" class="danger" type="button">Stop camera</button></div><div id="fawHandLog"></div>`;
  document.body.append(button,panel);
  const video=panel.querySelector('#fawHandVideo'),layer=panel.querySelector('#fawFingerLayer'),gestureEl=panel.querySelector('#hcGesture'),targetEl=panel.querySelector('#hcTarget'),actionEl=panel.querySelector('#hcAction'),logEl=panel.querySelector('#fawHandLog'),stopBtn=panel.querySelector('#fawHandStop'),centerBtn=panel.querySelector('#fawHandCenter');
  const dots={};[['T','thumb'],['I','index'],['M','middle'],['R','ring'],['P','pinky']].forEach(([t,k])=>{const d=document.createElement('div');d.className='hc-finger';d.textContent=t;layer.appendChild(d);dots[k]=d});
  function renderLog(){if(!logEl)return;logEl.innerHTML=state.logs.slice(-8).reverse().map(x=>`<div>${new Date(x.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ${x.type}${x.label?` · ${x.label}`:''}</div>`).join('')||'<div>No actions yet.</div>'}renderLog();
  const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});

  function interactiveEls(){return [...document.querySelectorAll('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card')].filter(el=>el.offsetParent!==null&&!el.disabled&&el!==button&&el!==stopBtn&&el!==centerBtn)}
  function nearest(x,y,radius=90){let best=document.elementFromPoint(x,y)?.closest?.('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card');if(best&&best.offsetParent!==null&&!best.disabled)return best;let bd=radius;best=null;for(const el of interactiveEls()){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;const cx=clamp(x,r.left,r.right),cy=clamp(y,r.top,r.bottom),d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best=el}}return best}
  function setHover(el){if(state.hover&&state.hover!==el)state.hover.classList.remove('faw-hand-target');state.hover=el;if(el)el.classList.add('faw-hand-target');targetEl.textContent=labelOf(el)||'None'}
  function clickTarget(){if(!state.hover)return;const label=labelOf(state.hover);state.hover.click();logEvent('click',{label});actionEl.textContent=`Opened ${label}`}
  function closeOrBack(){const close=document.querySelector('.drawer.open .close,.modal.open .close,.drawer.open [data-close],.modal.open [data-close]');if(close){const l=labelOf(close)||'panel';close.click();logEvent('close',{label:l});actionEl.textContent='Closed panel';return}const active=document.querySelector('#nav button.active,[data-section].active');const overview=[...document.querySelectorAll('#nav button,[data-section]')].find(x=>/overview/i.test(labelOf(x)));if(overview&&active!==overview){overview.click();logEvent('close',{label:'Return to Overview'});actionEl.textContent='Returned to Overview'}}
  function nextSection(){const nav=[...document.querySelectorAll('#nav button,[data-section]')].filter(x=>x.offsetParent!==null);if(!nav.length)return;let i=nav.findIndex(x=>x.classList.contains('active'));if(i<0)i=0;i=(i+1)%nav.length;const l=labelOf(nav[i]);nav[i].click();logEvent('section',{label:l});actionEl.textContent=`Section: ${l}`}
  function clearPairVisuals(){Object.values(dots).forEach(d=>d.classList.remove('active'))}
  function finishPair(){
    if(!state.activePair)return;
    const pair=state.activePair,held=performance.now()-state.pairStart,wasDragged=state.dragged;
    if(pair==='index'&&!wasDragged&&held>110&&held<900)clickTarget();
    logEvent('pinch-release',{finger:pair,dragged:wasDragged,held:Math.round(held)});
    state.activePair=null;state.pairStart=0;state.dragged=false;clearPairVisuals();
  }
  function beginPair(chosen,screen){
    state.activePair=chosen;state.pairStart=performance.now();state.startY=screen[chosen].y;state.lastY=screen[chosen].y;state.startX=screen[chosen].x;state.lastX=screen[chosen].x;state.dragged=false;dots[chosen].classList.add('active');dots.thumb.classList.add('active');logEvent('pinch-start',{finger:chosen});
  }

  function onResults(results){
    if(!state.running)return;const lm=results.multiHandLandmarks?.[0];
    if(!lm){Object.values(dots).forEach(d=>d.style.display='none');gestureEl.textContent='No hand';targetEl.textContent='None';setHover(null);finishPair();return}
    const tips={thumb:lm[4],index:lm[8],middle:lm[12],ring:lm[16],pinky:lm[20]};
    Object.entries(tips).forEach(([k,p])=>{const d=dots[k];d.style.display='grid';d.style.left=((1-p.x)*100)+'%';d.style.top=(p.y*100)+'%';d.classList.remove('snap');const sx=(1-p.x)*innerWidth,sy=p.y*innerHeight;if(nearest(sx,sy,75))d.classList.add('snap')});
    const screen={};Object.entries(tips).forEach(([k,p])=>screen[k]={x:(1-p.x)*innerWidth,y:p.y*innerHeight});
    const pairs=[['index',dist(tips.thumb,tips.index)],['middle',dist(tips.thumb,tips.middle)],['ring',dist(tips.thumb,tips.ring)],['pinky',dist(tips.thumb,tips.pinky)]].sort((a,b)=>a[1]-b[1]);
    const chosen=pairs[0][1]<0.052?pairs[0][0]:null;

    if(!chosen&&state.activePair)finishPair();
    if(chosen&&chosen!==state.activePair){if(state.activePair)finishPair();beginPair(chosen,screen)}

    const active=state.activePair;
    const point=screen[active||'index'];setHover(nearest(point.x,point.y,active==='index'?105:80));

    if(active==='index'){
      const dy=screen.index.y-state.lastY,total=Math.hypot(screen.index.x-state.startX,screen.index.y-state.startY);if(total>11)state.dragged=true;
      if(state.dragged&&Math.abs(dy)>1.5){window.scrollBy({top:-dy*1.12,left:0,behavior:'auto'});actionEl.textContent='Grabbing page';gestureEl.textContent='Thumb + index — drag';if(Date.now()-state.lastAction>180){state.lastAction=Date.now();logEvent('drag-scroll',{delta:Math.round(-dy)})}}
      else{gestureEl.textContent='Thumb + index — hold/click';actionEl.textContent='Hold still, then release to click'}
      state.lastY=screen.index.y;state.lastX=screen.index.x;
    }else if(active==='middle'){
      const dy=screen.middle.y-state.lastY;if(Math.abs(dy)>1.2)window.scrollBy({top:-dy*.55,left:0,behavior:'auto'});state.lastY=screen.middle.y;gestureEl.textContent='Thumb + middle — fine scroll';actionEl.textContent='Fine scrolling';
    }else if(active==='ring'){
      gestureEl.textContent='Thumb + ring — close/back';if(performance.now()-state.pairStart>170&&Date.now()-state.lastAction>700){state.lastAction=Date.now();closeOrBack()}
    }else if(active==='pinky'){
      gestureEl.textContent='Thumb + pinky — next section';if(performance.now()-state.pairStart>170&&Date.now()-state.lastAction>800){state.lastAction=Date.now();nextSection()}
    }else{
      gestureEl.textContent='Pointing';actionEl.textContent='Move any fingertip near a control';
      const twoUp=lm[8].y<lm[6].y&&lm[12].y<lm[10].y&&lm[16].y>lm[14].y&&lm[20].y>lm[18].y;const cube=document.querySelector('#cubeCanvas,.cube-wrap canvas');if(twoUp&&cube){const p=screen.index,r=cube.getBoundingClientRect();cube.dispatchEvent(new PointerEvent('pointermove',{clientX:clamp(p.x,r.left,r.right),clientY:clamp(p.y,r.top,r.bottom),bubbles:true,pointerId:88,pointerType:'pen',buttons:1}));gestureEl.textContent='Two fingers — 3D move';actionEl.textContent='Moving 3D view'}
    }
  }

  async function frame(){if(!state.running||!state.hands)return;try{if(video.readyState>=2)await state.hands.send({image:video})}catch(e){}state.raf=requestAnimationFrame(frame)}
  async function start(){if(state.running||state.loading)return;state.loading=true;button.disabled=true;button.textContent='Loading…';panel.classList.add('on');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera not supported');await loadScript(`${CDN}/hands.js`);state.hands=new Hands({locateFile:file=>`${CDN}/${file}`});state.hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.65,minTrackingConfidence:.6});state.hands.onResults(onResults);state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});video.srcObject=state.stream;await video.play();state.running=true;state.loading=false;button.disabled=false;button.textContent='✋ Hand Control ON';gestureEl.textContent='Show your hand';actionEl.textContent='Ready';logEvent('camera-start');frame()}catch(e){state.loading=false;button.disabled=false;button.textContent='✋ Hand Control';gestureEl.textContent='Camera error';actionEl.textContent=e.message||'Could not start camera'}}
  function stop(){state.running=false;state.loading=false;if(state.raf)cancelAnimationFrame(state.raf);if(state.stream)state.stream.getTracks().forEach(t=>t.stop());state.stream=null;video.srcObject=null;Object.values(dots).forEach(d=>d.style.display='none');setHover(null);finishPair();panel.classList.remove('on');button.disabled=false;button.textContent='✋ Hand Control';logEvent('camera-stop')}
  button.addEventListener('click',()=>state.running?stop():start());stopBtn.addEventListener('click',stop);centerBtn.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});actionEl.textContent='View reset';logEvent('reset-view')});window.addEventListener('pagehide',stop,{once:true});
})();