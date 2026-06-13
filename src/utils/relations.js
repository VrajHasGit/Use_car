import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Core relational queries and autofill logic from USED CAR FINAL.html

export const autoFillFromInq = async (inqId) => {
  if (!inqId) return null;
  try {
    const q = query(collection(db, 'pur_inq'), where('inqId', '==', inqId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
    // Fallback: search by document ID if inqId field isn't set
    const fallbackQ = query(collection(db, 'pur_inq'));
    const all = await getDocs(fallbackQ);
    const doc = all.docs.find(d => d.id === inqId);
    if (doc) return doc.data();
  } catch (error) {
    console.error("Error autofilling from inquiry:", error);
  }
  return null;
};

export const autoFillFromStock = async (regNo) => {
  if (!regNo) return null;
  try {
    const q = query(collection(db, 'stk'), where('regNo', '==', regNo));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
  } catch (error) {
    console.error("Error autofilling from stock:", error);
  }
  return null;
};

export const loadBrands = () => {
  return [
    'Maruti Suzuki','Hyundai','Tata','Honda','Toyota','Mahindra','Ford',
    'Volkswagen','Kia','Renault','Nissan','MG','Skoda','Jeep','Audi','BMW','Mercedes','Others'
  ];
};

export const loadModels = (make) => {
  const MODELS = {
    'Maruti Suzuki': ['Swift','Alto','Baleno','WagonR','Brezza','Ertiga','Dzire','Ciaz','Ignis','S-Presso'],
    'Hyundai': ['i20','i10','Creta','Venue','Verna','Tucson','Alcazar','Aura','Grand i10','Santro'],
    'Tata': ['Nexon','Harrier','Safari','Punch','Altroz','Tiago','Tigor','Hexa','Nano'],
    'Honda': ['City','Amaze','WR-V','Jazz','CR-V','HR-V','Elevate'],
    'Toyota': ['Innova Crysta','Fortuner','Camry','Glanza','Urban Cruiser Hyryder','Yaris'],
    'Mahindra': ['Scorpio','Thar','XUV700','Bolero','XUV300','Marazzo','BE6'],
    'Ford': ['EcoSport','Figo','Aspire','Endeavour'],
    'Volkswagen': ['Polo','Vento','Taigun','Virtus'],
    'Kia': ['Seltos','Sonet','Carnival','EV6'],
    'Renault': ['Kwid','Duster','Triber','Kiger'],
    'Others': ['Other Model']
  };
  return MODELS[make] || ['Other'];
};

export const loadYears = () => {
  const years = [];
  for (let y = new Date().getFullYear(); y >= 1998; y--) {
    years.push(y);
  }
  return years;
};
