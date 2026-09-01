(()=>{
  if(window.__FAW_HAND_CONTROL__) return;
  window.__FAW_HAND_CONTROL__=true;

  const MP_VERSION='0.4.1675469240';
  const CDN=`https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}`;
  const state={running:false,loading:false,stream:null,hands:null,raf:0,lastPinch:false,lastClick:0,lastPalmY:null,lastPalmX:null,lastSwipe:0,cursorX:innerWidth/2,cursorY:innerHeight/2,prevX:null,prevY:null};

  const css=document.createElement('style');
  css.textContent=`
  #fawHandButton{position:fixed;right:18px;bottom:18px;z-index:10002;border:1px solid rgba(215,182,109,.55);background:linear-gradient(135deg,#e2c47d,#ae7f32);color:#171006;border-radius:999px;padding:12px 16px;font:800 13px/1.1 Inter,Segoe UI,sans-serif;box-shadow:0 14px 42px rgba(0,0,0,.35)}
  #fawHandPanel{position:fixed;right:18px;bottom:72px;z-index:10001;width:min(310px,calc(100vw - 28px));padding:12px;border:1px solid #374b68;border-radius:16px;background:rgba(7,14,25,.94);backdrop-filter:blur(16px);color:#f6f3eb;box-shadow:0 20px 70px rgba(0,0,0,.48);display:none}
  #fawHandPanel.on{display:block}#fawHandVideo{width:100%;aspect-ratio:4/3;object-fit:cover;transform:scaleX(-1);border-radius:12px;background:#02060c}
  #fawHandStatus{font:600 11px/1.45 Inter,Segoe UI,sans-serif;color:#c9d2df;margin-top:8px}#fawHandStatus b{color:#f1d99e}
  #fawHandStop{width:100%;margin-top:9px;border:1px solid #5a3140;background:#361822;color:#fff;border-radius:10px;padding:9px;font-weight:800}
  #fawHandCursor{position:fixed;z-index:10005;width:26px;height:26px;border:3px solid #f1d99e;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);box-shadow:0 0 0 6px rgba(215,182,109,.15),0 0 22px rgba(215,182,109,.45);display:none;transition:width .08s,height .08s,border-color .08s}
  #fawHandCursor.pinching{width:16px;height:16px;border-color:#68d3a0}
  .faw-hand-target{outline:2px solid rgba(241,217,158,.8)!important;outline-offset:3px!important}
  @media(max-width:700px){#fawHandButton{right:12px;bottom:12px}#fawHandPanel{right:12px;bottom:66px}}
  `;
  document.head.appendChild(css);

  const button=document.createElement('button');button.id='fawHandButton';button.type='button';button.textContent='✋ Hand Control';button.setAttribute('aria-label','Turn on camera hand controls');
  const panel=document.createElement('div');panel.id='fawHandPanel';panel.innerHTML=`<video id="fawHandVideo" autoplay muted playsinline></video><div id="fawHandStatus"><b>Hand controls</b><br>Point = move cursor · Pinch = click · Open palm = scroll · Palm swipe = change section</div><button id="fawHandStop" type="button">Stop camera</button>`;
  const cursor=document.createElement('div');cursor.id='fawHandCursor';
  document.body.append(button,panel,cursor);
  const video=panel.querySelector('#fawHandVideo'),status=panel.querySelector('#fawHandStatus'),stopBtn=panel.querySelector('#fawHandStop');

  const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src===src))return resolve();const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const extended=(lm,tip,pip)=>lm[tip].y < lm[pip].y;
  const interactiveAt=(x,y)=>{let el=document.elementFromPoint(x,y);if(!el)return null;return el.closest('button,a,[role="button"],input,select,textarea,[data-edit],[data-map],[data-section],.stat.clickable,.chartbox.clickable,.barrow,.calitem,.drill-card,.heat-cell')};
  let highlighted=null;
  function highlight(el){if(highlighted&&highlighted!==el)highlighted.classList.remove('faw-hand-target');highlighted=el;if(el)el.classList.add('faw-hand-target')}
  function setStatus(t){status.innerHTML=`<b>Hand controls</b><br>${t}`}

  function navigateSection(dir){const nav=[...document.querySelectorAll('#nav button,[data-section]')].filter(x=>x.offsetParent!==null);if(!nav.length)return;let i=nav.findIndex(x=>x.classList.contains('active'));if(i<0)i=0;i=(i+dir+nav.length)%nav.length;nav[i].click();setStatus(`Section changed to ${nav[i].textContent.trim()}.`)}

  function onResults(results){
    if(!state.running)return;
    const lm=results.multiHandLandmarks&&results.multiHandLandmarks[0];
    if(!lm){cursor.style.display='none';highlight(null);state.lastPalmY=null;state.lastPalmX=null;setStatus('Show one hand to the camera.');return}
    cursor.style.display='block';
    const index=lm[8], thumb=lm[4];
    const tx=(1-index.x)*innerWidth, ty=index.y*innerHeight;
    state.cursorX=state.cursorX*.72+tx*.28;state.cursorY=state.cursorY*.72+ty*.28;
    cursor.style.left=state.cursorX+'px';cursor.style.top=state.cursorY+'px';
    const target=interactiveAt(state.cursorX,state.cursorY);highlight(target);

    const pinch=dist(index,thumb)<0.055;
    cursor.classList.toggle('pinching',pinch);
    if(pinch&&!state.lastPinch&&Date.now()-state.lastClick>650){state.lastClick=Date.now();if(target){target.click();setStatus(`Pinch click: ${target.textContent.trim().slice(0,55)||'control'}`)}}
    state.lastPinch=pinch;

    const fingers=[extended(lm,8,6),extended(lm,12,10),extended(lm,16,14),extended(lm,20,18)];
    const open=fingers.filter(Boolean).length>=4&&!pinch;
    const palm=lm[9];
    if(open){
      if(state.lastPalmY!==null){const dy=(palm.y-state.lastPalmY)*innerHeight;if(Math.abs(dy)>3)window.scrollBy({top:dy*1.7,left:0,behavior:'auto'})}
      if(state.lastPalmX!==null){const dx=palm.x-state.lastPalmX;if(Math.abs(dx)>.14&&Date.now()-state.lastSwipe>900){state.lastSwipe=Date.now();navigateSection(dx>0?1:-1);state.lastPalmX=palm.x}}
      state.lastPalmY=palm.y;state.lastPalmX=palm.x;
    }else{state.lastPalmY=null;state.lastPalmX=null}

    const two=fingers[0]&&fingers[1]&&!fingers[2]&&!fingers[3]&&!pinch;
    const cube=document.querySelector('#cubeCanvas, canvas[data-cube], .cube-wrap canvas');
    if(two&&cube){
      if(state.prevX!==null){const rect=cube.getBoundingClientRect();const cx=Math.max(rect.left,Math.min(rect.right,state.cursorX)),cy=Math.max(rect.top,Math.min(rect.bottom,state.cursorY));cube.dispatchEvent(new PointerEvent('pointermove',{clientX:cx,clientY:cy,bubbles:true,pointerId:88,pointerType:'pen',buttons:1}))}
      state.prevX=state.cursorX;state.prevY=state.cursorY;
    }else{state.prevX=null;state.prevY=null}
  }

  async function frame(){if(!state.running||!state.hands)return;try{if(video.readyState>=2)await state.hands.send({image:video})}catch(e){}state.raf=requestAnimationFrame(frame)}

  async function start(){
    if(state.running||state.loading)return;state.loading=true;button.disabled=true;button.textContent='Loading hand tracking…';panel.classList.add('on');
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access is not supported in this browser.');
      await loadScript(`${CDN}/hands.js`);
      if(!window.Hands)throw new Error('Hand tracking library did not load.');
      state.hands=new Hands({locateFile:file=>`${CDN}/${file}`});
      state.hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.6,minTrackingConfidence:.55});
      state.hands.onResults(onResults);
      state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
      video.srcObject=state.stream;await video.play();state.running=true;state.loading=false;button.disabled=false;button.textContent='✋ Hand Control ON';setStatus('Camera active. Point with your index finger to begin.');frame();
    }catch(err){state.loading=false;button.disabled=false;button.textContent='✋ Hand Control';panel.classList.add('on');setStatus(`${err.message||'Could not start camera.'} Camera permission may need to be enabled in your browser settings.`)}
  }
  function stop(){state.running=false;state.loading=false;if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;if(state.stream)state.stream.getTracks().forEach(t=>t.stop());state.stream=null;video.srcObject=null;cursor.style.display='none';highlight(null);panel.classList.remove('on');button.disabled=false;button.textContent='✋ Hand Control';setStatus('Camera stopped.')}
  button.addEventListener('click',()=>state.running?stop():start());stopBtn.addEventListener('click',stop);window.addEventListener('pagehide',stop,{once:true});
})();