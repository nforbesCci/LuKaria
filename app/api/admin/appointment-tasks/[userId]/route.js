import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Get admin user session
    const session = await getSession();
    
    if (!session || !session.user) {
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
    console.log('📋 Admin fetching appointment tasks for user:', targetUserId);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const appointmentTasksCollection = db.collection('appointment_tasks');

    // Fetch all appointment tasks for the target user
    const appointmentTasks = await appointmentTasksCollection
      .find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('✅ Admin appointment tasks fetched successfully, count:', appointmentTasks.length);

    return NextResponse.json({
      success: true,
      appointmentTasks,
      userId: targetUserId
    });

  } catch (error) {
    console.error('❌ Error fetching admin appointment tasks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch appointment tasks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // Get admin user session
    const session = await getSession();
    
    if (!session || !session.user) {
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
    const { taskType, taskData, completed, notes } = await request.json();

    if (!taskType) {
      return NextResponse.json(
        { error: 'Task type is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Admin creating appointment task:', { targetUserId, taskType, completed });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const appointmentTasksCollection = db.collection('appointment_tasks');

    // Create new appointment task
    const newTask = {
      userId: targetUserId,
      taskType,
      taskData: taskData || {},
      completed: completed || false,
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.sub // Admin who created the task
    };

    const result = await appointmentTasksCollection.insertOne(newTask);

    console.log('✅ Admin appointment task created successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Appointment task created successfully',
      taskId: result.insertedId,
      task: newTask
    });

  } catch (error) {
    console.error('❌ Error creating admin appointment task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create appointment task',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Get admin user session
    const session = await getSession();
    
    if (!session || !session.user) {
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
    const { taskId, taskType, taskData, completed, notes } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Admin updating appointment task:', { targetUserId, taskId, completed });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const appointmentTasksCollection = db.collection('appointment_tasks');

    // Update the appointment task
    const updateData = {
      updatedAt: new Date(),
      updatedBy: session.user.sub // Admin who updated the task
    };
    
    if (taskType !== undefined) updateData.taskType = taskType;
    if (taskData !== undefined) updateData.taskData = taskData;
    if (completed !== undefined) updateData.completed = completed;
    if (notes !== undefined) updateData.notes = notes;

    const result = await appointmentTasksCollection.updateOne(
      { 
        _id: new ObjectId(taskId),
        userId: targetUserId
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment task not found' },
        { status: 404 }
      );
    }

    console.log('✅ Admin appointment task updated successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Appointment task updated successfully',
      taskId,
      updatedFields: updateData
    });

  } catch (error) {
    console.error('❌ Error updating admin appointment task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update appointment task',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
