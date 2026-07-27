import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { appBaseUrl, getSetting, setSetting } from './settings';

export async function getMicrosoftConfig() {
  const defaultRedirect =
    process.env.MICROSOFT_REDIRECT_URI || `${appBaseUrl()}/api/admin/microsoft/callback`;

  const setting = await getSetting('microsoft_config');
  if (!setting?.value) {
    if (process.env.MICROSOFT_CLIENT_ID || process.env.MS365_CLIENT_ID) {
      return {
        clientId: process.env.MICROSOFT_CLIENT_ID || process.env.MS365_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || process.env.MS365_CLIENT_SECRET || '',
        tenantId: process.env.MICROSOFT_TENANT_ID || process.env.MS365_TENANT_ID || 'common',
        redirectUri: defaultRedirect,
      };
    }
    return null;
  }
  try {
    const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
    if (!parsed) return null;
    // Always keep a usable redirect; stale Auth0-domain URIs break authorize
    const redirectUri = normalizeMicrosoftRedirectUri(parsed.redirectUri) || defaultRedirect;
    return { ...parsed, redirectUri };
  } catch (e) {
    console.error('[Microsoft] Error parsing config:', e);
    return null;
  }
}

/** Drop known-bad redirect hosts (Auth0 issuer) so local/prod app URL is used instead. */
export function normalizeMicrosoftRedirectUri(uri) {
  if (!uri || typeof uri !== 'string') return null;
  try {
    const parsed = new URL(uri);
    const issuerHost = process.env.AUTH0_ISSUER_BASE_URL
      ? new URL(process.env.AUTH0_ISSUER_BASE_URL).host
      : null;
    if (issuerHost && parsed.host === issuerHost) {
      return null;
    }
    return uri.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/**
 * MSAL client for delegated mailbox OAuth.
 * Azure app "Svelte" is configured as a confidential Web client (redirect URIs under Web,
 * Allow public client flows = No). Use ConfidentialClientApplication + client secret + PKCE.
 * Set MICROSOFT_PUBLIC_CLIENT=true only if Azure is switched back to public client flows.
 */
export async function getMsalClient() {
  const config = await getMicrosoftConfig();
  if (!config?.clientId) return null;

  const auth = {
    clientId: config.clientId,
    authority: `https://login.microsoftonline.com/${config.tenantId || 'common'}`,
  };

  const usePublic =
    process.env.MICROSOFT_PUBLIC_CLIENT === 'true' || config.publicClient === true;

  if (usePublic) {
    return new msal.PublicClientApplication({ auth });
  }

  if (!config.clientSecret) {
    throw new Error(
      'Microsoft client secret is missing. Save the Azure secret Value in Settings or MS365_CLIENT_SECRET.',
    );
  }

  return new msal.ConfidentialClientApplication({
    auth: {
      ...auth,
      clientSecret: config.clientSecret,
    },
  });
}

export async function getMicrosoftTokens() {
  const setting = await getSetting('microsoft_integration');
  if (!setting?.value) return null;
  try {
    return typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
  } catch (e) {
    console.error('[Microsoft] Error parsing token data:', e);
    return null;
  }
}

export async function saveMicrosoftTokens(tokens) {
  await setSetting('microsoft_integration', JSON.stringify(tokens));
}

export async function getValidAccessToken() {
  const tokens = await getMicrosoftTokens();
  if (!tokens) return null;

  if (new Date(tokens.expiresOn).getTime() > Date.now() + 5 * 60 * 1000) {
    return tokens.accessToken;
  }

  const pca = await getMsalClient();
  if (!pca) return null;

  try {
    const response = await pca.acquireTokenByRefreshToken({
      refreshToken: tokens.refreshToken,
      scopes: ['https://graph.microsoft.com/Mail.Send', 'offline_access'],
    });
    if (response) {
      const newTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || tokens.refreshToken,
        expiresOn: response.expiresOn || new Date(Date.now() + 3600 * 1000),
        account: {
          homeAccountId: response.account?.homeAccountId || tokens.account.homeAccountId,
          environment: response.account?.environment || tokens.account.environment,
          tenantId: response.account?.tenantId || tokens.account.tenantId,
          username: response.account?.username || tokens.account.username,
        },
      };
      await saveMicrosoftTokens(newTokens);
      return newTokens.accessToken;
    }
  } catch (error) {
    console.error('[Microsoft] Error refreshing token:', error);
  }
  return null;
}

export async function sendMicrosoftMail({ to, subject, htmlBody, attachments }) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error('Microsoft account not connected or could not refresh token.');
  }

  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const mail = {
    message: {
      from: { emailAddress: { name: 'Svelte by LuKaria' } },
      subject,
      body: { contentType: 'HTML', content: htmlBody },
      toRecipients: [{ emailAddress: { address: to } }],
      attachments:
        attachments?.map((att) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.name,
          contentType: att.contentType,
          contentBytes: att.content,
        })) || [],
    },
  };

  await client.api('/me/sendMail').post(mail);
  return { success: true };
}
