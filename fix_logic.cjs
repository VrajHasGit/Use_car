const fs = require('fs');

// 1. Fix DocModal handleSave
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');
docModal = docModal.replace(
  `      if (editData && editData.id) {
        await updateRecord('doc', editData.id, updatedData);
      } else {
        const cnt = await getNextCounter('doc');
        const docId = genId('DOC', cnt);
        await addRecord('doc', { ...updatedData, docId, date: updatedData.dc_date || today() });
      }
      setUploading(false);
      if (onSave) { await onSave(updatedData); } else if (onSuccess) { onSuccess(); } else { onClose(); }`,
  `      setUploading(false);
      if (onSave) {
        await onSave(updatedData);
      } else {
        if (editData && editData.id) {
          await updateRecord('doc', editData.id, updatedData);
        } else {
          const cnt = await getNextCounter('doc');
          const docId = genId('DOC', cnt);
          await addRecord('doc', { ...updatedData, docId, date: updatedData.dc_date || today() });
        }
        if (onSuccess) onSuccess();
        else onClose();
      }`
);
fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);


// 2. Fix Documents.jsx ID format
let documents = fs.readFileSync('src/pages/Documents.jsx', 'utf8');
documents = documents.replace(`getNextCounter('DOC')`, `getNextCounter('doc')`);
fs.writeFileSync('src/pages/Documents.jsx', documents);

console.log('Fixed double saving and ID format');
