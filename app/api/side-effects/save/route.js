import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

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
    const reportData = await request.json();

    console.log('💾 Saving side effects for user:', userId);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const sideEffectsCollection = db.collection('SideEffects');

    // Create the side effects document
    const sideEffectsDocument = {
      userId: userId,
      sideEffects: reportData.sideEffects || [],
      otherSideEffect: reportData.otherSideEffect || '',
      appetiteSuppressed: reportData.appetiteSuppressed || '',
      hasTreatmentConcerns: reportData.hasTreatmentConcerns || '',
      treatmentConcerns: reportData.treatmentConcerns || '',
      requestDoctorContact: reportData.requestDoctorContact || false,
      contactMessage: reportData.contactMessage || '',
      reportDate: reportData.reportDate || new Date().toISOString(),
      reportId: reportData.reportId || `SE-${Date.now()}`,
      complete: true, // Mark as complete when saved
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the side effects report
    const result = await sideEffectsCollection.updateOne(
      { reportId: sideEffectsDocument.reportId }, 
      { $set: sideEffectsDocument }, { upsert: true });

    console.log('✅ Side effects saved successfully:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Side effects saved successfully',
      reportId: sideEffectsDocument.reportId,
      id: result.insertedId
    });

  } catch (error) {
    console.error('❌ Error saving side effects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save side effects',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

