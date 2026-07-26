import { getApiSession } from '../../../../lib/api-auth';
import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/mongodb';

// POST /api/questions/save - Save/update user questions to MongoDB
export async function POST(request) {
  console.log('🔍 API Route Called: POST /api/questions/save');
  
  try {
    const session = await getApiSession(request);
    
    console.log('👤 Session:', session ? 'Found' : 'Not found');
    console.log('👤 User:', session?.user?.sub || 'No user');
    
    if (!session || !session.user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questionsData = await request.json();
    const userId = session.user.sub;
    
    console.log('📥 Received questions data:', JSON.stringify(questionsData, null, 2));
    console.log('✅ User ID:', userId);

    // Validate required fields
    if (!questionsData) {
      return NextResponse.json(
        { error: 'Questions data is required' },
        { status: 400 }
      );
    }

    // Get questions collection from MongoDB
    const questionsCollection = await getCollection('questions');
    
    // Prepare questions document for database
    const questionsDocument = {
      userId,
      questions: questionsData.questions || null,
      noQuestions: questionsData.noQuestions || false,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userEmail: session.user.email,
      userName: session.user.name,
      // Store all raw questions data
      rawData: questionsData
    };

    console.log('💾 Saving to MongoDB...');
    console.log('📄 Document to save:', JSON.stringify(questionsDocument, null, 2));
    
    // Upsert (update or insert) the questions in MongoDB
    const result = await questionsCollection.updateOne(
      { userId },
      { 
        $set: questionsDocument,
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    );
    
    console.log('✅ MongoDB operation completed:', {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

    const responseData = {
      questions: questionsDocument.questions,
      noQuestions: questionsDocument.noQuestions,
      savedAt: questionsDocument.savedAt,
      updatedAt: questionsDocument.updatedAt,
      userId,
      dbOperation: result.upsertedCount > 0 ? 'created' : 'updated',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    };

    console.log('✅ Returning response data:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: result.upsertedCount > 0 
        ? 'Questions saved successfully in database' 
        : 'Questions updated successfully in database'
    });

  } catch (error) {
    console.error('❌ Error saving questions:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save questions to database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/questions/save - Retrieve user questions from MongoDB
export async function GET(request) {
  console.log('🔍 API Route Called: GET /api/questions/save');
  
  try {
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('✅ User ID:', userId);

    // Get questions collection from MongoDB
    const questionsCollection = await getCollection('questions');
    
    // Find user's questions
    const questionsDoc = await questionsCollection.findOne({ userId });
    
    if (!questionsDoc) {
      return NextResponse.json({
        success: true,
        data: {
          questions: '',
          noQuestions: false,
          savedAt: null,
          updatedAt: null
        },
        message: 'No questions found for user'
      });
    }

    const responseData = {
      questions: questionsDoc.questions || '',
      noQuestions: questionsDoc.noQuestions || false,
      savedAt: questionsDoc.savedAt,
      updatedAt: questionsDoc.updatedAt
    };

    console.log('✅ Returning questions data:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Questions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error retrieving questions:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve questions from database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
