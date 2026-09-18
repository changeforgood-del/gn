(function(){
  const PATCH_KEY='fawKaiserApproved20260918';
  const isKaiser=x=>x && ((x.id==='kaiser') || /kaiser permanente/i.test(x.org||''));

  const kaiserIndex={
    id:'kaiser',org:'Kaiser Permanente — Fresno Area',status:'Confirmed',worker:'Ashley',owner:'Ashley Morris',
    contact:'Samantha Schuh',comm:'samantha.schuh@kp.org',
    route:'Cash sponsorship — payment in process',value:1000,address:'Fresno, CA',
    last:'Kaiser Permanente approved a $1,000 sponsorship for the 15th Annual Fresno AIDS Walk on Sept. 18, 2026. Payment is in process.',
    next:'Confirm payment receipt. Coordinate any applicable Kaiser event participation, logos, ads, speakers, exhibits, promotional materials, or attendees with Samantha Schuh as needed.',
    notes:'Confirmed $1,000 cash sponsorship. Approval states that accepting the sponsorship confirms WestCare California Inc has a documented non-discrimination policy covering the protected categories listed in Kaiser’s approval notice. Payment is in process.'
  };

  try{
    if(typeof sponsors!=='undefined' && Array.isArray(sponsors)){
      sponsors=sponsors.filter(x=>!isKaiser(x));
      sponsors.unshift(kaiserIndex);
      if(typeof timeline!=='undefined' && Array.isArray(timeline)){
        if(!timeline.some(t=>Array.isArray(t)&&/kaiser permanente/i.test(t.join(' '))&&/1,000/.test(t.join(' ')))){
          timeline.push(['2026-09-18','Kaiser Permanente — $1,000 approved','Kaiser Permanente approved a $1,000 sponsorship for the 15th Annual Fresno AIDS Walk; payment is in process.']);
        }
      }
      if(typeof activity!=='undefined' && Array.isArray(activity) && !localStorage.getItem(PATCH_KEY+'-index')){
        activity.unshift({at:new Date().toISOString(),summary:'Kaiser Permanente approved a $1,000 cash sponsorship.',source:'Sept. 18, 2026 Kaiser Permanente approval notice; payment is in process.'});
        localStorage.setItem('faw2026Activity',JSON.stringify(activity));
        localStorage.setItem(PATCH_KEY+'-index','1');
      }
      if(typeof persist==='function') persist(); else if(typeof renderAll==='function') renderAll();
    }
  }catch(e){console.warn('Sept. 18 Kaiser sponsor index patch:',e)}

  try{
    if(typeof db!=='undefined' && db && db.campaigns && typeof enrich==='function'){
      if(!db.campaigns[2026] && typeof newCampaign==='function') db.campaigns[2026]=newCampaign(2026,null);
      const c=db.campaigns[2026];
      if(c){
        const kaiser=enrich({
          id:'kaiser',org:'Kaiser Permanente — Fresno Area',worker:'Ashley',owner:'Ashley Morris',
          contact:'Samantha Schuh',email:'samantha.schuh@kp.org',status:'Confirmed',
          sector:'Healthcare',strength:'Established',probability:100,method:'Online application',tier:'Sponsor',
          value:1000,valueType:'Cash',payment:'Approved — payment in process',address:'Kaiser Permanente Fresno Medical Center, Fresno, CA',
          ask:'Confirm payment receipt and coordinate any applicable event participation or sponsor materials.',
          last:'Kaiser Permanente approved a $1,000 sponsorship for the 15th Annual Fresno AIDS Walk on Sept. 18, 2026. Payment is in process.',
          next:'Confirm payment receipt. Contact Samantha Schuh for any applicable logos, ads, speakers, exhibits, promotional materials, or attendee logistics.',
          notes:'Confirmed $1,000 cash sponsor. Acceptance of the sponsorship confirms WestCare California Inc has the documented non-discrimination policy described in Kaiser’s approval notice.'
        });
        c.sponsors=(c.sponsors||[]).filter(x=>!isKaiser(x));
        c.sponsors.unshift(kaiser);
        c.calendar=c.calendar||[];
        if(!c.calendar.some(x=>x.id==='kaiser-payment-20260918')){
          c.calendar.push({id:'kaiser-payment-20260918',date:'2026-09-18',type:'Payment',title:'Kaiser Permanente — $1,000 payment in process',owner:'Ashley Morris',notes:'Sponsorship approved Sept. 18, 2026. Confirm receipt when payment arrives.',sponsorId:'kaiser'});
        }
        c.activity=c.activity||[];
        if(!localStorage.getItem(PATCH_KEY+'-db')){
          c.activity.unshift({at:new Date().toISOString(),summary:'Sept. 18: Kaiser Permanente approved $1,000 cash sponsorship.',source:'Kaiser Permanente approval notice; payment is in process.'});
          localStorage.setItem(PATCH_KEY+'-db','1');
        }
        if(typeof save==='function') save();
        if(typeof renderAll==='function') renderAll();
      }
    }
  }catch(e){console.warn('Sept. 18 Kaiser sponsor database patch:',e)}

  try{
    const b=document.querySelector('.banner');
    if(b){
      b.innerHTML=b.innerHTML
        .replace(/Confirmed cash sponsorship is now \$4,500\.?/i,'Confirmed cash sponsorship is now $5,500.')
        .replace(/known confirmed cash total[^<.]*\$4,500[^<.]*\.?/i,'known confirmed cash total is $5,500.');
      if(!/Kaiser Permanente approved/i.test(b.textContent||'')){
        b.insertAdjacentHTML('beforeend','<br><strong>Sept. 18:</strong> Kaiser Permanente approved a $1,000 cash sponsorship for the 15th Annual Fresno AIDS Walk. Payment is in process.');
      }
    }
    const stats=[...document.querySelectorAll('#stats .stat')];
    stats.forEach(card=>{
      const label=(card.querySelector('.label')?.textContent||'').toLowerCase();
      const hint=card.querySelector('.hint');
      if(label.includes('confirmed cash')&&hint) hint.textContent='CVS Health + RH + Oakmont + Imperial Dove Court + Economy Inn Fresno + Kaiser Permanente confirmed';
    });
  }catch(e){}
})();