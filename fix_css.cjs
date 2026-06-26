const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace the fixed px dimensions with em in .car-spinner
css = css.replace(/width: 14px;/g, 'width: 1em;');
css = css.replace(/height: 14px;/g, 'height: 1em;');
css = css.replace(/margin-right: 6px;/g, 'margin-right: 0.4em;');
css = css.replace(/border: 2px solid transparent;/g, 'border: 0.15em solid transparent;');
css = css.replace(/top: 1px; left: 1px; right: 1px; bottom: 1px;/g, 'top: 0; left: 0; right: 0; bottom: 0;');

fs.writeFileSync('src/index.css', css, 'utf8');
