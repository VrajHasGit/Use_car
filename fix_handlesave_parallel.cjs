const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

const newHandleSave = `  const handleSave = async () => {
    setUploading(true);
    try {
      let updatedData = { ...formData };
      const keys = Object.keys(filesToUpload || {});
      const uploadPromises = keys.map(async (k) => {
        const file = filesToUpload[k];
        if (file) {
           const url = await uploadFileToStorage(file, \`documents/\${Date.now()}_\${file.name}\`);
           updatedData[k] = url.url || url;
        }
      });
      await Promise.all(uploadPromises);
      
      const checkboxKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];
      checkboxKeys.forEach(k => {
         if (updatedData[\`dcu_\${k}\`]) {
            updatedData[\`dc_\${k}\`] = true;
         }
      });
      
      if (!updatedData.docId && (!editData || !editData.docId)) {
        const cnt = await getNextCounter('doc');
        updatedData.docId = genId('DOC', cnt);
      } else if (editData && editData.docId) {
        updatedData.docId = editData.docId;
      }

      setUploading(false);
      if (onSave) {
        await onSave(updatedData);
      } else {
        if (editData && editData.id) {
          await updateRecord('doc', editData.id, updatedData);
        } else {
          await addRecord('doc', { ...updatedData, date: updatedData.dc_date || today() });
        }
        if (onSuccess) onSuccess();
        else onClose();
      }
    } catch (error) {
      setUploading(false);
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };`;

docModal = docModal.replace(/const handleSave = async \(\) => \{[\s\S]*?alert\('Failed to save record\.'\);\s*\}\s*\};/m, newHandleSave);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed handleSave!');
