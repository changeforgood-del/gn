(()=>{
  if(window.__FAW_HAND_CONTROL_V5__) return;
  window.__FAW_HAND_CONTROL_V5__=true;

  const MP_VERSION='0.4.1675469240';
  const CDN=`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}`;
  const LOG_KEY='fawHandGestureLogV5';
  const state={running:false,loading:false,stream:null,hands:null,raf:0,scrollRaf:0,scrollVelocity:0,cursorX:innerWidth/2,cursorY:innerHeight/2,hover:null,pinching:false,pinchStart:0,pinchMoved:false,lastClick:0,samples:[],lastFlick:0,logs:[]};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const labelOf=el=>el?((el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.value||el.tagName||'control').trim().replace(/\s+/g,' ').slice(0,80)):'';

  function loadLogs(){try{const x=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');state.logs=Array.isArray(x)?x.slice(-300):[]}catch(e){state.logs=[]}}
  function saveLogs(){try{localStorage.setItem(LOG_KEY,JSON.stringify(state.logs.slice(-300)))}catch(e){}}
  function logEvent(type,detail={}){const e={at:new Date().toISOString(),type,...detail};state.logs.push(e);if(state.logs.length>300)state.logs.shift();saveLogs();renderLog();try{if(typeof db!=='undefined'&&db?.campaigns?.[2026]&&['click','finger-flick'].includes(type)){db.campaigns[2026].activity.unshift({at:e.at,summary:`Hand control: ${type}${detail.label?` — ${detail.label}`:''}`,source:'Camera hand tracking'});if(typeof save==='function')save()}}catch(err){}}
  loadLogs();

  const css=document.createElement('style');
  css.textContent=`
    #fawHandButton{position:fixed;right:16px;bottom:16px;z-index:10010;border:1px solid rgba(215,182,109,.6);background:linear-gradient(135deg,#e2c47d,#ae7f32);color:#171006;border-radius:999px;padding:12px 16px;font:900 13px/1 Inter,Segoe UI,sans-serif;box-shadow:0 14px 42px rgba(0,0,0,.35)}
    #fawHandPanel{position:fixed;right:16px;bottom:68px;z-index:10009;width:min(360px,calc(100vw - 24px));padding:12px;border:1px solid #374b68;border-radius:16px;background:rgba(7,14,25,.97);color:#f6f3eb;box-shadow:0 20px 70px rgba(0,0,0,.5);display:none}#fawHandPanel.on{display:block}
    #fawHandVideoWrap{position:relative}#fawHandVideo{width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);border-radius:12px;background:#02060c}
    #fawFingerLayer{position:absolute;inset:0;pointer-events:none}.hc-finger{position:absolute;width:26px;height:26px;border-radius:50%;transform:translate(-50%,-50%);display:none;place-items:center;font:900 9px/1 Inter;background:rgba(7,14,25,.82);border:2px solid #f1d99e;color:#fff}.hc-finger.active{border-color:#68d3a0;box-shadow:0 0 0 8px rgba(104,211,160,.16)}
    #fawAirCursor{position:fixed;z-index:10020;width:30px;height:30px;border:3px solid #f1d99e;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);display:none;box-shadow:0 0 0 7px rgba(241,217,158,.12),0 0 22px rgba(241,217,158,.4)}#fawAirCursor.pinch{width:20px;height:20px;border-color:#68d3a0}
    .faw-hand-target{outline:3px solid rgba(241,217,158,.96)!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(241,217,158,.1)!important}
    #fawHandHud{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;margin-top:9px;font:700 11px/1.35 Inter}.hc-key{color:#93a5bc}.hc-value{color:#f5eee0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #fawScrollMeter{height:10px;border-radius:999px;background:#0b1422;border:1px solid #2d3b51;margin-top:9px;position:relative;overflow:hidden}#fawScrollThumb{position:absolute;left:50%;top:1px;height:6px;width:12px;border-radius:999px;background:#68d3a0;transform:translateX(-50%)}
    #fawGestureGuide{margin-top:9px;padding:9px;border-radius:10px;background:#0d1828;font:650 10px/1.5 Inter;color:#cbd5e2}#fawGestureGuide b{color:#f1d99e}
    #fawHandControls{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}#fawHandControls button{border:1px solid #374b68;background:#111d2e;color:#fff;border-radius:10px;padding:9px;font-weight:800}#fawHandControls .danger{background:#361822;border-color:#5a3140}
    #fawHandLog{margin-top:8px;border-top:1px solid #28384f;padding-top:7px;max-height:80px;overflow:auto;font:600 9px/1.4 ui-monospace,monospace;color:#aeb9c8}
    @media(max-width:700px){#fawHandButton{right:10px;bottom:10px}#fawHandPanel{right:10px;bottom:62px}}
  `;
  document.head.appendChild(css);

  const button=document.createElement('button');button.id='fawHandButton';button.type='button';button.textContent='☝️ Finger Control';
  const panel=document.createElement('div');panel.id='fawHandPanel';panel.innerHTML=`
    <div id="fawHandVideoWrap"><video id="fawHandVideo" autoplay muted playsinline></video><div id="fawFingerLayer"></div></div>
    <div id="fawHandHud"><span class="hc-key">Gesture</span><span id="hcGesture" class="hc-value">Camera off</span><span class="hc-key">Target</span><span id="hcTarget" class="hc-value">None</span><span class="hc-key">Scroll</span><span id="hcAction" class="hc-value">Stopped</span></div>
    <div id="fawScrollMeter"><div id="fawScrollThumb"></div></div>
    <div id="fawGestureGuide"><b>Phone-style air controls</b><br>☝️ Index finger = pointer.<br>⬆️ Flick index upward = rapidly scroll DOWN the page.<br>⬇️ Flick index downward = rapidly scroll UP the page.<br>🤏 Thumb + index pinch = select/open the highlighted item.<br>Faster flick = more momentum.</div>
    <div id="fawHandControls"><button id="fawHandCenter" type="button">Stop scroll</button><button id="fawHandStop" class="danger" type="button">Stop camera</button></div><div id="fawHandLog"></div>`;
  const cursor=document.createElement('div');cursor.id='fawAirCursor';document.body.append(button,panel,cursor);

  const video=panel.querySelector('#fawHandVideo'),layer=panel.querySelector('#fawFingerLayer'),gestureEl=panel.querySelector('#hcGesture'),targetEl=panel.querySelector('#hcTarget'),actionEl=panel.querySelector('#hcAction'),logEl=panel.querySelector('#fawHandLog'),stopBtn=panel.querySelector('#fawHandStop'),centerBtn=panel.querySelector('#fawHandCenter'),scrollThumb=panel.querySelector('#fawScrollThumb');
  const indexDot=document.createElement('div');indexDot.className='hc-finger';indexDot.textContent='I';layer.appendChild(indexDot);
  const thumbDot=document.createElement('div');thumbDot.className='hc-finger';thumbDot.textContent='T';layer.appendChild(thumbDot);

  function renderLog(){if(!logEl)return;logEl.innerHTML=state.logs.slice(-7).reverse().map(x=>`<div>${new Date(x.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ${x.type}${x.label?` · ${x.label}`:''}</div>`).join('')||'<div>No actions yet.</div>'}renderLog();
  const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  function interactiveEls(){return [...document.querySelectorAll('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card')].filter(el=>el.offsetParent!==null&&!el.disabled&&el!==button&&el!==stopBtn&&el!==centerBtn)}
  function nearest(x,y,radius=88){let best=document.elementFromPoint(x,y)?.closest?.('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell,.contact-card,.research-card');if(best&&best.offsetParent!==null&&!best.disabled)return best;let bd=radius;best=null;for(const el of interactiveEls()){const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;const cx=clamp(x,r.left,r.right),cy=clamp(y,r.top,r.bottom),d=Math.hypot(x-cx,y-cy);if(d<bd){bd=d;best=el}}return best}
  function setHover(el){if(state.hover&&state.hover!==el)state.hover.classList.remove('faw-hand-target');state.hover=el;if(el)el.classList.add('faw-hand-target');targetEl.textContent=labelOf(el)||'None'}
  function clickTarget(){if(!state.hover||Date.now()-state.lastClick<450)return;state.lastClick=Date.now();const label=labelOf(state.hover);state.hover.click();logEvent('click',{label});actionEl.textContent=`Opened ${label}`}
  function stopMomentum(){state.scrollVelocity=0;actionEl.textContent='Stopped';scrollThumb.style.left='50%'}
  function momentumLoop(){if(!state.running)return;if(Math.abs(state.scrollVelocity)>.15){window.scrollBy(0,state.scrollVelocity);state.scrollVelocity*=.92;actionEl.textContent=`Momentum ${state.scrollVelocity>0?'down':'up'} ${Math.round(Math.abs(state.scrollVelocity))}`;const pct=50+clamp(state.scrollVelocity/70,-1,1)*45;scrollThumb.style.left=pct+'%'}else{state.scrollVelocity=0;scrollThumb.style.left='50%';if(!state.pinching)actionEl.textContent='Stopped'}state.scrollRaf=requestAnimationFrame(momentumLoop)}
  function addSample(x,y){const now=performance.now();state.samples.push({x,y,t:now});while(state.samples.length&&now-state.samples[0].t>150)state.samples.shift()}
  function detectFlick(){if(state.samples.length<3||Date.now()-state.lastFlick<450)return;const a=state.samples[0],b=state.samples[state.samples.length-1],dt=Math.max(1,b.t-a.t),dy=b.y-a.y,dx=b.x-a.x;const vy=dy/dt;if(Math.abs(dy)>55&&Math.abs(vy)>.38&&Math.abs(dy)>Math.abs(dx)*1.25){state.lastFlick=Date.now();const direction=dy<0?'down':'up';const speed=clamp(Math.abs(vy)*105,18,68);state.scrollVelocity=dy<0?speed:-speed;gestureEl.textContent=dy<0?'Index flick ↑':'Index flick ↓';actionEl.textContent=`Rapid scroll ${direction}`;logEvent('finger-flick',{direction,speed:Math.round(speed)});state.samples=[]}}

  function onResults(results){if(!state.running)return;const lm=results.multiHandLandmarks?.[0];if(!lm){indexDot.style.display=thumbDot.style.display='none';cursor.style.display='none';setHover(null);state.samples=[];gestureEl.textContent='No hand';return}
    const index=lm[8],thumb=lm[4];
    const sx=(1-index.x)*innerWidth,sy=index.y*innerHeight;
    const tx=(1-thumb.x)*innerWidth,ty=thumb.y*innerHeight;
    const alpha=.34;state.cursorX+=(sx-state.cursorX)*alpha;state.cursorY+=(sy-state.cursorY)*alpha;
    cursor.style.display='block';cursor.style.left=state.cursorX+'px';cursor.style.top=state.cursorY+'px';
    indexDot.style.display=thumbDot.style.display='grid';indexDot.style.left=((1-index.x)*100)+'%';indexDot.style.top=(index.y*100)+'%';thumbDot.style.left=((1-thumb.x)*100)+'%';thumbDot.style.top=(thumb.y*100)+'%';
    const pinch=dist(index,thumb)<.050;
    cursor.classList.toggle('pinch',pinch);indexDot.classList.toggle('active',pinch);thumbDot.classList.toggle('active',pinch);
    const target=nearest(state.cursorX,state.cursorY,pinch?110:88);setHover(target);

    if(pinch){
      if(!state.pinching){state.pinching=true;state.pinchStart=performance.now();state.pinchMoved=false;state.samples=[]}
      if(Math.hypot(sx-state.cursorX,sy-state.cursorY)>22)state.pinchMoved=true;
      gestureEl.textContent='Pinch — select';actionEl.textContent=target?'Release to open':'No target';
    }else{
      if(state.pinching){const held=performance.now()-state.pinchStart;if(!state.pinchMoved&&held>70&&held<800)clickTarget();state.pinching=false;state.pinchStart=0;state.pinchMoved=false;state.samples=[]}
      const indexExtended=lm[8].y<lm[6].y;
      if(indexExtended){gestureEl.textContent='Index pointer';addSample(sx,sy);detectFlick()}else{state.samples=[];gestureEl.textContent='Raise index finger'}
    }
  }

  async function frame(){if(!state.running||!state.hands)return;try{if(video.readyState>=2)await state.hands.send({image:video})}catch(e){}state.raf=requestAnimationFrame(frame)}
  async function start(){if(state.running||state.loading)return;state.loading=true;button.disabled=true;button.textContent='Loading…';panel.classList.add('on');try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera not supported');await loadScript(`${CDN}/hands.js`);state.hands=new Hands({locateFile:file=>`${CDN}/${file}`});state.hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.68,minTrackingConfidence:.66});state.hands.onResults(onResults);state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});video.srcObject=state.stream;await video.play();state.running=true;state.loading=false;button.disabled=false;button.textContent='☝️ Finger Control ON';momentumLoop();frame()}catch(err){state.loading=false;button.disabled=false;button.textContent='☝️ Finger Control';actionEl.textContent=err.message||'Could not start camera'}}
  function stop(){state.running=false;state.loading=false;if(state.raf)cancelAnimationFrame(state.raf);if(state.scrollRaf)cancelAnimationFrame(state.scrollRaf);state.scrollVelocity=0;if(state.stream)state.stream.getTracks().forEach(t=>t.stop());state.stream=null;video.srcObject=null;panel.classList.remove('on');button.disabled=false;button.textContent='☝️ Finger Control';cursor.style.display='none';setHover(null)}
  button.addEventListener('click',()=>state.running?stop():start());stopBtn.addEventListener('click',stop);centerBtn.addEventListener('click',stopMomentum);window.addEventListener('pagehide',stop,{once:true});
})();