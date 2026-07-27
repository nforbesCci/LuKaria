import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../lib/api-auth';
import {
  getMicrosoftConfig,
  getMicrosoftTokens,
} from '../../../../lib/microsoft-mail';
import { getGoogleConfig, getGoogleTokens } from '../../../../lib/google-mail';
import { appBaseUrl, maskSecret } from '../../../../lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const msTokens = await getMicrosoftTokens();
    const googleTokens = await getGoogleTokens();
    const msConfig = await getMicrosoftConfig();
    const googleConfig = await getGoogleConfig();
    const base = appBaseUrl();

    return NextResponse.json({
      connectUrls: {
        googleAuth: `${base}/api/admin/google/auth`,
        microsoftAuth: `${base}/api/admin/microsoft/auth`,
      },
      microsoft: {
        connected: !!msTokens,
        email: msTokens?.account?.username || null,
        lastUpdated: msTokens?.expiresOn || null,
        config: msConfig
          ? {
              clientId: msConfig.clientId,
              tenantId: msConfig.tenantId,
              clientSecret: maskSecret(msConfig.clientSecret),
              redirectUri: msConfig.redirectUri,
            }
          : null,
      },
      google: {
        connected: !!googleTokens,
        email: googleTokens?.email || null,
        lastUpdated: googleTokens?.expiry_date
          ? new Date(googleTokens.expiry_date).toISOString()
          : null,
        config: googleConfig
          ? {
              clientId: googleConfig.clientId,
              clientSecret: maskSecret(googleConfig.clientSecret),
              redirectUri: googleConfig.redirectUri,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Admin Settings] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings', details: error.message },
      { status: 500 },
    );
  }
}
