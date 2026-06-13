import fs from 'fs';
import { parse } from 'node-html-parser';

const htmlContent = fs.readFileSync('USED CAR FINAL.html', 'utf8');
const root = parse(htmlContent);

const modals = root.querySelectorAll('.overlay');

if (!fs.existsSync('src/components/modals')) {
  fs.mkdirSync('src/components/modals', { recursive: true });
}

let exportsList = [];

modals.forEach(modal => {
  const id = modal.getAttribute('id');
  if (!id) return;

  // Convert id like m_pur_inq to ComponentName (PurInqModal)
  const nameParts = id.replace('m_', '').split('_');
  const componentName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Modal';
  
  // Clean up HTML to JSX
  let jsx = modal.toString();
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/onclick=/g, 'onClick=');
  jsx = jsx.replace(/onchange=/g, 'onChange=');
  jsx = jsx.replace(/oninput=/g, 'onChange=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
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

  // Remove exact function calls inside onClick/onChange to prevent undefined errors
  jsx = jsx.replace(/onClick="[^"]*"/g, 'onClick={() => {}}');
  jsx = jsx.replace(/onChange="[^"]*"/g, 'onChange={() => {}}');

  const componentCode = `import React from 'react';

export const ${componentName} = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    ${jsx.replace(/className="m-close" onClick=\{\(\) => \{\}\}/g, 'className="m-close" onClick={onClose}')}
  );
};
`;

  fs.writeFileSync(`src/components/modals/${componentName}.jsx`, componentCode);
  exportsList.push(`export { ${componentName} } from './${componentName}';`);
  console.log(`Generated ${componentName}.jsx`);
});

fs.writeFileSync('src/components/modals/index.js', exportsList.join('\n'));
console.log('All modals generated successfully!');
