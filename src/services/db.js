import { db } from '../firebase';
import {
  collection, doc, getDocs, getDoc,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// ── Collections ──
export const COL = {
  users: 'users',
  pur_inq: 'pur_inq',
  val: 'val',
  pfu: 'pfu',
  pcl: 'pcl',
  ob: 'ob',
  sal_inq: 'sal_inq',
  sfu: 'sfu',
  scl: 'scl',
  sob: 'sob',
  stk: 'stk',
  ws: 'ws',
  pay: 'pay',
  del: 'del',
  doc: 'doc',
  cust: 'cust',
  dn: 'dn',
  gp: 'gp',
  sp: 'sp',
  td: 'td',
  fin: 'fin',
  exp_rec: 'exp_rec',
  gst_inv: 'gst_inv',
  targets: 'targets',
  feedback: 'feedback',
  tasks: 'tasks',
  settings: 'settings',
  counters: 'counters',
};

// ── Generic getAll ──
export async function getAll(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error(`getAll(${colName}):`, e);
    return [];
  }
}

// ── Generic getById ──
export async function getById(colName, id) {
  try {
    const snap = await getDoc(doc(db, colName, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error(`getById(${colName}, ${id}):`, e);
    return null;
  }
}

// ── Generic add ──
export async function addRecord(colName, data) {
  try {
    const ref = await addDoc(collection(db, colName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.error(`addRecord(${colName}):`, e);
    throw e;
  }
}

// ── Generic update ──
export async function updateRecord(colName, id, data) {
  try {
    await updateDoc(doc(db, colName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error(`updateRecord(${colName}, ${id}):`, e);
    throw e;
  }
}

// ── Generic delete ──
export async function deleteRecord(colName, id) {
  try {
    await deleteDoc(doc(db, colName, id));
  } catch (e) {
    console.error(`deleteRecord(${colName}, ${id}):`, e);
    throw e;
  }
}

// ── Counter management ──
export async function getNextCounter(key) {
  try {
    const ref = doc(db, 'counters', 'main');
    const snap = await getDoc(ref);
    let counters = snap.exists() ? snap.data() : {};
    const next = (counters[key] || 0) + 1;
    await setDoc(ref, { ...counters, [key]: next }, { merge: true });
    return next;
  } catch (e) {
    console.error(`getNextCounter(${key}):`, e);
    return Math.floor(Math.random() * 9000) + 1000;
  }
}

// ── Settings ──
export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'main'));
    return snap.exists() ? snap.data() : {};
  } catch (e) {
    return {};
  }
}

export async function saveSettings(data) {
  try {
    await setDoc(doc(db, 'settings', 'main'), data, { merge: true });
  } catch (e) {
    console.error('saveSettings:', e);
  }
}

// ── Realtime listener ──
export function subscribeCollection(colName, callback) {
  return onSnapshot(collection(db, colName), (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}
