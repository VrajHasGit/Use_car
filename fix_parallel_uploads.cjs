const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

const oldSave = `      const keys = Object.keys(filesToUpload);
      for (const k of keys) {
        const file = filesToUpload[k];
        if (file) {
           const url = await uploadFileToStorage(file, \`documents/\${Date.now()}_\${file.name}\`);
           updatedData[k] = url.url || url;
        }
      }`;

const newSave = `      const keys = Object.keys(filesToUpload);
      const uploadPromises = keys.map(async (k) => {
        const file = filesToUpload[k];
        if (file) {
           const url = await uploadFileToStorage(file, \`documents/\${Date.now()}_\${file.name}\`);
           updatedData[k] = url.url || url;
        }
      });
      await Promise.all(uploadPromises);`;

docModal = docModal.replace(oldSave, newSave);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed parallel uploads!');
