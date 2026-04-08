const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'locales', 'en', 'translation.json'), 'utf8'));

function flat(obj, p = '') {
  let r = [];
  for (const [k, v] of Object.entries(obj)) {
    const f = p ? p + '.' + k : k;
    if (typeof v === 'object' && v) r.push(...flat(v, f));
    else r.push(f);
  }
  return r;
}

const enKeys = new Set(flat(en));

function findFiles(dir, exts) {
  let r = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) r.push(...findFiles(f, exts));
    else if (exts.some(x => e.name.endsWith(x))) r.push(f);
  }
  return r;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = findFiles(srcDir, ['.js', '.jsx']);

// Regex: match t('key' or t("key" not preceded by word char (to exclude .set() etc)
const re = /(?<!\w)t\(\s*['"]([^'"]+)['"]/g;

const keyData = new Map();
for (const fp of files) {
  const c = fs.readFileSync(fp, 'utf8');
  const rp = path.relative(path.join(__dirname, '..'), fp).replace(/\\/g, '/');
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(c)) !== null) {
    const k = m[1];
    if (!keyData.has(k)) keyData.set(k, { files: new Set(), fallback: '' });
    keyData.get(k).files.add(rp);
  }
}

// Extract string fallbacks separately
const reFb = /(?<!\w)t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]/g;
for (const fp of files) {
  const c = fs.readFileSync(fp, 'utf8');
  let m;
  reFb.lastIndex = 0;
  while ((m = reFb.exec(c)) !== null) {
    const k = m[1], fb = m[2];
    if (keyData.has(k) && fb) keyData.get(k).fallback = fb;
  }
}

const skip = [/^\//, /^\./, /^:$/, /^T$/];
const missing = [];
for (const [k, d] of keyData) {
  if (skip.some(p => p.test(k))) continue;
  if (!enKeys.has(k)) missing.push({ key: k, files: [...d.files], fallback: d.fallback });
}
missing.sort((a, b) => a.key.localeCompare(b.key));

fs.writeFileSync(path.join(__dirname, 'missing-keys-report.json'), JSON.stringify(missing, null, 2));
console.log('Total EN keys: ' + enKeys.size);
console.log('Total unique keys in code: ' + keyData.size);
console.log('Missing keys: ' + missing.length);
console.log('');

const groups = {};
for (const item of missing) {
  const prefix = item.key.includes('.') ? item.key.split('.').slice(0, -1).join('.') : '(top-level)';
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(item);
}

for (const [group, items] of Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`--- ${group} (${items.length} keys) ---`);
  for (const { key, files, fallback } of items) {
    console.log(`  KEY: ${key}`);
    if (fallback) console.log(`    FALLBACK: "${fallback}"`);
    for (const f of files) console.log(`    FILE: ${f}`);
  }
  console.log('');
}
