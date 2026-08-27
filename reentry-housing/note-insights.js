(()=>{
const CITY_ZIP={Stockton:'95202',Modesto:'95354',Merced:'95340',Madera:'93637',Fresno:'93721',Visalia:'93291',Hanford:'93230',Porterville:'93257',Bakersfield:'93301'};
const CITY_RE=new RegExp('\\b('+Object.keys(CITY_ZIP).join('|')+')\\b','i');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function currentClient(){try{const cs=JSON.parse(localStorage.getItem('vrhn_clients')||'[]'),id=localStorage.getItem('vrhn_current');return cs.find(c=>c.id===id)||null}catch(e){return null}}
function signal(label,value,why,kind='verify'){return{label,value,why,kind}}
function analyze(text){
 const t=text.trim(), low=t.toLowerCase(), c=currentClient(), signals=[];
 const zip=(t.match(/\b9\d{4}\b/)||[])[0]||'';
 const cityMatch=t.match(CITY_RE); const city=cityMatch?cityMatch[1].replace(/\b\w/g,m=>m.toUpperCase()):'';
 const money=t.match(/\$\s?([0-9]{2,5})(?:\s*(?:\/|per)\s*(?:month|mo))?/i);
 const hh=t.match(/(?:household|family)\s*(?:of|size)?\s*(\d+)/i);
 if(zip)signals.push(signal('Postal code',zip,'Explicitly stated in the note.','location'));
 if(city)signals.push(signal('City',city,'Explicitly stated in the note.','location'));
 if(money)signals.push(signal('Income mentioned',`$${money[1]}/month?`,'Confirm amount and frequency before using it for program screening.'));
 if(hh)signals.push(signal('Household size mentioned',hh[1],'Confirm who will be housed together.'));
 if(/wheelchair|walker|amputee|no stairs|ground floor|accessible|ada|mobility|elevator/.test(low))signals.push(signal('Accessibility search filter','Accessible / ground-floor options','The note mentions a mobility or accessibility need. Verify the exact accommodation requested.','filter'));
 if(/service animal|service dog/.test(low))signals.push(signal('Animal accommodation','Service animal mentioned','Verify the client’s stated accommodation needs; do not treat a service animal as an ordinary pet restriction.','filter'));
 else if(/\bdog\b|\bcat\b|\bpet\b/.test(low))signals.push(signal('Pet-friendly search','Pet mentioned','Verify number/type of pets and property policy.','filter'));
 if(/veteran|va |hud-vash|vash|ssvf/.test(low))signals.push(signal('Veteran housing pathway','VA / HUD-VASH / SSVF to verify','The note explicitly mentions veteran/VA housing information.','pathway'));
 if(/parole|agent of record|\baor\b|form 1502|\bstop\b/.test(low))signals.push(signal('STOP pathway','WestCare STOP / CDCR pathway to verify','The note explicitly mentions parole/STOP/AOR information. Verify active-parole status and referral requirements.','pathway'));
 if(/returning home well|\brhwh\b/.test(low))signals.push(signal('RHWH pathway','Returning Home Well Housing to verify','The note explicitly mentions RHWH.','pathway'));
 if(/permanent supportive housing|\bpsh\b/.test(low))signals.push(signal('PSH search pathway','Permanent Supportive Housing records to review','The note explicitly mentions PSH. Availability and eligibility still require verification.','pathway'));
 if(/treatment|recovery residence|sober living|outpatient|substance use|drug and alcohol/.test(low))signals.push(signal('Service preference to verify','Treatment/recovery housing options may be relevant','Only use this filter if it reflects the client’s stated preference or referral plan.','pathway'));
 if(/bus|transportation|ride|no car|doesn.?t drive|cannot drive/.test(low))signals.push(signal('Transportation factor','Prioritize options with workable transportation','The note mentions transportation access. Verify the client’s actual travel constraints.','filter'));
 if(/missing id|no id|birth certificate|social security card|documents/.test(low))signals.push(signal('Document task','Document replacement / verification','The note mentions identification or document barriers.','task'));
 if(/unsheltered|homeless|street|encampment|shelter|motel|couch surfing|staying with/.test(low))signals.push(signal('Housing urgency','Current housing instability mentioned','Use for follow-up urgency, not as an automatic eligibility determination.','task'));
 const baseCity=city||(c&&c.city)||'Fresno';
 const baseZip=zip||(c&&c.postalCode)||CITY_ZIP[baseCity]||'93721';
 let profile=[];
 profile.push(`Search center: ${baseCity} / ${baseZip}`);
 profile.push('Search range: primary ZIP + nearby Valley ZIPs');
 if(signals.some(s=>s.label==='Accessibility search filter'))profile.push('Filter: accessible / ground-floor / elevator options');
 if(signals.some(s=>s.label==='Animal accommodation'))profile.push('Filter: service-animal accommodation needs to verify');
 if(signals.some(s=>s.label==='Pet-friendly search'))profile.push('Filter: pet-friendly options');
 if(signals.some(s=>s.label==='Transportation factor'))profile.push('Area factor: workable transportation to appointments/services');
 const paths=[];
 if(signals.some(s=>s.label==='STOP pathway'))paths.push('WestCare STOP housing records / AOR referral workflow');
 if(signals.some(s=>s.label==='RHWH pathway'))paths.push('Returning Home Well Housing (verify current referral status)');
 if(signals.some(s=>s.label==='PSH search pathway'))paths.push('Permanent Supportive Housing records (verify availability/eligibility)');
 if(signals.some(s=>s.label==='Veteran housing pathway'))paths.push('VA / HUD-VASH / SSVF resources to verify');
 if(signals.some(s=>s.label==='Service preference to verify'))paths.push('Recovery/reentry or treatment-linked housing only if client wants/needs that pathway');
 if(!paths.length)paths.push('General affordable/supportive housing search based on stated location and needs');
 return{created:new Date().toISOString(),clientId:c&&c.id||'',sourceNote:t,baseCity,baseZip,signals,profile,paths};
}
function saveAnalysis(a){localStorage.setItem('vrhn_note_insights',JSON.stringify(a));if(a.clientId){try{const all=JSON.parse(localStorage.getItem('vrhn_note_insights_history')||'[]');all.unshift(a);localStorage.setItem('vrhn_note_insights_history',JSON.stringify(all.slice(0,100)))}catch(e){}}}
function runSearch(a){localStorage.setItem('vrhn_last_zip',a.baseZip);localStorage.setItem('vrhn_search_scope','nearby');localStorage.setItem('vrhn_note_search_profile',JSON.stringify(a));const f=document.getElementById('searchFrame');if(f)f.src='regional-search.html?note=1&ts='+Date.now();}
function render(a){const box=document.getElementById('noteInsightResults');if(!box)return;box.innerHTML=`<div class="profile"><b>Recommended search profile — verify before placement</b><br>${a.profile.map(esc).join('<br>')}</div><div style="margin-top:10px"><b style="font-size:.82rem">Housing pathways to review</b>${a.paths.map(p=>`<div class="clientCard"><b>${esc(p)}</b></div>`).join('')}</div><div style="margin-top:10px"><b style="font-size:.82rem">Key items pulled from the note</b>${a.signals.length?a.signals.map(s=>`<div class="clientCard"><b>${esc(s.label)}: ${esc(s.value)}</b><div class="small">${esc(s.why)}</div><span class="pill">Verify</span></div>`).join(''):'<p class="small">No strong housing-specific clues were detected. The search will use the active client profile.</p>'}</div><div class="notice" style="margin-top:10px">This recommendation organizes the note into search filters and pathways. It does not determine STOP, PSH, voucher, disability, or landlord eligibility.</div>`;
}
function analyzeAndSearch(){const raw=document.getElementById('rawNote');if(!raw||!raw.value.trim()){alert('Enter a case note first.');return}const a=analyze(raw.value);saveAnalysis(a);runSearch(a);render(a);const st=document.getElementById('aiStatus');if(st)st.textContent=`Note analyzed. Housing search centered on ${a.baseCity} / ${a.baseZip}.`;}
function inject(){const notes=document.getElementById('notes');if(!notes||document.getElementById('noteHousingIntel'))return;const card=document.createElement('div');card.id='noteHousingIntel';card.className='card full';card.innerHTML=`<div class="sectionhead"><h2>Note → Housing Recommendation</h2><span class="small right">Reads only what is written</span></div><p class="small">Type your normal case note above. This tool pulls out housing-relevant details, creates a search profile, and starts a ZIP/area search without silently changing the client record.</p><div class="row stack"><button class="btn success" id="analyzeHousingNote">Analyze Note + Search Housing</button><button class="btn secondary" id="openRecommendedSearch">Open Recommended Search</button></div><div id="noteInsightResults" style="margin-top:12px"></div>`;notes.insertBefore(card,notes.firstChild);document.getElementById('analyzeHousingNote').onclick=analyzeAndSearch;document.getElementById('openRecommendedSearch').onclick=()=>{try{const a=JSON.parse(localStorage.getItem('vrhn_note_insights')||'null');if(a)runSearch(a)}catch(e){} if(typeof showTab==='function')showTab('search')};try{const prev=JSON.parse(localStorage.getItem('vrhn_note_insights')||'null');if(prev)render(prev)}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
