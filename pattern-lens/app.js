const KEY='patternLens.v1';
let db=JSON.parse(localStorage.getItem(KEY)||'{"profiles":[],"events":[],"predictions":[]}');
const $=s=>document.querySelector(s);const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
function uid(){return crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)}
function fmt(d){return new Date(d).toLocaleString()}
function profileName(id){return db.profiles.find(p=>p.id===id)?.name||'Unknown'}
function hourBucket(d){const h=new Date(d).getHours();return `${String(h).padStart(2,'0')}:00–${String((h+2)%24).padStart(2,'0')}:00`}
function predictionKey(e){const d=new Date(e.when);return [e.personId,e.behavior.trim().toLowerCase(),d.getDay(),Math.floor(d.getHours()/2)].join('|')}
function rebuildPredictions(){
  const groups={};
  for(const e of db.events){const k=predictionKey(e);(groups[k]??=[]).push(e)}
  const priorOutcomes={};
  for(const p of db.predictions){if(p.outcome!==null){(priorOutcomes[p.patternKey]??=[]).push(p.outcome)}}
  const next=[];const now=new Date();
  for(const [k,events] of Object.entries(groups)){
    if(events.length<3)continue;
    const sample=events[0], base=new Date(sample.when); let candidate=new Date(now);
    candidate.setSeconds(0,0); candidate.setHours(Math.floor(base.getHours()/2)*2,0,0,0);
    const targetDay=base.getDay();let add=(targetDay-candidate.getDay()+7)%7;if(add===0&&candidate<=now)add=7;candidate.setDate(candidate.getDate()+add);
    const outcomes=priorOutcomes[k]||[]; const hits=outcomes.filter(Boolean).length;
    const empirical=(hits+1)/(outcomes.length+2); const recurrence=Math.min(.95,.45+events.length*.07);
    const probability=Math.round((outcomes.length?(.55*empirical+.45*recurrence):recurrence)*100);
    const existing=db.predictions.find(p=>p.patternKey===k&&p.outcome===null&&Math.abs(new Date(p.windowStart)-candidate)<6*3600000);
    next.push(existing||{id:uid(),patternKey:k,personId:sample.personId,behavior:sample.behavior,windowStart:candidate.toISOString(),windowEnd:new Date(candidate.getTime()+2*3600000).toISOString(),probability,evidenceCount:events.length,outcome:null,createdAt:new Date().toISOString()});
  }
  db.predictions=[...db.predictions.filter(p=>p.outcome!==null),...next];save();
}
function render(){
  $('#person').innerHTML='<option value="">Select…</option>'+db.profiles.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  const resolved=db.predictions.filter(p=>p.outcome!==null),correct=resolved.filter(p=>p.outcome===true).length;
  $('#stats').innerHTML=`<div class="stat"><span class="muted">Participants</span><strong>${db.profiles.length}</strong></div><div class="stat"><span class="muted">Observations</span><strong>${db.events.length}</strong></div><div class="stat"><span class="muted">Confirmed prediction rate</span><strong>${resolved.length?Math.round(correct/resolved.length*100)+'%':'—'}</strong></div>`;
  $('#profiles').innerHTML=db.profiles.length?db.profiles.map(p=>`<div class="row"><strong>${escapeHtml(p.name)}</strong> <span class="pill">consented</span><div class="muted">${escapeHtml(p.context||'No context')}</div><button onclick="deleteProfile('${p.id}')">Delete</button></div>`).join(''):'<p class="muted">No participants yet.</p>';
  $('#events').innerHTML=db.events.slice().sort((a,b)=>new Date(b.when)-new Date(a.when)).slice(0,30).map(e=>`<div class="row"><strong>${escapeHtml(profileName(e.personId))}</strong> — ${escapeHtml(e.behavior)}<div class="muted">${fmt(e.when)} · ${escapeHtml(e.location||'no location category')} · ${escapeHtml(e.preceding||'no preceding condition')}</div></div>`).join('')||'<p class="muted">No observations yet.</p>';
  const upcoming=db.predictions.filter(p=>p.outcome===null).sort((a,b)=>new Date(a.windowStart)-new Date(b.windowStart)).slice(0,20);
  $('#predictions').innerHTML=upcoming.map(p=>`<div class="prediction"><div><strong>${escapeHtml(profileName(p.personId))}</strong> may <strong>${escapeHtml(p.behavior)}</strong></div><div class="prob">${p.probability}%</div><div class="muted">${fmt(p.windowStart)} to ${new Date(p.windowEnd).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</div><div class="muted">Evidence: ${p.evidenceCount} matching observations. Prediction, not certainty.</div><div class="actions"><button class="yes" onclick="confirmPrediction('${p.id}',true)">Yes, happened</button><button class="no" onclick="confirmPrediction('${p.id}',false)">No</button></div></div>`).join('')||'<p class="muted">Predictions appear after at least 3 observations of a similar behavior in a matching weekday/time bucket.</p>';
}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
$('#profileForm').addEventListener('submit',e=>{e.preventDefault();if(!$('#consent').checked)return alert('Consent is required.');db.profiles.push({id:uid(),name:$('#name').value.trim(),context:$('#context').value.trim(),consented:true,createdAt:new Date().toISOString()});save();e.target.reset();render()});
$('#eventForm').addEventListener('submit',e=>{e.preventDefault();db.events.push({id:uid(),personId:$('#person').value,behavior:$('#behavior').value.trim(),when:new Date($('#when').value).toISOString(),preceding:$('#preceding').value.trim(),location:$('#location').value.trim()});save();rebuildPredictions();e.target.reset();setDefaultTime();render()});
window.confirmPrediction=(id,outcome)=>{const p=db.predictions.find(x=>x.id===id);if(!p)return;p.outcome=outcome;p.resolvedAt=new Date().toISOString();save();rebuildPredictions();render()};
window.deleteProfile=id=>{if(!confirm('Delete this participant and all associated data?'))return;db.profiles=db.profiles.filter(p=>p.id!==id);db.events=db.events.filter(e=>e.personId!==id);db.predictions=db.predictions.filter(p=>p.personId!==id);save();render()};
$('#notifyBtn').onclick=async()=>{if(!('Notification'in window))return alert('Browser notifications are unavailable here.');const r=await Notification.requestPermission();alert(r==='granted'?'Alerts enabled.':'Notifications were not enabled.')};
function alertDue(){if(Notification.permission!=='granted')return;const now=Date.now();for(const p of db.predictions.filter(p=>p.outcome===null)){const start=new Date(p.windowStart).getTime();if(now>=start&&now<start+60000&&!p.alerted){new Notification('Pattern Lens prediction',{body:`${profileName(p.personId)}: ${p.behavior} (${p.probability}%)`});p.alerted=true;save()}}}
$('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pattern-lens-data.json';a.click();URL.revokeObjectURL(a.href)};
$('#importInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.profiles)||!Array.isArray(x.events))throw 0;db={profiles:x.profiles,events:x.events,predictions:Array.isArray(x.predictions)?x.predictions:[]};save();rebuildPredictions();render()}catch{alert('Invalid Pattern Lens JSON file.')}};
$('#clearBtn').onclick=()=>{if(confirm('Delete all Pattern Lens data from this browser?')){db={profiles:[],events:[],predictions:[]};save();render()}};
function setDefaultTime(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#when').value=d.toISOString().slice(0,16)}
setDefaultTime();rebuildPredictions();render();setInterval(alertDue,30000);