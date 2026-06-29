const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/services/db.js');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';`,
  `import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';`
);

code = code.replace(
  `export async function uploadFileToStorage(file, folder = 'documents') {
  try {
    const ext = file.name.split('.').pop();
    const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(2, 8)}.\${ext}\`;
    const storageRef = ref(storage, \`\${folder}/\${fileName}\`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { url, name: file.name };
  } catch (e) {
    console.error('uploadFileToStorage:', e);
    throw e;
  }
}`,
  `export async function uploadFileToStorage(file, folder = 'documents', onProgress) {
  try {
    const ext = file.name.split('.').pop();
    const fileName = \`\${Date.now()}_\${Math.random().toString(36).substring(2, 8)}.\${ext}\`;
    const storageRef = ref(storage, \`\${folder}/\${fileName}\`);
    
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url, name: file.name });
          }
        );
      });
    } else {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { url, name: file.name };
    }
  } catch (e) {
    console.error('uploadFileToStorage:', e);
    throw e;
  }
}`
);

fs.writeFileSync(file, code);
console.log("db.js updated");
