const fs = require('fs');

let mainJsx = fs.readFileSync('src/main.jsx', 'utf8');

if (!mainJsx.includes('window.addEventListener("error"')) {
  mainJsx = mainJsx.replace(
    `ReactDOM.createRoot`,
    `window.addEventListener("error", (e) => { alert("Global Error: " + e.message + "\\n" + e.filename + ":" + e.lineno); });\nwindow.addEventListener("unhandledrejection", (e) => { alert("Promise Error: " + e.reason); });\n\nReactDOM.createRoot`
  );
  fs.writeFileSync('src/main.jsx', mainJsx);
  console.log('Injected global error alert');
}
