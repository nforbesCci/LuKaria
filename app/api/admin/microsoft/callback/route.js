import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getMicrosoftConfig,
  getMsalClient,
  saveMicrosoftTokens,
} from '../../../../../lib/microsoft-mail';

export const dynamic = 'force-dynamic';

const PKCE_COOKIE = 'ms_oauth_pkce';
const SCOPES = ['https://graph.microsoft.com/Mail.Send', 'offline_access'];

function settingsRedirect(request, params) {
  const dest = new URL('/admin/settings', request.url);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') dest.searchParams.set(key, String(value));
  });
  return NextResponse.redirect(dest);
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  const pca = await getMsalClient();
  const config = await getMicrosoftConfig();
  if (!pca || !config) {
    return NextResponse.json({ error: 'Microsoft configuration missing' }, { status: 400 });
  }

  if (error) {
    console.error('[Microsoft Callback] OAuth error:', error, errorDescription);
    return settingsRedirect(request, {
      error: 'microsoft_auth_error',
      details: errorDescription || error,
    });
  }
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(PKCE_COOKIE)?.value;
  cookieStore.delete(PKCE_COOKIE);

  try {
    if (!codeVerifier) {
      return settingsRedirect(request, {
        error: 'token_exchange_failed',
        details:
          'Missing PKCE verifier cookie. Try Authorize again from the same browser (HTTPS).',
      });
    }

    const response = await pca.acquireTokenByCode({
      code,
      scopes: SCOPES,
      redirectUri: config.redirectUri,
      codeVerifier,
    });

    if (response) {
      await saveMicrosoftTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '',
        expiresOn: response.expiresOn || new Date(Date.now() + 3600 * 1000),
        account: {
          homeAccountId: response.account?.homeAccountId || '',
          environment: response.account?.environment || '',
          tenantId: response.account?.tenantId || '',
          username: response.account?.username || '',
        },
      });
      return settingsRedirect(request, { success: 'microsoft_connected' });
    }
    return settingsRedirect(request, { error: 'no_response' });
  } catch (err) {
    console.error('[Microsoft Callback] Error:', err);
    const details =
      err?.errorMessage ||
      err?.message ||
      err?.errorCode ||
      'token_exchange_failed';
    return settingsRedirect(request, {
      error: 'token_exchange_failed',
      details,
    });
  }
}
