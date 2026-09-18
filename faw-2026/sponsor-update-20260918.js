(function(){
  const PATCH_KEY='fawSponsorUpdate20260918EconomyInn';
  const isEconomy=x=>x && ((x.id==='economy-inn') || /economy inn/i.test(x.org||''));

  const economyIndex={
    id:'economy-inn',org:'Economy Inn Fresno',status:'Confirmed',worker:'Terrance',owner:'Terrance',
    contact:'Sue & Anil Kumar',comm:'economyinnfresno@gmail.com',
    route:'Cash sponsorship — check being delivered to Emily',value:500,address:'Fresno, CA',
    last:'Sue Kumar confirmed a $500 Fresno AIDS Walk donation on Sept. 18, 2026 and stated she would give Emily the check that afternoon.',
    next:'Confirm Emily received the check and complete payment processing/deposit; confirm any sponsor recognition materials still needed.',
    notes:'Confirmed $500 cash sponsorship from Sue and Anil / Economy Inn Fresno. Sept. 18 email says Sue will give Emily the check that afternoon; do not mark payment deposited until receipt is confirmed.'
  };

  try{
    if(typeof sponsors!=='undefined' && Array.isArray(sponsors)){
      sponsors=sponsors.filter(x=>!isEconomy(x));
      sponsors.unshift(economyIndex);
      if(typeof timeline!=='undefined' && Array.isArray(timeline)){
        if(!timeline.some(t=>Array.isArray(t)&&/economy inn/i.test(t.join(' ')))){
          timeline.push(['2026-09-18','Economy Inn Fresno — $500 confirmed','Sue Kumar confirmed a $500 cash sponsorship and said the check would be given to Emily that afternoon.']);
        }
      }
      if(typeof activity!=='undefined' && Array.isArray(activity) && !localStorage.getItem(PATCH_KEY+'-index')){
        activity.unshift({at:new Date().toISOString(),summary:'Economy Inn Fresno confirmed a $500 cash sponsorship.',source:'Sept. 18, 2026 email from Sue Kumar; check planned for delivery to Emily that afternoon.'});
        localStorage.setItem('faw2026Activity',JSON.stringify(activity));
        localStorage.setItem(PATCH_KEY+'-index','1');
      }
      if(typeof persist==='function') persist(); else if(typeof renderAll==='function') renderAll();
    }
  }catch(e){console.warn('Sept. 18 Economy Inn sponsor index patch:',e)}

  try{
    if(typeof db!=='undefined' && db && db.campaigns && typeof enrich==='function'){
      if(!db.campaigns[2026] && typeof newCampaign==='function') db.campaigns[2026]=newCampaign(2026,null);
      const c=db.campaigns[2026];
      if(c){
        const economy=enrich({
          id:'economy-inn',org:'Economy Inn Fresno',worker:'Terrance',owner:'Terrance',
          contact:'Sue & Anil Kumar',email:'economyinnfresno@gmail.com',status:'Confirmed',
          sector:'Hospitality / Lodging',strength:'Established',probability:100,method:'Email',tier:'Sponsor',
          value:500,valueType:'Cash',payment:'Check being delivered to Emily on Sept. 18, 2026',address:'Fresno, CA',
          ask:'Confirm Emily received the check and complete payment processing/deposit.',
          last:'Sue Kumar confirmed a $500 donation toward the 2026 Fresno AIDS Walk on Sept. 18, 2026 and said she would give Emily the check that afternoon.',
          next:'Confirm Emily received the check; process/deposit payment and verify any remaining recognition materials.',
          notes:'Confirmed $500 cash sponsor. Sue and Anil thanked by Yvette. Payment is expected by check via Emily; receipt/deposit not yet independently confirmed.'
        });
        c.sponsors=(c.sponsors||[]).filter(x=>!isEconomy(x));
        c.sponsors.unshift(economy);
        c.calendar=c.calendar||[];
        if(!c.calendar.some(x=>x.id==='economy-inn-check-20260918')){
          c.calendar.push({id:'economy-inn-check-20260918',date:'2026-09-18',type:'Payment',title:'Economy Inn Fresno — $500 check to Emily',owner:'Terrance',notes:'Sue Kumar said she would give Emily the $500 sponsorship check this afternoon; confirm receipt before marking payment received/deposited.',sponsorId:'economy-inn'});
        }
        c.activity=c.activity||[];
        if(!localStorage.getItem(PATCH_KEY+'-db')){
          c.activity.unshift({at:new Date().toISOString(),summary:'Sept. 18: Economy Inn Fresno confirmed $500 cash sponsorship.',source:'Email from Sue Kumar; check planned for delivery to Emily that afternoon.'});
          localStorage.setItem(PATCH_KEY+'-db','1');
        }
        if(typeof save==='function') save();
        if(typeof renderAll==='function') renderAll();
      }
    }
  }catch(e){console.warn('Sept. 18 Economy Inn sponsor database patch:',e)}

  try{
    const b=document.querySelector('.banner');
    if(b){
      b.innerHTML=b.innerHTML
        .replace(/Confirmed cash sponsorship is now \$4,000\.?/i,'Confirmed cash sponsorship is now $4,500.')
        .replace(/known confirmed cash total[^<.]*\$4,000[^<.]*\.?/i,'known confirmed cash total is $4,500.');
      if(!/Economy Inn Fresno/i.test(b.textContent||'')){
        b.insertAdjacentHTML('beforeend','<br><strong>Sept. 18:</strong> Economy Inn Fresno confirmed a $500 cash sponsorship. Sue Kumar said the check would be given to Emily that afternoon; payment receipt still needs confirmation.');
      }
    }
    const stats=[...document.querySelectorAll('#stats .stat')];
    stats.forEach(card=>{
      const label=(card.querySelector('.label')?.textContent||'').toLowerCase();
      const hint=card.querySelector('.hint');
      if(label.includes('confirmed cash')&&hint) hint.textContent='CVS Health + RH + Oakmont + Imperial Dove Court + Economy Inn Fresno confirmed';
    });
  }catch(e){}
})();