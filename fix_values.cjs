const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

const fileKeys = ['rc','ins','puc','pan','adh','f29','f30','f28','f35','noc','gst','svc','inv','key','book'];

fileKeys.forEach(k => {
  const badValueStr = `value={formData['dcu_${k}'] || ''} `;
  docModal = docModal.replace(badValueStr, '');
});

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed file input values!');
