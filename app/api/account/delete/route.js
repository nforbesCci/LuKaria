import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { getManagementClient } from '../../../../lib/auth0-management';

/**
 * Signed consent forms and side-effect reports are clinical records the practice
 * must retain, so they are kept when a patient deletes their account.
 */
const USER_DATA_COLLECTIONS = [
  'profiles',
  'measurements',
  'meals',
  'medications',
  'bodyScans',
  'questions',
  'appointments',
  'appointment_tasks',
  'preappointmentTask',
  'NotificationCollection',
];

export async function DELETE(request) {
  try {
    const session = await getApiSession(request);
    const userId = session?.user?.sub;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDatabase();
    const deleted = {};
    for (const name of USER_DATA_COLLECTIONS) {
      const result = await db.collection(name).deleteMany({ userId });
      deleted[name] = result.deletedCount;
    }

    await getManagementClient().users.delete(userId);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('❌ Account deletion failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete account',
        details: error.message || error.body?.message || String(error),
      },
      { status: error.statusCode || error.status || 500 },
    );
  }
}
