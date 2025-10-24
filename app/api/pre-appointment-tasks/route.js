import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;

    console.log('🔍 Fetching pre-appointment tasks for user:', userId);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    // Fetch all pre-appointment tasks for the user
    const tasks = await preAppointmentTasksCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    console.log('✅ User pre-appointment tasks fetched successfully:', tasks.length, 'tasks found');

    return NextResponse.json({
      success: true,
      message: 'Pre-appointment tasks fetched successfully',
      tasks: tasks
    });

  } catch (error) {
    console.error('❌ Error fetching user pre-appointment tasks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pre-appointment tasks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const { taskKey, completed, notes, taskData } = await request.json();

    if (!taskKey) {
      return NextResponse.json(
        { error: 'Task key is required' },
        { status: 400 }
      );
    }

    console.log('🔧 User creating pre-appointment task:', { userId, taskKey, completed });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    // Create new pre-appointment task
    const newTask = {
      userId: userId,
      taskKey,
      completed: completed || false,
      notes: notes || '',
      taskData: taskData || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId // User who created the task
    };

    const result = await preAppointmentTasksCollection.insertOne(newTask);

    console.log('✅ User pre-appointment task created successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Pre-appointment task created successfully',
      taskId: result.insertedId,
      task: newTask
    });

  } catch (error) {
    console.error('❌ Error creating user pre-appointment task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create pre-appointment task',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    console.log('🔧 PUT /api/pre-appointment-tasks - Starting request');
    
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      console.log('❌ PUT /api/pre-appointment-tasks - No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    console.log('🔧 PUT /api/pre-appointment-tasks - User ID:', userId);
    
    const requestBody = await request.json();
    console.log('🔧 PUT /api/pre-appointment-tasks - Request body:', requestBody);
    
    const { taskKey, completed, notes, taskData } = requestBody;

    if (!taskKey) {
      console.log('❌ PUT /api/pre-appointment-tasks - No task key provided');
      return NextResponse.json(
        { error: 'Task key is required' },
        { status: 400 }
      );
    }

    console.log('🔧 User updating pre-appointment task:', { userId, taskKey, completed });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    // Update the pre-appointment task
    const updateData = {
      updatedAt: new Date(),
      updatedBy: userId // User who updated the task
    };
    
    if (taskData !== undefined) updateData.taskData = taskData;
    if (completed !== undefined) updateData.completed = completed;
    if (notes !== undefined) updateData.notes = notes;

    console.log('🔧 PUT /api/pre-appointment-tasks - Update data:', updateData);

    const result = await preAppointmentTasksCollection.updateOne(
      { 
        userId: userId,
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

export async function DELETE(request) {
  try {
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const { taskKey } = await request.json();

    console.log('🗑️ User clearing pre-appointment tasks:', { userId, taskKey });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const preAppointmentTasksCollection = db.collection('preappointmentTask');

    let result;
    if (taskKey) {
      // Delete specific task key
      result = await preAppointmentTasksCollection.deleteOne({
        userId: userId,
        taskKey: taskKey
      });
      console.log('✅ Specific pre-appointment task deleted successfully:', result);
    } else {
      // Delete all tasks for user
      result = await preAppointmentTasksCollection.deleteMany({
        userId: userId
      });
      console.log('✅ All pre-appointment tasks deleted successfully:', result);
    }

    return NextResponse.json({
      success: true,
      message: taskKey ? 'Pre-appointment task deleted successfully' : 'All pre-appointment tasks deleted successfully',
      deletedCount: result.deletedCount,
      taskKey: taskKey || 'all'
    });

  } catch (error) {
    console.error('❌ Error deleting pre-appointment tasks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete pre-appointment tasks',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

