import { db } from '../firebase';
import { doc, setDoc, collection, addDoc, writeBatch } from 'firebase/firestore';

const USERS = [
  { id: 'USR-001', name: 'Administrator', lid: 'admin', pw: 'admin123', role: 'Admin', branch: 'Head Office', mobile: '9900000001', status: 'Active' },
  { id: 'USR-002', name: 'Ritesh Shah', lid: 'ritesh', pw: 'manager123', role: 'Partner', branch: 'All', mobile: '9898765432', status: 'Active' },
  { id: 'USR-003', name: 'Rajan Desai', lid: 'rajan', pw: 'manager123', role: 'Partner', branch: 'All', mobile: '9876543210', status: 'Active' },
  { id: 'USR-004', name: 'Kalpesh Joshi', lid: 'kalpesh', pw: 'manager123', role: 'Manager', branch: 'SG Highway', mobile: '9900000003', status: 'Active' },
  { id: 'USR-005', name: 'Marut Dandawala', lid: 'marut', pw: 'manager123', role: 'Manager', branch: 'Vastral', mobile: '9900000004', status: 'Active' },
  { id: 'USR-006', name: 'Isha Dashraniya', lid: 'isha', pw: 'closer123', role: 'Closer', branch: 'SG Highway', mobile: '9900000005', status: 'Active' },
  { id: 'USR-007', name: 'Pinal Desai', lid: 'pinal', pw: 'closer123', role: 'Closer', branch: 'Vastral', mobile: '9900000006', status: 'Active' },
  { id: 'USR-008', name: 'Mittal Mehta', lid: 'mittal', pw: 'exec123', role: 'Executive', branch: 'SG Highway', mobile: '9900000007', status: 'Active' },
  { id: 'USR-009', name: 'Amisha Dave', lid: 'amisha', pw: 'exec123', role: 'Executive', branch: 'Vastral', mobile: '9900000008', status: 'Active' },
  { id: 'USR-010', name: 'Dipti', lid: 'dipti', pw: 'exec123', role: 'Executive', branch: 'Head Office', mobile: '9900000009', status: 'Active' },
  // Short aliases for login
  { id: 'USR-011', name: 'Purchase User', lid: 'purchase', pw: 'pur123', role: 'Executive', branch: 'SG Highway', mobile: '9900000010', status: 'Active' },
  { id: 'USR-012', name: 'Sales User', lid: 'sales', pw: 'sal123', role: 'Executive', branch: 'SG Highway', mobile: '9900000011', status: 'Active' },
];

const SETTINGS = {
  compName: 'Carecay Private Limited',
  compShort: 'CARECAY',
  tagline: 'Carecay Pvt. Ltd.',
  gst: '24AAACC1234F1Z5',
  address: 'SG Highway, Ahmedabad, Gujarat - 380051',
  phone: '+91 9876543210',
  email: 'info@carecay.in',
  branches: ['SG Highway', 'Vastral', 'Head Office'],
  theme: 'black-darkblue',
  font: 'Inter',
};

export async function seedFirestore() {
  try {
    // Seed users
    const batch = writeBatch(db);
    USERS.forEach(u => {
      batch.set(doc(db, 'users', u.id), u);
    });
    // Seed settings
    batch.set(doc(db, 'settings', 'main'), SETTINGS);
    // Seed counters
    batch.set(doc(db, 'counters', 'main'), {
      pur: 0, val: 0, pfu: 0, pcl: 0, ob: 0,
      sal: 0, sfu: 0, scl: 0, sob: 0, stk: 0,
      ws: 0, pay: 0, del: 0, doc: 0, cust: 0,
      dn: 0, gp: 0, sp: 0, td: 0, usr: 12,
      fin: 0, exp_rec: 0, gst_inv: 0, tgt: 0,
    });
    await batch.commit();
    console.log('✅ Firestore seeded successfully');
    return { success: true };
  } catch (e) {
    console.error('Seed error:', e);
    return { success: false, error: e.message };
  }
}
