import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

function isDoctorOrAdmin(session) {
  const groups = session?.user?.groups || session?.user?.['https://lukariagroup.com/roles'] || [];
  return groups.includes('Admin') || groups.includes('Doctor');
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorName, content } = body;

    if (!authorName?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }

    const comment = {
      id: new ObjectId().toString(),
      authorName: authorName.trim().slice(0, 100),
      content: content.trim().slice(0, 2000),
      createdAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: comment } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user || !isDoctorOrAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized. Doctor or Admin required.' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(id) },
      { $pull: { comments: { id: commentId } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove comment' }, { status: 500 });
  }
}
