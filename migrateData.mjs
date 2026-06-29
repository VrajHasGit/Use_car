import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
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
