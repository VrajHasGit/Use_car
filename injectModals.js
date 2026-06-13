import fs from 'fs';
import path from 'path';

const pagesDir = path.join('src', 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

const modalMap = {
  'PurchaseInquiry.jsx': 'PurInqModal',
  'Valuation.jsx': 'ValModal',
  'PurchaseFollowUp.jsx': 'PfuModal',
  'PurchaseCloser.jsx': 'PclModal',
  'PurchaseBooking.jsx': 'ObModal',
  'SalesInquiry.jsx': 'SalInqModal',
  'SalesFollowUp.jsx': 'SfuModal',
  'SalesCloser.jsx': 'SclModal',
  'SalesBooking.jsx': 'SobModal',
  'Stock.jsx': 'StkModal',
  'Workshop.jsx': 'WsModal',
  'Payment.jsx': 'PayModal',
  'Delivery.jsx': 'DelModal',
  'DeliveryNote.jsx': 'DnModal',
  'GatePass.jsx': 'GpModal'
};

pages.forEach(page => {
  if (modalMap[page]) {
    const modalName = modalMap[page];
    let content = fs.readFileSync(path.join(pagesDir, page), 'utf8');

    if (!content.includes(modalName)) {
      // 1. Add import
      content = content.replace("import { db }", `import { ${modalName} } from '../components/modals/${modalName}';\nimport { db }`);

      // 2. Add state
      content = content.replace("useEffect(() => {", `const [isModalOpen, setIsModalOpen] = useState(false);\n\n  useEffect(() => {`);

      // 3. Update button
      content = content.replace(/<button className="btn btn-or">/g, `<button className="btn btn-or" onClick={() => setIsModalOpen(true)}>`);

      // 4. Inject component before last </div>
      content = content.replace(/<\/div>\s*<div className="tc">/g, `</div>\n      <${modalName} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />\n      <div className="tc">`);

      fs.writeFileSync(path.join(pagesDir, page), content);
      console.log(`Injected ${modalName} into ${page}`);
    }
  }
});
console.log('All modals injected successfully!');
