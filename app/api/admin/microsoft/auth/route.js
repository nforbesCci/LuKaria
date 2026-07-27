import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as msal from '@azure/msal-node';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import { getMicrosoftConfig, getMsalClient } from '../../../../../lib/microsoft-mail';

export const dynamic = 'force-dynamic';

const PKCE_COOKIE = 'ms_oauth_pkce';
const SCOPES = ['https://graph.microsoft.com/Mail.Send', 'offline_access'];

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const pca = await getMsalClient();
    const config = await getMicrosoftConfig();
    if (!pca || !config) {
      return NextResponse.json(
        {
          error:
            'Microsoft integration is not configured. Save Client ID and Secret in Settings first.',
        },
        { status: 400 },
      );
    }

    // PKCE required when Azure redirect URI is SPA (and recommended for Web too)
    const cryptoProvider = new msal.CryptoProvider();
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    const cookieStore = await cookies();
    cookieStore.set(PKCE_COOKIE, verifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    });

    const authUrl = await pca.getAuthCodeUrl({
      scopes: SCOPES,
      redirectUri: config.redirectUri,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
    });

    console.log('[Microsoft Auth] redirectUri=', config.redirectUri);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Microsoft Auth] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL', details: error.message },
      { status: 500 },
    );
  }
}
