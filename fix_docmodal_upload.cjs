const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/modals/DocModal.jsx');
let code = fs.readFileSync(file, 'utf8');

// Replace DocUploadRow component completely
const docUploadRowRegex = /const DocUploadRow = \(\{.*?};/s;
const newDocUploadRow = `const DocUploadRow = ({ docKey, label, subLabel, formData, setFormData }) => {
  const [uploadProgress, setUploadProgress] = useState(null);
  
  const dcuKey = \`dcu_\${docKey}\`;
  const dcKey = \`dc_\${docKey}\`;
  
  const hasRemoteFile = typeof formData[dcuKey] === 'string' && formData[dcuKey].length > 5;
  const isUploading = uploadProgress !== null;
  const hasFile = hasRemoteFile;
  
  const handleRemove = () => {
    if (hasRemoteFile) {
      setFormData(prev => ({ ...prev, [dcuKey]: '', [dcKey]: false }));
    }
    const input = document.getElementById(dcuKey);
    if (input) input.value = '';
  };

  const handlePreview = () => {
    if (hasRemoteFile) {
      window.open(formData[dcuKey], '_blank');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress(0);
    
    try {
       let fileToUpload = file;
       if (file.type.startsWith('image/')) {
         const processed = await processFile(file);
         const response = await fetch(processed.url);
         fileToUpload = await response.blob();
         fileToUpload.name = processed.name || file.name;
         fileToUpload.type = processed.type || file.type;
       }
       
       const urlData = await uploadFileToStorage(fileToUpload, \`documents/\${Date.now()}_\${file.name}\`, (progress) => {
         setUploadProgress(Math.round(progress));
       });
       
       setFormData(prev => ({
          ...prev,
          [dcuKey]: urlData.url || urlData,
          [dcKey]: true
       }));
    } catch (err) {
       console.error("Upload failed", err);
       alert("Upload failed.");
    }
    
    setUploadProgress(null);
    e.target.value = '';
  };
  
  const handleChangeCheck = (e) => {
     setFormData(prev => ({ ...prev, [dcKey]: e.target.checked }));
  };

  return (
    <div style={{background:"var(--bg)",border:"1px solid var(--border2)",borderRadius:"var(--radius-sm)",padding:"10px 12px",display:"flex",alignItems:"center",gap:"10px",position:"relative",overflow:"hidden"}}>
      {isUploading && (
        <div style={{position:"absolute",left:0,bottom:0,height:"3px",background:"var(--or1)",width:\`\${uploadProgress}%\`,transition:"width 0.2s"}} />
      )}
      <input type="checkbox" id={dcKey} name={dcKey} checked={!!formData[dcKey]} onChange={handleChangeCheck} style={{width:"16px",height:"16px",accentColor:"var(--or1)",flexShrink:"0"}}  />
      <div style={{flex:"1",minWidth:"0"}}>
        <div style={{fontSize:"12px",fontWeight:"600",color:"var(--text)"}}>
          {label} {subLabel && <span style={{fontSize:"10px",color:"var(--text3)"}}>{subLabel}</span>}
        </div>
        <div id={\`\${dcKey}_fname\`} style={{fontSize:"10px",color:"var(--text3)",marginTop:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {isUploading ? \`Uploading... \${uploadProgress}%\` : (hasRemoteFile ? 'File Uploaded' : 'No file uploaded')}
        </div>
      </div>
      
      {!hasFile && !isUploading ? (
         <button type="button" onClick={() => document.getElementById(dcuKey).click()} style={{background:"rgba(59,130,246,.15)",border:"1px solid rgba(59,130,246,.3)",color:"var(--bl5)",borderRadius:"5px",padding:"4px 9px",fontSize:"10px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:"0"}} id={\`\${dcKey}_btn\`}>📎 Upload</button>
      ) : isUploading ? (
         <div style={{fontSize:"10px",fontWeight:"600",color:"var(--or1)"}}>{uploadProgress}%</div>
      ) : (
         <div style={{display:"flex", gap:"5px"}}>
           <button type="button" onClick={handlePreview} style={{background:"var(--surface2)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:"5px",padding:"4px 9px",fontSize:"10px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:"0"}} title="Preview">👁</button>
           <button type="button" onClick={() => document.getElementById(dcuKey).click()} style={{background:"rgba(59,130,246,.15)",border:"1px solid rgba(59,130,246,.3)",color:"var(--bl5)",borderRadius:"5px",padding:"4px 9px",fontSize:"10px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:"0"}} title="Re-upload">🔄</button>
           <button type="button" onClick={handleRemove} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.3)",color:"var(--rd5)",borderRadius:"5px",padding:"4px 9px",fontSize:"10px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:"0"}} title="Remove">✖</button>
         </div>
      )}
      <input type="file" id={dcuKey} name={dcuKey} onChange={handleFileChange} accept="image/*,application/pdf" style={{display:"none"}}  />
    </div>
  );
};`;

code = code.replace(docUploadRowRegex, newDocUploadRow);

// Remove filesToUpload state from DocModal
code = code.replace(/const \[filesToUpload, setFilesToUpload\] = useState\(\{.*?\}\);\n/, '');
// Remove uploadProgress state from DocModal
code = code.replace(/const \[uploadProgress, setUploadProgress\] = useState\(''\);\n/, '');

// Fix handleChange in DocModal to remove file handling since it's obsolete
code = code.replace(`  const handleChange = (e) => {
    if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setFilesToUpload({ ...filesToUpload, [e.target.name]: file });
      }
    } else {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData({ ...formData, [e.target.name]: val });
    }
  };`, `  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };`);

// Replace handleSave
const handleSaveStart = code.indexOf('const handleSave = async () => {');
const handleSaveEnd = code.indexOf('catch (error) {', handleSaveStart) + 120; // skip catch block
const handleSaveActualEnd = code.indexOf('};', handleSaveEnd) + 2;

const newHandleSave = `  const handleSave = async () => {
    setUploading(true);
    try {
      let updatedData = { ...formData };
      
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

code = code.substring(0, handleSaveStart) + newHandleSave + code.substring(handleSaveActualEnd);

// Fix the .map invocation in the JSX where it passes filesToUpload etc.
code = code.replace(/filesToUpload={filesToUpload} setFilesToUpload={setFilesToUpload} handleChange={handleChange} \/>/g, 'setFormData={setFormData} />');

// Fix the Save Button text since uploadProgress is removed
code = code.replace(`{uploading ? (uploadProgress || 'Saving...') : 'Save Documents'}`, `{uploading ? 'Saving...' : 'Save Documents'}`);

fs.writeFileSync(file, code);
console.log("DocModal updated");
