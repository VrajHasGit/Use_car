const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(
  `if (!isOpen) return null;`,
  `  const fileKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];\n  const docsChecked = fileKeys.filter(k => formData[\`dc_\${k}\`]).length;\n  const filesUploaded = fileKeys.filter(k => filesToUpload[\`dcu_\${k}\`] || formData[\`dcu_\${k}\`]).length;\n\n  if (!isOpen) return null;`
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed variables missing!');
