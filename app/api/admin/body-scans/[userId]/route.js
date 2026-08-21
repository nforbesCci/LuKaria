import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import { getDatabase } from '../../../../../lib/mongodb';
import { sanitizeMeasurement } from '../../../../../lib/fitxpress';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 },
      );
    }

    const userRoles = session.user['https://lukariagroup.com/roles'] || [];
    const hasAdminRole = userRoles.some(
      (role) =>
        String(role).toLowerCase() === 'admin' ||
        String(role).toLowerCase() === 'doctor',
    );
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const targetUserId = params.userId;
    if (!targetUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const scans = await db
      .collection('bodyScans')
      .find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      userId: targetUserId,
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
    console.error('Admin body scans error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch body scans',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
