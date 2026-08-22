import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import {
  getMedicationFormulary,
  saveMedicationFormulary,
} from '../../../../../lib/medication-formulary';

export const dynamic = 'force-dynamic';

function requireStaff(session) {
  const roles = session?.user?.['https://lukariagroup.com/roles'] || [];
  return roles.some(
    (r) => String(r).toLowerCase() === 'admin' || String(r).toLowerCase() === 'doctor',
  );
}

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!requireStaff(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const formulary = await getMedicationFormulary();
    return NextResponse.json({ success: true, ...formulary });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!requireStaff(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const saved = await saveMedicationFormulary(body.medications);
    return NextResponse.json({ success: true, ...saved });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
