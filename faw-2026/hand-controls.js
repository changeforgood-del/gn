(()=>{
  if(window.__FAW_HAND_CONTROL__) return;
  window.__FAW_HAND_CONTROL__=true;

  const MP_VERSION='0.4.1675469240';
  const CDN=`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}`;
  const LOG_KEY='fawHandGestureLogV2';
  const state={
    running:false,loading:false,stream:null,hands:null,raf:0,
    cursorX:innerWidth/2,cursorY:innerHeight/2,rawX:innerWidth/2,rawY:innerHeight/2,
    target:null,targetSince:0,lastTargetLabel:'',
    pinch:false,pinchStart:0,pinchClicked:false,lastClick:0,
    palmOpen:false,palmStart:0,lastPalm:null,lastScrollLog:0,scrollAccum:0,
    swipeStart:null,lastSwipe:0,
    tracking:false,lastTrackingLog:0,
    precision:false,prevCube:null,
    logs:[]
  };

  function loadLogs(){try{const x=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');state.logs=Array.isArray(x)?x.slice(-500):[]}catch(e){state.logs=[]}}
  function saveLogs(){try{localStorage.setItem(LOG_KEY,JSON.stringify(state.logs.slice(-500)))}catch(e){}}
  function labelOf(el){if(!el)return'';return (el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.value||el.tagName||'control').trim().replace(/\s+/g,' ').slice(0,90)}
  function logEvent(type,detail={}){
    const entry={at:new Date().toISOString(),type,...detail};state.logs.push(entry);if(state.logs.length>500)state.logs.shift();saveLogs();renderLog();
    try{
      if(typeof db!=='undefined'&&db?.campaigns?.[2026]){
        const c=db.campaigns[2026];c.activity=c.activity||[];
        if(['click','section','camera-start','camera-stop'].includes(type)){
          c.activity.unshift({at:entry.at,summary:`Hand control: ${type}${detail.label?` — ${detail.label}`:''}`,source:'Camera hand tracking'});
          if(typeof save==='function')save();
        }
      }
    }catch(e){}
  }

  loadLogs();
  const css=document.createElement('style');
  css.textContent=`
  #fawHandButton{position:fixed;right:18px;bottom:18px;z-index:10002;border:1px solid rgba(215,182,109,.55);background:linear-gradient(135deg,#e2c47d,#ae7f32);color:#171006;border-radius:999px;padding:12px 16px;font:900 13px/1.1 Inter,Segoe UI,sans-serif;box-shadow:0 14px 42px rgba(0,0,0,.35)}
  #fawHandPanel{position:fixed;right:18px;bottom:72px;z-index:10001;width:min(350px,calc(100vw - 28px));padding:12px;border:1px solid #374b68;border-radius:16px;background:rgba(7,14,25,.96);backdrop-filter:blur(16px);color:#f6f3eb;box-shadow:0 20px 70px rgba(0,0,0,.48);display:none}
  #fawHandPanel.on{display:block}#fawHandVideo{width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);border-radius:12px;background:#02060c}
  #fawHandHud{display:grid;grid-template-columns:auto 1fr;gap:5px 9px;margin-top:8px;font:700 11px/1.35 Inter,Segoe UI,sans-serif}.hc-key{color:#93a5bc}.hc-value{color:#f5eee0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #fawHandStatus{font:600 11px/1.45 Inter,Segoe UI,sans-serif;color:#c9d2df;margin-top:8px;padding:8px;border-radius:10px;background:#0d1828}#fawHandStatus b{color:#f1d99e}
  #fawHandControls{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}#fawHandControls button{border:1px solid #374b68;background:#111d2e;color:#fff;border-radius:10px;padding:9px;font-weight:800}#fawHandControls button.danger{border-color:#5a3140;background:#361822}
  #fawHandLog{margin-top:9px;border-top:1px solid #28384f;padding-top:8px;max-height:116px;overflow:auto;font:600 9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#aeb9c8}#fawHandLog div{padding:2px 0;border-bottom:1px solid rgba(57,72,95,.28)}
  #fawHandCursor{position:fixed;z-index:10005;width:32px;height:32px;border:3px solid #f1d99e;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);box-shadow:0 0 0 7px rgba(215,182,109,.13),0 0 22px rgba(215,182,109,.42);display:none;transition:width .08s,height .08s,border-color .08s,box-shadow .08s}
  #fawHandCursor:after{content:'';position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;background:#fff;transform:translate(-50%,-50%)}
  #fawHandCursor.pinching{width:22px;height:22px;border-color:#68d3a0;box-shadow:0 0 0 10px rgba(104,211,160,.12),0 0 24px rgba(104,211,160,.5)}
  #fawHandCursor.confirming{animation:hcPulse .18s linear infinite alternate}@keyframes hcPulse{to{box-shadow:0 0 0 15px rgba(104,211,160,.22),0 0 26px rgba(104,211,160,.65)}}
  .faw-hand-target{outline:3px solid rgba(241,217,158,.95)!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(241,217,158,.10)!important}
  .faw-hand-click{animation:hcClick .22s ease-out}@keyframes hcClick{50%{transform:scale(.98)}}
  @media(max-width:700px){#fawHandButton{right:12px;bottom:12px}#fawHandPanel{right:12px;bottom:66px;width:min(330px,calc(100vw - 24px))}}
  `;document.head.appendChild(css);

  const button=document.createElement('button');button.id='fawHandButton';button.type='button';button.textContent='✋ Hand Control';button.setAttribute('aria-label','Turn on camera hand controls');
  const panel=document.createElement('div');panel.id='fawHandPanel';panel.innerHTML=`
    <video id="fawHandVideo" autoplay muted playsinline></video>
    <div id="fawHandHud"><span class="hc-key">Gesture</span><span id="hcGesture" class="hc-value">Camera off</span><span class="hc-key">Target</span><span id="hcTarget" class="hc-value">None</span><span class="hc-key">Mode</span><span id="hcMode" class="hc-value">Precision cursor</span></div>
    <div id="fawHandStatus"><b>Simple controls</b><br>Point = aim · Hold pinch briefly = click · Open palm, pause, then move = scroll · Fast sideways open-palm swipe = change section.</div>
    <div id="fawHandControls"><button id="fawHandCenter" type="button">Re-center cursor</button><button id="fawHandStop" class="danger" type="button">Stop camera</button></div>
    <div id="fawHandLog"></div>`;
  const cursor=document.createElement('div');cursor.id='fawHandCursor';document.body.append(button,panel,cursor);
  const video=panel.querySelector('#fawHandVideo'),status=panel.querySelector('#fawHandStatus'),stopBtn=panel.querySelector('#fawHandStop'),centerBtn=panel.querySelector('#fawHandCenter'),gestureEl=panel.querySelector('#hcGesture'),targetEl=panel.querySelector('#hcTarget'),modeEl=panel.querySelector('#hcMode'),logEl=panel.querySelector('#fawHandLog');

  function renderLog(){if(!logEl)return;logEl.innerHTML=state.logs.slice(-12).reverse().map(x=>`<div>${new Date(x.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ${x.type}${x.label?` · ${x.label}`:''}</div>`).join('')||'<div>No hand actions yet.</div>'}
  renderLog();
  const setGesture=t=>gestureEl.textContent=t;
  const setStatus=t=>status.innerHTML=`<b>Hand controls</b><br>${t}`;
  const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const extended=(lm,tip,pip)=>lm[tip].y < lm[pip].y;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function allInteractive(){return [...document.querySelectorAll('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card')].filter(el=>el.offsetParent!==null&&!el.disabled)}
  function nearestInteractive(x,y,radius=68){
    const direct=document.elementFromPoint(x,y)?.closest?.('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card');
    if(direct&&direct.offsetParent!==null&&!direct.disabled)return direct;
    let best=null,bd=radius;
    for(const el of allInteractive()){
      const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
      const cx=clamp(x,r.left,r.right),cy=clamp(y,r.top,r.bottom),d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best=el}
    }return best;
  }
  let highlighted=null;
  function highlight(el){if(highlighted&&highlighted!==el)highlighted.classList.remove('faw-hand-target');highlighted=el;if(el)el.classList.add('faw-hand-target')}
  function setTarget(el){
    if(state.target!==el){const prev=state.target;state.target=el;state.targetSince=performance.now();const label=labelOf(el);targetEl.textContent=label||'None';highlight(el);if(label&&label!==state.lastTargetLabel){state.lastTargetLabel=label;logEvent('hover',{label})}if(prev&&!el)targetEl.textContent='None'}
  }
  function clickTarget(el){
    if(!el)return;const label=labelOf(el);el.classList.add('faw-hand-click');setTimeout(()=>el.classList.remove('faw-hand-click'),240);el.click();logEvent('click',{label});setStatus(`Opened/activated: ${label||'control'}. Release your pinch before the next click.`)
  }
  function navigateSection(dir){const nav=[...document.querySelectorAll('#nav button,[data-section]')].filter(x=>x.offsetParent!==null);if(!nav.length)return;let i=nav.findIndex(x=>x.classList.contains('active'));if(i<0)i=0;i=(i+dir+nav.length)%nav.length;const label=labelOf(nav[i]);nav[i].click();logEvent('section',{label,direction:dir>0?'next':'previous'});setStatus(`Section: ${label}.`)}

  function onResults(results){
    if(!state.running)return;
    const lm=results.multiHandLandmarks&&results.multiHandLandmarks[0];
    if(!lm){
      if(state.tracking&&Date.now()-state.lastTrackingLog>800){logEvent('tracking-lost');state.lastTrackingLog=Date.now()}state.tracking=false;cursor.style.display='none';setTarget(null);state.lastPalm=null;state.swipeStart=null;state.pinch=false;state.pinchStart=0;state.pinchClicked=false;setGesture('No hand');return;
    }
    if(!state.tracking){state.tracking=true;logEvent('tracking-found')}
    cursor.style.display='block';

    const index=lm[8],thumb=lm[4],wrist=lm[0],palm=lm[9];
    const rawX=(1-index.x)*innerWidth,rawY=index.y*innerHeight;
    state.rawX=rawX;state.rawY=rawY;
    const jump=Math.hypot(rawX-state.cursorX,rawY-state.cursorY);
    const alpha=jump>180?.34:jump>80?.25:.16;
    const nx=state.cursorX+(rawX-state.cursorX)*alpha,ny=state.cursorY+(rawY-state.cursorY)*alpha;
    const dead=Math.hypot(nx-state.cursorX,ny-state.cursorY);
    if(dead>1.8){state.cursorX=nx;state.cursorY=ny}

    const fingers=[extended(lm,8,6),extended(lm,12,10),extended(lm,16,14),extended(lm,20,18)];
    const pinchDistance=dist(index,thumb);
    const pinch=pinchDistance<0.047;
    const open=fingers.filter(Boolean).length>=4&&!pinch;
    const two=fingers[0]&&fingers[1]&&!fingers[2]&&!fingers[3]&&!pinch;
    const pointing=fingers[0]&&!fingers[1]&&!fingers[2]&&!fingers[3]&&!pinch;

    if(pointing||pinch||two){
      const target=nearestInteractive(state.cursorX,state.cursorY,pinch?82:68);setTarget(target);
      if(target){const r=target.getBoundingClientRect();const sx=clamp(state.cursorX,r.left+Math.min(10,r.width/2),r.right-Math.min(10,r.width/2));const sy=clamp(state.cursorY,r.top+Math.min(10,r.height/2),r.bottom-Math.min(10,r.height/2));state.cursorX=state.cursorX*.72+sx*.28;state.cursorY=state.cursorY*.72+sy*.28}
    } else setTarget(null);

    cursor.style.left=state.cursorX+'px';cursor.style.top=state.cursorY+'px';

    if(pinch){
      if(!state.pinch){state.pinch=true;state.pinchStart=performance.now();state.pinchClicked=false;logEvent('pinch-start',{label:labelOf(state.target)})}
      const held=performance.now()-state.pinchStart;cursor.classList.add('pinching');cursor.classList.toggle('confirming',held>100&&!state.pinchClicked);setGesture(held<180?'Pinch — hold':'Pinch — click');
      if(held>=180&&!state.pinchClicked&&performance.now()-state.targetSince>=110&&Date.now()-state.lastClick>420){state.pinchClicked=true;state.lastClick=Date.now();clickTarget(state.target)}
    }else{
      if(state.pinch){logEvent('pinch-release',{label:labelOf(state.target),clicked:state.pinchClicked})}
      state.pinch=false;state.pinchStart=0;state.pinchClicked=false;cursor.classList.remove('pinching','confirming');
    }

    if(open){
      if(!state.palmOpen){state.palmOpen=true;state.palmStart=performance.now();state.lastPalm={x:palm.x,y:palm.y,t:performance.now()};state.swipeStart={x:palm.x,y:palm.y,t:performance.now()};state.scrollAccum=0;logEvent('open-palm-start');}
      const openHeld=performance.now()-state.palmStart;
      if(openHeld<260){setGesture('Open palm — steady');modeEl.textContent='Scroll clutch arming';}
      else{
        setGesture('Open palm — scroll');modeEl.textContent='Scroll mode';
        if(state.lastPalm){
          const dy=(palm.y-state.lastPalm.y)*innerHeight;const dx=palm.x-state.lastPalm.x;const dt=performance.now()-state.lastPalm.t;
          if(Math.abs(dy)>7&&Math.abs(dy)<120){const amt=clamp(dy*1.15,-90,90);window.scrollBy({top:amt,left:0,behavior:'auto'});state.scrollAccum+=amt;if(Date.now()-state.lastScrollLog>700&&Math.abs(state.scrollAccum)>30){logEvent('scroll',{pixels:Math.round(state.scrollAccum)});state.scrollAccum=0;state.lastScrollLog=Date.now()}}
          if(state.swipeStart&&performance.now()-state.swipeStart.t<620){const totalDx=palm.x-state.swipeStart.x,totalDy=palm.y-state.swipeStart.y;if(Math.abs(totalDx)>.20&&Math.abs(totalDy)<.11&&Date.now()-state.lastSwipe>900){state.lastSwipe=Date.now();navigateSection(totalDx>0?1:-1);state.swipeStart={x:palm.x,y:palm.y,t:performance.now()}}}
          else state.swipeStart={x:palm.x,y:palm.y,t:performance.now()};
        }
        state.lastPalm={x:palm.x,y:palm.y,t:performance.now()};
      }
    }else{
      if(state.palmOpen){if(Math.abs(state.scrollAccum)>15)logEvent('scroll',{pixels:Math.round(state.scrollAccum)});logEvent('open-palm-end')}
      state.palmOpen=false;state.palmStart=0;state.lastPalm=null;state.swipeStart=null;state.scrollAccum=0;if(!pinch&&!two)modeEl.textContent='Precision cursor';
    }

    const cube=document.querySelector('#cubeCanvas, canvas[data-cube], .cube-wrap canvas');
    if(two&&cube){
      setGesture('Two fingers — 3D control');modeEl.textContent='3D precision mode';
      const rect=cube.getBoundingClientRect();const cx=clamp(state.cursorX,rect.left,rect.right),cy=clamp(state.cursorY,rect.top,rect.bottom);
      if(!state.prevCube){cube.dispatchEvent(new PointerEvent('pointerdown',{clientX:cx,clientY:cy,bubbles:true,pointerId:88,pointerType:'pen',buttons:1}));state.prevCube={x:cx,y:cy};logEvent('3d-start')}
      else{cube.dispatchEvent(new PointerEvent('pointermove',{clientX:cx,clientY:cy,bubbles:true,pointerId:88,pointerType:'pen',buttons:1}));state.prevCube={x:cx,y:cy}}
    }else if(state.prevCube){const cube=document.querySelector('#cubeCanvas, canvas[data-cube], .cube-wrap canvas');if(cube)cube.dispatchEvent(new PointerEvent('pointerup',{clientX:state.prevCube.x,clientY:state.prevCube.y,bubbles:true,pointerId:88,pointerType:'pen',buttons:0}));state.prevCube=null;logEvent('3d-end')}

    if(!pinch&&!open&&!two){setGesture(pointing?'Pointing':'Hand detected');modeEl.textContent='Precision cursor'}
  }

  async function frame(){if(!state.running||!state.hands)return;try{if(video.readyState>=2)await state.hands.send({image:video})}catch(e){}state.raf=requestAnimationFrame(frame)}
  async function start(){
    if(state.running||state.loading)return;state.loading=true;button.disabled=true;button.textContent='Loading hand tracking…';panel.classList.add('on');
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access is not supported in this browser.');
      await loadScript(`${CDN}/hands.js`);if(!window.Hands)throw new Error('Hand tracking library did not load.');
      state.hands=new Hands({locateFile:file=>`${CDN}/${file}`});state.hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.66,minTrackingConfidence:.62});state.hands.onResults(onResults);
      state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960},height:{ideal:720},frameRate:{ideal:30,max:30}},audio:false});video.srcObject=state.stream;await video.play();
      state.running=true;state.loading=false;button.disabled=false;button.textContent='✋ Hand Control ON';setStatus('Camera active. Use one index finger to aim. Targets will magnetically highlight before a click.');setGesture('Finding hand');logEvent('camera-start');frame();
    }catch(err){state.loading=false;button.disabled=false;button.textContent='✋ Hand Control';panel.classList.add('on');setStatus(`${err.message||'Could not start camera.'} Camera permission may need to be enabled in your browser settings.`);logEvent('camera-error',{message:err.message||'unknown'})}
  }
  function stop(){
    if(state.running)logEvent('camera-stop');state.running=false;state.loading=false;if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;if(state.stream)state.stream.getTracks().forEach(t=>t.stop());state.stream=null;video.srcObject=null;cursor.style.display='none';setTarget(null);panel.classList.remove('on');button.disabled=false;button.textContent='✋ Hand Control';setGesture('Camera off');modeEl.textContent='Precision cursor';setStatus('Camera stopped.');
  }
  function recenter(){state.cursorX=innerWidth/2;state.cursorY=innerHeight/2;state.rawX=state.cursorX;state.rawY=state.cursorY;cursor.style.left=state.cursorX+'px';cursor.style.top=state.cursorY+'px';logEvent('recenter');setStatus('Cursor re-centered. Point naturally and continue.')}
  button.addEventListener('click',()=>state.running?stop():start());stopBtn.addEventListener('click',stop);centerBtn.addEventListener('click',recenter);window.addEventListener('resize',()=>{state.cursorX=clamp(state.cursorX,0,innerWidth);state.cursorY=clamp(state.cursorY,0,innerHeight)});window.addEventListener('pagehide',stop,{once:true});
})();