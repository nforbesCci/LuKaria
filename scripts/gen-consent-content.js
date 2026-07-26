const fs = require('fs');
const src = fs.readFileSync('app/consent-forms/page.js', 'utf8');
const start = src.indexOf('const allForms = [');
const end = src.indexOf('];', start);
const block = src.slice(start, end + 2);

const forms = [];
const re = /id: '([^']+)'[\s\S]*?content: `([\s\S]*?)`/g;
let m;
while ((m = re.exec(block))) {
  forms.push({ id: m[1], content: m[2] });
}

const map = {
  photographConsent: 'PHOTOGRAPH',
  mounjaroConsent: 'MOUNJARO',
  semaglutideConsent: 'SEMAGLUTIDE',
  retatrutideConsent: 'RETATRUTIDE',
  telemedicineConsent: 'TELEHEALTH',
};

let out = 'package com.lukariagroup.app.data.consent\n\n';
out += 'import com.lukariagroup.app.data.models.ConsentType\n\n';
out += '/** Full consent copy mirrored from the web consent-forms page. */\n';
out += 'object ConsentFormContent {\n';
out += '    fun textFor(type: ConsentType): String = when (type) {\n';

for (const f of forms) {
  const key = map[f.id];
  if (!key) continue;
  const body = f.content.trim().replace(/\$/g, "${'$'}");
  out += `        ConsentType.${key} -> """\n`;
  out += `${body}\n`;
  out += '        """.trimIndent()\n\n';
}

out += '    }\n}\n';

const dest =
  'mobile/composeApp/src/commonMain/kotlin/com/lukariagroup/app/data/consent/ConsentFormContent.kt';
fs.mkdirSync(require('path').dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('wrote', forms.length, 'forms ->', dest);
