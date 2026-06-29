const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

// 1. Remove missing documents field
docModal = docModal.replace(
  `<div className="fg"><label>Missing Documents</label><input id="dc_miss" name="dc_miss" value={formData['dc_miss'] || ''} onChange={handleChange} placeholder="List missing docs" /></div>\n    `,
  ``
);

// 2. Make dc_cname and dc_carinfo readOnly
docModal = docModal.replace(
  `<input id="dc_cname" name="dc_cname" value={formData['dc_cname'] || ''} onChange={handleChange} placeholder="Owner / Client Name" />`,
  `<input id="dc_cname" name="dc_cname" value={formData['dc_cname'] || ''} readOnly style={{"background":"var(--surface2)","color":"var(--text2)","cursor":"not-allowed"}} placeholder="Owner / Client Name" />`
);
docModal = docModal.replace(
  `<input id="dc_carinfo" name="dc_carinfo" value={formData['dc_carinfo'] || ''} onChange={handleChange} placeholder="Make Model Year" />`,
  `<input id="dc_carinfo" name="dc_carinfo" value={formData['dc_carinfo'] || ''} readOnly style={{"background":"var(--surface2)","color":"var(--text2)","cursor":"not-allowed"}} placeholder="Make Model Year" />`
);

// 3. Remove regNo from dc_carinfo in useEffects
docModal = docModal.replace(
  `\${match.regNo || match.pi_regn || match.ob_regn || ''}`,
  ``
);
docModal = docModal.replace(
  `\${match.regNo || match.pi_regn || match.ob_regn || ''}`,
  ``
);
docModal = docModal.replace(
  `\${stk.sk_regn || stk.regNo || ''}`,
  ``
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed requested fields!');
