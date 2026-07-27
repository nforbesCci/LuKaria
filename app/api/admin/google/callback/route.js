import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOauth2Client, saveGoogleTokens } from '../../../../../lib/google-mail';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const client = await getOauth2Client();
  if (!client) {
    return NextResponse.json({ error: 'Google configuration missing' }, { status: 400 });
  }

  if (error) {
    return NextResponse.redirect(new URL('/admin/settings?error=google_auth_error', request.url));
  }
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const userInfo = await oauth2.userinfo.get();

    await saveGoogleTokens({
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || null,
      expiry_date: tokens.expiry_date || null,
      email: userInfo.data.email || null,
    });

    return NextResponse.redirect(
      new URL('/admin/settings?success=google_connected', request.url),
    );
  } catch (err) {
    console.error('[Google Callback] Error:', err);
    return NextResponse.redirect(
      new URL('/admin/settings?error=token_exchange_failed', request.url),
    );
  }
}
