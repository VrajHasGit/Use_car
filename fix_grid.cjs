const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(
  /<div className="grid3">\s*<div className="fg"><label>Verified By/g,
  '<div className="grid2">\n    <div className="fg"><label>Verified By'
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed grid layout!');
