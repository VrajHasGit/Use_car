const fs = require('fs');
let file = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');
file = file.replace(/<input type="checkbox" id="(dc_[a-z0-9]+)" name="\1" value=\{formData\['\1'\] \|\| ''\}/g, '<input type="checkbox" id="$1" name="$1" checked={!!formData[\'$1\']}');
fs.writeFileSync('src/components/modals/DocModal.jsx', file);
console.log('Fixed checkboxes');
