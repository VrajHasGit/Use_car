import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_REDACTED",
  authDomain: "use-car-c9e76.firebaseapp.com",
  projectId: "use-car-c9e76",
  storageBucket: "use-car-c9e76.firebasestorage.app",
  messagingSenderId: "964924436035",
  appId: "1:964924436035:web:195103ff57222bbe8eaef6",
  measurementId: "G-YRGG6DEL4Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jsonPath = '../carecay_export.json';

async function migrate() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`Export file not found at ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('Found data in local storage export. Migrating to Firestore...');

  for (const [key, value] of Object.entries(data)) {
    try {
      const parsedValue = JSON.parse(value);
      
      if (Array.isArray(parsedValue)) {
        console.log(`Migrating array key: ${key} (${parsedValue.length} items)`);
        for (let i = 0; i < parsedValue.length; i++) {
          const item = parsedValue[i];
          const itemId = item.id || `item_${i}`;
          await setDoc(doc(db, key, String(itemId)), item);
        }
      } else if (typeof parsedValue === 'object' && parsedValue !== null) {
        console.log(`Migrating object key: ${key}`);
        await setDoc(doc(db, 'config', key), parsedValue);
      } else {
        console.log(`Migrating primitive key: ${key}`);
        await setDoc(doc(db, 'config', key), { value: parsedValue });
      }

    } catch (e) {
      console.log(`Key ${key} is not JSON. Storing as raw string.`);
      await setDoc(doc(db, 'config', key), { value });
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate();
