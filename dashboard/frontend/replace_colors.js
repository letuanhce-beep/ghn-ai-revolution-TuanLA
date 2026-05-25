const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) {
      let content = fs.readFileSync(p, 'utf8');
      const original = content;
      content = content.replace(/#F26522/ig, '#FF5200');
      content = content.replace(/#003366/ig, '#006FAD');
      content = content.replace(/#2563EB/ig, '#006FAD');
      if (content !== original) {
        fs.writeFileSync(p, content);
        console.log('Updated', p);
      }
    }
  });
}
walk('.');
