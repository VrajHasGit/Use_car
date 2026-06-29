import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const pfuSnap = await getDocs(collection(db, 'pfu'));
  const pfuRecords = pfuSnap.docs.map(d => ({id: d.id, ...d.data()}));
  console.log("All PFU Records:", JSON.stringify(pfuRecords, null, 2));
  process.exit(0);
}

run();
