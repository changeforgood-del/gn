(function(){
  const PATCH_KEY='fawHomewoodConfirmed20260916';
  const orgMatch=x=>x && ((x.id==='homewood') || /homewood suites/i.test(x.org||''));
  const note='Homewood Suites by Hilton is confirmed via the neighborhood sponsorship form returned Sept. 14, 2026. The logo and sponsorship dollar amount/payment still need verification; do not add a dollar value to confirmed cash until verified.';

  try{
    if(typeof sponsors!=='undefined' && Array.isArray(sponsors)){
      const rec={
        id:'homewood',org:'Homewood Suites by Hilton',status:'Confirmed',worker:'Ashley Morris / Terrance',owner:'Ashley Morris',
        contact:'Brian Garcia — Area Director of Sales',comm:'Brian.Garcia@Hilton.com • 559-312-1022',
        route:'Cash sponsorship — amount TBD',value:null,address:'Homewood Suites by Hilton, Clovis, CA',
        last:'Completed neighborhood sponsorship form received Sept. 14, 2026; Ashley confirmed the form is sufficient and requested the logo.',
        next:'Receive logo by Sept. 18 and verify the sponsorship dollar amount/level and payment status before adding it to the confirmed cash total.',
        notes:'Confirmed sponsor. Amount is TBD because the email thread does not state the dollar value.'
      };
      sponsors=sponsors.filter(x=>!orgMatch(x));
      sponsors.unshift(rec);
      if(typeof timeline!=='undefined' && Array.isArray(timeline) && !timeline.some(t=>Array.isArray(t)&&/homewood/i.test(t.join(' ')))){
        timeline.push(['2026-09-14','Homewood Suites confirmed','Brian Garcia returned the neighborhood sponsorship form. Ashley confirmed the form is sufficient and requested the logo. Amount/payment still need verification.']);
      }
      if(typeof activity!=='undefined' && Array.isArray(activity) && !localStorage.getItem(PATCH_KEY+'-index')){
        activity.unshift({at:new Date().toISOString(),summary:'Homewood Suites moved to Confirmed; amount remains TBD.',source:'Brian Garcia returned the neighborhood sponsorship form Sept. 14, 2026; Ashley confirmed the form is sufficient and requested the logo.'});
        localStorage.setItem('faw2026Activity',JSON.stringify(activity));
        localStorage.setItem(PATCH_KEY+'-index','1');
      }
      if(typeof persist==='function') persist(); else if(typeof renderAll==='function') renderAll();
    }
  }catch(e){console.warn('Homewood index patch:',e)}

  try{
    if(typeof db!=='undefined' && db && db.campaigns && typeof enrich==='function'){
      if(!db.campaigns[2026] && typeof newCampaign==='function') db.campaigns[2026]=newCampaign(2026,null);
      const c=db.campaigns[2026];
      if(c){
        const rec=enrich({
          id:'homewood',org:'Homewood Suites by Hilton',status:'Confirmed',owner:'Ashley Morris',worker:'Ashley Morris / Terrance',
          contact:'Brian Garcia',contactRole:'Area Director of Sales',email:'Brian.Garcia@Hilton.com',phone:'559-312-1022',
          sentDate:'2026-09-01',responseDate:'2026-09-14',followUpDate:'2026-09-18',strength:'Established',probability:100,
          sector:'Hospitality / Hotel',method:'Email / sponsorship form',tier:'Neighborhood Sponsorship',
          ask:'Neighborhood sponsorship for the 2026 Fresno AIDS Walk.',value:null,valueType:'Cash',
          payment:'Form received; amount/payment verification pending',logo:'Requested',address:'Homewood Suites by Hilton, Clovis, CA',
          last:'Completed neighborhood sponsorship form received Sept. 14, 2026; Ashley confirmed the form is sufficient and requested the logo.',
          next:'Receive logo by Sept. 18 and verify the sponsorship dollar amount/level and payment status before adding it to the confirmed cash total.',
          notes:'Confirmed sponsor. Amount is TBD because the email thread does not state the dollar value.'
        });
        c.sponsors=(c.sponsors||[]).filter(x=>!orgMatch(x));
        c.sponsors.unshift(rec);
        c.calendar=c.calendar||[];
        if(!c.calendar.some(x=>x.id==='homewood-confirmed-20260914')) c.calendar.push({id:'homewood-confirmed-20260914',date:'2026-09-14',type:'Response',title:'Homewood Suites confirmed',owner:'Ashley Morris',notes:'Neighborhood sponsorship form received; logo and dollar amount/payment still need verification.',sponsorId:'homewood'});
        c.activity=c.activity||[];
        if(!localStorage.getItem(PATCH_KEY+'-db')){
          c.activity.unshift({at:new Date().toISOString(),summary:'Homewood Suites moved to Confirmed; amount remains TBD.',source:'Neighborhood sponsorship form received Sept. 14, 2026; logo requested.'});
          localStorage.setItem(PATCH_KEY+'-db','1');
        }
        if(typeof save==='function') save();
        if(typeof renderAll==='function') renderAll();
      }
    }
  }catch(e){console.warn('Homewood database patch:',e)}

  try{
    const b=document.querySelector('.banner');
    if(b && !/Homewood Suites/i.test(b.textContent||'')) b.insertAdjacentHTML('beforeend','<br><strong>Sept. 14:</strong> Homewood Suites by Hilton returned its neighborhood sponsorship form and is confirmed. Logo and dollar amount/payment still need verification; the known confirmed cash total stays unchanged until the amount is verified.');
  }catch(e){}
})();