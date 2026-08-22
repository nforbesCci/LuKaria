import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getMedicationFormulary } from '../../../../lib/medication-formulary';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const formulary = await getMedicationFormulary();
    return NextResponse.json({ success: true, ...formulary });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to load allowed medications' },
      { status: 500 },
    );
  }
}
