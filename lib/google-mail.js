import { google } from 'googleapis';
import { appBaseUrl, getSetting, setSetting } from './settings';

export async function getGoogleConfig() {
  const setting = await getSetting('google_config');
  if (!setting?.value) {
    if (process.env.GOOGLE_CLIENT_ID) {
      return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri:
          process.env.GOOGLE_REDIRECT_URI || `${appBaseUrl()}/api/admin/google/callback`,
      };
    }
    return null;
  }
  try {
    return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
  } catch (e) {
    console.error('[Google] Error parsing config:', e);
    return null;
  }
}

export async function getOauth2Client() {
  const config = await getGoogleConfig();
  if (!config) return null;
  return new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
}

export async function getGoogleTokens() {
  const setting = await getSetting('google_integration');
  if (!setting?.value) return null;
  try {
    return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
  } catch (e) {
    console.error('[Google] Error parsing token data:', e);
    return null;
  }
}

export async function saveGoogleTokens(tokens) {
  if (!tokens.refresh_token) {
    const existing = await getGoogleTokens();
    if (existing?.refresh_token) tokens.refresh_token = existing.refresh_token;
  }
  await setSetting('google_integration', JSON.stringify(tokens));
}

export async function getValidGoogleAccessToken() {
  const tokens = await getGoogleTokens();
  if (!tokens?.refresh_token) return null;

  const client = await getOauth2Client();
  if (!client) return null;

  client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  const isExpired = tokens.expiry_date
    ? tokens.expiry_date <= Date.now() + 5 * 60 * 1000
    : true;
  if (!isExpired) return tokens.access_token;

  try {
    const { credentials } = await client.refreshAccessToken();
    if (credentials) {
      const newTokens = {
        access_token: credentials.access_token || '',
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date || null,
        email: tokens.email,
      };
      await saveGoogleTokens(newTokens);
      return credentials.access_token || null;
    }
  } catch (error) {
    console.error('[Google] Error refreshing token:', error);
  }
  return null;
}

export async function sendGmail({ to, subject, htmlBody, attachments }) {
  const tokens = await getGoogleTokens();
  const accessToken = await getValidGoogleAccessToken();
  if (!accessToken) {
    throw new Error('Google account not connected or could not refresh token.');
  }

  const client = await getOauth2Client();
  if (!client) throw new Error('Google configuration missing');

  client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: client });

  const boundary = `----=_Part_${Date.now()}`;
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  let message = [
    `From: Svelte by LuKaria <${tokens?.email || ''}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
  ];

  if (attachments?.length) {
    for (const att of attachments) {
      message = message.concat([
        `--${boundary}`,
        `Content-Type: ${att.contentType}; name="${att.name}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.name}"`,
        '',
        att.content,
        '',
      ]);
    }
  }

  message.push(`--${boundary}--`);
  const encodedMessage = Buffer.from(message.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
  return { success: true };
}
