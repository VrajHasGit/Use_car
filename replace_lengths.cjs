const fs = require('fs');
const path = require('path');
const dir = 'd:/Project/Carecay Used Car/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;
  
  if (content.includes('{records.length}</span>')) {
    content = content.replace(/\{records\.length\}<\/span>/g, '{filtered.length}</span>');
    changed = true;
  }
  if (content.includes('{inquiries.length}</span>')) {
    content = content.replace(/\{inquiries\.length\}<\/span>/g, '{filtered.length}</span>');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Updated ' + f);
  }
});
