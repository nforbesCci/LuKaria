import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Get admin user session
    const session = await getApiSession(request);
    
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
    
    // Get limit from query params (default to last 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;

    console.log('📋 Admin fetching questions for user:', targetUserId, 'limit:', limit);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const questionsCollection = db.collection('questions');

    // Fetch questions for the target user, sorted by date (newest first)
    const questions = await questionsCollection
      .find({ 
        userId: targetUserId
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    console.log('✅ Admin questions fetched successfully, count:', questions.length);

    return NextResponse.json({
      success: true,
      questions,
      userId: targetUserId,
      limit: limit
    });

  } catch (error) {
    console.error('❌ Error fetching admin questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get admin user session
    const session = await getApiSession(request);
    
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
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Admin deleting question:', questionId, 'for user:', targetUserId);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const questionsCollection = db.collection('questions');

    // Delete the specific question
    const result = await questionsCollection.deleteOne({
      _id: new ObjectId(questionId),
      userId: targetUserId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Question not found or already deleted' },
        { status: 404 }
      );
    }

    console.log('✅ Admin question deleted successfully:', questionId);

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
      deletedCount: result.deletedCount,
      questionId: questionId
    });

  } catch (error) {
    console.error('❌ Error deleting admin question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete question',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
