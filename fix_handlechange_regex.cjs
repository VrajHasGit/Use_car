const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(/const handleChange = \(e\) => \{[\s\S]*?setFormData\(\{ \.\.\.formData, \[e\.target\.name\]: val \}\);\s*\};/,
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

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Fixed handleChange with regex!');
