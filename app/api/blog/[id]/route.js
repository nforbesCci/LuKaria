import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function isDoctorOrAdmin(session) {
  const groups = session?.user?.groups || session?.user?.['https://lukariagroup.com/roles'] || [];
  return groups.includes('Admin') || groups.includes('Doctor');
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user || !isDoctorOrAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized. Doctor or Admin required.' }, { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const imageFile = formData.get('image');

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const update = {
      title,
      content,
      updatedAt: new Date(),
    };

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(imageFile.name) || '.jpg';
      const filename = `blog-${Date.now()}${ext}`;
      const blogDir = path.join(process.cwd(), 'public', 'images', 'blog');
      await mkdir(blogDir, { recursive: true });
      const filepath = path.join(blogDir, filename);
      await writeFile(filepath, buffer);
      update.imageUrl = `/images/blog/${filename}`;
    }

    const result = await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user || !isDoctorOrAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized. Doctor or Admin required.' }, { status: 403 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const result = await db.collection('blogPosts').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
