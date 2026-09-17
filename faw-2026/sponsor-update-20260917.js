(function(){
  const PATCH_KEY='fawSponsorUpdate20260917';
  const isIDC=x=>x && ((x.id==='idc') || /imperial dove court|\bidc\b/i.test(x.org||''));
  const isKVPR=x=>x && ((x.id==='kvpr') || /kvpr|valley public radio/i.test(x.org||''));

  const idcIndex={
    id:'idc',org:'Imperial Dove Court de Fresno',status:'Confirmed',worker:'Ashley Morris',owner:'Ashley Morris',contact:'Christopher',comm:'',
    route:'Cash sponsorship — check received',value:250,address:'Fresno, CA',
    last:'Neighborhood sponsor check for $250 received Sept. 17, 2026.',
    next:'Deposit/process the received check and confirm any logo/materials needed for sponsor recognition.',
    notes:'Confirmed $250 cash sponsor. Check received Sept. 17, 2026.'
  };
  const kvprIndex={
    id:'kvpr',org:'KVPR | Valley Public Radio',status:'Confirmed',worker:'Terrance',owner:'Terrance',contact:'Alexa Teal Green — Director of Engagement & Events',comm:'agreen@kvpr.org • 559-862-2471',
    route:'In-kind media sponsorship',value:500,address:'2589 Alluvial Ave, Clovis, CA 93611',
    last:'KVPR approved $500 in complimentary on-air spots promoting the Fresno AIDS Walk. Spots are planned to begin the week of Oct. 27, 2026 after approval of the proposed media schedule.',
    next:'Approve the proposed media schedule and provide any final event copy/materials needed for recording.',
    notes:'Confirmed $500 in-kind Media Sponsor. KVPR: 89.3 Fresno / 89.1 Bakersfield; KVPR Classical: 89.3 HD-2 Fresno.'
  };

  try{
    if(typeof sponsors!=='undefined' && Array.isArray(sponsors)){
      sponsors=sponsors.filter(x=>!isIDC(x)&&!isKVPR(x));
      sponsors.unshift(kvprIndex,idcIndex);
      if(typeof timeline!=='undefined' && Array.isArray(timeline)){
        if(!timeline.some(t=>Array.isArray(t)&&/imperial dove court.*250|250.*imperial dove court/i.test(t.join(' ')))) timeline.push(['2026-09-17','Imperial Dove Court check received','$250 neighborhood sponsor check received; confirmed cash sponsorship is now fully documented.']);
        if(!timeline.some(t=>Array.isArray(t)&&/kvpr|valley public radio/i.test(t.join(' ')))) timeline.push(['2026-09-17','KVPR media sponsorship confirmed','$500 in complimentary on-air promotion confirmed; spots planned to begin the week of Oct. 27 after media schedule approval.']);
      }
      if(typeof activity!=='undefined' && Array.isArray(activity) && !localStorage.getItem(PATCH_KEY+'-index')){
        activity.unshift({at:new Date().toISOString(),summary:'KVPR confirmed at $500 in-kind and Imperial Dove Court confirmed at $250 cash.',source:'KVPR media sponsorship email and Imperial Dove Court neighborhood sponsor check received Sept. 17, 2026.'});
        localStorage.setItem('faw2026Activity',JSON.stringify(activity));
        localStorage.setItem(PATCH_KEY+'-index','1');
      }
      if(typeof persist==='function') persist(); else if(typeof renderAll==='function') renderAll();
    }
  }catch(e){console.warn('Sept. 17 sponsor index patch:',e)}

  try{
    if(typeof db!=='undefined' && db && db.campaigns && typeof enrich==='function'){
      if(!db.campaigns[2026] && typeof newCampaign==='function') db.campaigns[2026]=newCampaign(2026,null);
      const c=db.campaigns[2026];
      if(c){
        const idc=enrich({
          id:'idc',org:'Imperial Dove Court de Fresno',worker:'Ashley Morris',owner:'Ashley Morris',contact:'Christopher',status:'Confirmed',
          sector:'Community partner',strength:'Established',probability:100,method:'Check / sponsorship form',tier:'Neighborhood Sponsor',
          value:250,valueType:'Cash',payment:'Check received Sept. 17, 2026',address:'Fresno, CA',
          last:'Neighborhood sponsor check for $250 received Sept. 17, 2026.',
          next:'Deposit/process the received check and confirm any logo/materials needed for sponsor recognition.',
          notes:'Confirmed $250 cash sponsor; payment received by check.'
        });
        const kvpr=enrich({
          id:'kvpr',org:'KVPR | Valley Public Radio',worker:'Terrance',owner:'Terrance',contact:'Alexa Teal Green',contactRole:'Director of Engagement & Events',email:'agreen@kvpr.org',phone:'559-862-2471',status:'Confirmed',
          sector:'Media / Public Radio',strength:'Established',probability:100,method:'Email',tier:'Media Sponsor',
          value:500,valueType:'In-kind',payment:'In-kind media value',address:'2589 Alluvial Ave, Clovis, CA 93611',
          ask:'Approve the proposed media schedule and provide any approved event copy or materials needed to record the spots.',
          last:'KVPR confirmed $500 in complimentary on-air spots promoting the Fresno AIDS Walk; spots are planned to begin the week of Oct. 27, 2026 after schedule approval.',
          next:'Approve the proposed media schedule and provide any final event copy/materials needed for recording.',
          notes:'Confirmed $500 in-kind media sponsorship. KVPR serves 89.3 Fresno / 89.1 Bakersfield; KVPR Classical airs on 89.3 HD-2 Fresno.'
        });
        c.sponsors=(c.sponsors||[]).filter(x=>!isIDC(x)&&!isKVPR(x));
        c.sponsors.unshift(kvpr,idc);
        c.calendar=c.calendar||[];
        if(!c.calendar.some(x=>x.id==='idc-check-20260917')) c.calendar.push({id:'idc-check-20260917',date:'2026-09-17',type:'Payment',title:'Imperial Dove Court — $250 check received',owner:'Ashley Morris',notes:'Neighborhood sponsor check received; confirmed cash sponsor.',sponsorId:'idc'});
        if(!c.calendar.some(x=>x.id==='kvpr-media-20261027')) c.calendar.push({id:'kvpr-media-20261027',date:'2026-10-27',type:'Media',title:'KVPR on-air promotion begins this week',owner:'Terrance',notes:'Complimentary Fresno AIDS Walk spots valued at $500, pending approval of proposed media schedule.',sponsorId:'kvpr'});
        c.activity=c.activity||[];
        if(!localStorage.getItem(PATCH_KEY+'-db')){
          c.activity.unshift({at:new Date().toISOString(),summary:'Sept. 17: Imperial Dove Court $250 check received; KVPR $500 media sponsorship confirmed.',source:'Sponsor/payment updates supplied Sept. 17, 2026.'});
          localStorage.setItem(PATCH_KEY+'-db','1');
        }
        if(typeof save==='function') save();
        if(typeof renderAll==='function') renderAll();
      }
    }
  }catch(e){console.warn('Sept. 17 sponsor database patch:',e)}

  try{
    const b=document.querySelector('.banner');
    if(b){
      b.innerHTML=b.innerHTML
        .replace(/Imperial Dove Court de Fresno is confirmed, with amount and payment status still to verify\./i,'Imperial Dove Court de Fresno is confirmed at $250 and its neighborhood sponsor check was received Sept. 17.')
        .replace(/Confirmed known monetary total is now \$3,750 before the Imperial amount\./i,'Confirmed cash sponsorship is now $4,000.')
        .replace(/Homewood Suites by Hilton returned its neighborhood sponsorship form and is confirmed\. Logo and dollar amount\/payment still need verification; the known confirmed cash total stays unchanged until the amount is verified\./i,'Homewood Suites by Hilton returned its neighborhood sponsorship form and is confirmed. Logo and dollar amount/payment still need verification; the known confirmed cash total excludes Homewood until its amount is verified.');
      if(!/KVPR/i.test(b.textContent||'')) b.insertAdjacentHTML('beforeend','<br><strong>Sept. 17:</strong> KVPR | Valley Public Radio confirmed $500 in complimentary on-air promotion as a Media Sponsor. Spots are planned to begin the week of Oct. 27 after the proposed schedule is approved.');
    }
    const stats=[...document.querySelectorAll('#stats .stat')];
    stats.forEach(card=>{
      const label=(card.querySelector('.label')?.textContent||'').toLowerCase();
      const hint=card.querySelector('.hint');
      if(label.includes('confirmed cash')&&hint) hint.textContent='CVS Health + RH + Oakmont + Imperial Dove Court confirmed';
      if(label.includes('confirmed in-kind')&&hint) hint.textContent='KVPR + Ampersand + Trader Joe’s known values';
    });
  }catch(e){}
})();