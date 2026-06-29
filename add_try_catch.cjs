const fs = require('fs');
let docModal = fs.readFileSync('src/components/modals/DocModal.jsx', 'utf8');

docModal = docModal.replace(
  `return (\n      <div className="overlay" id="m_doc">`,
  `try {\n    return (\n      <div className="overlay" id="m_doc">`
);

// We need to find the end of the return statement.
// Since the file ends with:
//   );
// };
// We can replace the last `);` with `); } catch (err) { return <div style={{zIndex:9999,position:'fixed',top:0,left:0,background:'red',color:'white',padding:'20px',fontSize:'16px',width:'100%',height:'100%'}}><h1>DocModal Render Error</h1><pre>{err.stack}</pre></div>; }`

docModal = docModal.replace(
  `  );\n};`,
  `  );\n  } catch (err) {\n    return <div style={{zIndex:9999,position:'fixed',top:0,left:0,background:'red',color:'white',padding:'20px',fontSize:'16px',width:'100%',height:'100%'}}><h1>DocModal Render Error</h1><pre>{err.stack}</pre></div>;\n  }\n};`
);

fs.writeFileSync('src/components/modals/DocModal.jsx', docModal);
console.log('Added try-catch to DocModal!');
