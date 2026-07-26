const fs = require('fs');
const path = require('path');

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name === 'route.js' && !p.includes(`${path.sep}auth${path.sep}`)) a.push(p);
  }
  return a;
}

const root = path.join('c:', 'Git', 'Lukaria');
const files = walk(path.join(root, 'app', 'api'));
let n = 0;

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('getSession')) continue;
  if (c.includes('getApiSession') && !c.includes("from '@auth0/nextjs-auth0'") && !c.match(/getSession\s*\(/)) {
    continue;
  }
  // Still has getSession calls
  if (!c.match(/getSession\s*\(/)) continue;

  const dir = path.dirname(f);
  let importPath = path.relative(dir, path.join(root, 'lib', 'api-auth')).replace(/\\/g, '/');
  if (!importPath.startsWith('.')) importPath = './' + importPath;

  if (/import\s*\{([^}]+)\}\s*from\s*'@auth0\/nextjs-auth0'/.test(c)) {
    c = c.replace(/import\s*\{([^}]+)\}\s*from\s*'@auth0\/nextjs-auth0'\s*;?/, (m, imps) => {
      const others = imps
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && s !== 'getSession');
      const lines = [];
      if (others.length) {
        lines.push(`import { ${others.join(', ')} } from '@auth0/nextjs-auth0';`);
      }
      if (!c.includes('api-auth')) {
        lines.push(`import { getApiSession } from '${importPath}';`);
      }
      return lines.join('\n');
    });
  } else if (!c.includes('api-auth')) {
    c = `import { getApiSession } from '${importPath}';\n` + c;
  }

  c = c.replace(/await getSession\(request\)/g, 'await getApiSession(request)');
  c = c.replace(/await getSession\(\)/g, 'await getApiSession(request)');

  fs.writeFileSync(f, c);
  n++;
  console.log('fixed', path.relative(root, f));
}

console.log('done', n);
