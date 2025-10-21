import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    console.log('🔍 Admin Pre-Appointment Tasks API: Starting request');
    console.log('📋 Params:', params);
    
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ Admin Pre-Appointment Tasks API: Unauthorized - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('👤 Admin Pre-Appointment Tasks API: Session found for user:', session.user.sub);

    // Check if user has admin role (case insensitive)
    const userRoles = session.user['https://lukariagroup.com/roles'] || [];
    console.log('🔐 Admin Pre-Appointment Tasks API: User roles:', userRoles);
    const hasAdminRole = userRoles.some(role => 
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'doctor'
    );
    if (!hasAdminRole) {
      console.log('❌ Admin Pre-Appointment Tasks API: Forbidden - No admin role');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('✅ Admin Pre-Appointment Tasks API: Admin access confirmed');

    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Admin: Fetching pre-appointment tasks for user:', userId);

    const db = await getDatabase('lukaria');
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    // Fetch all pre-appointment tasks for the specified user
    const preAppointmentTasks = await preAppointmentTasksCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('✅ Admin: Pre-appointment tasks fetched successfully:', {
      userId,
      count: preAppointmentTasks.length
    });

    return NextResponse.json({
      success: true,
      message: 'Pre-appointment tasks fetched successfully',
      userId,
      preAppointmentTasks,
      count: preAppointmentTasks.length
    });

  } catch (error) {
    console.error('❌ Admin: Error fetching pre-appointment tasks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pre-appointment tasks', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
