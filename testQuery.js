import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  console.log("Fetching data...");
  const obSnap = await getDocs(collection(db, 'ob'));
  const obRecords = obSnap.docs.map(d => ({id: d.id, ...d.data()}));
  
  const pfuSnap = await getDocs(collection(db, 'pfu'));
  const pfuRecords = pfuSnap.docs.map(d => ({id: d.id, ...d.data()}));
  
  const docSnap = await getDocs(collection(db, 'doc'));
  const docRecords = docSnap.docs.map(d => ({id: d.id, ...d.data()}));

  const ob6 = obRecords.find(r => r.obId === 'OB-2026-0006');
  console.log("OB-2026-0006:", ob6);
  
  if (ob6) {
    const inqId = ob6.ob_inqid || ob6.inqId || '';
    const cleanRegn = (s) => (s || '').replace(/[\s-]/g, '').toLowerCase();
    const reg = cleanRegn(ob6.ob_regn || ob6.regNo);
    console.log("Looking for pfu with inqId:", inqId, "or reg:", reg);
    
    const pfuMatches = pfuRecords.filter(p => 
      (inqId && (p.pf_inqid || '').toLowerCase() === inqId.toLowerCase()) || 
      (reg && cleanRegn(p.pf_regn) === reg)
    );
    console.log("PFU Matches:", JSON.stringify(pfuMatches, null, 2));

    const docMatches = docRecords.filter(d => 
        (ob6.obId && d.dc_obid === ob6.obId) || 
        (inqId && d.dc_obid === inqId) || 
        (reg && cleanRegn(d.dc_regn) === reg)
    );
    console.log("DOC Matches:", JSON.stringify(docMatches, null, 2));
  }
  
  process.exit(0);
}

run();
