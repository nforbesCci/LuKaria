import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Get user session
    const session = await getApiSession(request);
    
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
    const severities = reportData.sideEffectSeverities && typeof reportData.sideEffectSeverities === 'object'
      ? reportData.sideEffectSeverities
      : {};
    const otherSeverity = Number.isFinite(Number(reportData.otherSeverity))
      ? Number(reportData.otherSeverity)
      : (Number.isFinite(Number(severities.Other)) ? Number(severities.Other) : null);
    const severityValues = [
      ...Object.values(severities).map(Number).filter(Number.isFinite),
      ...(otherSeverity != null ? [otherSeverity] : []),
      ...(Number.isFinite(Number(reportData.severity)) ? [Number(reportData.severity)] : []),
    ];
    const overallSeverity = severityValues.length
      ? Math.max(...severityValues)
      : null;

    const sideEffectsDocument = {
      userId: userId,
      sideEffects: reportData.sideEffects || [],
      sideEffectSeverities: severities,
      otherSideEffect: reportData.otherSideEffect || '',
      otherSeverity,
      severity: overallSeverity,
      notes: reportData.notes || reportData.contactMessage || '',
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

