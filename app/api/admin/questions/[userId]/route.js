import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';

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
