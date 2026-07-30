import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { sanitizeMeasurement } from '../../../../lib/fitxpress';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const db = await getDatabase();
    const scans = await db
      .collection('bodyScans')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      count: scans.length,
      scans: scans.map((s) => ({
        measurementId: s.measurementId,
        status: s.status,
        gender: s.gender,
        heightCm: s.heightCm,
        weightKg: s.weightKg,
        age: s.age,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        completedAt: s.completedAt || null,
        measurement: sanitizeMeasurement(s.result),
      })),
    });
  } catch (error) {
    console.error('Body scan list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list body scans' },
      { status: 500 },
    );
  }
}
