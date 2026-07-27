import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import { getSetting, isMaskedSecret, setSetting } from '../../../../../lib/settings';

export const dynamic = 'force-dynamic';

function envMicrosoftSecret() {
  return (
    process.env.MICROSOFT_CLIENT_SECRET ||
    process.env.MS365_CLIENT_SECRET ||
    process.env.AZURE_CLIENT_VALUE ||
    ''
  );
}

function envGoogleSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || '';
}

function looksLikeSecretId(secret) {
  return (
    typeof secret === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(secret.trim())
  );
}

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, config } = await request.json();
    if (!['microsoft', 'google'].includes(type) || !config) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (type === 'microsoft' && (!config.clientId || !config.tenantId)) {
      return NextResponse.json(
        { error: 'Missing required Microsoft configuration fields (clientId, tenantId)' },
        { status: 400 },
      );
    }
    if (type === 'microsoft' && config.clientId === config.tenantId) {
      return NextResponse.json(
        {
          error:
            'Client ID and Tenant ID are the same. Tenant ID is Directory (tenant) ID; Client ID is Application (client) ID.',
        },
        { status: 400 },
      );
    }
    if (type === 'google' && !config.clientId) {
      return NextResponse.json(
        { error: 'Missing required Google configuration fields (clientId)' },
        { status: 400 },
      );
    }

    const key = `${type}_config`;
    const existing = await getSetting(key);
    let oldConfig = null;
    if (existing?.value) {
      try {
        oldConfig =
          typeof existing.value === 'string' ? JSON.parse(existing.value) : existing.value;
      } catch {
        oldConfig = null;
      }
    }

    const incomingSecret = config.clientSecret;
    const envSecret = type === 'microsoft' ? envMicrosoftSecret() : envGoogleSecret();

    // Never persist a masked placeholder or Azure "Secret ID" (GUID)
    if (!incomingSecret || isMaskedSecret(incomingSecret) || looksLikeSecretId(incomingSecret)) {
      const previous =
        oldConfig?.clientSecret &&
        !isMaskedSecret(oldConfig.clientSecret) &&
        !looksLikeSecretId(oldConfig.clientSecret)
          ? oldConfig.clientSecret
          : envSecret;

      if (!previous) {
        return NextResponse.json(
          {
            error:
              'Client secret is required. Paste the secret Value from Azure (not the Secret ID), or set it in .env.local.',
          },
          { status: 400 },
        );
      }
      if (looksLikeSecretId(incomingSecret)) {
        return NextResponse.json(
          {
            error:
              'That looks like a Secret ID (GUID). In Azure, open the client secret and copy the Value column, not the ID.',
          },
          { status: 400 },
        );
      }
      config.clientSecret = previous;
    }

    await setSetting(key, JSON.stringify(config));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Settings Config] POST error:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
