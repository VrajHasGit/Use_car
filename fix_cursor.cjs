const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>`,
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)","cursor":"not-allowed"}} /></div>`
);
docModal = docModal.replace(
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>`,
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)","cursor":"not-allowed"}} /></div>`
);
docModal = docModal.replace(
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)"}} /></div>`,
  `readOnly style={{"background":"var(--surface2)","color":"var(--text2)","cursor":"not-allowed"}} /></div>`
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed cursor!');
