import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
  auth: {
    clientId: process.env.MS365_CLIENT_ID,
    clientSecret: process.env.MS365_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.MS365_TENANT_ID}`,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

async function getAccessToken() {
  const response = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });
  return response.accessToken;
}

export async function uploadLabPdfToSharePoint(pdfBuffer, fileName) {
  const accessToken = await getAccessToken();
  const graphClient = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  try {
    await graphClient
      .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/Lab Requisitions:/children`)
      .get();
  } catch {
    try {
      await graphClient
        .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root/children`)
        .post({
          name: 'Lab Requisitions',
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename',
        });
    } catch {
      // proceed
    }
  }

  try {
    return await graphClient
      .api(
        `/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/Lab Requisitions/${fileName}:/content`
      )
      .put(pdfBuffer);
  } catch {
    return await graphClient
      .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/${fileName}:/content`)
      .put(pdfBuffer);
  }
}

export async function sendLabPdfEmail(pdfBuffer, fileName, userEmail, userName) {
  const accessToken = await getAccessToken();
  const graphClient = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const base64Content = pdfBuffer.toString('base64');
  await graphClient.api(`/users/${process.env.MS365_EMAIL_FROM}/sendMail`).post({
    message: {
      subject: `Lab Requisition - ${userName}`,
      body: {
        contentType: 'HTML',
        content: `<p>Lab requisition for <strong>${userName}</strong> is attached.</p>`,
      },
      toRecipients: [
        {
          emailAddress: {
            address: userEmail,
            name: userName,
          },
        },
      ],
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: fileName,
          contentBytes: base64Content,
          contentType: 'application/pdf',
        },
      ],
    },
    saveToSentItems: true,
  });

  return { success: true };
}

/**
 * Build a minimal single-page PDF with plain text lines (no external PDF deps).
 */
export function buildSimpleTextPdf(title, lines) {
  const escapePdf = (s) =>
    String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const contentLines = [
    'BT',
    '/F1 14 Tf',
    '50 780 Td',
    `(${escapePdf(title)}) Tj`,
    '0 -24 Td',
    '/F1 10 Tf',
  ];

  let yOffset = 0;
  for (const line of lines) {
    contentLines.push(`0 -14 Td`);
    contentLines.push(`(${escapePdf(line)}) Tj`);
    yOffset += 14;
    if (yOffset > 700) break;
  }
  contentLines.push('ET');

  const stream = contentLines.join('\n');
  const objects = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objects.push(
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n'
  );
  objects.push(
    `4 0 obj<< /Length ${Buffer.byteLength(stream, 'utf8')} >>stream\n${stream}\nendstream\nendobj\n`
  );
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}
