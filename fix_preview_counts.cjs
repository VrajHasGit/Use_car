const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

// 1. Add counts calculation before return
docModal = docModal.replace(
  `return (\n   <div className="modal-overlay">`,
  `  const fileKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];\n  const docsChecked = fileKeys.filter(k => formData[\`dc_\${k}\`]).length;\n  const filesUploaded = fileKeys.filter(k => filesToUpload[\`dcu_\${k}\`] || formData[\`dcu_\${k}\`]).length;\n\n  return (\n   <div className="modal-overlay">`
);

// 2. Replace summary section
docModal = docModal.replace(
  `Files uploaded: <b id="dc_file_count" style={{"color":"var(--success)"}}>0</b> / 15`,
  `Files uploaded: <b id="dc_file_count" style={{"color":"var(--success)"}}>{filesUploaded}</b> / 15`
);
docModal = docModal.replace(
  `Docs checked: <b id="dc_chk_count" style={{"color":"var(--or2)"}}>0</b> / 15`,
  `Docs checked: <b id="dc_chk_count" style={{"color":"var(--or2)"}}>{docsChecked}</b> / 15`
);

// 3. Add Preview button and wrap in flex div
const fileKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];
fileKeys.forEach(k => {
  const btnRegex = new RegExp(`<button style=\\{\\{"background":"rgba\\(59,130,246,\\.15\\)","border":"1px solid rgba\\(59,130,246,\\.3\\)","color":"var\\(--bl5\\)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0", "color": \\(filesToUpload\\['dcu_${k}'\\] \\|\\| formData\\['dcu_${k}'\\]\\) \\? "var\\(--error\\)" : "var\\(--bl5\\)", "background": \\(filesToUpload\\['dcu_${k}'\\] \\|\\| formData\\['dcu_${k}'\\]\\) \\? "rgba\\(239,68,68,\\.1\\)" : "rgba\\(59,130,246,\\.15\\)", "borderColor": \\(filesToUpload\\['dcu_${k}'\\] \\|\\| formData\\['dcu_${k}'\\]\\) \\? "rgba\\(239,68,68,\\.3\\)" : "rgba\\(59,130,246,\\.3\\)"\\}\\} id="dc_${k}_btn" onClick=\\{\\(e\\) => \\{ e\\.preventDefault\\(\\); if \\(filesToUpload\\['dcu_${k}'\\] \\|\\| formData\\['dcu_${k}'\\]\\) \\{ const nf = \\{\\.\\.\\.filesToUpload\\}; delete nf\\['dcu_${k}'\\]; setFilesToUpload\\(nf\\); setFormData\\(\\{\\.\\.\\.formData, dcu_${k}: ''\\}\\); document\\.getElementById\\('dcu_${k}'\\)\\.value = ''; \\} else \\{ document\\.getElementById\\('dcu_${k}'\\)\\.click\\(\\); \\} \\}\\}>\\{filesToUpload\\['dcu_${k}'\\] \\|\\| formData\\['dcu_${k}'\\] \\? '.*?' : '.*?'\\}<\\/button>`);
  
  const newHTML = `<div style={{display:"flex",gap:"5px"}}>
     {(filesToUpload['dcu_${k}'] || formData['dcu_${k}']) && (
       <button onClick={(e) => { e.preventDefault(); const f = filesToUpload['dcu_${k}'] || formData['dcu_${k}']; if (typeof f === 'string') window.open(f, '_blank'); else window.open(URL.createObjectURL(f), '_blank'); }} style={{background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.3)",color:"#10B981",borderRadius:"5px",padding:"4px 9px",fontSize:"10px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:"0"}} title="Preview"><i className="fa fa-eye"></i> Preview</button>
     )}
     <button style={{"background":"rgba(59,130,246,.15)","border":"1px solid rgba(59,130,246,.3)","color":"var(--bl5)","borderRadius":"5px","padding":"4px 9px","fontSize":"10px","fontWeight":"600","cursor":"pointer","whiteSpace":"nowrap","flexShrink":"0", "color": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "var(--error)" : "var(--bl5)", "background": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "rgba(239,68,68,.1)" : "rgba(59,130,246,.15)", "borderColor": (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) ? "rgba(239,68,68,.3)" : "rgba(59,130,246,.3)"}} id="dc_${k}_btn" onClick={(e) => { e.preventDefault(); if (filesToUpload['dcu_${k}'] || formData['dcu_${k}']) { const nf = {...filesToUpload}; delete nf['dcu_${k}']; setFilesToUpload(nf); setFormData({...formData, dcu_${k}: ''}); try { document.getElementById('dcu_${k}').value = ''; } catch(e){} } else { document.getElementById('dcu_${k}').click(); } }}>{filesToUpload['dcu_${k}'] || formData['dcu_${k}'] ? '🗑 Remove' : '📎 Upload'}</button>
     </div>`;
     
  docModal = docModal.replace(btnRegex, newHTML);
});

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed previews and counts!');
