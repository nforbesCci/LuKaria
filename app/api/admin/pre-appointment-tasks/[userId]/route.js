import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import { getDatabase } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    console.log('🔧 Admin Pre-Appointment Tasks API: GET request started');
    
    // Get the session
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Admin Pre-Appointment Tasks API: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const userRoles = session.user['https://lukariagroup.com/roles'] || [];
    const hasAdminRole = userRoles.some(role => 
      role.toLowerCase() === 'admin' || 
      role.toLowerCase() === 'doctor'
    );

    if (!hasAdminRole) {
      console.log('❌ Admin Pre-Appointment Tasks API: User does not have admin role');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = params;
    console.log('🔧 Admin Pre-Appointment Tasks API: Fetching pre-appointment tasks for user:', userId);

    // Get database connection
    const db = await getDatabase();
    const collection = db.collection('preappointmentTask');

    // Find pre-appointment tasks for the specific user
    const tasks = await collection.find({ userId }).toArray();
    
    console.log('✅ Admin Pre-Appointment Tasks API: Found tasks:', tasks.length);

    return NextResponse.json({ tasks }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Admin Pre-Appointment Tasks API: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    console.log('🔧 PUT /api/pre-appointment-tasks - Starting request');
    
    // Get user session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.log('❌ PUT /api/pre-appointment-tasks - No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user has admin role (case insensitive)
    const userRoles = session.user['https://lukariagroup.com/roles'] || [];
    const hasAdminRole = userRoles.some(role => 
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'doctor'
    );
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const targetUserId = params.userId;

    const userId = session.user.sub;
  ;
    
    const requestBody = await request.json();
    
    const { taskKey, completed, } = requestBody;

    if (!taskKey) {
      console.log('❌ PUT /api/pre-appointment-tasks - No task key provided');
      return NextResponse.json(
        { error: 'Task key is required' },
        { status: 400 }
      );
    }

    console.log('🔧 User updating pre-appointment task:', { userId, taskKey, completed });

    // Connect to MongoDB
    const db = await getDatabase();
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    // Update the pre-appointment task
    const updateData = {
      completed: completed,
      updatedAt: new Date(),
      updatedBy: userId
    };
    
    const result = await preAppointmentTasksCollection.updateOne(
      { 
        userId: targetUserId,
        taskKey: taskKey
      },
      { $set: updateData },
      { upsert: true } // Create if doesn't exist
    );

    console.log('✅ User pre-appointment task updated successfully:', result);

    const response = {
      success: true,
      message: 'Pre-appointment task updated successfully',
      taskKey,
      updatedFields: updateData
    };
    
    console.log('🔧 PUT /api/pre-appointment-tasks - Response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error updating user pre-appointment task:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to update pre-appointment task',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}