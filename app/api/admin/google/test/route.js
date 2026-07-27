import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import { sendGmail } from '../../../../../lib/google-mail';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to } = await request.json();
    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    await sendGmail({
      to,
      subject: 'Svelte by LuKaria - Google Integration Test',
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #877449; border-radius: 8px;">
          <h2 style="color: #1C1915;">Integration Success!</h2>
          <p>This is a test email from the <strong>Svelte by LuKaria</strong> admin portal.</p>
          <p>Your Google account is linked for Gmail delivery.</p>
          <small style="color: #666;">Sent at: ${new Date().toLocaleString()}</small>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Google Test Email] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 },
    );
  }
}
