import React, { useState, useMemo, useEffect } from 'react';
import { updateRecord } from '../../services/db';

/* ══ Heuristic base prices (₹) for common Indian models ══ */
const SEGMENT_BASE = {
  'Alto':3.2,'Alto K10':3.5,'WagonR':4.8,'Swift':5.8,'Baleno':6.8,
  'i10':4.4,'Grand i10':5.2,'i20':7.0,'Santro':4.0,'Polo':5.8,
  'Jazz':6.4,'Amaze':6.2,'Brio':4.2,'Tiago':5.0,'Altroz':6.8,
  'Ignis':5.4,'Celerio':4.8,'Kwid':3.8,'Redi-Go':3.4,
  'Dzire':6.8,'Xcent':6.2,'Aspire':6.4,'Tigor':6.0,
  'City':9.8,'Verna':10.0,'Rapid':7.8,'Ciaz':8.8,
  'Linea':7.2,'Sunny':7.4,'Indigo':5.2,
  'Nexon':9.8,'Brezza':10.0,'Ecosport':9.2,'Venue':9.8,
  'Sonet':9.4,'Kiger':8.8,'Punch':7.8,'Magnite':8.2,
  'Bolero':9.0,'Scorpio':14.0,'Thar':16.0,
  'Creta':13.0,'Seltos':12.5,'Hector':15.0,'Duster':10.0,
  'XUV300':11.5,'XUV400':13.5,'XUV700':21.0,
  'Safari':17.0,'Harrier':16.0,'Compass':18.5,
  'Ertiga':10.0,'Marazzo':12.5,'Hexa':15.5,
  'Innova':17.5,'Innova Crysta':18.0,
  'Carens':13.0,'Carnival':27.0,
};

const OVR_FACTOR  = { Excellent:1.05, Good:1.0, Average:0.88, Poor:0.74 };
const ENG_FACTOR  = { Good:1.0, 'Repair Required':0.90 };
const TYRE_FACTOR = { Good:1.0, Average:0.97, Bad:0.94 };

const AI_PROVIDERS = [
  { id:'gemini',     name:'Gemini',     symbol:'✦', brand:'#4285F4', grad:'linear-gradient(135deg,#4285F4,#34A853)', getUrl: p => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`, desc:'Best for Indian market'       },
  { id:'claude',     name:'Claude',     symbol:'◆', brand:'#D97706', grad:'linear-gradient(135deg,#D97706,#F59E0B)', getUrl: p => `https://claude.ai/new?q=${encodeURIComponent(p)}`,        desc:'Deep reasoning & analysis'    },
  { id:'chatgpt',    name:'ChatGPT',    symbol:'◉', brand:'#10A37F', grad:'linear-gradient(135deg,#10A37F,#06D6A0)', getUrl: p => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,          desc:'Wide market knowledge'        },
  { id:'grok',       name:'Grok',       symbol:'✗', brand:'#1D9BF0', grad:'linear-gradient(135deg,#1D9BF0,#7C3AED)', getUrl: p => `https://grok.com/?q=${encodeURIComponent(p)}`,             desc:'Real-time market data'        },
  { id:'perplexity', name:'Perplexity', symbol:'⊕', brand:'#20B2AA', grad:'linear-gradient(135deg,#20B2AA,#2196F3)', getUrl: p => `https://www.perplexity.ai/?q=${encodeURIComponent(p)}`,    desc:'Research-backed pricing'     },
  { id:'meta',       name:'Meta AI',    symbol:'∞', brand:'#0668E1', grad:'linear-gradient(135deg,#0668E1,#E040FB)', getUrl: p => `https://www.meta.ai/?q=${encodeURIComponent(p)}`,          desc:'Quick estimates'             },
];

/* ── heuristic engine ── */
function computeHeuristic(rec) {
  const model  = rec.v_model || rec.model || '';
  const year   = parseInt(rec.v_year  || rec.year  || new Date().getFullYear());
  const km     = parseFloat(rec.v_km  || rec.km    || 0);
  const fuel   = rec.v_fuel  || rec.fuel   || 'Petrol';
  const owners = rec.v_own   || rec.owners || '1st';
  const ovr    = rec.v_ovr   || rec.overallCondition || 'Good';
  const eng    = rec.v_eng   || rec.engineCondition  || 'Good';
  const tyre   = rec.v_tyre  || rec.tyreCondition    || 'Good';
  const hasRC  = rec.v_rc    || rec.rcAvailable;
  const hasSvc = rec.v_svc   || rec.serviceRecord;
  const noAcc  = rec.v_acc   || rec.noAccident;

  const age = Math.max(0, new Date().getFullYear() - year);

  let base = (SEGMENT_BASE[model] || (fuel === 'Diesel' ? 9 : 6)) * 100000;
  let dep  = base;
  for (let i = 0; i < age; i++) dep *= (i === 0 ? 0.85 : i < 5 ? 0.90 : 0.92);

  const extraKm = Math.max(0, km - 15000);
  dep *= Math.pow(0.99, Math.floor(extraKm / 10000));
  dep *= (OVR_FACTOR[ovr]   || 1.0);
  dep *= (ENG_FACTOR[eng]   || 1.0);
  dep *= (TYRE_FACTOR[tyre] || 1.0);
  if (owners==='2nd')  dep *= 0.92;
  if (owners==='3rd')  dep *= 0.85;
  if (owners==='4th+') dep *= 0.75;
  if (hasRC)  dep *= 1.02;
  if (hasSvc) dep *= 1.03;
  if (noAcc)  dep *= 1.04;
  if (fuel==='Diesel' && age<8) dep *= 1.05;
  if (fuel==='CNG')  dep *= 0.95;
  if (fuel==='EV')   dep *= 1.15;

  return {
    low:  Math.round(dep * 0.92 / 1000) * 1000,
    mid:  Math.round(dep        / 1000) * 1000,
    high: Math.round(dep * 1.08 / 1000) * 1000,
  };
}

/* ── prompt builder ── */
function buildPrompt(rec) {
  const f  = (k, fb='—') => rec[k] || fb;
  const ck = v => v ? '✅ Yes' : '❌ No';
  return `You are an expert used car valuation specialist in the Indian automotive market.

Please provide a detailed PURCHASE price valuation for the vehicle below.
I am a used car dealer looking to BUY this vehicle from a seller.

═══════════════════════════════════
VEHICLE DETAILS
═══════════════════════════════════
Make / Brand   : ${f('v_make')||f('make')}
Model          : ${f('v_model')||f('model')}
Variant        : ${f('v_var')||f('variant','Unknown')}
Year           : ${f('v_year')||f('year')}
Fuel Type      : ${f('v_fuel')||f('fuel')}
Registration # : ${f('v_vnum')||f('regNo')}
KM Driven      : ${f('v_km')||f('km')} km
Owner History  : ${f('v_own')||f('owners')} owner

═══════════════════════════════════
INSPECTION REPORT
═══════════════════════════════════
Overall Condition   : ${f('v_ovr')||f('overallCondition')}
Engine Condition    : ${f('v_eng')||f('engineCondition')}
Tyre Condition      : ${f('v_tyre')||f('tyreCondition')}
RC Available        : ${ck(rec.v_rc||rec.rcAvailable)}
Service Record      : ${ck(rec.v_svc||rec.serviceRecord)}
No Accident History : ${ck(rec.v_acc||rec.noAccident)}

═══════════════════════════════════
SELLER EXPECTATIONS
═══════════════════════════════════
Seller's Expected Price : ₹${rec.expectedPrice||rec.v_expPrice||'Not disclosed'}
Remarks / Notes         : ${f('v_rem')||f('remarks')}

═══════════════════════════════════
PLEASE PROVIDE:
═══════════════════════════════════
1. 📊 Fair Market Value Range (Low / Mid / High) in ₹
2. 💡 Recommended PURCHASE OFFER PRICE with justification
3. ⚠️  Key risk factors affecting the price
4. 🔍 Comparable market listings if known
5. ✅ Final recommendation: Should I buy at seller's asking price?

Use Indian number format (Lakh/Crore) for all values.`;
}

const fmtINR = n => {
  if (!n) return '—';
  const l = n / 100000;
  return l >= 1 ? `₹${l.toFixed(2)} L` : `₹${n.toLocaleString('en-IN')}`;
};

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export const AIPriceModal = ({ isOpen, onClose, record, onSavePrice }) => {
  const [step,        setStep]        = useState('estimate');
  const [selectedAI,  setSelectedAI]  = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [aiResult,    setAiResult]    = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('estimate');
      setSelectedAI(null);
      setCopied(false);
      setAiResult(record?.aiSuggestion || '');
      setSaved(!!record?.aiSuggestion);
    }
  }, [isOpen, record]);

  const estimate = useMemo(() => record ? computeHeuristic(record) : null, [record]);
  const prompt   = useMemo(() => record ? buildPrompt(record) : '',          [record]);

  if (!isOpen || !record) return null;

  const vehicle = `${record.v_make||record.make||''} ${record.v_model||record.model||''} (${record.v_year||record.year||''})`.trim();
  const age     = new Date().getFullYear() - parseInt(record.v_year||record.year||new Date().getFullYear());

  const fallbackCopyText = (text) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      // Must be rendered on screen but invisible to work reliably
      ta.style.position = 'fixed';
      ta.style.left = '0';
      ta.style.top = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      console.error('Fallback copy failed', e);
      return false;
    }
  };

  const doCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          // Fallback if clipboard API rejects
          fallbackCopyText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        });
    } else {
      // Direct fallback
      fallbackCopyText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyAndOpen = () => {
    if (!selectedAI) return;
    // 1. Open window synchronously to avoid popup blocker
    window.open(selectedAI.getUrl(prompt), '_blank', 'noopener,noreferrer');
    // 2. Perform copy
    doCopy();
  };

  const handleSaveResult = async () => {
    if (!aiResult.trim() || !record.id) return;
    setSaving(true);
    try { await onSavePrice({ aiSuggestion: aiResult }); setSaved(true); }
    catch (e) { console.error(e); }
    finally   { setSaving(false); }
  };

  /* ── shared inline styles using CSS vars ── */
  const S = {
    /* modal chrome */
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
    box:     { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:760, maxHeight:'94vh', overflowY:'auto', boxShadow:'var(--shadow)', display:'flex', flexDirection:'column' },

    /* header */
    hdr:      { padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, background:'var(--surface)', zIndex:2, background:'linear-gradient(135deg, var(--sb-top), var(--bl2))' },
    hdrIcon:  { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,var(--or1),var(--or2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
    hdrTitle: { fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:'#fff', margin:0 },
    hdrSub:   { fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2, fontWeight:400, textTransform:'none', letterSpacing:0 },
    closeBtn: { marginLeft:'auto', width:30, height:30, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:6, color:'rgba(255,255,255,.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'.15s', flexShrink:0 },

    /* tab bar */
    tabBar:   { display:'flex', borderBottom:'2px solid var(--border)', background:'var(--surface2)' },
    tabBtn:   (active) => ({ flex:1, padding:'12px 0', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', transition:'.15s', color: active ? 'var(--or1)' : 'var(--text3)', borderBottom: active ? '2px solid var(--or1)' : '2px solid transparent', marginBottom:-2 }),

    /* body */
    body:  { padding:'20px 22px', flex:1 },

    /* section label */
    secLbl: { fontSize:9, color:'var(--text3)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:12, display:'flex', alignItems:'center', gap:6 },

    /* summary strip */
    strip:     { background:'var(--or5)', border:'1px solid var(--or4)', borderRadius:12, padding:'14px 18px', marginBottom:20, display:'flex', flexWrap:'wrap', gap:16 },
    stripKey:  { fontSize:9, color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:2 },
    stripVal:  { fontSize:12, color:'var(--or1)', fontWeight:700 },

    /* estimate cards */
    estGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 },

    /* prompt box */
    promptBox: { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', fontSize:11, color:'var(--text2)', overflow:'auto', maxHeight:180, whiteSpace:'pre-wrap', fontFamily:"'Space Grotesk',monospace", lineHeight:1.6, margin:0 },

    /* AI grid */
    aiGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 },

    /* paste area */
    textarea: { width:'100%', minHeight:100, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 14px', color:'var(--text)', fontSize:12, fontFamily:'inherit', resize:'vertical', outline:'none', lineHeight:1.6, boxSizing:'border-box', transition:'.2s' },

    /* action row */
    foot: { display:'flex', gap:8, justifyContent:'flex-end', marginTop:10 },

    /* generic outlined button */
    btnOut: { background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', padding:'8px 18px', color:'var(--text2)', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer', transition:'.15s' },

    /* primary gradient button */
    btnPri: { background:'linear-gradient(135deg,var(--or1),var(--or2))', border:'none', borderRadius:'var(--radius-sm)', padding:'9px 20px', color:'#fff', fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'.2s', letterSpacing:'.3px' },
  };

  /* ── chips for value factors ── */
  const factorChips = [
    { label:`${age} yr${age!==1?'s':''} old`,             impact: age>5?'hi': age>2?'md':'lo' },
    { label:`${parseInt(record.v_km||record.km||0).toLocaleString('en-IN')} km`, impact:(record.v_km||record.km)>80000?'hi':(record.v_km||record.km)>40000?'md':'lo' },
    { label:record.v_own||'1st owner',                    impact:(record.v_own||'').includes('3')||(record.v_own||'').includes('4')?'hi':(record.v_own||'').includes('2')?'md':'lo' },
    { label:`${record.v_ovr||'Good'} condition`,          impact:(record.v_ovr||'')==='Poor'?'hi':(record.v_ovr||'')==='Average'?'md':'lo' },
    { label:record.v_rc  ?'✅ RC Available'  :'❌ No RC',  impact:record.v_rc ?'lo':'hi' },
    { label:record.v_svc ?'✅ Service Hist.' :'❌ No Service Rec.',impact:record.v_svc?'lo':'md' },
    { label:record.v_acc ?'✅ No Accident'   :'⚠️ Accident Hist.',impact:record.v_acc?'lo':'hi' },
  ];

  const chipStyle = (impact) => ({
    padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700,
    background: impact==='hi' ? 'rgba(var(--danger-rgb,239,68,68),.1)'   : impact==='md' ? 'rgba(var(--warn-rgb,245,158,11),.1)'   : 'rgba(var(--success-rgb,34,197,94),.1)',
    color:      impact==='hi' ? 'var(--danger)' : impact==='md' ? 'var(--warn)' : 'var(--success)',
    border:     `1px solid ${impact==='hi' ? 'rgba(239,68,68,.2)' : impact==='md' ? 'rgba(245,158,11,.2)' : 'rgba(34,197,94,.2)'}`,
  });

  return (
    <div style={S.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.box}>

        {/* ── HEADER ── */}
        <div style={S.hdr}>
          <div style={S.hdrIcon}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={S.hdrTitle}>AI Price Suggestion</div>
            <div style={S.hdrSub}>{vehicle}</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── TAB BAR ── */}
        <div style={S.tabBar}>
          {[{id:'estimate',icon:'📊',label:'Smart Estimate'},{id:'launch',icon:'🚀',label:'Ask AI'}].map(t => (
            <button key={t.id} style={S.tabBtn(step===t.id)} onClick={() => setStep(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB 1 — SMART ESTIMATE
        ══════════════════════════════════════ */}
        {step==='estimate' && (
          <div style={S.body}>

            {/* Car summary strip */}
            <div style={S.strip}>
              {[
                {label:'Vehicle',   value:vehicle},
                {label:'KM Driven', value:(record.v_km||record.km)?`${parseInt(record.v_km||record.km||0).toLocaleString('en-IN')} km`:'—'},
                {label:'Age',       value:`${age} yr${age!==1?'s':''}`},
                {label:'Owners',    value:record.v_own||record.owners||'1st'},
                {label:'Condition', value:record.v_ovr||record.overallCondition||'Good'},
                {label:'Fuel',      value:record.v_fuel||record.fuel||'—'},
              ].map(({label,value}) => (
                <div key={label} style={{minWidth:100}}>
                  <div style={S.stripKey}>{label}</div>
                  <div style={S.stripVal}>{value}</div>
                </div>
              ))}
            </div>

            {/* Estimate cards */}
            <div style={S.secLbl}>📊 Heuristic Valuation Range</div>
            <div style={S.estGrid}>
              {[
                {label:'Conservative', sub:'Safe offer to seller', val:estimate?.low,  color:'var(--success)', bg:'var(--surface2)', borderKey:'var(--border2)', emoji:'🟢'},
                {label:'Fair Market',  sub:'Recommended price',    val:estimate?.mid,  color:'var(--or1)',     bg:'var(--or5)',      borderKey:'var(--or4)',     emoji:'⭐'},
                {label:'Aggressive',   sub:'If top condition',     val:estimate?.high, color:'var(--warn)',    bg:'var(--surface2)', borderKey:'var(--border2)', emoji:'🔥'},
              ].map(c => (
                <div key={c.label} style={{background:c.bg, border:`1px solid ${c.borderKey}`, borderRadius:'var(--radius-lg)', padding:'16px 14px', textAlign:'center'}}>
                  <div style={{fontSize:20,marginBottom:6}}>{c.emoji}</div>
                  <div style={{fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:800, color:c.color}}>{fmtINR(c.val)}</div>
                  <div style={{fontSize:11, fontWeight:700, color:c.color, marginTop:4}}>{c.label}</div>
                  <div style={{fontSize:10, color:'var(--text3)', marginTop:3}}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Seller vs estimate comparison */}
            {(record.expectedPrice||record.v_expPrice) && (() => {
              const ask  = parseFloat(record.expectedPrice||record.v_expPrice||0);
              const fair = estimate?.mid||0;
              const diff = ask - fair;
              const pct  = fair>0 ? Math.abs((diff/fair)*100).toFixed(1) : 0;
              const hi   = diff>0;
              return (
                <div style={{background: hi?'rgba(239,68,68,.06)':'rgba(34,197,94,.06)', border:`1px solid ${hi?'rgba(239,68,68,.2)':'rgba(34,197,94,.2)'}`, borderRadius:'var(--radius)', padding:'12px 16px', display:'flex', alignItems:'center', gap:14, marginBottom:20}}>
                  <div style={{fontSize:22}}>{hi?'⚠️':'✅'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:12, color: hi?'var(--danger)':'var(--success)'}}>
                      {hi?`Seller asking ${pct}% ABOVE fair market`:`Seller asking ${pct}% BELOW fair market`}
                    </div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>
                      Asking {fmtINR(ask)} · Fair mid {fmtINR(fair)} · Gap {hi?'+':''}{fmtINR(Math.abs(diff))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Value factor chips */}
            <div style={S.secLbl}>📉 Value Factors Applied</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:22}}>
              {factorChips.map(({label,impact}) => (
                <span key={label} style={chipStyle(impact)}>{label}</span>
              ))}
            </div>

            <div style={S.foot}>
              <button style={S.btnOut} onClick={onClose}>Close</button>
              <button style={S.btnPri} onClick={() => setStep('launch')}>
                🚀 Ask an AI for deeper analysis
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB 2 — LAUNCH AI
        ══════════════════════════════════════ */}
        {step==='launch' && (
          <div style={S.body}>

            {/* AI provider grid */}
            <div style={S.secLbl}>🤖 Choose Your AI Assistant</div>
            <div style={S.aiGrid}>
              {AI_PROVIDERS.map(ai => {
                const sel = selectedAI?.id===ai.id;
                return (
                  <button key={ai.id} onClick={() => setSelectedAI(ai)} style={{
                    background:    sel ? ai.grad : 'var(--surface2)',
                    border:        `2px solid ${sel ? ai.brand : 'var(--border)'}`,
                    borderRadius:  'var(--radius-lg)',
                    padding:       '14px 12px',
                    cursor:        'pointer',
                    textAlign:     'center',
                    transition:    '.2s',
                    outline:       'none',
                    boxShadow:     sel ? `0 0 0 3px ${ai.brand}33, 0 8px 24px ${ai.brand}22` : 'none',
                    transform:     sel ? 'translateY(-3px)' : 'none',
                  }}>
                    <div style={{fontSize:22, marginBottom:6, color: sel?'#fff':ai.brand}}>{ai.symbol}</div>
                    <div style={{fontWeight:800, fontSize:12, color: sel?'#fff':'var(--text)', marginBottom:3, fontFamily:"'Space Grotesk',sans-serif"}}>{ai.name}</div>
                    <div style={{fontSize:9, color: sel?'rgba(255,255,255,.75)':'var(--text3)', letterSpacing:'.3px'}}>{ai.desc}</div>
                    {sel && <div style={{marginTop:6, fontSize:9, background:'rgba(255,255,255,.2)', borderRadius:10, padding:'2px 8px', color:'#fff', fontWeight:700}}>✓ SELECTED</div>}
                  </button>
                );
              })}
            </div>

            {/* Prompt preview */}
            <div style={{marginBottom:16}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                <div style={S.secLbl}>📋 Auto-Generated Valuation Prompt</div>
                <button
                  onClick={doCopy}
                  style={{...S.btnOut, padding:'4px 12px', fontSize:10}}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Only'}
                </button>
              </div>
              <pre style={S.promptBox}>{prompt}</pre>
            </div>

            {/* Open AI button */}
            <button
              onClick={handleCopyAndOpen}
              disabled={!selectedAI}
              style={{
                width:'100%', padding:13, border:'none', borderRadius:'var(--radius)', cursor: selectedAI?'pointer':'not-allowed',
                background:  selectedAI ? selectedAI.grad : 'var(--surface2)',
                color:       selectedAI ? '#fff' : 'var(--text3)',
                fontFamily:  "'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, letterSpacing:'.5px',
                transition:  '.2s', marginBottom:20,
                boxShadow:   selectedAI ? `0 6px 24px ${selectedAI.brand}44` : 'none',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              }}
            >
              {copied
                ? '✅ Copied! Opening…'
                : selectedAI
                  ? `📋 Copy Prompt & Open ${selectedAI.name} →`
                  : '← Select an AI provider above first'}
            </button>

            {/* Log AI result */}
            <div style={{borderTop:'1px solid var(--border)', paddingTop:16}}>
              <div style={{...S.secLbl, marginBottom:8}}>📥 Paste AI Response to Save</div>
              <textarea
                value={aiResult}
                onChange={e => { setAiResult(e.target.value); setSaved(false); }}
                placeholder="Paste the AI's valuation response here… It will be saved to this record."
                style={S.textarea}
                onFocus={e  => e.target.style.borderColor='var(--or1)'}
                onBlur={e   => e.target.style.borderColor='var(--border)'}
              />
              <div style={S.foot}>
                <button style={S.btnOut} onClick={onClose}>Close</button>
                <button
                  onClick={handleSaveResult}
                  disabled={!aiResult.trim()||saving||saved}
                  style={{
                    ...S.btnPri,
                    background: saved
                      ? 'var(--surface2)'
                      : aiResult.trim()
                        ? 'linear-gradient(135deg,var(--or1),var(--or2))'
                        : 'var(--surface2)',
                    color: saved ? 'var(--success)' : aiResult.trim() ? '#fff' : 'var(--text3)',
                    border: saved ? '1px solid var(--border2)' : 'none',
                    cursor: aiResult.trim()&&!saving&&!saved ? 'pointer' : 'not-allowed',
                  }}
                >
                  {saving ? <><i className="fa fa-spinner fa-spin"/> Saving…</>
                          : saved  ? '✅ Saved to Record'
                          : <><i className="fa fa-save"/> Save AI Result</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
