import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    console.log('🔄 Side Effects Review API: Starting request processing');
    
    // Get the session to verify user authentication
    const session = await getSession(request);
    
    if (!session || !session.user) {
      console.log('❌ Side Effects Review API: No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or doctor
    const user = session.user;
    const isAdmin = user.groups && (
      user.groups.includes('Admin') || 
      user.groups.includes('Doctor')
    ) || (
      user['https://lukariagroup.com/roles'] && (
        user['https://lukariagroup.com/roles'].includes('Admin') || 
        user['https://lukariagroup.com/roles'].includes('Doctor')
      )
    );

    if (!isAdmin) {
      console.log('❌ Side Effects Review API: User is not admin/doctor');
      return NextResponse.json(
        { error: 'Admin or Doctor role required' },
        { status: 403 }
      );
    }

    const { reportId } = await request.json();
    console.log('📋 Side Effects Review API: Received reportId:', reportId);

    if (!reportId) {
      console.log('❌ Side Effects Review API: Missing reportId');
      return NextResponse.json(
        { error: 'Missing required field: reportId' },
        { status: 400 }
      );
    }

    console.log('🔌 Side Effects Review API: Connecting to database');
    const db = await getDatabase();
    console.log('✅ Side Effects Review API: Database connected successfully');

    // Update the side effects report to mark as reviewed
    console.log('📝 Side Effects Review API: Updating side effects report');
      const updateResult = await db.collection('SideEffects').updateOne(
        { _id: new ObjectId(reportId) },
      {
        $set: {
          reviewed: true,
          reviewedAt: new Date(),
          reviewedBy: user.sub,
          reviewedByName: user.name || user.email,
          updatedAt: new Date()
        }
      }
    );

    console.log('📊 Side Effects Review API: Update result:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log('❌ Side Effects Review API: Report not found');
      return NextResponse.json(
        { error: 'Side effects report not found' },
        { status: 404 }
      );
    }

    // Get the updated report data
    console.log('👤 Side Effects Review API: Fetching updated report data');
    const updatedReport = await db.collection('SideEffects').findOne({ _id: new ObjectId(reportId) });
    console.log('✅ Side Effects Review API: Report data fetched successfully');

    const responseData = {
      success: true,
      data: {
        reportId: reportId,
        reviewed: true,
        reviewedAt: updatedReport.reviewedAt,
        reviewedBy: updatedReport.reviewedBy,
        reviewedByName: updatedReport.reviewedByName
      }
    };

    console.log('✅ Side Effects Review API: Success response prepared:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Side Effects Review API: Error occurred:', error);
    console.error('❌ Side Effects Review API: Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
