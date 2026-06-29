const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

// 1. Add uploadFileToStorage to the imports
docModal = docModal.replace(
  `import { addRecord, updateRecord, getNextCounter } from '../../services/db';`,
  `import { addRecord, updateRecord, getNextCounter, uploadFileToStorage } from '../../services/db';`
);

// 1.b. Re-add filesToUpload and uploading state
docModal = docModal.replace(
  `const [formData, setFormData] = useState({`,
  `const [filesToUpload, setFilesToUpload] = useState({});\n  const [uploading, setUploading] = useState(false);\n  const [formData, setFormData] = useState({`
);

// 2. Replace handleChange entirely
docModal = docModal.replace(
  `const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };`,
  `const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setFilesToUpload({ ...filesToUpload, [e.target.name]: file });
      }
    } else {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData({ ...formData, [e.target.name]: val });
    }
  };`
);

// 3. Replace handleSave completely
const oldHandleSave = `  const handleSave = async () => {
    try {
      if (editData && editData.id) {
        await updateRecord('doc', editData.id, formData);
      } else {
        const cnt = await getNextCounter('doc');
        const docId = genId('DOC', cnt);
        await addRecord('doc', { ...formData, docId, date: formData.dc_date || today() });
      }
      if (onSave) { await onSave(formData); } else if (onSuccess) { onSuccess(); } else { onClose(); }
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };`;

const newHandleSave = `  const handleSave = async () => {
    setUploading(true);
    try {
      let updatedData = { ...formData };
      const keys = Object.keys(filesToUpload);
      for (const k of keys) {
        const file = filesToUpload[k];
        if (file) {
           const url = await uploadFileToStorage(file, \`documents/\${Date.now()}_\${file.name}\`);
           updatedData[k] = url;
        }
      }
      
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

docModal = docModal.replace(oldHandleSave, newHandleSave);


// 4. UI Fixes - grid4 and Car Details
docModal = docModal.replace(
  `<div className="grid3">
    <div className="fg"><label>Inquiry / Booking ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label>`,
  `<div className="grid4">
    <div className="fg"><label>Doc ID</label><input value={formData.docId || (editData && editData.id ? editData.id.slice(0,12) : 'Auto-generated')} readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>
    <div className="fg"><label>Inquiry / Booking ID <span style={{"color":"var(--or1)","fontSize":"10px"}}>⚡ Auto-Fill</span></label>`
);

docModal = docModal.replace(
  `value={formData['dc_carinfo'] || ''} onChange={handleChange}`,
  `value={(formData['dc_carinfo'] || '').replace(new RegExp(' ?' + (formData['dc_regn'] || 'MISSING_REG'), 'i'), '')} onChange={handleChange}`
);

// 5. Update the upload buttons to become Remove/Upload toggles
const checkboxKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];

checkboxKeys.forEach(k => {
  const uploadRegex = new RegExp(`<button style=\\{\\{([^\\}]+)\\}\\}(.*?)id="dc_${k}_btn"\\s*onClick=\\{\\(e\\) => \\{ e\\.preventDefault\\(\\); document\\.getElementById\\('dcu_${k}'\\)\\.click\\(\\); \\}\\}>📎 Upload</button>`);
  docModal = docModal.replace(uploadRegex, (match, style, rest) => {
    return `<button style={{${style}, "color": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "var(--error)" : "var(--bl5)", "background": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "rgba(239,68,68,.1)" : "rgba(59,130,246,.15)", "borderColor": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "rgba(239,68,68,.3)" : "rgba(59,130,246,.3)"}} ${rest}id="dc_${k}_btn" onClick={(e) => { e.preventDefault(); if (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) { const nf = {...filesToUpload}; delete nf['dcu_${k}']; setFilesToUpload(nf); setFormData({...formData, dcu_${k}: '', dc_${k}: false}); document.getElementById('dcu_${k}').value = ''; } else { document.getElementById('dcu_${k}').click(); } }}>{filesToUpload['dcu_${k}'] || formData['dcu_${k}'] ? '🗑 Remove' : '📎 Upload'}</button>`;
  });
});

// 6. Update the footer save button
const oldFooter = `   <button className="btn btn-or" onClick={handleSave}>
     <i className="fa fa-save"></i> Save Documents
   </button>`;

const newFooter = `   <button className="btn btn-or" onClick={handleSave} disabled={uploading}>
     {uploading ? (
       <><i className="fa fa-spinner fa-spin"></i> Uploading & Saving...</>
     ) : (
       <><i className="fa fa-save"></i> Save Documents</>
     )}
   </button>`;

docModal = docModal.replace(oldFooter, newFooter);

// 7. Remove value property from file inputs
checkboxKeys.forEach(k => {
  docModal = docModal.replace(new RegExp(`value=\\{formData\\['dcu_${k}'\\] \\|\\| ''\\} `), '');
});

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed ALL DocModal logic');
