import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { retrieveMeasurement, sanitizeMeasurement } from '../../../../lib/fitxpress';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const measurementId = searchParams.get('id');
    if (!measurementId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const userId = session.user.sub;
    const db = await getDatabase();
    const existing = await db.collection('bodyScans').findOne({
      userId,
      measurementId,
    });

    if (!existing) {
      return NextResponse.json({ error: 'Body scan not found' }, { status: 404 });
    }

    const measurement = await retrieveMeasurement(measurementId);
    const sanitized = sanitizeMeasurement(measurement);

    await db.collection('bodyScans').updateOne(
      { _id: existing._id },
      {
        $set: {
          status: sanitized.status,
          result: sanitized,
          updatedAt: new Date(),
          ...(sanitized.status === 'successful' || sanitized.status === 'failed'
            ? { completedAt: sanitized.completed_at ? new Date(sanitized.completed_at) : new Date() }
            : {}),
        },
      },
    );

    return NextResponse.json({
      success: true,
      measurementId,
      status: sanitized.status,
      measurement: sanitized,
    });
  } catch (error) {
    console.error('Body scan status error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch body scan status',
        details: error.payload || undefined,
      },
      { status },
    );
  }
}
