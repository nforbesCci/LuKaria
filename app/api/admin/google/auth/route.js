import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import { getOauth2Client } from '../../../../../lib/google-mail';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const client = await getOauth2Client();
    if (!client) {
      return NextResponse.json(
        { error: 'Google integration is not configured. Save Client ID and Secret in Settings first.' },
        { status: 400 },
      );
    }

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Google Auth] Error:', error);
    return NextResponse.json({ error: 'Failed to generate authorization URL' }, { status: 500 });
  }
}
