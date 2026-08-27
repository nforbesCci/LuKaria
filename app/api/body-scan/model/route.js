import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

function hasAdminOrDoctorRole(session) {
  const userRoles = session?.user?.['https://lukariagroup.com/roles'] || [];
  return userRoles.some(
    (role) =>
      String(role).toLowerCase() === 'admin' ||
      String(role).toLowerCase() === 'doctor',
  );
}

/**
 * Proxy FitXpress / S3 .obj so the browser can load it without CORS issues.
 * Auth: owner of the scan, or admin/doctor.
 */
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

    const db = await getDatabase();
    const scan = await db.collection('bodyScans').findOne({ measurementId });
    if (!scan) {
      return NextResponse.json({ error: 'Body scan not found' }, { status: 404 });
    }

    const userId = session.user.sub;
    if (scan.userId !== userId && !hasAdminOrDoctorRole(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const modelUrl = scan.result?.model_3d_url;
    if (!modelUrl) {
      return NextResponse.json({ error: 'No 3D model for this scan' }, { status: 404 });
    }

    const upstream = await fetch(modelUrl);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch model (${upstream.status})` },
        { status: 502 },
      );
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/obj',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Body scan model proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load 3D model' },
      { status: 500 },
    );
  }
}
