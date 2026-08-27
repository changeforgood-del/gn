export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'OPENAI_API_KEY is not configured on the server'});
  const {text,client={}}=req.body||{};
  if(!text||typeof text!=='string') return res.status(400).json({error:'Missing note text'});
  const instructions=`You are a case-note writing assistant for housing and reentry case management. Rewrite the worker's raw note into concise, professional, objective documentation. Correct spelling and grammar. Preserve all facts and uncertainty exactly. Never invent services, diagnoses, eligibility, legal requirements, contacts, dates, outcomes, or client statements. Avoid stigmatizing language. Use neutral person-centered language. Keep the note in one clear paragraph unless the raw note clearly needs short action bullets. Do not make legal or clinical judgments. Output only the improved note.`;
  const context={preferred_city:client.city||'',supervision:client.supervision||'',housing_now:client.housingNow||''};
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.4-mini',instructions,input:`Client context (for wording only; do not add facts): ${JSON.stringify(context)}\n\nRaw case note:\n${text}`,max_output_tokens:500})
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||'OpenAI request failed'});
    const note=data.output_text||data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
    if(!note) return res.status(502).json({error:'No rewritten note returned'});
    return res.status(200).json({note});
  }catch(err){return res.status(500).json({error:'AI service unavailable'});}
}
