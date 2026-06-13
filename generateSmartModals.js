import fs from 'fs';
import { parse } from 'node-html-parser';

const htmlContent = fs.readFileSync('USED CAR FINAL.html', 'utf8');
const root = parse(htmlContent);

const modals = root.querySelectorAll('.overlay');

if (!fs.existsSync('src/components/modals')) {
  fs.mkdirSync('src/components/modals', { recursive: true });
}

let exportsList = [];

// Mapping from modal ID to Firestore collection name based on original JS
const collectionMap = {
  'm_pur_inq': 'pur_inq',
  'm_val': 'val',
  'm_pfu': 'pfu',
  'm_pcl': 'pcl',
  'm_ob': 'ob',
  'm_sal_inq': 'sal_inq',
  'm_sfu': 'sfu',
  'm_scl': 'scl',
  'm_sob': 'sob',
  'm_stk': 'stk',
  'm_ws': 'ws',
  'm_pay': 'pay',
  'm_del': 'del',
  'm_dn': 'dn',
  'm_gp': 'gp',
  'm_fin': 'fin',
  'm_exp': 'exp',
  'm_gst': 'gst',
  'm_tgt': 'tgt'
};

modals.forEach(modal => {
  const id = modal.getAttribute('id');
  if (!id) return;

  const collectionName = collectionMap[id] || id.replace('m_', '');
  const nameParts = id.replace('m_', '').split('_');
  const componentName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Modal';
  
  // Extract all input IDs to create state
  const inputs = modal.querySelectorAll('input, select, textarea');
  const fieldNames = [];
  inputs.forEach(inp => {
    const inpId = inp.getAttribute('id');
    if (inpId && !['v_photos', 'v_video', 'ex_bill_inp', 'logoFileInp'].includes(inpId)) {
      fieldNames.push(inpId);
    }
  });

  const stateInitial = fieldNames.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});

  // Convert HTML to JSX
  let jsx = modal.toString();
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  
  // Replace style strings with objects
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    const styleObj = p1.split(';').filter(s => s.trim()).reduce((acc, s) => {
      let [key, val] = s.split(':');
      if(key && val) {
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        acc[key] = val.trim();
      }
      return acc;
    }, {});
    return `style={${JSON.stringify(styleObj)}}`;
  });
  
  // Fix self-closing tags
  jsx = jsx.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
  jsx = jsx.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
  jsx = jsx.replace(/<br([^>]*?[^\/])>/g, '<br$1 />');

  // Strip native DOM handlers
  jsx = jsx.replace(/onclick="[^"]*"/gi, '');
  jsx = jsx.replace(/onchange="[^"]*"/gi, '');
  jsx = jsx.replace(/oninput="[^"]*"/gi, '');
  jsx = jsx.replace(/ondragover="[^"]*"/gi, '');
  jsx = jsx.replace(/ondragleave="[^"]*"/gi, '');
  jsx = jsx.replace(/ondrop="[^"]*"/gi, '');
  jsx = jsx.replace(/readonly/g, 'readOnly');
  jsx = jsx.replace(/maxlength/g, 'maxLength');

  // Add close handler to close button
  jsx = jsx.replace(/className="m-close"/g, 'className="m-close" onClick={onClose}');

  // Bind inputs to state
  fieldNames.forEach(field => {
    const regex = new RegExp(`id="${field}"`, 'g');
    jsx = jsx.replace(regex, `id="${field}" name="${field}" value={formData['${field}'] || ''} onChange={handleChange}`);
  });

  // Bind Save button
  jsx = jsx.replace(/className="btn btn-or"/g, `className="btn btn-or" onClick={handleSave}`);
  
  // Add Cancel handler
  jsx = jsx.replace(/>Cancel<\/button>/g, ` onClick={onClose}>Cancel</button>`);

  const componentCode = `import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const ${componentName} = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(${JSON.stringify(stateInitial, null, 2)});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, '${collectionName}'), { ...formData, createdAt: new Date().toISOString() });
      alert('Record saved successfully!');
      onClose();
    } catch (error) {
      console.error("Error saving record: ", error);
      alert('Failed to save record.');
    }
  };

  return (
    ${jsx}
  );
};
`;

  fs.writeFileSync(`src/components/modals/${componentName}.jsx`, componentCode);
  exportsList.push(`export { ${componentName} } from './${componentName}';`);
  console.log(`Generated Smart ${componentName}.jsx`);
});

fs.writeFileSync('src/components/modals/index.js', exportsList.join('\n'));
console.log('All Smart Modals generated successfully!');
