const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(
  /<div className="fg"><label>Missing Documents<\/label><input id="dc_miss" name="dc_miss" value=\{formData\['dc_miss'\] \|\| ''\} onChange=\{handleChange\} placeholder="List missing docs" \/><\/div>\s*/g,
  ''
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed missing documents!');
