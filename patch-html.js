const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
html = html.replace(/app\.js(\?v=\d+)?/g, "app.js?v=" + Date.now());
fs.writeFileSync('public/index.html', html);
